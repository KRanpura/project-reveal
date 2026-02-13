import 'dotenv/config';


// console.log('ENV CHECK', {
//   BACKEND_URL: process.env.BACKEND_URL,
//   FRONTEND_URL: process.env.FRONTEND_URL,
//   CWD: process.cwd(),
// });

import express from 'express';
import multer from 'multer';
import { S3Client, PutObjectCommand, HeadBucketCommand } from '@aws-sdk/client-s3';
import pkg from 'pg';
const { Pool } = pkg;
import crypto from 'crypto';

import jwt from 'jsonwebtoken';  //for google oauth, admin portal sign in + s3 visibility toggling
import cookieParser from 'cookie-parser';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import cors from 'cors';

const app = express();

// Middleware
app.use(express.json());
app.use(cookieParser()); //new addition for admin portal, CORs lets frontend talk to backend
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(passport.initialize());
app.use(express.urlencoded({ extended: true }));
app.set('trust proxy', 1);


// Configure S3
// console.log('================ S3 CONFIG =================');
// console.log('AWS_REGION:', process.env.AWS_REGION);
// console.log('AWS_ACCESS_KEY_ID:', process.env.AWS_ACCESS_KEY_ID ? '✅ Present' : '❌ Missing');
// console.log('AWS_SECRET_ACCESS_KEY:', process.env.AWS_SECRET_ACCESS_KEY ? '✅ Present' : '❌ Missing');
// console.log('S3_BUCKET_NAME:', process.env.S3_BUCKET_NAME);

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
// console.log('================ POSTGRES CONFIG ================');
// console.log('DB_USER:', process.env.DB_USER);
// console.log('DB_HOST:', process.env.DB_HOST);
// console.log('DB_NAME:', process.env.DB_NAME);
// console.log('DB_PORT:', process.env.DB_PORT);

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
        content_tags,
        visibility
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'pending')
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

// ============================================================
// AUTH MIDDLEWARE
// ============================================================
const requireAdmin = (req, res, next) => {
  const token = req.cookies?.admin_token;
  if (!token) return res.status(401).json({ error: 'Not authenticated' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.admin = decoded;
    next();
  } catch {
    res.clearCookie('admin_token');
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

// ============================================================
// PASSPORT GOOGLE OAUTH STRATEGY
// ============================================================

if (!process.env.BACKEND_URL) {
  throw new Error('BACKEND_URL is not defined');
}

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: `${process.env.BACKEND_URL}/api/admin/auth/google/callback`,
}, async (accessToken, refreshToken, profile, done) => {
  try {
    const email = profile.emails[0].value.toLowerCase();
    const result = await pool.query(
      'SELECT * FROM admins WHERE LOWER(email) = $1',
      [email]
    );
    if (result.rows.length === 0) {
      return done(null, false, { message: 'Email not whitelisted' });
    }
    return done(null, { email, name: profile.displayName, id: profile.id });
  } catch (err) {
    return done(err);
  }
}));

// ============================================================
// GOOGLE OAUTH ROUTES
// ============================================================

// Step 1: Redirect to Google
app.get('/api/admin/auth/google',
  passport.authenticate('google', { scope: ['email', 'profile'], session: false })
);

// Step 2: Google callback
app.get('/api/admin/auth/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: `${process.env.FRONTEND_URL}/admin?error=unauthorized` }),
  (req, res) => {
    const token = jwt.sign(
      { email: req.user.email, name: req.user.name },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.cookie('admin_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 8 * 60 * 60 * 1000, // 8 hours
    });

    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/admin`);
  }
);

// Step 3: Check auth status (frontend polls this on load)
app.get('/api/admin/auth/me', requireAdmin, (req, res) => {
  res.json({ email: req.admin.email, name: req.admin.name });
});

// Step 4: Logout
app.post('/api/admin/auth/logout', (req, res) => {
  res.clearCookie('admin_token');
  res.json({ success: true });
});

// ============================================================
// DOCUMENT MANAGEMENT ROUTES
// ============================================================

// GET all submissions with filters
// Query params: ?visibility=pending|public|private&search=...&limit=50&offset=0
app.get('/api/admin/documents', requireAdmin, async (req, res) => {
  try {
    const { visibility, search, limit = 50, offset = 0 } = req.query;

    let whereClauses = [];
    let params = [];
    let paramIdx = 1;

    if (visibility && ['pending', 'public', 'private'].includes(visibility)) {
      whereClauses.push(`visibility = $${paramIdx++}`);
      params.push(visibility);
    }

    if (search) {
      whereClauses.push(
        `(doc_title ILIKE $${paramIdx} OR your_name ILIKE $${paramIdx} OR your_email ILIKE $${paramIdx})`
      );
      params.push(`%${search}%`);
      paramIdx++;
    }

    const where = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

    const countResult = await pool.query(
      `SELECT COUNT(*) FROM form_submissions ${where}`,
      params
    );

    const result = await pool.query(
      `SELECT 
        id, your_name, your_email, peer_reviewer_name, peer_reviewer_email,
        doc_title, source, s3_file_url, original_abstract, final_abstract,
        content_tags, visibility, reviewed_at, reviewed_by, created_at
       FROM form_submissions
       ${where}
       ORDER BY created_at DESC
       LIMIT $${paramIdx} OFFSET $${paramIdx + 1}`,
      [...params, parseInt(limit), parseInt(offset)]
    );

    res.json({
      total: parseInt(countResult.rows[0].count),
      documents: result.rows,
    });
  } catch (err) {
    console.error('GET /admin/documents error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// GET counts per visibility status (for dashboard stats)
app.get('/api/admin/documents/stats', requireAdmin, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        COUNT(*) FILTER (WHERE visibility = 'pending')  AS pending,
        COUNT(*) FILTER (WHERE visibility = 'public')   AS public,
        COUNT(*) FILTER (WHERE visibility = 'private')  AS private,
        COUNT(*) AS total
      FROM form_submissions
    `);
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH visibility of a single document
app.patch('/api/admin/documents/:id/visibility', requireAdmin, async (req, res) => {
  const { id } = req.params;
  const { visibility } = req.body;

  if (!['pending', 'public', 'private'].includes(visibility)) {
    return res.status(400).json({ error: 'Invalid visibility value' });
  }

  try {
    const result = await pool.query(
      `UPDATE form_submissions
       SET visibility = $1, reviewed_at = NOW(), reviewed_by = $2
       WHERE id = $3
       RETURNING id, doc_title, visibility, reviewed_at`,
      [visibility, req.admin.email, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Document not found' });
    }

    res.json({ success: true, document: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH visibility in bulk
app.patch('/api/admin/documents/bulk-visibility', requireAdmin, async (req, res) => {
  const { ids, visibility } = req.body;

  if (!Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ error: 'ids must be a non-empty array' });
  }
  if (!['pending', 'public', 'private'].includes(visibility)) {
    return res.status(400).json({ error: 'Invalid visibility value' });
  }

  try {
    const result = await pool.query(
      `UPDATE form_submissions
       SET visibility = $1, reviewed_at = NOW(), reviewed_by = $2
       WHERE id = ANY($3::int[])
       RETURNING id`,
      [visibility, req.admin.email, ids]
    );

    res.json({ success: true, updated: result.rows.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE a document (removes from Postgres AND S3)
app.delete('/api/admin/documents/:id', requireAdmin, async (req, res) => {
  const { id } = req.params;

  try {
    // Get S3 URL first
    const selectResult = await pool.query(
      'SELECT s3_file_url, doc_title FROM form_submissions WHERE id = $1',
      [id]
    );

    if (selectResult.rows.length === 0) {
      return res.status(404).json({ error: 'Document not found' });
    }

    const { s3_file_url, doc_title } = selectResult.rows[0];

    // Delete from S3 if file exists
    if (s3_file_url) {
      try {
        // Extract the S3 key from the URL
        const url = new URL(s3_file_url);
        const s3Key = url.pathname.slice(1); // removes leading /
        await s3Client.send(new DeleteObjectCommand({
          Bucket: process.env.S3_BUCKET_NAME,
          Key: s3Key,
        }));
        console.log(`✅ Deleted from S3: ${s3Key}`);
      } catch (s3Err) {
        console.error('S3 delete failed (continuing):', s3Err.message);
        // Don't block the DB delete if S3 fails
      }
    }

    // Delete from PostgreSQL
    await pool.query('DELETE FROM form_submissions WHERE id = $1', [id]);

    res.json({ success: true, deleted: { id, doc_title } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET a pre-signed S3 URL for secure document preview (15 min expiry)
app.get('/api/admin/documents/:id/preview', requireAdmin, async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      'SELECT s3_file_url, doc_title FROM form_submissions WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0 || !result.rows[0].s3_file_url) {
      return res.status(404).json({ error: 'Document or file not found' });
    }

    const { s3_file_url } = result.rows[0];
    const url = new URL(s3_file_url);
    const s3Key = url.pathname.slice(1);

    const signedUrl = await getSignedUrl(
      s3Client,
      new GetObjectCommand({ Bucket: process.env.S3_BUCKET_NAME, Key: s3Key }),
      { expiresIn: 900 } // 15 minutes
    );

    res.json({ signedUrl });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 5000;

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
