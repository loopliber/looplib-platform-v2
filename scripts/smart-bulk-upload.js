// scripts/smart-bulk-upload.js
// Enhanced bulk upload with intelligent filename parsing and tag selection

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
const readline = require('readline');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

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
    genre: 'drill'
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

// Enhanced metadata parser for LoopLib naming convention
function parseFilename(filename) {
  // Remove file extension
  const nameWithoutExt = path.parse(filename).name;
  
  // Split by common separators and clean
  const parts = nameWithoutExt
    .replace(/@LOOPLIB/gi, '')
    .split(/[_\-\s]+/)
    .filter(part => part.length > 0);
  
  let name = '';
  let bpm = null;
  let key = null;
  
  for (let i = 0; i < parts.length; i++) {
    const part = parts[i].trim();
    
    // Check for BPM (numbers like 120, 130, etc.)
    if (/^\d{2,3}$/.test(part) && parseInt(part) >= 60 && parseInt(part) <= 200) {
      bpm = parseInt(part);
    }
    // Check for key (like dmin, gmaj, f#min, etc.)
    else if (/^[a-g][#b]?(min|maj|m|M)?$/i.test(part)) {
      key = part.toLowerCase()
        .replace('min', ' minor')
        .replace('maj', ' major')
        .replace(/^([a-g][#b]?)m$/i, '$1 minor')
        .replace(/^([a-g][#b]?)M$/i, '$1 major');
      
      // Capitalize first letter
      key = key.charAt(0).toUpperCase() + key.slice(1);
    }
    // Otherwise, it's part of the name
    else {
      if (name) name += ' ';
      name += part;
    }
  }
  
  // Clean up and format name
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

// Detect genre from filename and metadata
function detectGenre(filename, metadata) {
  const text = (filename + ' ' + metadata.name).toLowerCase();
  
  if (text.includes('trap')) return 'trap';
  if (text.includes('drill')) return 'drill';
  if (text.includes('soul') || text.includes('vintage')) return 'soul';
  if (text.includes('rnb') || text.includes('r&b')) return 'rnb';
  if (text.includes('hip') && text.includes('hop')) return 'hip-hop';
  if (text.includes('jazz')) return 'jazz';
  if (text.includes('funk')) return 'funk';
  if (text.includes('house')) return 'house';
  if (text.includes('techno')) return 'techno';
  
  return 'hip-hop'; // Default genre
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
  
  const choice = await question('\nEnter choice (1-5): ');
  const selectedCategory = tagCategories[choice];
  
  if (!selectedCategory) {
    log('Invalid choice, using default soul/vintage tags', 'yellow');
    return { tags: tagCategories[1].tags, genre: tagCategories[1].genre };
  }
  
  if (selectedCategory.name === 'Custom') {
    const customTags = await question('Enter custom tags (comma-separated): ');
    const customGenre = await question('Enter genre: ');
    return {
      tags: customTags.split(',').map(tag => tag.trim().toLowerCase()).filter(tag => tag.length > 0),
      genre: customGenre.trim().toLowerCase()
    };
  }
  
  log(`✓ Selected: ${selectedCategory.name} [${selectedCategory.tags.join(', ')}] → Genre: ${selectedCategory.genre}`, 'green');
  return { tags: selectedCategory.tags, genre: selectedCategory.genre };
}

async function uploadSample(filePath, metadata, selectedTags, selectedGenre) {
  try {
    // Read the file
    const fileBuffer = fs.readFileSync(filePath);
    const originalFilename = path.basename(filePath);
    const timestamp = Date.now();
    const fileExtension = path.extname(originalFilename);
    const storageFilename = `${metadata.name.toLowerCase().replace(/\s+/g, '_')}_${timestamp}${fileExtension}`;
    
    log(`⬆️  Uploading: ${originalFilename}`, 'cyan');
    
    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('samples')
      .upload(storageFilename, fileBuffer, {
        contentType: fileExtension === '.mp3' ? 'audio/mpeg' : 'audio/wav'
      });
    
    if (uploadError) {
      throw new Error(`Upload failed: ${uploadError.message}`);
    }
    
    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('samples')
      .getPublicUrl(storageFilename);
    
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
      const { data: newArtist, error: artistError } = await supabase
        .from('artists')
        .insert({
          name: 'LoopLib',
          bio: 'Premium samples and loops for music producers'
        })
        .select('id')
        .single();
      
      if (artistError) throw artistError;
      artistId = newArtist.id;
    }
    
    // Insert sample record - USE selectedGenre instead of detectGenre
    const sampleData = {
      name: metadata.name,
      artist_id: artistId,
      genre: selectedGenre, // ✅ Use the selected genre from tag categories
      bpm: metadata.bpm || 120,
      key: metadata.key || 'C major',
      duration: '0:30', // Default duration
      tags: selectedTags,
      file_url: publicUrl,
      downloads: 0,
      likes: 0,
      is_premium: false
    };
    
    const { data: sampleRecord, error: insertError } = await supabase
      .from('samples')
      .insert(sampleData)
      .select()
      .single();
    
    if (insertError) {
      throw new Error(`Database insert failed: ${insertError.message}`);
    }
    
    log(`✅ Successfully uploaded: ${metadata.name}`, 'green');
    log(`   Genre: ${sampleData.genre} | BPM: ${sampleData.bpm} | Key: ${sampleData.key}`, 'blue');
    log(`   Tags: [${selectedTags.join(', ')}]`, 'magenta');
    
    return sampleRecord;
    
  } catch (error) {
    log(`❌ Failed to upload ${path.basename(filePath)}: ${error.message}`, 'red');
    return null;
  }
}

async function main() {
  try {
    log('🎵 LoopLib Smart Bulk Upload', 'cyan');
    log('================================', 'cyan');
    
    // Get folder path
    const folderPath = await question('Enter folder path containing samples: ');
    
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
    
    // Select tags and genre for this folder
    const { tags: selectedTags, genre: selectedGenre } = await selectTagCategory();
    
    // Preview files and metadata
    log('\n📋 Preview of files to upload:', 'yellow');
    files.slice(0, 3).forEach(file => {
      const metadata = parseFilename(path.basename(file));
      log(`   ${path.basename(file)} → "${metadata.name}" (${metadata.bpm || 'unknown'} BPM, ${metadata.key || 'unknown'} key)`, 'blue');
    });
    
    if (files.length > 3) {
      log(`   ... and ${files.length - 3} more files`, 'blue');
    }
    
    const confirm = await question(`\n🚀 Upload ${files.length} files with tags [${selectedTags.join(', ')}]? (y/N): `);
    
    if (confirm.toLowerCase() !== 'y' && confirm.toLowerCase() !== 'yes') {
      log('❌ Upload cancelled', 'yellow');
      process.exit(0);
    }
    
    // Upload all files
    log('\n🚀 Starting upload...', 'green');
    let successCount = 0;
    let failCount = 0;
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const metadata = parseFilename(path.basename(file));
      
      log(`\n[${i + 1}/${files.length}] Processing: ${path.basename(file)}`, 'yellow');
      
      const result = await uploadSample(file, metadata, selectedTags, selectedGenre);
      
      if (result) {
        successCount++;
      } else {
        failCount++;
      }
      
      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    // Final summary
    log('\n🎉 Upload Complete!', 'green');
    log(`✅ Successfully uploaded: ${successCount} files`, 'green');
    if (failCount > 0) {
      log(`❌ Failed uploads: ${failCount} files`, 'red');
    }
    log(`🏷️  All files tagged with: [${selectedTags.join(', ')}]`, 'magenta');
    
  } catch (error) {
    log(`❌ Unexpected error: ${error.message}`, 'red');
  } finally {
    rl.close();
  }
}

// Run the script
main();
