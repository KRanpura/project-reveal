// test-s3.js - Test S3 connection for Project Reveal
import dotenv from 'dotenv';
import AWS from 'aws-sdk';

dotenv.config();

// Configure AWS S3
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION
});

async function testS3Connection() {
  try {
    console.log('🔍 Testing Project Reveal S3 connection...');
    console.log(`📦 Bucket: ${process.env.S3_BUCKET_NAME}`);
    console.log(`🌍 Region: ${process.env.AWS_REGION}`);
    
    // Test 1: List objects in bucket
    console.log('\n📋 Testing bucket access...');
    const listParams = {
      Bucket: process.env.S3_BUCKET_NAME,
      MaxKeys: 5
    };
    
    const listResult = await s3.listObjectsV2(listParams).promise();
    console.log('✅ Bucket access successful!');
    console.log(`📁 Files in bucket: ${listResult.KeyCount}`);
    
    if (listResult.Contents && listResult.Contents.length > 0) {
      console.log('📄 Sample files:');
      listResult.Contents.forEach((file, index) => {
        console.log(`   ${index + 1}. ${file.Key} (${file.Size} bytes)`);
      });
    }
    
    // Test 2: Upload a test file
    console.log('\n📤 Testing file upload...');
    const testContent = JSON.stringify({
      test: true,
      timestamp: new Date().toISOString(),
      message: 'Project Reveal S3 test file'
    }, null, 2);
    
    const uploadParams = {
      Bucket: process.env.S3_BUCKET_NAME,
      Key: 'test/connection-test.json',
      Body: testContent,
      ContentType: 'application/json'
    };
    
    const uploadResult = await s3.upload(uploadParams).promise();
    console.log('✅ File upload successful!');
    console.log(`🔗 File URL: ${uploadResult.Location}`);
    
    // Test 3: Delete the test file
    console.log('\n🗑️  Cleaning up test file...');
    const deleteParams = {
      Bucket: process.env.S3_BUCKET_NAME,
      Key: 'test/connection-test.json'
    };
    
    await s3.deleteObject(deleteParams).promise();
    console.log('✅ Test file deleted successfully!');
    
    console.log('\n🎉 S3 is fully configured and ready for Project Reveal!');
    
  } catch (error) {
    console.error('❌ S3 connection failed:', error.message);
    
    if (error.code === 'NoSuchBucket') {
      console.log('💡 The bucket "project-reveal-archive" doesn\'t exist or isn\'t accessible');
    } else if (error.code === 'InvalidAccessKeyId') {
      console.log('💡 Check your AWS_ACCESS_KEY_ID in .env file');
    } else if (error.code === 'SignatureDoesNotMatch') {
      console.log('💡 Check your AWS_SECRET_ACCESS_KEY in .env file');
    } else {
      console.log('💡 Check your AWS credentials and bucket permissions');
    }
  }
}

testS3Connection();