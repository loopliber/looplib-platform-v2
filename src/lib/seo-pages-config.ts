// lib/seo-pages-config.ts

export const seoPageConfigs = {
  // Artist/Producer Style Pages
  artistStyles: [
    'travis-scott', 'metro-boomin', 'kanye-west', 'drake', 'the-weeknd',
    'future', 'gunna', 'lil-baby', 'young-thug', '21-savage',
    'migos', 'dababy', 'roddy-ricch', 'polo-g', 'lil-durk',
    'juice-wrld', 'xxxtentacion', 'ski-mask', 'trippie-redd', 'playboi-carti',
    'tyler-the-creator', 'frank-ocean', 'sza', 'summer-walker', 'jhene-aiko',
    'bryson-tiller', 'partynextdoor', 'brent-faiyaz', '6lack', 'khalid',
    'anderson-paak', 'mac-miller', 'j-cole', 'kendrick-lamar', 'schoolboy-q',
    'asap-rocky', 'joey-badass', 'denzel-curry', 'jid', 'earthgang',
    'childish-gambino', 'chance-the-rapper', 'vic-mensa', 'noname', 'saba'
  ],

  // Descriptive Style Pages
  descriptiveStyles: {
    trap: [
      'dark-aggressive', 'melodic-emotional', 'hard-hitting', 'atmospheric-ambient',
      'psychedelic-trippy', 'minimalist-sparse', 'orchestral-cinematic', 'vintage-classic',
      'futuristic-modern', 'gritty-raw', 'smooth-polished', 'experimental-weird',
      'bouncy-energetic', 'moody-introspective', 'spacey-ethereal'
    ],
    soul: [
      'vintage-classic', 'modern-neo', 'gospel-inspired', 'jazzy-smooth',
      'funky-groovy', 'emotional-heartfelt', 'uplifting-positive', 'melancholic-sad',
      'romantic-love', 'retro-throwback', 'contemporary-fresh', 'organic-natural',
      'sophisticated-classy', 'raw-authentic', 'spiritual-deep'
    ],
    rnb: [
      'smooth-silky', 'dark-moody', 'sensual-sexy', 'emotional-deep',
      'modern-trap', 'classic-90s', 'alternative-indie', 'pop-crossover',
      'jazzy-sophisticated', 'minimalist-stripped', 'lush-orchestral', 'electronic-synth',
      'acoustic-organic', 'experimental-avant', 'nostalgic-retro'
    ]
  },

  // BPM-specific pages
  bpmRanges: [
    { bpm: 60, genres: ['soul', 'rnb'], description: 'slow and soulful' },
    { bpm: 70, genres: ['soul', 'rnb'], description: 'classic groove tempo' },
    { bpm: 80, genres: ['rnb', 'soul'], description: 'perfect for ballads' },
    { bpm: 90, genres: ['rnb', 'soul', 'hiphop'], description: 'classic hip-hop tempo' },
    { bpm: 100, genres: ['rnb', 'hiphop'], description: 'mid-tempo vibes' },
    { bpm: 110, genres: ['hiphop', 'trap'], description: 'modern hip-hop speed' },
    { bpm: 120, genres: ['trap', 'hiphop'], description: 'standard trap tempo' },
    { bpm: 130, genres: ['trap'], description: 'energetic trap beats' },
    { bpm: 140, genres: ['trap'], description: 'high-energy trap' },
    { bpm: 150, genres: ['trap'], description: 'aggressive trap tempo' },
    { bpm: 160, genres: ['trap'], description: 'double-time feel' }
  ],

  // Key-specific pages
  musicalKeys: [
    { key: 'c-major', genres: ['all'], mood: 'happy and uplifting' },
    { key: 'c-minor', genres: ['trap', 'rnb'], mood: 'dark and emotional' },
    { key: 'd-major', genres: ['soul', 'rnb'], mood: 'triumphant and bright' },
    { key: 'd-minor', genres: ['trap', 'soul'], mood: 'melancholic and serious' },
    { key: 'e-major', genres: ['rnb', 'soul'], mood: 'warm and confident' },
    { key: 'e-minor', genres: ['trap', 'rnb'], mood: 'sad and introspective' },
    { key: 'f-major', genres: ['soul', 'rnb'], mood: 'peaceful and calm' },
    { key: 'f-minor', genres: ['trap', 'rnb'], mood: 'dark and mysterious' },
    { key: 'g-major', genres: ['all'], mood: 'bright and energetic' },
    { key: 'g-minor', genres: ['trap', 'soul'], mood: 'nostalgic and yearning' },
    { key: 'a-major', genres: ['rnb', 'soul'], mood: 'joyful and optimistic' },
    { key: 'a-minor', genres: ['trap', 'rnb'], mood: 'natural and contemplative' },
    { key: 'b-flat-major', genres: ['soul', 'rnb'], mood: 'noble and grand' },
    { key: 'b-flat-minor', genres: ['trap'], mood: 'dramatic and intense' }
  ],

  // Combination pages (mood + instrument + genre)
  combinationPages: [
    // Trap combinations
    { url: '/trap/dark-piano-melodies', keywords: ['trap', 'dark', 'piano', 'melodic'] },
    { url: '/trap/aggressive-808-patterns', keywords: ['trap', 'aggressive', '808', 'bass'] },
    { url: '/trap/ambient-guitar-loops', keywords: ['trap', 'ambient', 'guitar', 'atmospheric'] },
    { url: '/trap/orchestral-string-samples', keywords: ['trap', 'orchestral', 'strings', 'cinematic'] },
    { url: '/trap/vintage-synth-leads', keywords: ['trap', 'vintage', 'synth', 'retro'] },
    
    // Soul combinations
    { url: '/soul/gospel-organ-chords', keywords: ['soul', 'gospel', 'organ', 'church'] },
    { url: '/soul/vintage-bass-grooves', keywords: ['soul', 'vintage', 'bass', 'groove'] },
    { url: '/soul/warm-piano-progressions', keywords: ['soul', 'warm', 'piano', 'chords'] },
    { url: '/soul/live-drum-breaks', keywords: ['soul', 'live', 'drums', 'breaks'] },
    { url: '/soul/jazzy-guitar-licks', keywords: ['soul', 'jazz', 'guitar', 'licks'] },
    
    // R&B combinations
    { url: '/rnb/smooth-electric-piano', keywords: ['rnb', 'smooth', 'electric piano', 'keys'] },
    { url: '/rnb/silky-vocal-chops', keywords: ['rnb', 'silky', 'vocal', 'chops'] },
    { url: '/rnb/modern-trap-drums', keywords: ['rnb', 'modern', 'trap', 'drums'] },
    { url: '/rnb/emotional-string-sections', keywords: ['rnb', 'emotional', 'strings', 'orchestral'] },
    { url: '/rnb/jazzy-chord-progressions', keywords: ['rnb', 'jazz', 'chords', 'progression'] }
  ]
};

// Helper function to generate all possible page URLs
export function generateAllPageUrls() {
  const urls: string[] = [];
  
  // Artist style pages
  seoPageConfigs.artistStyles.forEach(artist => {
    urls.push(`/type/${artist}`);
  });
  
  // Descriptive style pages
  Object.entries(seoPageConfigs.descriptiveStyles).forEach(([genre, styles]) => {
    styles.forEach(style => {
      urls.push(`/samples/${genre}/${style}`);
    });
  });
  
  // BPM pages
  seoPageConfigs.bpmRanges.forEach(({ bpm, genres }) => {
    genres.forEach(genre => {
      urls.push(`/bpm/${bpm}/${genre}`);
    });
  });
  
  // Key pages
  seoPageConfigs.musicalKeys.forEach(({ key, genres }) => {
    genres.forEach(genre => {
      if (genre !== 'all') {
        urls.push(`/key/${key}/${genre}`);
      }
    });
  });
  
  // Combination pages
  seoPageConfigs.combinationPages.forEach(({ url }) => {
    urls.push(url);
  });
  
  return urls;
}

// Generate sitemap entries
export function generateSitemapEntries() {
  const urls = generateAllPageUrls();
  return urls.map(url => ({
    url: `https://looplib.com${url}`,
    changefreq: 'weekly',
    priority: 0.8
  }));
}

// Function to generate meta tags for any page type
export function generateMetaTags(pageType: string, params: any) {
  const baseTitle = 'LoopLib';
  let title = '';
  let description = '';
  let keywords = '';
  
  switch (pageType) {
    case 'artist':
      const artistName = params.style.replace('-', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase());
      title = `Free ${artistName} Type Samples & Loops | ${artistName} Type Beats | ${baseTitle}`;
      description = `Download free ${artistName} type samples, loops, and melodies. Create ${artistName} style beats with professional sounds. 100% royalty-free for personal use.`;
      keywords = `${artistName} type samples, ${artistName} type beats, ${artistName} loops, free ${artistName} samples`;
      break;
      
    case 'bpm':
      title = `Free ${params.bpm} BPM ${params.genre} Samples & Loops | ${baseTitle}`;
      description = `Download free ${params.bpm} BPM ${params.genre} samples and loops. Perfect tempo for ${params.genre} production. High-quality sounds, 100% royalty-free.`;
      keywords = `${params.bpm} bpm samples, ${params.bpm} bpm ${params.genre}, ${params.genre} loops ${params.bpm} bpm`;
      break;
      
    case 'key':
      const keyName = params.key.replace('-', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase());
      title = `Free ${keyName} ${params.genre} Samples & Loops | ${baseTitle}`;
      description = `Download free ${params.genre} samples in ${keyName}. Professional loops and melodies in the key of ${keyName}. 100% royalty-free.`;
      keywords = `${keyName} samples, ${params.genre} ${keyName}, ${keyName} loops, free samples ${keyName}`;
      break;
      
    case 'style':
      const styleName = params.style.replace('-', ' ');
      title = `Free ${styleName} ${params.genre} Samples & Loops | ${baseTitle}`;
      description = `Download free ${styleName} ${params.genre} samples and loops. High-quality ${styleName} sounds for ${params.genre} production. 100% royalty-free.`;
      keywords = `${styleName} ${params.genre} samples, ${styleName} loops, free ${styleName} sounds`;
      break;
  }
  
  return { title, description, keywords };
}