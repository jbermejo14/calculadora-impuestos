import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { AdSenseScript, getAdSenseClient } from '@/components/AdSenseScript';
import { absoluteUrl, getSiteUrl, SITE_NAME } from '@/lib/site';
import { HOME_DESCRIPTION, HOME_TITLE } from '@/lib/seo';

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-inter',
  display: 'swap'
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['500', '700'],
  variable: '--font-jetbrains',
  display: 'swap'
});

/**
 * Fija el tema antes de pintar para evitar el parpadeo: primero la elección guardada
 * y, si no hay, la preferencia del sistema. El try/catch cubre un localStorage no disponible.
 */
const THEME_SCRIPT = `
  (function() {
    var theme = null;
    try {
      var saved = localStorage.getItem('ododex-theme');
      if (saved === 'light' || saved === 'dark') theme = saved;
      if (!theme) {
        var prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        theme = prefersDark ? 'dark' : 'light';
      }
    } catch (e) {
      theme = 'light';
    }
    document.documentElement.setAttribute('data-theme', theme);
  })();
`;

const homeUrl = absoluteUrl('/');

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: HOME_TITLE,
    template: `%s | ${SITE_NAME}`
  },
  description: HOME_DESCRIPTION,
  keywords: [
    'calculadora impuestos vehiculos',
    'impuesto matriculacion 2026',
    'impuesto transferencia coche',
    'ITP coche segunda mano',
    'modelo 620',
    'modelo 621',
    'modelo 576',
    'tasas DGT cambio titularidad'
  ],
  authors: [{ name: SITE_NAME }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  robots: {
    index: true,
    follow: true
  },
  alternates: {
    canonical: homeUrl
  },
  openGraph: {
    type: 'website',
    locale: 'es_ES',
    url: homeUrl,
    siteName: SITE_NAME,
    title: HOME_TITLE,
    description: HOME_DESCRIPTION
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: THEME_SCRIPT
          }}
        />
      </head>
      <body>
        <Header />
        {children}
        <Footer mostrarConsentimiento={getAdSenseClient() !== null} />
        <AdSenseScript />
      </body>
    </html>
  );
}
