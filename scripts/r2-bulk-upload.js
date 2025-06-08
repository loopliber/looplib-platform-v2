// scripts/r2-bulk-upload.js
const { createClient } = require('@supabase/supabase-js');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const fs = require('fs').promises;
const fsSync = require('fs');
const path = require('path');
const readline = require('readline');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegStatic = require('ffmpeg-static');
const crypto = require('crypto');
require('dotenv').config({ path: '.env.local' });

// Configure ffmpeg
ffmpeg.setFfmpegPath(ffmpegStatic);

// Initialize clients
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const r2Client = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

// Configuration
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME;
const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL;
const BATCH_SIZE = 5; // Process 5 files at a time to avoid overwhelming
const PREVIEW_DURATION = 25; // seconds

// Your existing color codes and tag categories
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m'
};

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
    genre: 'trap' // Changed to trap since drill isn't in your schema
  },
  5: { 
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

// Your existing parseFilename function
function parseFilename(filename) {
  const nameWithoutExt = path.parse(filename).name;
  
  const parts = nameWithoutExt
    .replace(/@LOOPLIB/gi, '')
    .split(/[_\-\s]+/)
    .filter(part => part.length > 0);
  
  let name = '';
  let bpm = null;
  let key = null;
  
  for (let i = 0; i < parts.length; i++) {
    const part = parts[i].trim();
    
    if (/^\d{2,3}$/.test(part) && parseInt(part) >= 60 && parseInt(part) <= 200) {
      bpm = parseInt(part);
    }
    else if (/^[a-g][#b]?(min|maj|m|M)?$/i.test(part)) {
      key = part.toLowerCase()
        .replace('min', ' minor')
        .replace('maj', ' major')
        .replace(/^([a-g][#b]?)m$/i, '$1 minor')
        .replace(/^([a-g][#b]?)M$/i, '$1 major');
      
      key = key.charAt(0).toUpperCase() + key.slice(1);
    }
    else {
      if (name) name += ' ';
      name += part;
    }
  }
  
  if (name) {
    name = name
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  } else {
    name = path.parse(filename).name.replace(/@LOOPLIB/gi, '').trim();
  }
  
  return { name, bpm, key };
}

// Generate preview using ffmpeg
async function generatePreview(inputPath, outputPath) {
  return new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .setStartTime(0)
      .setDuration(PREVIEW_DURATION)
      .audioCodec('libmp3lame')
      .audioBitrate('128k')
      .audioChannels(2)
      .audioFrequency(44100)
      .output(outputPath)
      .on('end', resolve)
      .on('error', reject)
      .run();
  });
}

// Get audio duration
async function getAudioDuration(filePath) {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(filePath, (err, metadata) => {
      if (err) reject(err);
      else resolve(Math.round(metadata.format.duration));
    });
  });
}

// Upload file to R2
async function uploadToR2(filePath, key, contentType) {
  const fileBuffer = await fs.readFile(filePath);
  
  const command = new PutObjectCommand({
    Bucket: R2_BUCKET_NAME,
    Key: key,
    Body: fileBuffer,
    ContentType: contentType,
    CacheControl: 'public, max-age=31536000',
  });
  
  await r2Client.send(command);
  return `${R2_PUBLIC_URL}/${key}`;
}

// Generate simple waveform data
function generateWaveformData(length = 100) {
  return Array.from({ length }, () => 0.2 + Math.random() * 0.6);
}

// Your existing selectTagCategory function
async function selectTagCategory() {
  log('\n📁 Select tag category for this folder:', 'cyan');
  Object.entries(tagCategories).forEach(([key, category]) => {
    if (category.name === 'Custom') {
      log(`${key}. ${category.name} (enter your own tags)`, 'yellow');
    } else {
      log(`${key}. ${category.name} [${category.tags.join(', ')}] → Genre: ${category.genre}`, 'blue');
    }
  });
  
  const choice = await question('\nEnter choice (1-5): ');
  const selectedCategory = tagCategories[choice];
  
  if (!selectedCategory) {
    log('Invalid choice, using default soul/vintage tags', 'yellow');
    return { tags: tagCategories[1].tags, genre: tagCategories[1].genre };
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

// Enhanced upload function for R2
async function uploadSampleToR2(filePath, metadata, selectedTags, selectedGenre) {
  const tempDir = path.join(__dirname, 'temp', crypto.randomBytes(8).toString('hex'));
  
  try {
    // Create temp directory
    await fs.mkdir(tempDir, { recursive: true });
    
    const sampleId = crypto.randomUUID();
    const timestamp = Date.now();
    const fileExtension = path.extname(filePath);
    const originalFilename = path.basename(filePath);
    
    log(`⬆️  Processing: ${originalFilename}`, 'cyan');
    
    // Get audio duration
    let duration = 30; // default
    try {
      duration = await getAudioDuration(filePath);
    } catch (err) {
      log(`   ⚠️  Could not determine duration, using default`, 'yellow');
    }
    
    // Generate preview
    const previewPath = path.join(tempDir, 'preview.mp3');
    log(`   🎵 Generating ${PREVIEW_DURATION}s preview...`, 'blue');
    await generatePreview(filePath, previewPath);
    
    // Upload files to R2
    const fullKey = `full/${sampleId}_${timestamp}_full${fileExtension}`;
    const previewKey = `previews/${sampleId}_${timestamp}_preview.mp3`;
    
    log(`   ☁️  Uploading to R2...`, 'blue');
    const [fullUrl, previewUrl] = await Promise.all([
      uploadToR2(filePath, fullKey, fileExtension === '.mp3' ? 'audio/mpeg' : 'audio/wav'),
      uploadToR2(previewPath, previewKey, 'audio/mpeg')
    ]);
    
    // Get or create artist
    let artistId = null;
    const { data: existingArtist } = await supabase
      .from('artists')
      .select('id')
      .eq('name', 'LoopLib')
      .single();
    
    if (existingArtist) {
      artistId = existingArtist.id;
    } else {
      const { data: newArtist } = await supabase
        .from('artists')
        .insert({
          name: 'LoopLib',
          bio: 'Premium samples and loops for music producers'
        })
        .select('id')
        .single();
      
      artistId = newArtist.id;
    }
    
    // Insert into database
    const sampleData = {
      id: sampleId,
      name: metadata.name,
      artist_id: artistId,
      genre: selectedGenre,
      bpm: metadata.bpm || 120,
      key: metadata.key || 'C major',
      duration: `${Math.floor(duration / 60)}:${(duration % 60).toString().padStart(2, '0')}`,
      tags: selectedTags,
      file_url: fullUrl,
      preview_url: previewUrl,
      waveform_data: generateWaveformData(),
      downloads: 0,
      likes: 0,
      is_premium: false,
      has_stems: false
    };
    
    const { data: sampleRecord, error: insertError } = await supabase
      .from('samples')
      .insert(sampleData)
      .select()
      .single();
    
    if (insertError) {
      throw new Error(`Database insert failed: ${insertError.message}`);
    }
    
    // Clean up temp files
    await fs.rm(tempDir, { recursive: true, force: true });
    
    log(`✅ Successfully uploaded: ${metadata.name}`, 'green');
    log(`   Genre: ${sampleData.genre} | BPM: ${sampleData.bpm} | Key: ${sampleData.key}`, 'blue');
    log(`   Duration: ${sampleData.duration} | Preview: ${PREVIEW_DURATION}s`, 'blue');
    log(`   Tags: [${selectedTags.join(', ')}]`, 'magenta');
    
    return sampleRecord;
    
  } catch (error) {
    // Clean up on error
    try {
      await fs.rm(tempDir, { recursive: true, force: true });
    } catch {}
    
    log(`❌ Failed to upload ${path.basename(filePath)}: ${error.message}`, 'red');
    return null;
  }
}

// Process files in batches
async function processBatch(files, selectedTags, selectedGenre, startIndex) {
  const results = await Promise.all(
    files.map((file, i) => {
      const metadata = parseFilename(path.basename(file));
      log(`\n[${startIndex + i + 1}/${totalFileCount}] Processing: ${path.basename(file)}`, 'yellow');
      return uploadSampleToR2(file, metadata, selectedTags, selectedGenre);
    })
  );
  
  return results;
}

let totalFileCount = 0; // Global for logging

async function main() {
  try {
    log('🎵 LoopLib R2 Bulk Upload with Preview Generation', 'cyan');
    log('================================================', 'cyan');
    
    // Check environment variables
    const requiredEnvVars = ['R2_ACCOUNT_ID', 'R2_ACCESS_KEY_ID', 'R2_SECRET_ACCESS_KEY', 'R2_BUCKET_NAME', 'R2_PUBLIC_URL'];
    const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
    
    if (missingVars.length > 0) {
      log(`❌ Missing environment variables: ${missingVars.join(', ')}`, 'red');
      log('   Please check your .env.local file', 'yellow');
      process.exit(1);
    }
    
    // Get folder path
    const folderPath = await question('Enter folder path containing samples: ');
    
    if (!fsSync.existsSync(folderPath)) {
      log('❌ Folder not found!', 'red');
      process.exit(1);
    }
    
    // Get all audio files
    const files = fsSync.readdirSync(folderPath)
      .filter(file => /\.(mp3|wav|aiff|flac)$/i.test(file))
      .map(file => path.join(folderPath, file));
    
    totalFileCount = files.length;
    
    if (files.length === 0) {
      log('❌ No audio files found in the specified folder!', 'red');
      process.exit(1);
    }
    
    log(`\n📁 Found ${files.length} audio files`, 'blue');
    log(`⚡ Will generate ${PREVIEW_DURATION}-second previews for each`, 'cyan');
    log(`📦 Processing in batches of ${BATCH_SIZE} files`, 'cyan');
    
    // Select tags and genre
    const { tags: selectedTags, genre: selectedGenre } = await selectTagCategory();
    
    // Preview files
    log('\n📋 Preview of files to upload:', 'yellow');
    files.slice(0, 3).forEach(file => {
      const metadata = parseFilename(path.basename(file));
      log(`   ${path.basename(file)} → "${metadata.name}" (${metadata.bpm || '?'} BPM, ${metadata.key || '?'} key)`, 'blue');
    });
    
    if (files.length > 3) {
      log(`   ... and ${files.length - 3} more files`, 'blue');
    }
    
    const confirm = await question(`\n🚀 Upload ${files.length} files to R2 with genre "${selectedGenre}" and tags [${selectedTags.join(', ')}]? (y/N): `);
    
    if (confirm.toLowerCase() !== 'y' && confirm.toLowerCase() !== 'yes') {
      log('❌ Upload cancelled', 'yellow');
      process.exit(0);
    }
    
    // Process in batches
    log('\n🚀 Starting upload to Cloudflare R2...', 'green');
    let successCount = 0;
    let failCount = 0;
    
    for (let i = 0; i < files.length; i += BATCH_SIZE) {
      const batch = files.slice(i, i + BATCH_SIZE);
      log(`\n📦 Processing batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(files.length / BATCH_SIZE)}`, 'yellow');
      
      const results = await processBatch(batch, selectedTags, selectedGenre, i);
      
      results.forEach(result => {
        if (result) successCount++;
        else failCount++;
      });
      
      // Small delay between batches
      if (i + BATCH_SIZE < files.length) {
        log(`   ⏳ Waiting before next batch...`, 'blue');
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
    
    // Final summary
    log('\n🎉 Upload Complete!', 'green');
    log(`✅ Successfully uploaded: ${successCount} files`, 'green');
    if (failCount > 0) {
      log(`❌ Failed uploads: ${failCount} files`, 'red');
    }
    log(`🏷️  All files tagged with: [${selectedTags.join(', ')}]`, 'magenta');
    log(`☁️  Files stored in Cloudflare R2 bucket: ${R2_BUCKET_NAME}`, 'cyan');
    log(`🎵 Preview duration: ${PREVIEW_DURATION} seconds for all files`, 'cyan');
    
  } catch (error) {
    log(`❌ Unexpected error: ${error.message}`, 'red');
  } finally {
    rl.close();
  }
}

// Run the script
main();