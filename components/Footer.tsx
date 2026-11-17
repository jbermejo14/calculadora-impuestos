import React from 'react';
import Link from 'next/link';
import { getComunidadesList } from '@/lib/itp';
import { SITE_NAME } from '@/lib/site';

export function Footer() {
  const comunidades = getComunidadesList(2026);

  return (
    <footer className="site-footer">
      <div className="footer-container">
        <p className="footer-text">
          <strong>{SITE_NAME}</strong> &bull; Calculadora fiscal de vehículos para particulares y profesionales.
        </p>
        <p className="footer-subtext">
          Valores fiscales del ejercicio 2026 pendientes de revisión contra la fuente, basados en la Ley 38/1992 de Impuestos Especiales, la Orden HAC/1484/2024 de precios medios de venta y coeficientes de depreciación del BOE, las tasas de la DGT y las leyes autonómicas de tributos cedidos.
        </p>
        <div className="flex flex-wrap justify-center gap-x-3 gap-y-1 text-xs text-muted mt-2">
          <span>Comunidades Autónomas:</span>
          {comunidades.map(com => (
            <Link key={com.slug} href={`/itp-coche-segunda-mano/${com.slug}`} className="text-muted hover:text-accent transition-colors">
              {com.nombre}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
}
