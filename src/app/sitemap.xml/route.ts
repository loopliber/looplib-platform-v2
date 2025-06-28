// src/app/sitemap.xml/route.ts

import { NextResponse } from 'next/server';

export async function GET() {
  const baseUrl = 'https://looplib.com';

  // All artist pages (16 total)
  const artistPages = [
    // Original 10
    'travis-scott', 'drake', 'metro-boomin', 'the-weeknd', 
    'future', 'kanye-west', 'juice-wrld', 'gunna', 
    'lil-baby', 'playboi-carti',
    // New additions
    'partynextdoor', 'bryson-tiller', '6lack', 
    'young-thug', '21-savage', 'lil-uzi-vert'
  ].map(artist => ({
    loc: `${baseUrl}/type/${artist}`,
    lastmod: new Date().toISOString(),
    changefreq: 'weekly',
    priority: 0.9,
  }));

  // Core pages (highest priority)
  const corePages = [
    { loc: `${baseUrl}`, changefreq: 'daily', priority: 1.0 },
    { loc: `${baseUrl}/hitmaker`, changefreq: 'weekly', priority: 0.95 },
  ];

  // Genre pages
  const genrePages = [
    { loc: `${baseUrl}/samples`, changefreq: 'weekly', priority: 0.9 },
    { loc: `${baseUrl}/samples/trap`, changefreq: 'weekly', priority: 0.9 },
    { loc: `${baseUrl}/samples/rnb`, changefreq: 'weekly', priority: 0.9 },
    { loc: `${baseUrl}/samples/soul`, changefreq: 'weekly', priority: 0.9 },
  ];

  // Content pages
  const contentPages = [
    { loc: `${baseUrl}/packs`, changefreq: 'weekly', priority: 0.8 },
    { loc: `${baseUrl}/blog`, changefreq: 'weekly', priority: 0.7 },
  ];

  // Blog posts
  const blogPosts = [
    { loc: `${baseUrl}/blog/best-free-samples-2025`, changefreq: 'monthly', priority: 0.6 },
    { loc: `${baseUrl}/blog/how-to-use-free-samples-legally`, changefreq: 'monthly', priority: 0.6 },
    { loc: `${baseUrl}/blog/free-trap-samples-ultimate-guide`, changefreq: 'monthly', priority: 0.6 },
    { loc: `${baseUrl}/blog/free-soul-samples-where-to-find`, changefreq: 'monthly', priority: 0.6 },
    { loc: `${baseUrl}/blog/free-samples-vs-paid-comparison`, changefreq: 'monthly', priority: 0.6 },
    { loc: `${baseUrl}/blog/organize-free-samples-library`, changefreq: 'monthly', priority: 0.6 },
  ];

  // Add lastmod to all static pages
  const staticPages = [...corePages, ...genrePages, ...contentPages, ...blogPosts].map(page => ({
    ...page,
    lastmod: new Date().toISOString(),
  }));

  // Combine all pages
  const allPages = [...staticPages, ...artistPages];

  // Generate XML
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
${allPages
  .map(
    page => `  <url>
    <loc>${page.loc}</loc>
    <lastmod>${page.lastmod}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`
  )
  .join('\n')}
</urlset>`;

  return new NextResponse(sitemap, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=43200',
    },
  });
}