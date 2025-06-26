// scripts/generate-seo-pages.ts
// Run with: npx tsx scripts/generate-seo-pages.ts

import fs from 'fs';
import path from 'path';

const artistStyles = [
  { slug: 'travis-scott', name: 'Travis Scott', genre: 'trap' },
  { slug: 'drake', name: 'Drake', genre: 'rnb' },
  { slug: 'metro-boomin', name: 'Metro Boomin', genre: 'trap' },
  { slug: 'the-weeknd', name: 'The Weeknd', genre: 'rnb' },
  { slug: 'future', name: 'Future', genre: 'trap' },
];

// Generate static pages for better SEO
function generateStaticPages() {
  artistStyles.forEach(artist => {
    const pageContent = `
import ArtistStylePage from '@/components/templates/ArtistStylePage';

export const metadata = {
  title: 'Free ${artist.name} Type Samples & Loops | ${artist.name} Type Beats | LoopLib',
  description: 'Download free ${artist.name} type samples and loops. Professional ${artist.genre} sounds for ${artist.name} style production. 100% royalty-free.',
  keywords: '${artist.name} type beats, ${artist.name} samples, ${artist.name} loops, free ${artist.name} sounds',
};

export default function ${artist.name.replace(/\s+/g, '')}Page() {
  return <ArtistStylePage artistSlug="${artist.slug}" artistName="${artist.name}" genre="${artist.genre}" />;
}
`;

    const dir = path.join(process.cwd(), 'app', 'type', artist.slug);
    const filePath = path.join(dir, 'page.tsx');
    
    // Create directory if it doesn't exist
    fs.mkdirSync(dir, { recursive: true });
    
    // Write file
    fs.writeFileSync(filePath, pageContent.trim());
    console.log(`✅ Generated: /type/${artist.slug}`);
  });
}

// Generate redirects for common misspellings
function generateRedirects() {
  const redirects = [
    { from: '/travis-scot', to: '/type/travis-scott' },
    { from: '/traviss-scott', to: '/type/travis-scott' },
    { from: '/metro-boomin-type-beat', to: '/type/metro-boomin' },
    { from: '/the-weekend', to: '/type/the-weeknd' },
  ];
  
  const redirectContent = redirects.map(r => 
    `${r.from} ${r.to} 301`
  ).join('\n');
  
  fs.writeFileSync('public/_redirects', redirectContent);
  console.log('✅ Generated redirects');
}

// Generate comprehensive sitemap
function generateSitemap() {
  const baseUrl = 'https://looplib.com';
  const pages: string[] = [];
  
  // Artist pages
  artistStyles.forEach(artist => {
    pages.push(`${baseUrl}/type/${artist.slug}`);
  });
  
  // BPM pages
  [60, 70, 80, 90, 100, 110, 120, 130, 140, 150, 160].forEach(bpm => {
    ['trap', 'soul', 'rnb'].forEach(genre => {
      pages.push(`${baseUrl}/bpm/${bpm}/${genre}`);
    });
  });
  
  // Key pages
  ['c-major', 'c-minor', 'd-major', 'd-minor', 'e-major', 'e-minor'].forEach(key => {
    ['trap', 'soul', 'rnb'].forEach(genre => {
      pages.push(`${baseUrl}/key/${key}/${genre}`);
    });
  });
  
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages.map(url => `  <url>
    <loc>${url}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`).join('\n')}
</urlset>`;
  
  fs.writeFileSync('public/sitemap-seo.xml', sitemap);
  console.log(`✅ Generated sitemap with ${pages.length} pages`);
}

// Run all generators
console.log('🚀 Generating SEO pages...\n');
generateStaticPages();
generateRedirects();
generateSitemap();
console.log('\n✨ Done! Don\'t forget to:');
console.log('1. Submit new sitemap to Google Search Console');
console.log('2. Test pages with Rich Results Test');
console.log('3. Monitor performance in Analytics');