// scripts/bulk-upload-parser.js
// Bulk upload 1000+ samples to Supabase with automatic metadata parsing

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
  cyan: '\x1b[36m'
};

// Parse metadata from filename
// Format: "moonshine_138 bmin @looplib.mp3" → {name: "Moonshine", bpm: 138, key: "B min"}
function parseFilename(filename) {
  // Remove extension
  const nameWithoutExt = filename.replace(/\.(mp3|wav|m4a|flac)$/i, '');
  
  // Extract producer tag (after @)
  const producerMatch = nameWithoutExt.match(/@(.+)$/);
  const producer = producerMatch ? producerMatch[1].trim() : 'LoopLib';
  
  // Remove producer tag for parsing
  const cleanName = nameWithoutExt.replace(/@.+$/, '').trim();
  
  // Extract BPM (any 2-3 digit number)
  const bpmMatch = cleanName.match(/\b(\d{2,3})\b/);
  const bpm = bpmMatch ? parseInt(bpmMatch[1]) : 140; // Default 140
  
  // Extract key (letter + optional # + min/maj)
  const keyPatterns = [
    /([A-G]#?\s*min(?:or)?)/i,
    /([A-G]#?\s*maj(?:or)?)/i,
    /([A-G]#?m)\b/i, // Short form like "Cm"
    /([A-G]#?)(?=\s|_|$)/i // Just the note
  ];
  
  let key = 'C min'; // Default
  for (const pattern of keyPatterns) {
    const keyMatch = cleanName.match(pattern);
    if (keyMatch) {
      key = keyMatch[1]
        .replace(/m$/, ' min')
        .replace(/min(?:or)?/i, 'min')
        .replace(/maj(?:or)?/i, 'maj');
      // Ensure proper formatting
      if (!key.includes('min') && !key.includes('maj')) {
        key += ' min'; // Default to minor if not specified
      }
      break;
    }
  }
  
  // Clean the name (remove BPM and key info)
  let name = cleanName
    .replace(/\b\d{2,3}\b/, '') // Remove BPM
    .replace(/([A-G]#?\s*(?:min|maj|minor|major|m)?)(?:\s|_|$)/gi, '') // Remove key
    .replace(/_+/g, ' ') // Replace underscores with spaces
    .replace(/\s+/g, ' ') // Clean up multiple spaces
    .trim();
  
  // Capitalize properly
  name = name
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
  
  // If name is empty after cleaning, use the original
  if (!name) {
    name = cleanName.replace(/_/g, ' ').split(' ')[0];
  }
  
  // Determine genre based on BPM and keywords
  let genre = 'trap'; // Default
  if (bpm < 100) {
    genre = 'rnb';
  } else if (bpm >= 100 && bpm < 130) {
    genre = 'soul';
  } else if (bpm >= 140 && bpm <= 150) {
    genre = 'drill';
  }
  
  // Override based on filename keywords
  const lowerName = nameWithoutExt.toLowerCase();
  if (lowerName.includes('soul')) genre = 'soul';
  else if (lowerName.includes('rnb') || lowerName.includes('r&b')) genre = 'rnb';
  else if (lowerName.includes('drill')) genre = 'drill';
  else if (lowerName.includes('trap')) genre = 'trap';
  
  // Generate tags based on name and genre
  const tags = [genre];
  
  // Add mood tags based on keywords
  if (lowerName.includes('dark')) tags.push('dark');
  if (lowerName.includes('hard')) tags.push('hard');
  if (lowerName.includes('soft') || lowerName.includes('smooth')) tags.push('smooth');
  if (lowerName.includes('aggressive')) tags.push('aggressive');
  if (lowerName.includes('melodic') || lowerName.includes('melody')) tags.push('melodic');
  if (lowerName.includes('ambient')) tags.push('atmospheric');
  if (lowerName.includes('bounce')) tags.push('bouncy');
  if (lowerName.includes('sad') || lowerName.includes('emotional')) tags.push('emotional');
  
  // Ensure we have at least 2 tags
  if (tags.length === 1) {
    tags.push('original');
  }
  
  return {
    name,
    bpm,
    key,
    genre,
    tags,
    producer
  };
}

// Get audio duration (simplified - returns default)
// In production, use an audio library like node-wav or music-metadata
function getAudioDuration(filePath) {
  // For now, return a default based on file size
  const stats = fs.statSync(filePath);
  const sizeMB = stats.size / (1024 * 1024);
  
  if (sizeMB < 0.5) return '0:10';
  else if (sizeMB < 1) return '0:15';
  else if (sizeMB < 2) return '0:20';
  else return '0:30';
}

// Generate waveform data
function generateWaveformData(length = 64) {
  const data = [];
  for (let i = 0; i < length; i++) {
    const base = Math.sin(i / 10) * 0.3 + 0.5;
    const variation = Math.random() * 0.2;
    data.push(Math.max(0.1, Math.min(0.9, base + variation)));
  }
  return data;
}

// Process a single file
async function processSample(filePath, artistId, options = {}) {
  const filename = path.basename(filePath);
  const metadata = parseFilename(filename);
  
  // Apply any overrides from options
  if (options.genre) metadata.genre = options.genre;
  if (options.tags) metadata.tags = [...metadata.tags, ...options.tags];
  
  console.log(`\n${colors.cyan}Processing: ${filename}${colors.reset}`);
  console.log(`  Name: ${metadata.name}`);
  console.log(`  BPM: ${metadata.bpm}, Key: ${metadata.key}, Genre: ${metadata.genre}`);
  console.log(`  Tags: ${metadata.tags.join(', ')}`);
  
  try {
    // Upload to Supabase Storage
    const fileBuffer = fs.readFileSync(filePath);
    const uploadName = `${Date.now()}_${filename}`;
    
    const { error: uploadError } = await supabase.storage
      .from('samples')
      .upload(uploadName, fileBuffer, {
        contentType: 'audio/mpeg',
        upsert: false
      });
    
    if (uploadError) throw uploadError;
    
    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('samples')
      .getPublicUrl(uploadName);
    
    // Get duration
    const duration = getAudioDuration(filePath);
    
    // Insert to database
    const { error: dbError } = await supabase
      .from('samples')
      .insert({
        name: metadata.name,
        artist_id: artistId,
        genre: metadata.genre,
        bpm: metadata.bpm,
        key: metadata.key,
        duration: duration,
        tags: metadata.tags,
        file_url: publicUrl,
        waveform_data: generateWaveformData(),
        downloads: 0,
        likes: 0,
        is_premium: false
      });
    
    if (dbError) throw dbError;
    
    console.log(`  ${colors.green}✓ Success${colors.reset}`);
    return { success: true, metadata };
    
  } catch (error) {
    console.log(`  ${colors.red}✗ Failed: ${error.message}${colors.reset}`);
    return { success: false, error: error.message };
  }
}

// Main bulk upload function
async function bulkUpload() {
  console.log(`${colors.blue}
╔════════════════════════════════════════╗
║     LoopLib Bulk Upload & Parser       ║
╚════════════════════════════════════════╝
${colors.reset}`);

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  const question = (q) => new Promise(resolve => rl.question(q, resolve));
  
  try {
    // Get folder path
    const folderPath = await question('Enter folder path containing samples: ');
    
    if (!fs.existsSync(folderPath)) {
      console.log(`${colors.red}✗ Folder not found!${colors.reset}`);
      return;
    }
    
    // Get all audio files
    const audioExtensions = ['.mp3', '.wav', '.m4a', '.flac'];
    const files = fs.readdirSync(folderPath)
      .filter(file => audioExtensions.includes(path.extname(file).toLowerCase()))
      .sort();
    
    console.log(`\n${colors.green}Found ${files.length} audio files${colors.reset}`);
    
    if (files.length === 0) {
      console.log('No audio files found in the directory.');
      return;
    }
    
    // Show sample of what will be parsed
    console.log('\n📋 Sample parsing preview:');
    const previewCount = Math.min(5, files.length);
    for (let i = 0; i < previewCount; i++) {
      const parsed = parseFilename(files[i]);
      console.log(`  ${files[i]} → "${parsed.name}" (${parsed.bpm} BPM, ${parsed.key})`);
    }
    
    const proceed = await question('\nProceed with upload? (y/n): ');
    if (proceed.toLowerCase() !== 'y') {
      console.log('Upload cancelled.');
      return;
    }
    
    // Get or create artist
    const artistName = await question('Artist name (default: LoopLib): ') || 'LoopLib';
    
    let { data: artist } = await supabase
      .from('artists')
      .select()
      .eq('name', artistName)
      .single();
    
    if (!artist) {
      const { data: newArtist } = await supabase
        .from('artists')
        .insert({ 
          name: artistName,
          bio: 'Premium samples and loops for modern producers'
        })
        .select()
        .single();
      artist = newArtist;
    }
    
    // Optional: Override genre for all files
    const overrideGenre = await question('Override genre for all? (leave empty for auto): ');
    
    // Start upload
    console.log(`\n${colors.yellow}Starting upload...${colors.reset}\n`);
    
    const startTime = Date.now();
    let successful = 0;
    let failed = 0;
    const errors = [];
    
    // Process in batches to avoid overwhelming the server
    const batchSize = 10;
    for (let i = 0; i < files.length; i += batchSize) {
      const batch = files.slice(i, i + batchSize);
      
      console.log(`\n${colors.blue}Batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(files.length/batchSize)}${colors.reset}`);
      
      // Process batch in parallel
      const promises = batch.map(file => 
        processSample(
          path.join(folderPath, file), 
          artist.id,
          { genre: overrideGenre || undefined }
        )
      );
      
      const results = await Promise.all(promises);
      
      results.forEach((result, index) => {
        if (result.success) {
          successful++;
        } else {
          failed++;
          errors.push({
            file: batch[index],
            error: result.error
          });
        }
      });
      
      // Progress update
      const progress = Math.round(((i + batch.length) / files.length) * 100);
      console.log(`\n${colors.cyan}Progress: ${progress}% (${successful} successful, ${failed} failed)${colors.reset}`);
    }
    
    // Summary
    const elapsed = Math.round((Date.now() - startTime) / 1000);
    console.log(`\n${colors.green}
╔════════════════════════════════════════╗
║           Upload Complete!             ║
╚════════════════════════════════════════╝

📊 Summary:
✅ Successful: ${successful}
❌ Failed: ${failed}
📁 Total: ${files.length}
⏱️  Time: ${elapsed} seconds

🎵 Your samples are now live on LoopLib!
${colors.reset}`);
    
    // Show errors if any
    if (errors.length > 0) {
      console.log('\n❌ Failed uploads:');
      errors.forEach(e => {
        console.log(`  ${e.file}: ${e.error}`);
      });
      
      // Save error log
      fs.writeFileSync(
        'upload-errors.log', 
        errors.map(e => `${e.file}: ${e.error}`).join('\n')
      );
      console.log('\nError details saved to upload-errors.log');
    }
    
  } catch (error) {
    console.error(`${colors.red}Error: ${error.message}${colors.reset}`);
  } finally {
    rl.close();
  }
}

// Test parser function
async function testParser() {
  console.log('\n🧪 Filename Parser Test\n');
  
  const testFiles = [
    'moonshine_138 bmin @looplib.mp3',
    'dark_trap_140_Cmin.mp3',
    'smooth_soul_95_Ebmaj_@producer.mp3',
    'aggressive_drill_145_fsharp.mp3',
    'wave_150 d#min @ajcookin.mp3',
    'silenthill_150 bminor @ajcookin.mp3',
    'vintage_160.mp3',
    'timeless.mp3'
  ];
  
  testFiles.forEach(file => {
    const parsed = parseFilename(file);
    console.log(`\nFile: ${file}`);
    console.log(`  Name: ${parsed.name}`);
    console.log(`  BPM: ${parsed.bpm}`);
    console.log(`  Key: ${parsed.key}`);
    console.log(`  Genre: ${parsed.genre}`);
    console.log(`  Tags: ${parsed.tags.join(', ')}`);
  });
}

// Menu
const args = process.argv.slice(2);

if (args[0] === 'test') {
  testParser();
} else if (args[0] === 'upload' && args[1]) {
  // Quick upload with folder path
  bulkUpload();
} else {
  // Interactive mode
  bulkUpload().catch(console.error);
}