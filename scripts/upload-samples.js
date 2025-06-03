// scripts/upload-samples.js

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Helper function to generate waveform data (mock)
function generateWaveformData(length = 32) {
  return Array.from({ length }, () => Math.random() * 0.8 + 0.2);
}

async function uploadSample(filePath, metadata) {
  try {
    console.log(`Uploading ${metadata.name}...`);

    // Read file
    const fileName = `${Date.now()}_${path.basename(filePath)}`;
    const fileBuffer = fs.readFileSync(filePath);
    
    // Upload to Supabase Storage
    const { data: fileData, error: uploadError } = await supabase.storage
      .from('samples')
      .upload(fileName, fileBuffer, {
        contentType: 'audio/mpeg'
      });

    if (uploadError) {
      throw uploadError;
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('samples')
      .getPublicUrl(fileName);

    // Generate waveform data (in production, use actual audio analysis)
    const waveformData = generateWaveformData();

    // Insert sample record
    const { data, error } = await supabase
      .from('samples')
      .insert({
        ...metadata,
        file_url: publicUrl,
        waveform_data: waveformData
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    console.log(`✓ Uploaded ${metadata.name}`);
    return data;
  } catch (error) {
    console.error(`✗ Failed to upload ${metadata.name}:`, error);
    throw error;
  }
}

async function uploadBatch() {
  // First, ensure we have an artist
  const { data: existingArtist } = await supabase
    .from('artists')
    .select()
    .eq('name', 'LoopLib')
    .single();

  let artistId;
  
  if (!existingArtist) {
    const { data: newArtist } = await supabase
      .from('artists')
      .insert({
        name: 'LoopLib',
        bio: 'Premium samples and loops for modern producers'
      })
      .select()
      .single();
    
    artistId = newArtist.id;
  } else {
    artistId = existingArtist.id;
  }

  // Sample metadata - replace with your actual samples
  const samples = [
    {
      path: './samples/trap_melody_1.mp3',
      metadata: {
        name: 'Midnight Dreams',
        artist_id: artistId,
        genre: 'trap',
        bpm: 140,
        key: 'C min',
        duration: '0:15',
        tags: ['dark', 'atmospheric', 'heavy', '808', 'melodic'],
        is_premium: false
      }
    },
    {
      path: './samples/drill_loop_1.mp3',
      metadata: {
        name: 'Street Heat',
        artist_id: artistId,
        genre: 'drill',
        bpm: 145,
        key: 'F# min',
        duration: '0:12',
        tags: ['aggressive', 'dark', 'UK', 'hard', 'bass'],
        is_premium: true
      }
    },
    {
      path: './samples/rnb_melody_1.mp3',
      metadata: {
        name: 'Velvet Touch',
        artist_id: artistId,
        genre: 'rnb',
        bpm: 90,
        key: 'Eb maj',
        duration: '0:20',
        tags: ['smooth', 'sensual', 'mellow', 'romantic', 'soulful'],
        is_premium: false
      }
    },
    {
      path: './samples/soul_loop_1.mp3',
      metadata: {
        name: 'Golden Hour',
        artist_id: artistId,
        genre: 'soul',
        bpm: 95,
        key: 'G maj',
        duration: '0:18',
        tags: ['vintage', 'warm', 'uplifting', 'classic', 'groove'],
        is_premium: true
      }
    }
  ];

  // Upload each sample
  for (const sample of samples) {
    try {
      // Check if file exists
      if (!fs.existsSync(sample.path)) {
        console.log(`⚠ File not found: ${sample.path}`);
        continue;
      }

      await uploadSample(sample.path, sample.metadata);
    } catch (error) {
      console.error('Upload error:', error);
    }
  }

  console.log('\n✅ Upload batch complete!');
}

// Run the upload
uploadBatch().catch(console.error);