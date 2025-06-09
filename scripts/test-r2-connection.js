// scripts/test-r2-connection.js
// Quick script to test R2 connection and upload a test file

const { S3Client, PutObjectCommand, ListObjectsV2Command } = require('@aws-sdk/client-s3');
require('dotenv').config({ path: '.env.local' });

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function testR2Connection() {
  log('🔍 Testing R2 Connection...', 'cyan');
  log('==========================', 'cyan');
  
  // Check environment variables
  const requiredVars = ['R2_ACCOUNT_ID', 'R2_ACCESS_KEY_ID', 'R2_SECRET_ACCESS_KEY', 'R2_BUCKET_NAME', 'R2_PUBLIC_URL'];
  let allVarsPresent = true;
  
  for (const varName of requiredVars) {
    if (process.env[varName]) {
      log(`✓ ${varName}: ${varName.includes('SECRET') ? '***' : process.env[varName]}`, 'green');
    } else {
      log(`✗ ${varName}: NOT SET`, 'red');
      allVarsPresent = false;
    }
  }
  
  if (!allVarsPresent) {
    log('\n❌ Missing required environment variables!', 'red');
    return;
  }
  
  try {
    // Initialize R2 client
    const R2 = new S3Client({
      region: "auto",
      endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
      },
    });
    
    log('\n📋 Testing R2 bucket access...', 'yellow');
    
    // List objects (test read access)
    const listCommand = new ListObjectsV2Command({
      Bucket: process.env.R2_BUCKET_NAME,
      MaxKeys: 5
    });
    
    const listResponse = await R2.send(listCommand);
    log(`✓ Successfully connected to R2 bucket: ${process.env.R2_BUCKET_NAME}`, 'green');
    log(`  Found ${listResponse.KeyCount || 0} objects in bucket`, 'blue');
    
    // Upload test file (test write access)
    log('\n📤 Testing upload capability...', 'yellow');
    
    const testContent = `LoopLib R2 test file - ${new Date().toISOString()}`;
    const testKey = `test/r2-test-${Date.now()}.txt`;
    
    const uploadCommand = new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: testKey,
      Body: testContent,
      ContentType: 'text/plain',
    });
    
    await R2.send(uploadCommand);
    log(`✓ Successfully uploaded test file: ${testKey}`, 'green');
    
    // Test public URL
    const publicUrl = `${process.env.R2_PUBLIC_URL}/${testKey}`;
    log(`\n🌐 Testing public access...`, 'yellow');
    log(`  URL: ${publicUrl}`, 'blue');
    
    try {
      const response = await fetch(publicUrl);
      if (response.ok) {
        log('✓ Public URL is accessible!', 'green');
        const content = await response.text();
        log(`  Content: "${content.substring(0, 50)}..."`, 'blue');
      } else {
        log(`✗ Public URL returned status: ${response.status}`, 'red');
        log('  Make sure your R2 bucket has public access enabled!', 'yellow');
      }
    } catch (error) {
      log('✗ Failed to access public URL', 'red');
      log(`  Error: ${error.message}`, 'red');
      log('  This might be a CORS issue or the bucket is not public', 'yellow');
    }
    
    log('\n✅ R2 connection test complete!', 'green');
    log('\nYour R2 setup appears to be working correctly.', 'green');
    log('You can now run the bulk upload script: npm run upload:r2', 'cyan');
    
  } catch (error) {
    log('\n❌ R2 connection test failed!', 'red');
    log(`Error: ${error.message}`, 'red');
    
    if (error.name === 'NoSuchBucket') {
      log('\nThe bucket does not exist. Please create it in your Cloudflare dashboard.', 'yellow');
    } else if (error.name === 'AccessDenied') {
      log('\nAccess denied. Check your R2 credentials and permissions.', 'yellow');
    } else if (error.name === 'NetworkingError') {
      log('\nNetwork error. Check your internet connection and R2 endpoint.', 'yellow');
    }
  }
}

// Run the test
testR2Connection();