import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'StealthHumanizer - Free AI Text Humanizer',
  description: 'Transform AI-generated text into natural, human-like writing. Free and open source alternative to StealthWriter.',
  keywords: ['ai humanizer', 'text humanizer', 'ai detector', 'stealthwriter alternative', 'free ai humanizer'],
  authors: [{ name: 'StealthHumanizer' }],
  openGraph: {
    title: 'StealthHumanizer - Free AI Text Humanizer',
    description: 'Transform AI-generated text into natural, human-like writing.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} antialiased`}>
        {children}
      </body>
    </html>
  );
}
