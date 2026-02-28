import type { Metadata } from 'next';
import '@/styles/globals.css';
import Script from 'next/script';

export const metadata: Metadata = {
  title: {
    default: 'Is It Safe To Visit? — Honest Travel Safety Guides',
    template: '%s | IsItSafeToVisit.com',
  },
  description: 'Real safety information for travelers. Neighborhood guides, scam alerts, local customs, and practical tips for 300+ cities worldwide.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <Script async src="https://www.googletagmanager.com/gtag/js?id=G-L7D51KXP2L" strategy="afterInteractive" />
        <Script id="gtag-init" strategy="afterInteractive">
          {`window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-L7D51KXP2L');`}
        </Script>
      </head>
      <body>{children}</body>
    </html>
  );
}