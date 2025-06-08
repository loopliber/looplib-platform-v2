import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Free Samples Blog | Music Production Tips & Guides | LoopLib',
  description: 'Learn how to find and use free samples in your music production. Guides, tutorials, and tips for trap, soul, R&B producers using free samples.',
  keywords: 'free samples blog, music production blog, free samples guide, sample licensing, trap production, soul samples, rnb production tips',
  openGraph: {
    title: 'Free Samples Blog - Music Production Tips & Guides',
    description: 'Expert guides on finding and using free samples for music production. Learn licensing, mixing tips, and production techniques.',
    type: 'website',
    url: 'https://looplib.com/blog',
    images: [
      {
        url: '/og-blog.jpg',
        width: 1200,
        height: 630,
        alt: 'LoopLib Free Samples Blog',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free Samples Blog - LoopLib',
    description: 'Expert guides on finding and using free samples for music production.',
    images: ['/og-blog.jpg'],
  },
  alternates: {
    canonical: 'https://looplib.com/blog',
  },
};

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Blog',
            name: 'LoopLib Free Samples Blog',
            description: 'Music production tips and guides for using free samples',
            url: 'https://looplib.com/blog',
            publisher: {
              '@type': 'Organization',
              name: 'LoopLib',
              logo: {
                '@type': 'ImageObject',
                url: 'https://looplib.com/logo.png',
              },
            },
          }),
        }}
      />
      {children}
    </>
  );
}