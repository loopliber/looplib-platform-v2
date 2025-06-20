// src/app/hitmaker/layout.tsx
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Hitmaker Bundle - 300+ Samples, MIDI & Presets | 78% OFF | LoopLib',
  description: '🔥 Get 300+ samples with stems, 800 MIDI progressions, analog drums & mixer presets. Save $200 today. Used by 10,000+ producers. Instant download.',
  keywords: 'hitmaker bundle, music production bundle, sample pack with stems, midi chord progressions, fl studio presets, ableton presets, trap samples, r&b samples, soul samples, boom bap samples, royalty free samples, producer bundle',
  openGraph: {
    title: 'Hitmaker Bundle - Everything You Need To Make Hits | 78% OFF',
    description: 'Get 300+ professional samples with stems, 800 MIDI progressions, analog drums & DAW presets. Limited time offer - Save $200!',
    type: 'website',
    url: 'https://looplib.com/hitmaker',
    images: [
      {
        url: 'https://cdn.shopify.com/s/files/1/0816/1257/0973/files/hitmaker-bundle-popup.webp',
        width: 1200,
        height: 630,
        alt: 'Hitmaker Bundle - Professional Music Production Pack',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Hitmaker Bundle - 78% OFF Limited Time',
    description: '300+ samples with stems, 800 MIDI progressions, analog drums & mixer presets. Save $200 today!',
    images: ['https://cdn.shopify.com/s/files/1/0816/1257/0973/files/hitmaker-bundle-popup.webp'],
  },
  alternates: {
    canonical: 'https://looplib.com/hitmaker',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function HitmakerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* Structured Data for Rich Results */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Product',
            name: 'Hitmaker Bundle - All Bundles Included',
            description: '300+ professional samples with full stems, 800 MIDI chord progressions, analog mastered drum kit, and mixer presets for FL Studio and Ableton.',
            image: 'https://cdn.shopify.com/s/files/1/0816/1257/0973/files/hitmaker-bundle-popup.webp',
            brand: {
              '@type': 'Brand',
              name: 'LoopLib',
            },
            offers: {
              '@type': 'Offer',
              url: 'https://looplib.com/hitmaker',
              priceCurrency: 'USD',
              price: '49.99',
              priceValidUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
              availability: 'https://schema.org/InStock',
              seller: {
                '@type': 'Organization',
                name: 'LoopLib',
              },
            },
            aggregateRating: {
              '@type': 'AggregateRating',
              ratingValue: '4.9',
              reviewCount: '127',
              bestRating: '5',
              worstRating: '1',
            },
            review: [
              {
                '@type': 'Review',
                reviewRating: {
                  '@type': 'Rating',
                  ratingValue: '5',
                },
                author: {
                  '@type': 'Person',
                  name: 'Mike Dean',
                },
                reviewBody: 'This bundle has everything you need. The stems are fire and the MIDI progressions save me hours of work.',
              },
            ],
          }),
        }}
      />
      
      {/* Facebook Pixel Event for Page View */}
      <script
        dangerouslySetInnerHTML={{
          __html: `
            if (typeof fbq !== 'undefined') {
              fbq('track', 'ViewContent', {
                content_name: 'Hitmaker Bundle',
                content_category: 'Music Production Bundle',
                value: 49.99,
                currency: 'USD'
              });
            }
          `,
        }}
      />
      
      {children}
    </>
  );
}