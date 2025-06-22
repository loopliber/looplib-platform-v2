// scripts/upload-folder.js
const { createClient } = require('@supabase/supabase-js');
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const fs = require('fs').promises;
const path = require('path');
const readline = require('readline');
require('dotenv').config({ path: '.env.local' });

// Configuration
const CONFIG = {
  SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  SUPABASE_SERVICE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  R2_ACCOUNT_ID: process.env.R2_ACCOUNT_ID,
  R2_ACCESS_KEY: process.env.R2_ACCESS_KEY_ID,
  R2_SECRET_KEY: process.env.R2_SECRET_ACCESS_KEY,
  R2_BUCKET_NAME: process.env.R2_BUCKET_NAME || 'looplib-samples',
  R2_PUBLIC_URL: 'https://pub-2a46ae07b1bf4d6c9c90d2138d740df6.r2.dev',
};

// Initialize clients
const supabase = createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_SERVICE_KEY);
const r2Client = new S3Client({
  region: "auto",
  endpoint: `https://${CONFIG.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: CONFIG.R2_ACCESS_KEY,
    secretAccessKey: CONFIG.R2_SECRET_KEY,
  },
});

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Helper to ask questions
const question = (text) => new Promise((resolve) => rl.question(text, resolve));

// Progress tracking
let progress = {
  total: 0,
  completed: 0,
  failed: 0,
  startTime: Date.now()
};

// Extract metadata from filename
function extractMetadataFromFilename(filename, genre) {
  // Remove extension
  const nameWithoutExt = path.basename(filename, path.extname(filename));
  
  // Try to extract BPM from filename (common patterns: _140bpm, -140-bpm, 140BPM, etc.)
  const bpmMatch = nameWithoutExt.match(/(\d{2,3})\s*bpm/i) || 
                   nameWithoutExt.match(/bpm\s*(\d{2,3})/i) ||
                   nameWithoutExt.match(/[-_](\d{2,3})[-_]/);
  const bpm = bpmMatch ? parseInt(bpmMatch[1]) : (genre === 'trap' ? 140 : genre === 'rnb' ? 85 : 95);
  
  // Try to extract key (e.g., Cmaj, C_minor, F#m, etc.)
  const keyMatch = nameWithoutExt.match(/([A-G][#b]?)\s*(maj|min|major|minor|m)/i);
  let key = 'C';
  if (keyMatch) {
    key = keyMatch[1].toUpperCase();
    if (keyMatch[2] && keyMatch[2].toLowerCase().includes('min')) {
      key += ' minor';
    } else {
      key += ' major';
    }
  }
  
  // Clean name for display
  let cleanName = nameWithoutExt
    .replace(/[-_]/g, ' ')
    .replace(/\s+/g, ' ')
    .replace(/\d{2,3}\s*bpm/gi, '')
    .replace(/bpm\s*\d{2,3}/gi, '')
    .replace(/[A-G][#b]?\s*(maj|min|major|minor|m)/gi, '')
    .trim();
  
  // Capitalize words
  cleanName = cleanName.split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
  
  // Generate tags based on genre and filename
  const tags = [];
  
  // Genre-specific tags
  if (genre === 'trap') {
    tags.push('trap', 'hip-hop');
    if (nameWithoutExt.toLowerCase().includes('dark')) tags.push('dark');
    if (nameWithoutExt.toLowerCase().includes('hard')) tags.push('hard');
    if (nameWithoutExt.toLowerCase().includes('melodic')) tags.push('melodic');
  } else if (genre === 'rnb') {
    tags.push('rnb', 'r&b');
    if (nameWithoutExt.toLowerCase().includes('smooth')) tags.push('smooth');
    if (nameWithoutExt.toLowerCase().includes('soul')) tags.push('neo-soul');
  } else if (genre === 'soul') {
    tags.push('soul', 'vintage');
    if (nameWithoutExt.toLowerCase().includes('gospel')) tags.push('gospel');
    if (nameWithoutExt.toLowerCase().includes('classic')) tags.push('classic');
  }
  
  // Add common descriptive tags
  if (nameWithoutExt.toLowerCase().includes('piano')) tags.push('piano');
  if (nameWithoutExt.toLowerCase().includes('guitar')) tags.push('guitar');
  if (nameWithoutExt.toLowerCase().includes('bass')) tags.push('bass');
  if (nameWithoutExt.toLowerCase().includes('drums')) tags.push('drums');
  if (nameWithoutExt.toLowerCase().includes('melody')) tags.push('melody');
  if (nameWithoutExt.toLowerCase().includes('loop')) tags.push('loop');
  
  return {
    name: cleanName || `${genre.charAt(0).toUpperCase() + genre.slice(1)} Sample`,
    bpm,
    key,
    tags: [...new Set(tags)] // Remove duplicates
  };
}

// Upload to R2
async function uploadToR2(key, body, contentType) {
  const command = new PutObjectCommand({
    Bucket: CONFIG.R2_BUCKET_NAME,
    Key: key,
    Body: body,
    ContentType: contentType,
    CacheControl: 'public, max-age=31536000',
  });

  await r2Client.send(command);
  return `${CONFIG.R2_PUBLIC_URL}/${key}`;
}

// Get or create artist
async function getOrCreateArtist(artistName) {
  const { data: existing } = await supabase
    .from('artists')
    .select('id')
    .eq('name', artistName)
    .maybeSingle();

  if (existing) return existing.id;

  const { data: newArtist, error } = await supabase
    .from('artists')
    .insert({ name: artistName })
    .select('id')
    .single();

  if (error) throw error;
  return newArtist.id;
}

// Process single file
async function processFile(filePath, genre, artistName, folderName) {
  const filename = path.basename(filePath);
  
  try {
    // Read file
    const fileBuffer = await fs.readFile(filePath);
    const fileStats = await fs.stat(filePath);
    
    // Extract metadata from filename
    const metadata = extractMetadataFromFilename(filename, genre);
    
    // Generate unique R2 key with organized folder structure
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(7);
    const extension = path.extname(filename);
    const cleanName = path.basename(filename, extension)
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .substring(0, 50);
    
    // Create organized folder structure: genre/artist/pack-name/filename
    const r2Key = `${genre}/${artistName.toLowerCase().replace(/[^a-z0-9]/g, '-')}/${folderName}/${cleanName}-${timestamp}-${randomId}${extension}`;
    
    console.log(`  📤 Uploading to: ${genre}/${artistName}/${folderName}/`);
    console.log(`     ${metadata.name} (${metadata.bpm} BPM, ${metadata.key})`);
    
    // Upload to R2
    const fileUrl = await uploadToR2(r2Key, fileBuffer, 'audio/mpeg');
    
    // Get or create artist
    const artistId = await getOrCreateArtist(artistName);
    
    // Insert into database
    const { error } = await supabase
      .from('samples')
      .insert({
        name: metadata.name,
        artist_id: artistId,
        file_url: fileUrl,
        file_name: filename,
        bpm: metadata.bpm,
        key: metadata.key,
        genre: genre,
        tags: metadata.tags
      });

    if (error) throw error;
    
    console.log(`  ✅ Success: ${metadata.name}`);
    progress.completed++;
    return { success: true };
    
  } catch (error) {
    console.log(`  ❌ Failed: ${filename} - ${error.message}`);
    progress.failed++;
    return { success: false, error: error.message, filename };
  }
}

// Main function - updated
async function main() {
  console.log('\n🎵 LoopLib Folder Upload Tool\n');
  
  try {
    // Ask for folder path
    const folderPath = await question('📁 Enter the path to your folder (drag & drop works too): ');
    const cleanPath = folderPath.trim().replace(/['"]/g, ''); // Remove quotes if dragged
    
    // Check if folder exists
    try {
      const stats = await fs.stat(cleanPath);
      if (!stats.isDirectory()) {
        console.log('❌ Error: Path is not a directory');
        process.exit(1);
      }
    } catch (error) {
      console.log('❌ Error: Folder not found');
      process.exit(1);
    }
    
    // Ask for pack/folder name in bucket
    const originalFolderName = path.basename(cleanPath);
    const suggestedName = originalFolderName.toLowerCase().replace(/[^a-z0-9]/g, '-');
    const packName = await question(`📦 Enter pack/folder name for R2 bucket (suggested: "${suggestedName}"): `);
    const finalPackName = packName.trim() || suggestedName;
    
    // Ask for genre
    console.log('\n🎹 Select genre:');
    console.log('1) Trap');
    console.log('2) R&B');
    console.log('3) Soul');
    const genreChoice = await question('\nEnter number (1-3): ');
    
    const genreMap = {
      '1': 'trap',
      '2': 'rnb',
      '3': 'soul'
    };
    
    const genre = genreMap[genreChoice.trim()];
    if (!genre) {
      console.log('❌ Invalid genre selection');
      process.exit(1);
    }
    
    // Ask for artist name
    const artistName = await question('\n🎤 Enter artist/producer name (or press Enter for "LoopLib"): ');
    const artist = artistName.trim() || 'LoopLib';
    
    // Get all audio files in folder
    console.log(`\n📂 Scanning folder for audio files...`);
    const files = await fs.readdir(cleanPath);
    const audioFiles = files.filter(file => 
      ['.mp3', '.wav', '.m4a', '.flac'].includes(path.extname(file).toLowerCase())
    );
    
    if (audioFiles.length === 0) {
      console.log('❌ No audio files found in folder');
      process.exit(1);
    }
    
    progress.total = audioFiles.length;
    console.log(`✅ Found ${audioFiles.length} audio files`);
    console.log(`📁 Will be organized in: ${genre}/${artist}/${finalPackName}/\n`);
    
    // Confirm upload
    const confirm = await question(`Ready to upload ${audioFiles.length} ${genre} samples by ${artist} to "${finalPackName}" folder? (y/n): `);
    if (confirm.toLowerCase() !== 'y') {
      console.log('Upload cancelled');
      process.exit(0);
    }
    
    console.log('\n🚀 Starting upload...\n');
    
    // Process files in batches
    const BATCH_SIZE = 3;
    const failed = [];
    
    for (let i = 0; i < audioFiles.length; i += BATCH_SIZE) {
      const batch = audioFiles.slice(i, i + BATCH_SIZE);
      
      const batchPromises = batch.map(file => {
        const filePath = path.join(cleanPath, file);
        return processFile(filePath, genre, artist, finalPackName);
      });
      
      const results = await Promise.all(batchPromises);
      
      // Track failed uploads
      results.forEach((result, index) => {
        if (!result.success) {
          failed.push({
            filename: batch[index],
            error: result.error
          });
        }
      });
      
      // Progress update
      const percentage = Math.round(((progress.completed + progress.failed) / progress.total) * 100);
      console.log(`\n📊 Progress: ${progress.completed + progress.failed}/${progress.total} (${percentage}%)\n`);
      
      // Small delay between batches
      if (i + BATCH_SIZE < audioFiles.length) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
    
    // Summary
    const elapsed = Math.round((Date.now() - progress.startTime) / 1000);
    console.log('\n✨ Upload Complete!');
    console.log(`✅ Successful: ${progress.completed}`);
    console.log(`❌ Failed: ${progress.failed}`);
    console.log(`📁 Folder: ${genre}/${artist}/${finalPackName}/`);
    console.log(`⏱️  Time: ${elapsed} seconds`);
    
    // Save failed uploads
    if (failed.length > 0) {
      const failedPath = `./failed-uploads-${Date.now()}.json`;
      await fs.writeFile(failedPath, JSON.stringify(failed, null, 2));
      console.log(`\n💾 Failed uploads saved to: ${failedPath}`);
    }
    
  } catch (error) {
    console.error('\n❌ Error:', error);
  } finally {
    rl.close();
  }
}

// Run the script
main();