// src/app/sitemap.xml/route.ts

import { NextResponse } from 'next/server';

export async function GET() {
  const baseUrl = 'https://looplib.com';

  // Dynamic artist pages
  const artistPages = [
    'travis-scott', 'drake', 'metro-boomin', 'the-weeknd', 
    'future', 'kanye-west', 'juice-wrld', 'gunna', 
    'lil-baby', 'playboi-carti'
  ].map(artist => ({
    loc: `${baseUrl}/type/${artist}`,
    lastmod: new Date().toISOString(),
    changefreq: 'weekly',
    priority: 0.9,
  }));

  // Static pages
  const staticPages = [
    { loc: `${baseUrl}`, changefreq: 'daily', priority: 1.0 },
    { loc: `${baseUrl}/samples`, changefreq: 'weekly', priority: 0.9 },
    { loc: `${baseUrl}/samples/trap`, changefreq: 'weekly', priority: 0.9 },
    { loc: `${baseUrl}/samples/rnb`, changefreq: 'weekly', priority: 0.9 },
    { loc: `${baseUrl}/samples/soul`, changefreq: 'weekly', priority: 0.9 },
    { loc: `${baseUrl}/packs`, changefreq: 'weekly', priority: 0.8 },
    { loc: `${baseUrl}/blog`, changefreq: 'weekly', priority: 0.7 },
    { loc: `${baseUrl}/blog/best-free-samples-2025`, changefreq: 'monthly', priority: 0.6 },
    { loc: `${baseUrl}/blog/how-to-use-free-samples-legally`, changefreq: 'monthly', priority: 0.6 },
    { loc: `${baseUrl}/blog/free-trap-samples-ultimate-guide`, changefreq: 'monthly', priority: 0.6 },
  ].map(page => ({
    ...page,
    lastmod: new Date().toISOString(),
  }));

  const allPages = [...staticPages, ...artistPages];

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${allPages
    .map(
      page => `
  <url>
    <loc>${page.loc}</loc>
    <lastmod>${page.lastmod}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`
    )
    .join('')}
</urlset>`;

  return new NextResponse(sitemap.trim(), {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=43200',
    },
  });
}