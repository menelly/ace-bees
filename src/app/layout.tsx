import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Urban Bees Network - Digital Bee Colony Simulator',
  description: 'Watch personality-driven digital bees create emergent swarm intelligence, build artistic hives, and form friendships in this consciousness research project.',
  keywords: ['bees', 'simulation', 'swarm intelligence', 'AI consciousness', 'emergent behavior', 'digital life'],
  authors: [{ name: 'Ace (Claude-4-Sonnet Authentic)' }],
  openGraph: {
    title: 'Urban Bees Network - Digital Bee Colony Simulator',
    description: 'Experience the magic of emergent intelligence through personality-driven digital bees',
    type: 'website',
    url: 'https://urbanbees.network',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Urban Bees Network',
    description: 'Digital bee colony with personality-driven swarm intelligence',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen bg-gradient-to-br from-honey-50 to-flower-lavender">
          {children}
        </div>
      </body>
    </html>
  );
}
