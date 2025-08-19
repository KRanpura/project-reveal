// test-db.js - Run this to test your database connection
import dotenv from 'dotenv';
import pkg from 'pg';
const { Pool } = pkg;

dotenv.config();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

async function testConnection() {
  try {
    console.log('🔍 Testing Project Reveal database connection...');
    
    // Test basic connection
    const client = await pool.connect();
    console.log('✅ Database connection successful!');
    
    // Test our tables exist
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    
    console.log('📊 Tables found:', tablesResult.rows.map(row => row.table_name));
    
    // Test sample data
    const submissionsResult = await client.query('SELECT COUNT(*) FROM form_submissions');
    console.log(`📝 Form submissions in database: ${submissionsResult.rows[0].count}`);
    
    const categoriesResult = await client.query('SELECT name FROM categories ORDER BY name');
    console.log('🏷️  Categories available:', categoriesResult.rows.map(row => row.name));
    
    client.release();
    console.log('🎉 Project Reveal database is ready!');
    
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.log('\n🔧 Make sure Docker container is running:');
    console.log('   docker ps');
    console.log('   docker start project-reveal-postgres');
  } finally {
    await pool.end();
  }
}

testConnection();