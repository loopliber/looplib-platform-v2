// lib/sample-matcher.ts

import { Sample } from '@/types';

// Keywords associated with different artists/styles
const styleKeywordMap: Record<string, string[]> = {
  'travis-scott': [
    'dark', 'atmospheric', 'psychedelic', 'ambient', 'spacey', 
    'auto-tune', 'distorted', 'reverb', 'moody', 'trap',
    'houston', 'rage', 'astro', 'cactus', 'jack'
  ],
  'metro-boomin': [
    'orchestral', 'cinematic', 'dark', 'horror', 'dramatic',
    'strings', 'brass', 'epic', 'ominous', 'haunting',
    'boomin', 'savage', 'mode', 'heroes', 'villains'
  ],
  'drake': [
    'melodic', 'emotional', 'smooth', 'toronto', 'ovo',
    'atmospheric', 'nocturnal', 'moody', 'introspective', 'bounce',
    '40', 'views', 'care', 'feelings', 'champagne'
  ],
  'the-weeknd': [
    'dark-rnb', 'synthwave', '80s', 'retro', 'electronic',
    'moody', 'nocturnal', 'cinematic', 'atmospheric', 'trilogy',
    'abel', 'xo', 'blinding', 'lights', 'starboy'
  ],
  'kanye-west': [
    'soul', 'chipmunk', 'gospel', 'experimental', 'orchestral',
    'chicago', 'yeezy', 'pablo', 'graduation', 'twisted',
    'vocal-chop', 'sample-flip', 'boom-bap', 'electronic', 'industrial'
  ],
  'future': [
    'trap', 'dark', 'auto-tune', 'atlanta', 'dirty',
    'sprite', 'codeine', 'pluto', 'hendrix', 'mask',
    'aggressive', 'melodic', 'spacey', 'futuristic', 'heavy'
  ],
  'juice-wrld': [
    'melodic', 'emotional', 'guitar', 'emo', 'rock',
    'sad', 'heartbreak', 'lucid', 'dreams', 'legends',
    'freestyle', 'piano', 'ambient', 'trap', 'melodic-trap'
  ],
  'tyler-the-creator': [
    'experimental', 'jazz', 'soul', 'alternative', 'odd',
    'future', 'wolf', 'cherry', 'bomb', 'igor',
    'synth', 'funk', 'neo-soul', 'creative', 'unique'
  ]
};

// Match samples to specific style pages
export function matchSamplesToStyle(samples: Sample[], style: string): Sample[] {
  const keywords = styleKeywordMap[style] || [];
  
  return samples.filter(sample => {
    // Check if sample tags match style keywords
    const tagMatch = sample.tags.some(tag => 
      keywords.some(keyword => 
        tag.toLowerCase().includes(keyword) || 
        keyword.includes(tag.toLowerCase())
      )
    );
    
    // Check if sample name matches style
    const nameMatch = keywords.some(keyword => 
      sample.name.toLowerCase().includes(keyword)
    );
    
    // Check genre compatibility
    const genreMatch = isGenreCompatible(style, sample.genre);
    
    // Check BPM range
    const bpmMatch = isBpmCompatible(style, sample.bpm);
    
    // Score the match (for ranking)
    const matchScore = 
      (tagMatch ? 2 : 0) + 
      (nameMatch ? 3 : 0) + 
      (genreMatch ? 1 : 0) + 
      (bpmMatch ? 1 : 0);
    
    return matchScore >= 2; // Minimum score threshold
  }).sort((a, b) => {
    // Sort by relevance
    const scoreA = calculateRelevanceScore(a, keywords);
    const scoreB = calculateRelevanceScore(b, keywords);
    return scoreB - scoreA;
  });
}

// Calculate relevance score for ranking
function calculateRelevanceScore(sample: Sample, keywords: string[]): number {
  let score = 0;
  
  // Tag matches (highest weight)
  sample.tags.forEach(tag => {
    keywords.forEach(keyword => {
      if (tag.toLowerCase() === keyword) score += 5;
      else if (tag.toLowerCase().includes(keyword)) score += 3;
      else if (keyword.includes(tag.toLowerCase())) score += 2;
    });
  });
  
  // Name matches
  keywords.forEach(keyword => {
    if (sample.name.toLowerCase().includes(keyword)) score += 4;
  });
  
  // Boost for certain attributes
  if (sample.has_stems) score += 2;
  if (sample.downloads && sample.downloads > 100) score += 1;
  
  return score;
}

// Check if genre is compatible with style
function isGenreCompatible(style: string, sampleGenre: string): boolean {
  const genreMap: Record<string, string[]> = {
    'trap': ['travis-scott', 'metro-boomin', 'future', 'migos', '21-savage'],
    'rnb': ['the-weeknd', 'drake', 'bryson-tiller', 'partynextdoor', 'frank-ocean'],
    'soul': ['kanye-west', 'anderson-paak', 'tyler-the-creator', 'mac-miller'],
    'hiphop': ['drake', 'kanye-west', 'j-cole', 'kendrick-lamar', 'tyler-the-creator']
  };
  
  return Object.entries(genreMap).some(([genre, artists]) => 
    genre === sampleGenre && artists.includes(style)
  );
}

// Check if BPM is compatible with style
function isBpmCompatible(style: string, sampleBpm: number): boolean {
  const bpmRanges: Record<string, { min: number; max: number }> = {
    'travis-scott': { min: 130, max: 160 },
    'metro-boomin': { min: 120, max: 150 },
    'drake': { min: 70, max: 140 },
    'the-weeknd': { min: 80, max: 120 },
    'kanye-west': { min: 70, max: 140 },
    'future': { min: 130, max: 170 },
    'juice-wrld': { min: 120, max: 160 },
    'tyler-the-creator': { min: 80, max: 140 }
  };
  
  const range = bpmRanges[style];
  if (!range) return true; // If no specific range, accept all
  
  return sampleBpm >= range.min && sampleBpm <= range.max;
}

// Generate smart tags for samples based on audio analysis (future feature)
export function generateSmartTags(sample: Sample): string[] {
  const tags = [...sample.tags];
  
  // Add BPM-based tags
  if (sample.bpm < 80) tags.push('slow', 'ballad');
  else if (sample.bpm >= 140) tags.push('uptempo', 'energetic');
  else if (sample.bpm >= 160) tags.push('fast', 'aggressive');
  
  // Add key-based mood tags
  const minorKeys = ['minor', 'm', 'min'];
  const majorKeys = ['major', 'maj'];
  
  if (sample.key && minorKeys.some(k => sample.key.toLowerCase().includes(k))) {
    tags.push('dark', 'emotional', 'moody');
  } else if (sample.key && majorKeys.some(k => sample.key.toLowerCase().includes(k))) {
    tags.push('uplifting', 'happy', 'bright');
  }
  
  // Add genre-specific tags
  if (sample.genre === 'trap') {
    tags.push('808', 'hi-hat', 'modern');
  } else if (sample.genre === 'soul') {
    tags.push('vintage', 'warm', 'organic');
  } else if (sample.genre === 'rnb') {
    tags.push('smooth', 'silky', 'contemporary');
  }
  
  return [...new Set(tags)]; // Remove duplicates
}

// Match samples for combination pages (e.g., "dark piano melodies")
export function matchSamplesForCombination(
  samples: Sample[], 
  keywords: string[]
): Sample[] {
  return samples.filter(sample => {
    // Count how many keywords match
    const matchCount = keywords.filter(keyword => 
      sample.tags.some(tag => tag.toLowerCase().includes(keyword)) ||
      sample.name.toLowerCase().includes(keyword)
    ).length;
    
    // Require at least 2 keyword matches for combination pages
    return matchCount >= Math.min(2, keywords.length);
  }).sort((a, b) => {
    // Sort by number of matching keywords
    const matchCountA = keywords.filter(keyword => 
      a.tags.some(tag => tag.toLowerCase().includes(keyword)) ||
      a.name.toLowerCase().includes(keyword)
    ).length;
    
    const matchCountB = keywords.filter(keyword => 
      b.tags.some(tag => tag.toLowerCase().includes(keyword)) ||
      b.name.toLowerCase().includes(keyword)
    ).length;
    
    return matchCountB - matchCountA;
  });
}