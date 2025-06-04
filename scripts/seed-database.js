// scripts/seed-database.js

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function seedDatabase() {
  console.log('🌱 Seeding database with test data...\n');

  try {
    // First, create a test artist
    const { data: artist, error: artistError } = await supabase
      .from('artists')
      .insert({
        name: 'LoopLib',
        bio: 'Premium samples for modern producers'
      })
      .select()
      .single();

    if (artistError && artistError.code !== '23505') { // Ignore if already exists
      throw artistError;
    }

    const artistId = artist?.id || 'existing-artist-id';

    // Test samples data
    const testSamples = [
      {
        name: 'Midnight Dreams',
        artist_id: artistId,
        genre: 'trap',
        bpm: 140,
        key: 'C min',
        duration: '0:15',
        tags: ['dark', 'atmospheric', 'heavy', '808', 'melodic'],
        file_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', // Test audio file
        waveform_data: Array.from({ length: 32 }, () => Math.random() * 0.8 + 0.2),
        downloads: 234,
        likes: 45,
        is_premium: false
      },
      {
        name: 'Street Heat',
        artist_id: artistId,
        genre: 'drill',
        bpm: 145,
        key: 'F# min',
        duration: '0:12',
        tags: ['aggressive', 'dark', 'UK', 'hard', 'bass'],
        file_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
        waveform_data: Array.from({ length: 32 }, () => Math.random() * 0.8 + 0.2),
        downloads: 156,
        likes: 23,
        is_premium: true
      },
      {
        name: 'Velvet Touch',
        artist_id: artistId,
        genre: 'rnb',
        bpm: 90,
        key: 'Eb maj',
        duration: '0:20',
        tags: ['smooth', 'sensual', 'mellow', 'romantic', 'soulful'],
        file_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
        waveform_data: Array.from({ length: 32 }, () => Math.random() * 0.8 + 0.2),
        downloads: 567,
        likes: 89,
        is_premium: false
      },
      {
        name: 'Golden Hour',
        artist_id: artistId,
        genre: 'soul',
        bpm: 95,
        key: 'G maj',
        duration: '0:18',
        tags: ['vintage', 'warm', 'uplifting', 'classic', 'groove'],
        file_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
        waveform_data: Array.from({ length: 32 }, () => Math.random() * 0.8 + 0.2),
        downloads: 432,
        likes: 67,
        is_premium: true
      },
      {
        name: 'Dark Mode',
        artist_id: artistId,
        genre: 'trap',
        bpm: 135,
        key: 'A min',
        duration: '0:16',
        tags: ['moody', 'cinematic', 'bass-heavy', 'dark', 'atmospheric'],
        file_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3',
        waveform_data: Array.from({ length: 32 }, () => Math.random() * 0.8 + 0.2),
        downloads: 123,
        likes: 34,
        is_premium: false
      },
      {
        name: 'City Lights',
        artist_id: artistId,
        genre: 'drill',
        bpm: 142,
        key: 'D min',
        duration: '0:14',
        tags: ['urban', 'aggressive', 'modern', 'trap-influenced'],
        file_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3',
        waveform_data: Array.from({ length: 32 }, () => Math.random() * 0.8 + 0.2),
        downloads: 89,
        likes: 12,
        is_premium: false
      },
      {
        name: 'Silk Roads',
        artist_id: artistId,
        genre: 'rnb',
        bpm: 85,
        key: 'B♭ maj',
        duration: '0:22',
        tags: ['smooth', 'jazzy', 'late-night', 'sensual'],
        file_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3',
        waveform_data: Array.from({ length: 32 }, () => Math.random() * 0.8 + 0.2),
        downloads: 345,
        likes: 56,
        is_premium: true
      },
      {
        name: 'Vintage Vibes',
        artist_id: artistId,
        genre: 'soul',
        bpm: 98,
        key: 'F maj',
        duration: '0:19',
        tags: ['retro', 'funky', 'groovy', 'classic'],
        file_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3',
        waveform_data: Array.from({ length: 32 }, () => Math.random() * 0.8 + 0.2),
        downloads: 678,
        likes: 98,
        is_premium: false
      }
    ];

    // Insert samples
    for (const sample of testSamples) {
      const { error } = await supabase
        .from('samples')
        .insert(sample);
      
      if (error && error.code !== '23505') { // Ignore duplicates
        console.error(`Error inserting ${sample.name}:`, error);
      } else {
        console.log(`✅ Added sample: ${sample.name}`);
      }
    }

    console.log('\n✨ Database seeding complete!');
    console.log('🎵 You now have test samples to browse');
    console.log('💡 Replace the file_urls with your actual sample URLs later');
    
  } catch (error) {
    console.error('❌ Seeding error:', error);
  }
}

seedDatabase();