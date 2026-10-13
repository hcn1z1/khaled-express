import type { Metadata } from 'next';
import { Inter, Tajawal } from 'next/font/google';
import './globals.css';
import ErrorBoundary from '@/components/ErrorBoundary';
import AppShell from '@/components/AppShell';
import { SiteProvider } from '@/lib/site-context';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const tajawal = Tajawal({
  subsets: ['arabic'],
  weight: ['400', '500', '700', '800'],
  variable: '--font-tajawal',
  display: 'swap',
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: 'Khaled Express | Transport de Colis Alger ↔ El Eulma',
  description:
    'Service express de transfert et livraison de colis entre Alger et El Eulma (Sétif). Suivi en temps réel et notifications SMS.',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Khaled Express | Transport de Colis Alger ↔ El Eulma',
    description:
      'Service express de transfert et livraison de colis entre Alger et El Eulma (Sétif). Suivi en temps réel et notifications SMS.',
    url: '/',
    siteName: 'Khaled Express',
    locale: 'fr_DZ',
    type: 'website',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Khaled Express Transport de Colis',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Khaled Express | Transport de Colis Alger ↔ El Eulma',
    description:
      'Service express de transfert et livraison de colis entre Alger et El Eulma (Sétif). Suivi en temps réel et notifications SMS.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
  },
};

const structuredData = {
  '@context': 'https://schema.org',
  '@type': 'DeliveryService',
  name: 'Khaled Express',
  description:
    'Service express de transport de colis et messagerie entre Alger et El Eulma (Sétif)',
  url: siteUrl,
  areaServed: [
    {
      '@type': 'City',
      name: 'Alger',
    },
    {
      '@type': 'City',
      name: 'El Eulma',
    },
  ],
  hasOfferCatalog: {
    '@type': 'OfferCatalog',
    name: 'Services de livraison',
    itemListElement: [
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: 'Transfert Colis Express Alger ➔ El Eulma',
        },
      },
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: 'Transfert Colis Express El Eulma ➔ Alger',
        },
      },
    ],
  },
  provider: {
    '@type': 'LocalBusiness',
    name: 'Khaled Express',
    telephone: '+213-23-00-00-00',
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'DZ',
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className={`dark ${inter.variable} ${tajawal.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </head>
      <body className="bg-dark-950 text-slate-100 min-h-screen antialiased">
        <SiteProvider>
          <ErrorBoundary>
            <AppShell>{children}</AppShell>
          </ErrorBoundary>
        </SiteProvider>
      </body>
    </html>
  );
}
