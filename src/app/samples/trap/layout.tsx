import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Free Trap Samples & Loops | Download Trap Sounds | LoopLib',
  description: 'Download 500+ free trap samples and loops. High-quality 808s, hi-hats, and melodies for trap music production. 140-170 BPM. Royalty-free with commercial licenses.',
  keywords: 'free trap samples, trap loops, 808 samples, trap drums, hi-hat rolls, trap melodies, free trap sounds, trap production, trap beats, trap music samples',
  openGraph: {
    title: 'Free Trap Samples & Loops - LoopLib',
    description: 'Professional trap samples for music producers. Download free 808s, hi-hats, and dark melodies.',
    type: 'website',
    url: 'https://looplib.com/samples/trap',
    images: [
      {
        url: '/og-trap-samples.jpg',
        width: 1200,
        height: 630,
        alt: 'Free Trap Samples Collection',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free Trap Samples & Loops - LoopLib',
    description: 'Download 500+ professional trap samples. 808s, hi-hats, melodies. 100% royalty-free.',
    images: ['/og-trap-samples.jpg'],
  },
  alternates: {
    canonical: 'https://looplib.com/samples/trap',
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

export default function TrapSamplesLayout({
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
            name: 'Free Trap Samples & Loops',
            description: 'Professional trap samples and loops for music production',
            url: 'https://looplib.com/samples/trap',
            isPartOf: {
              '@type': 'WebSite',
              name: 'LoopLib',
              url: 'https://looplib.com',
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
                    name: 'Samples',
                  },
                },
                {
                  '@type': 'ListItem',
                  position: 3,
                  item: {
                    '@id': 'https://looplib.com/samples/trap',
                    name: 'Trap',
                  },
                },
              ],
            },
            mainEntity: {
              '@type': 'ItemList',
              name: 'Trap Samples Collection',
              numberOfItems: '500+',
              itemListElement: [
                {
                  '@type': 'AudioObject',
                  name: 'Trap Sample Pack',
                  encodingFormat: 'audio/mpeg',
                  contentUrl: 'https://looplib.com/samples/trap',
                },
              ],
            },
          }),
        }}
      />
      
      {/* FAQ Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: [
              {
                '@type': 'Question',
                name: 'What BPM are trap beats?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'Most trap beats range from 140-170 BPM, with the sweet spot being around 140-150 BPM for traditional trap and 160-170 BPM for more aggressive styles.',
                },
              },
              {
                '@type': 'Question',
                name: 'Can I use free trap samples commercially?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'Yes, all LoopLib trap samples are royalty-free for personal use. For commercial releases, you need to purchase a license which starts at $19.',
                },
              },
              {
                '@type': 'Question',
                name: 'What makes a good trap sample?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'Good trap samples have punchy 808s with sub-bass presence, crisp hi-hats that cut through the mix, and dark atmospheric melodies that create the signature trap vibe.',
                },
              },
            ],
          }),
        }}
      />
      {children}
    </>
  );
}