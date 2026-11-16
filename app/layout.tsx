import type { Metadata } from 'next';
import { Plus_Jakarta_Sans, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { getSiteUrl } from '@/lib/site';

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-sans',
  display: 'swap'
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['500', '700'],
  variable: '--font-mono',
  display: 'swap'
});

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Calculadora de Impuestos de Vehículos 2026 | Matriculación e ITP DGT',
    template: '%s | AutoTax'
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
  authors: [{ name: 'AutoTax' }],
  creator: 'AutoTax',
  publisher: 'AutoTax',
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
    siteName: 'AutoTax',
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
    <html lang="es" data-theme="dark" suppressHydrationWarning className={`${plusJakarta.variable} ${jetbrainsMono.variable}`}>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var saved = localStorage.getItem('autotax_theme');
                  if (saved === 'light' || saved === 'dark') {
                    document.documentElement.setAttribute('data-theme', saved);
                  }
                } catch(e) {}
              })();
            `
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
