import type { Metadata } from 'next';
import '../styles/globals.css';

export const metadata: Metadata = {
  title: {
    default: 'Is It Safe To Visit? — Honest Travel Safety Guides for 300+ Cities',
    template: '%s — IsItSafeToVisit.com',
  },
  description: 'Real safety information for travelers. Neighborhood guides, scam alerts, local customs, and practical tips for 300+ cities worldwide.',
  metadataBase: new URL('https://isitsafetovisit.com'),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
