import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';

const BASE_URL = 'http://localhost:5000';

async function testHealthCheck() {
  console.log('🏥 Testing health check...');
  try {
    const response = await axios.get(`${BASE_URL}/api/health`);
    console.log('✅ Health check response:', response.data);
    return true;
  } catch (error) {
    console.error('❌ Health check failed:', error.message);
    return false;
  }
}

async function testWebhookNoFile() {
  console.log('\n📝 Testing webhook without file...');
  try {
    const formData = new FormData();
    formData.append('name', 'Test User');
    formData.append('email', 'test@example.com');
    formData.append('document_title', 'Test Document No File');
    formData.append('abstract', 'This is a test submission without a file.');
    formData.append('tags', 'test,no-file,metadata');

    const response = await axios.post(`${BASE_URL}/api/webhook/submission`, formData, {
      headers: formData.getHeaders(),
      timeout: 10000
    });

    console.log('✅ Success:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Failed:', error.response?.data || error.message);
    return null;
  }
}

async function testWebhookWithFile() {
  console.log('\n📎 Testing webhook with file...');
  
  // Create a simple test file
  const testContent = 'This is a test document for the webhook.\nCreated at: ' + new Date().toISOString();
  fs.writeFileSync('./test-doc.txt', testContent);
  
  try {
    const formData = new FormData();
    formData.append('name', 'Jane Researcher');
    formData.append('email', 'jane@university.edu');
    formData.append('document_title', 'Climate Research Paper 2024');
    formData.append('abstract', 'A comprehensive study on climate change impacts in coastal regions.');
    formData.append('tags', 'climate,research,coastal,environment');
    formData.append('document', fs.createReadStream('./test-doc.txt'));

    const response = await axios.post(`${BASE_URL}/api/webhook/submission`, formData, {
      headers: formData.getHeaders(),
      timeout: 30000 // Longer timeout for file upload
    });

    console.log('✅ Success:', response.data);
    
    // Clean up
    fs.unlinkSync('./test-doc.txt');
    return response.data;
    
  } catch (error) {
    console.error('❌ Failed:', error.response?.data || error.message);
    // Clean up even on error
    if (fs.existsSync('./test-doc.txt')) {
      fs.unlinkSync('./test-doc.txt');
    }
    return null;
  }
}

async function runTests() {
  console.log('🧪 Starting API Tests');
  console.log('='.repeat(40));
  
  // Test health check first
  const healthOk = await testHealthCheck();
  if (!healthOk) {
    console.log('❌ Health check failed - stopping tests');
    return;
  }
  
  // Wait a bit
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Test webhook without file
  await testWebhookNoFile();
  
  // Wait a bit
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Test webhook with file
  await testWebhookWithFile();
  
  console.log('\n✅ Tests completed!');
  console.log('='.repeat(40));
  console.log('Check your database: SELECT * FROM form_submissions ORDER BY created_at DESC LIMIT 5;');
}

// Run the tests
runTests().catch(console.error);