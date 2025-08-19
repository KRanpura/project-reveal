const express = require('express');
const multer = require('multer');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const { Pool } = require('pg');
const crypto = require('crypto');
const path = require('path');

const app = express();

// Configure S3
const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// Configure PostgreSQL
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
});

// Webhook endpoint for Google Forms
app.post('/api/webhook/submission', upload.single('document'), async (req, res) => {
  try {
    console.log('Received webhook data:', req.body);
    console.log('Received file:', req.file);

    const { name, email, document_title, abstract, tags } = req.body;

    // Validate required fields (abstract is optional in your schema)
    if (!name || !email || !document_title) {
      return res.status(400).json({ 
        error: 'Missing required fields: name, email, document_title' 
      });
    }

    let fileUrl = null;
    let fileName = null;

    // Handle file upload to S3 if file exists
    if (req.file) {
      fileName = `${Date.now()}-${crypto.randomUUID()}-${req.file.originalname}`;
      
      const uploadParams = {
        Bucket: process.env.S3_BUCKET_NAME,
        Key: `documents/${fileName}`,
        Body: req.file.buffer,
        ContentType: req.file.mimetype,
        Metadata: {
          originalName: req.file.originalname,
          uploadedBy: email,
          title: document_title,
        },
      };

      const uploadResult = await s3Client.send(new PutObjectCommand(uploadParams));
      fileUrl = `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/documents/${fileName}`;
      
      console.log('File uploaded to S3:', fileUrl);
    }

    // Parse tags (assuming comma-separated string)
    const parsedTags = tags ? tags.split(',').map(tag => tag.trim()).filter(tag => tag) : [];

    // Get file size if file exists
    const fileSize = req.file ? req.file.size : null;

    // Create the raw form data backup
    const formData = {
      source: 'google_form',
      timestamp: new Date().toISOString(),
      original_data: req.body,
      file_info: req.file ? {
        originalName: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size
      } : null
    };

    // Insert into PostgreSQL using your actual schema
    const insertQuery = `
      INSERT INTO form_submissions (
        timestamp, name, email, document_title, abstract, tags, 
        s3_bucket, s3_key, s3_url, file_size, form_data, status
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING id, created_at;
    `;

    const result = await pool.query(insertQuery, [
      new Date(), // timestamp
      name,
      email,
      document_title,
      abstract,
      parsedTags, // PostgreSQL will handle the TEXT[] conversion
      process.env.S3_BUCKET_NAME, // s3_bucket
      fileName ? `documents/${fileName}` : null, // s3_key
      fileUrl, // s3_url
      fileSize, // file_size
      JSON.stringify(formData), // form_data as JSONB
      'uploaded' // status
    ]);

    const submissionId = result.rows[0].id;
    const createdAt = result.rows[0].created_at;

    console.log('Submission saved with ID:', submissionId);

    // Send success response
    res.status(200).json({
      success: true,
      message: 'Submission received and processed successfully',
      data: {
        id: submissionId,
        created_at: createdAt,
        file_uploaded: !!fileUrl,
      },
    });

  } catch (error) {
    console.error('Error processing webhook:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message,
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({ error: 'Something went wrong!' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;