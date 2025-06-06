import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Free Sample Collections | Browse by Genre | LoopLib',
  description: 'Browse our free sample library organized by genre. Download trap, soul, R&B samples and more. Professional quality sounds for music producers.',
  keywords: 'free samples, sample library, music samples, trap samples, soul samples, rnb samples, sample packs, loops, free downloads',
  openGraph: {
    title: 'Free Sample Collections - LoopLib',
    description: 'Browse professional sample collections organized by genre. Trap, Soul, R&B and more.',
    type: 'website',
    url: 'https://looplib.com/samples',
    images: [
      {
        url: '/og-samples-collection.jpg',
        width: 1200,
        height: 630,
        alt: 'LoopLib Sample Collections',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free Sample Collections - LoopLib',
    description: 'Browse professional sample collections. Trap, Soul, R&B and more. 100% royalty-free.',
    images: ['/og-samples-collection.jpg'],
  },
  alternates: {
    canonical: 'https://looplib.com/samples',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function SamplesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* Structured Data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'CollectionPage',
            name: 'Free Sample Collections',
            description: 'Browse our free sample library organized by genre',
            url: 'https://looplib.com/samples',
            mainEntity: {
              '@type': 'ItemList',
              name: 'Genre Collections',
              numberOfItems: 3,
              itemListElement: [
                {
                  '@type': 'ListItem',
                  position: 1,
                  item: {
                    '@type': 'MusicPlaylist',
                    name: 'Trap Samples',
                    url: 'https://looplib.com/samples/trap',
                    description: 'Hard-hitting 808s and dark melodies',
                  },
                },
                {
                  '@type': 'ListItem',
                  position: 2,
                  item: {
                    '@type': 'MusicPlaylist',
                    name: 'Soul Samples',
                    url: 'https://looplib.com/samples/soul',
                    description: 'Warm vintage sounds and gospel chords',
                  },
                },
                {
                  '@type': 'ListItem',
                  position: 3,
                  item: {
                    '@type': 'MusicPlaylist',
                    name: 'R&B Samples',
                    url: 'https://looplib.com/samples/rnb',
                    description: 'Smooth melodies and modern vibes',
                  },
                },
              ],
            },
            breadcrumb: {
              '@type': 'BreadcrumbList',
              itemListElement: [
                {
                  '@type': 'ListItem',
                  position: 1,
                  item: {
                    '@id': 'https://looplib.com',
                    name: 'Home',
                  },
                },
                {
                  '@type': 'ListItem',
                  position: 2,
                  item: {
                    '@id': 'https://looplib.com/samples',
                    name: 'Sample Collections',
                  },
                },
              ],
            },
          }),
        }}
      />
      {children}
    </>
  );
}