import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { getSiteUrl, SITE_NAME } from '@/lib/site';

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

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Calculadora de Impuestos de Vehículos 2026 | Matriculación e ITP DGT',
    template: `%s | ${SITE_NAME}`
  },
  description: 'Calcula online los impuestos de matriculación (IEDMT Modelo 576) y transferencia de vehículos usados (ITP Modelos 620/621) en España para 2026 con tasas DGT actualizadas.',
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
    canonical: siteUrl
  },
  openGraph: {
    type: 'website',
    locale: 'es_ES',
    url: siteUrl,
    siteName: SITE_NAME,
    title: 'Calculadora de Impuestos de Vehículos 2026 | Matriculación e ITP',
    description: 'Calcula los impuestos de matriculación (IEDMT) y transferencia (ITP) de coches y motos en España con tipos autonómicos y tasas DGT (datos pendientes de revisión).'
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
        <Footer />
      </body>
    </html>
  );
}
