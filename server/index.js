import 'dotenv/config';
import express from 'express';
import multer from 'multer';
import { S3Client, PutObjectCommand, HeadBucketCommand } from '@aws-sdk/client-s3';
import pkg from 'pg';
const { Pool } = pkg;
import crypto from 'crypto';

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configure S3
console.log('================ S3 CONFIG =================');
console.log('AWS_REGION:', process.env.AWS_REGION);
console.log('AWS_ACCESS_KEY_ID:', process.env.AWS_ACCESS_KEY_ID ? '✅ Present' : '❌ Missing');
console.log('AWS_SECRET_ACCESS_KEY:', process.env.AWS_SECRET_ACCESS_KEY ? '✅ Present' : '❌ Missing');
console.log('S3_BUCKET_NAME:', process.env.S3_BUCKET_NAME);

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// Test S3 bucket access
(async () => {
  try {
    if (!process.env.S3_BUCKET_NAME) {
      console.warn('❌ S3_BUCKET_NAME is not set!');
      return;
    }
    await s3Client.send(new HeadBucketCommand({ Bucket: process.env.S3_BUCKET_NAME }));
    console.log(`✅ S3 bucket "${process.env.S3_BUCKET_NAME}" is accessible`);
  } catch (err) {
    console.error('❌ S3 bucket access failed:', err.message);
  }
})();

// Configure PostgreSQL
console.log('================ POSTGRES CONFIG ================');
console.log('DB_USER:', process.env.DB_USER);
console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_NAME:', process.env.DB_NAME);
console.log('DB_PORT:', process.env.DB_PORT);

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
});

// Webhook endpoint for Google Forms
app.post('/api/webhook/submission', upload.single('document'), async (req, res) => {
  console.log('================ Webhook Triggered ================');
  console.log('Received webhook data:', req.body);
  console.log('Received file:', req.file);

  try {
    // Extract form fields
    const {
      your_name,
      your_email,
      peer_reviewer_name,
      peer_reviewer_email,
      doc_title,
      source,
      original_abstract,
      final_abstract,
      content_tags
    } = req.body;

    // Validate required fields
    if (!your_name || !your_email || !doc_title) {
      console.error('❌ Missing required fields');
      return res.status(400).json({ 
        error: 'Missing required fields: your_name, your_email, doc_title' 
      });
    }

    // Handle file upload to S3
    let fileUrl = null;
    if (req.file) {
      const fileName = `${Date.now()}-${crypto.randomUUID()}-${req.file.originalname}`;
      const uploadParams = {
        Bucket: process.env.S3_BUCKET_NAME,
        Key: `documents/${fileName}`,
        Body: req.file.buffer,
        ContentType: req.file.mimetype,
        Metadata: {
          originalName: req.file.originalname,
          uploadedBy: your_email,
          title: doc_title,
        },
      };

      try {
        console.log('Uploading file to S3...');
        await s3Client.send(new PutObjectCommand(uploadParams));
        fileUrl = `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/documents/${fileName}`;
        console.log('✅ File uploaded to S3:', fileUrl);
      } catch (err) {
        console.error('❌ S3 upload failed:', err.message);
      }
    }

    // Parse content_tags into array for PostgreSQL text[]
    const parsedTags = content_tags 
      ? content_tags.split(',').map(tag => tag.trim()).filter(tag => tag) 
      : [];

    // Log values before insertion
    console.log('================ Inserting into PostgreSQL =================');
    console.log('your_name:', your_name);
    console.log('your_email:', your_email);
    console.log('peer_reviewer_name:', peer_reviewer_name);
    console.log('peer_reviewer_email:', peer_reviewer_email);
    console.log('doc_title:', doc_title);
    console.log('source:', source);
    console.log('fileUrl:', fileUrl);
    console.log('original_abstract:', original_abstract);
    console.log('final_abstract:', final_abstract);
    console.log('parsedTags:', parsedTags);

    // Insert into PostgreSQL
    const insertQuery = `
      INSERT INTO form_submissions (
        your_name,
        your_email,
        peer_reviewer_name,
        peer_reviewer_email,
        doc_title,
        source,
        s3_file_url,
        original_abstract,
        final_abstract,
        content_tags
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING id, created_at;
    `;

    try {
      console.log('Inserting data into PostgreSQL...');
      const result = await pool.query(insertQuery, [
        your_name,
        your_email,
        peer_reviewer_name,
        peer_reviewer_email,
        doc_title,
        source,
        fileUrl,
        original_abstract,
        final_abstract,
        parsedTags
      ]);

      const submissionId = result.rows[0].id;
      const createdAt = result.rows[0].created_at;
      console.log('✅ Submission saved with ID:', submissionId);

      res.status(200).json({
        success: true,
        message: 'Submission received and processed successfully',
        data: {
          id: submissionId,
          created_at: createdAt,
          file_uploaded: !!fileUrl,
        },
      });
    } catch (err) {
      console.error('❌ PostgreSQL insert failed:', err.message);
      res.status(500).json({
        success: false,
        error: 'PostgreSQL insert failed',
        message: err.message,
      });
    }

  } catch (error) {
    console.error('Error processing webhook:', error.message);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message,
    });
  }
});

// Health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    const client = await pool.connect();
    const dbResult = await client.query('SELECT NOW() as current_time');
    client.release();
    
    res.json({ 
      status: 'OK', 
      timestamp: new Date().toISOString(),
      database: 'connected',
      db_time: dbResult.rows[0].current_time,
      s3_bucket: process.env.S3_BUCKET_NAME || 'not configured'
    });
  } catch (error) {
    console.error('Health check failed:', error.message);
    res.status(500).json({ 
      status: 'ERROR', 
      timestamp: new Date().toISOString(),
      error: error.message 
    });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({ error: 'Something went wrong!' });
});

const PORT = process.env.PORT || 3000;

// Test connections on startup and start server
async function startServer() {
  try {
    const client = await pool.connect();
    const dbTest = await client.query('SELECT NOW()');
    client.release();
    console.log('✅ Database connected successfully at', dbTest.rows[0].now);
    
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📋 Health check: http://localhost:${PORT}/api/health`);
      console.log(`📨 Webhook endpoint: http://localhost:${PORT}/api/webhook/submission`);
      console.log('📦 S3 Bucket:', process.env.S3_BUCKET_NAME || 'NOT CONFIGURED');
    });
    
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    console.error('Check your .env file and database connection');
    process.exit(1);
  }
}

startServer();

export default app;
