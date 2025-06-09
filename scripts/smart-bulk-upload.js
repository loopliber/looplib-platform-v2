// scripts/smart-r2-bulk-upload.js
// Enhanced bulk upload to R2 with intelligent filename parsing and database sync

const { createClient } = require('@supabase/supabase-js');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const fs = require('fs');
const path = require('path');
const readline = require('readline');
require('dotenv').config({ path: '.env.local' });

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Initialize R2 client
const R2 = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

// Color codes for terminal
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m'
};

// Predefined tag categories
const tagCategories = {
  1: { 
    name: 'Soul/Vintage', 
    tags: ['soul', 'vintage', 'smooth', 'melodic'],
    genre: 'soul'
  },
  2: { 
    name: 'Dark Trap', 
    tags: ['dark', 'trap', 'hard', 'uptempo'],
    genre: 'trap'
  },
  3: { 
    name: 'Chill R&B', 
    tags: ['rnb', 'chill', 'mellow', 'atmospheric'],
    genre: 'rnb'
  },
  4: { 
    name: 'Drill Energy', 
    tags: ['drill', 'aggressive', 'intense', 'urban'],
    genre: 'trap'  // drill is a subgenre of trap
  },
  5: { 
    name: 'Hip-Hop Classic', 
    tags: ['hip-hop', 'boom bap', 'classic', 'beats'],
    genre: 'hip-hop'
  },
  6: { 
    name: 'Custom', 
    tags: [],
    genre: null
  }
};

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

// Enhanced metadata parser for LoopLib naming convention
function parseFilename(filename) {
  const nameWithoutExt = path.parse(filename).name;
  
  // Clean and split
  const parts = nameWithoutExt
    .replace(/@LOOPLIB/gi, '')
    .replace(/[_\-]+/g, ' ')
    .trim()
    .split(/\s+/)
    .filter(part => part.length > 0);
  
  let name = '';
  let bpm = null;
  let key = null;
  
  for (let i = 0; i < parts.length; i++) {
    const part = parts[i].trim();
    
    // Check for BPM
    if (/^\d{2,3}$/.test(part) && parseInt(part) >= 60 && parseInt(part) <= 200) {
      bpm = parseInt(part);
    }
    // Check for key notation
    else if (/^[a-g][#b]?(min|maj|minor|major|m|M)?$/i.test(part)) {
      key = formatKey(part);
    }
    // Otherwise, it's part of the name
    else {
      if (name) name += ' ';
      name += part;
    }
  }
  
  // Format name
  if (name) {
    name = name
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  } else {
    name = nameWithoutExt.replace(/@LOOPLIB/gi, '').trim();
  }
  
  return { name, bpm, key };
}

function formatKey(keyStr) {
  let key = keyStr.toLowerCase();
  
  // Convert various notations to standard format
  key = key
    .replace(/^([a-g][#b]?)min$/i, '$1 minor')
    .replace(/^([a-g][#b]?)maj$/i, '$1 major')
    .replace(/^([a-g][#b]?)m$/i, '$1 minor')
    .replace(/^([a-g][#b]?)M$/i, '$1 major');
  
  // Capitalize first letter
  return key.charAt(0).toUpperCase() + key.slice(1);
}

async function selectTagCategory() {
  log('\n📁 Select tag category for this folder:', 'cyan');
  Object.entries(tagCategories).forEach(([key, category]) => {
    if (category.name === 'Custom') {
      log(`${key}. ${category.name} (enter your own tags)`, 'yellow');
    } else {
      log(`${key}. ${category.name} [${category.tags.join(', ')}] → Genre: ${category.genre}`, 'blue');
    }
  });
  
  const choice = await question('\nEnter choice (1-6): ');
  const selectedCategory = tagCategories[choice];
  
  if (!selectedCategory) {
    log('Invalid choice, using default trap tags', 'yellow');
    return { tags: tagCategories[2].tags, genre: tagCategories[2].genre };
  }
  
  if (selectedCategory.name === 'Custom') {
    const customTags = await question('Enter custom tags (comma-separated): ');
    const customGenre = await question('Enter genre (trap/soul/rnb): ');
    return {
      tags: customTags.split(',').map(tag => tag.trim().toLowerCase()).filter(tag => tag.length > 0),
      genre: customGenre.trim().toLowerCase()
    };
  }
  
  log(`✓ Selected: ${selectedCategory.name} [${selectedCategory.tags.join(', ')}] → Genre: ${selectedCategory.genre}`, 'green');
  return { tags: selectedCategory.tags, genre: selectedCategory.genre };
}

async function uploadToR2(filePath, storageKey) {
  const fileBuffer = fs.readFileSync(filePath);
  const fileExtension = path.extname(filePath).toLowerCase();
  
  const contentType = {
    '.mp3': 'audio/mpeg',
    '.wav': 'audio/wav',
    '.aiff': 'audio/aiff',
    '.flac': 'audio/flac'
  }[fileExtension] || 'audio/mpeg';
  
  const command = new PutObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME,
    Key: storageKey,
    Body: fileBuffer,
    ContentType: contentType,
    CacheControl: 'public, max-age=31536000', // 1 year cache
  });
  
  await R2.send(command);
  
  // Return the public URL
  return `${process.env.R2_PUBLIC_URL}/${storageKey}`;
}

async function uploadSample(filePath, metadata, selectedTags, selectedGenre, artistName = 'LoopLib') {
  try {
    const originalFilename = path.basename(filePath);
    const timestamp = Date.now();
    const fileExtension = path.extname(originalFilename);
    const cleanName = metadata.name.toLowerCase().replace(/[^a-z0-9]/g, '_');
    const storageKey = `samples/${cleanName}_${timestamp}${fileExtension}`;
    
    log(`⬆️  Uploading to R2: ${originalFilename}`, 'cyan');
    
    // Upload to R2
    const publicUrl = await uploadToR2(filePath, storageKey);
    log(`   ✓ Uploaded to R2: ${storageKey}`, 'green');
    
    // Get file size
    const stats = fs.statSync(filePath);
    const fileSize = stats.size;
    
    // Ensure artist exists (create default artist)
    const { data: artists } = await supabase
      .from('artists')
      .select('id')
      .eq('name', artistName)
      .limit(1);
    
    let artistId = null;
    
    if (artists && artists.length > 0) {
      artistId = artists[0].id;
    } else {
      // Create artist if doesn't exist
      const { data: newArtist, error: artistError } = await supabase
        .from('artists')
        .insert({
          name: artistName,
          bio: 'Premium samples and loops for music producers'
        })
        .select('id')
        .single();
      
      if (!artistError && newArtist) {
        artistId = newArtist.id;
      }
    }
    
    // Insert sample record
    const sampleData = {
      name: metadata.name,
      artist_id: artistId,
      artist_name: artistName, // Also store as text for easier queries
      genre: selectedGenre,
      bpm: metadata.bpm || 120,
      key: metadata.key || 'C',
      tags: selectedTags,
      file_url: publicUrl,
      file_name: originalFilename,
      file_size: fileSize,
      downloads: 0,
      has_stems: false,
      created_at: new Date().toISOString()
    };
    
    const { data: sampleRecord, error: insertError } = await supabase
      .from('samples')
      .insert(sampleData)
      .select()
      .single();
    
    if (insertError) {
      throw new Error(`Database insert failed: ${insertError.message}`);
    }
    
    log(`✅ Success: ${metadata.name}`, 'green');
    log(`   URL: ${publicUrl}`, 'blue');
    log(`   Genre: ${sampleData.genre} | BPM: ${sampleData.bpm} | Key: ${sampleData.key}`, 'blue');
    log(`   Tags: [${selectedTags.join(', ')}]`, 'magenta');
    
    return sampleRecord;
    
  } catch (error) {
    log(`❌ Failed to upload ${path.basename(filePath)}: ${error.message}`, 'red');
    console.error(error); // Log full error for debugging
    return null;
  }
}

async function checkR2Configuration() {
  log('\n🔧 Checking R2 configuration...', 'cyan');
  
  const requiredEnvVars = [
    'R2_ACCOUNT_ID',
    'R2_ACCESS_KEY_ID',
    'R2_SECRET_ACCESS_KEY',
    'R2_BUCKET_NAME',
    'R2_PUBLIC_URL'
  ];
  
  let configValid = true;
  
  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      log(`❌ Missing environment variable: ${envVar}`, 'red');
      configValid = false;
    } else {
      log(`✓ ${envVar}: ${envVar.includes('SECRET') ? '***' : process.env[envVar]}`, 'green');
    }
  }
  
  if (!configValid) {
    log('\n❌ R2 configuration is incomplete. Please check your .env.local file.', 'red');
    log('Required variables:', 'yellow');
    log('  R2_ACCOUNT_ID=your_account_id', 'yellow');
    log('  R2_ACCESS_KEY_ID=your_access_key', 'yellow');
    log('  R2_SECRET_ACCESS_KEY=your_secret_key', 'yellow');
    log('  R2_BUCKET_NAME=your_bucket_name', 'yellow');
    log('  R2_PUBLIC_URL=https://pub-xxxxx.r2.dev', 'yellow');
    process.exit(1);
  }
  
  log('✅ R2 configuration valid', 'green');
}

async function main() {
  try {
    log('🎵 LoopLib Smart R2 Bulk Upload', 'cyan');
    log('===================================', 'cyan');
    
    // Check R2 configuration
    await checkR2Configuration();
    
    // Get folder path
    const folderPath = await question('\nEnter folder path containing samples: ');
    
    if (!fs.existsSync(folderPath)) {
      log('❌ Folder not found!', 'red');
      process.exit(1);
    }
    
    // Get all audio files
    const files = fs.readdirSync(folderPath)
      .filter(file => /\.(mp3|wav|aiff|flac)$/i.test(file))
      .map(file => path.join(folderPath, file));
    
    if (files.length === 0) {
      log('❌ No audio files found in the specified folder!', 'red');
      process.exit(1);
    }
    
    log(`\n📁 Found ${files.length} audio files`, 'blue');
    
    // Optional: Get artist name
    const customArtist = await question('\nArtist name (press Enter for "LoopLib"): ');
    const artistName = customArtist.trim() || 'LoopLib';
    
    // Select tags and genre for this folder
    const { tags: selectedTags, genre: selectedGenre } = await selectTagCategory();
    
    // Preview files and metadata
    log('\n📋 Preview of files to upload:', 'yellow');
    files.slice(0, 5).forEach(file => {
      const metadata = parseFilename(path.basename(file));
      log(`   ${path.basename(file)}`, 'cyan');
      log(`   → "${metadata.name}" (${metadata.bpm || '?'} BPM, ${metadata.key || '?'})`, 'blue');
    });
    
    if (files.length > 5) {
      log(`   ... and ${files.length - 5} more files`, 'blue');
    }
    
    const confirm = await question(`\n🚀 Upload ${files.length} files to R2 with tags [${selectedTags.join(', ')}]? (y/N): `);
    
    if (confirm.toLowerCase() !== 'y' && confirm.toLowerCase() !== 'yes') {
      log('❌ Upload cancelled', 'yellow');
      process.exit(0);
    }
    
    // Upload all files
    log('\n🚀 Starting upload to R2...', 'green');
    let successCount = 0;
    let failCount = 0;
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const metadata = parseFilename(path.basename(file));
      
      log(`\n[${i + 1}/${files.length}] Processing: ${path.basename(file)}`, 'yellow');
      
      const result = await uploadSample(file, metadata, selectedTags, selectedGenre, artistName);
      
      if (result) {
        successCount++;
      } else {
        failCount++;
      }
      
      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    // Final summary
    log('\n🎉 Upload Complete!', 'green');
    log(`✅ Successfully uploaded: ${successCount} files`, 'green');
    if (failCount > 0) {
      log(`❌ Failed uploads: ${failCount} files`, 'red');
    }
    log(`🏷️  All files tagged with: [${selectedTags.join(', ')}]`, 'magenta');
    log(`🎨 Genre: ${selectedGenre}`, 'magenta');
    log(`👤 Artist: ${artistName}`, 'magenta');
    log(`🌐 R2 Bucket: ${process.env.R2_BUCKET_NAME}`, 'blue');
    
  } catch (error) {
    log(`❌ Unexpected error: ${error.message}`, 'red');
    console.error(error);
  } finally {
    rl.close();
  }
}

// Run the script
main();