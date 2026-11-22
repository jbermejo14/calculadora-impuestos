import React from 'react';
import Link from 'next/link';
import { getComunidadesList } from '@/lib/itp';

export function Footer() {
  const comunidades = getComunidadesList(2026);

  return (
    <footer className="site-footer">
      <div className="footer-container">
        <p className="footer-text">
          <strong>Ododex · Calculadora de Impuestos</strong> &bull; Calculadora fiscal de vehículos para particulares y profesionales.
        </p>
        <p className="footer-subtext">
          Valores fiscales del ejercicio 2026 basados en la Ley 38/1992 de Impuestos Especiales, la Orden HAC/1484/2024 de precios medios de venta y coeficientes de depreciación del BOE, las tasas de la DGT y las leyes autonómicas de tributos cedidos. Sitio independiente no oficial.
        </p>
        <div className="flex flex-wrap justify-center gap-x-3 gap-y-1 text-xs text-slate-500 mt-2">
          <span>Comunidades Autónomas:</span>
          {comunidades.map(com => (
            <Link key={com.slug} href={`/itp-coche-segunda-mano/${com.slug}`} className="hover:text-orange-500 transition-colors">
              {com.nombre}
            </Link>
          ))}
        </div>
        <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs text-slate-400 mt-3 pt-3 border-t border-[var(--border-color)]">
          <a href="/es/multas/aviso-legal" className="hover:text-orange-500 transition-colors">Aviso legal</a>
          <a href="/es/multas/privacidad" className="hover:text-orange-500 transition-colors">Privacidad</a>
          <a href="/es/multas/cookies" className="hover:text-orange-500 transition-colors">Cookies</a>
          <a href="/sobre-nosotros" className="hover:text-orange-500 transition-colors">Sobre Ododex</a>
        </div>
      </div>
    </footer>
  );
}
