import type { Metadata } from 'next';
import './globals.css';

const SITE_URL = 'https://stealthhumanizer.vercel.app';

export const metadata: Metadata = {
  title: 'StealthHumanizer - Free AI Text Humanizer',
  description: 'Free open-source AI text humanizer. Transform AI-generated text into natural, human-like writing with 13 AI providers, 4 rewrite levels, and multi-pass ninja mode. No login required.',
  keywords: 'AI humanizer, text humanizer, AI text converter, humanize AI text, free AI humanizer, rewrite AI text',
  authors: [{ name: 'Rudra Sarker', url: 'https://github.com/rudra496' }],
  creator: 'Rudra Sarker',
  metadataBase: new URL(SITE_URL),
  alternates: { canonical: SITE_URL },
  openGraph: {
    title: 'StealthHumanizer - Free AI Text Humanizer',
    description: 'Free open-source AI text humanizer. Transform AI-generated text into natural, human-like writing with 13 AI providers, 4 rewrite levels, and multi-pass ninja mode. No login required.',
    url: SITE_URL,
    siteName: 'StealthHumanizer',
    type: 'website',
    locale: 'en_US',
    images: [{ url: `${SITE_URL}/og-image.png`, width: 1200, height: 630, alt: 'StealthHumanizer' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'StealthHumanizer - Free AI Text Humanizer',
    description: 'Free open-source AI text humanizer. Transform AI-generated text into natural, human-like writing.',,
    images: [`${SITE_URL}/og-image.png`],
  },
  robots: { index: true, follow: true },
  icons: { icon: '/favicon.ico' },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'StealthHumanizer',
  url: SITE_URL,
  description: 'Free open-source AI text humanizer. Transform AI-generated text into natural, human-like writing with 13 AI providers, 4 rewrite levels, and multi-pass ninja mode.',
  applicationCategory: 'Utility',
  operatingSystem: 'Web',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  author: { '@type': 'Person', name: 'Rudra Sarker', url: 'https://github.com/rudra496' },
  featureList: ['13 AI providers', '4 rewrite levels', 'Multi-pass ninja mode', 'PDF/DOCX upload', 'Grammar check', 'Multi-language support'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      </head>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
