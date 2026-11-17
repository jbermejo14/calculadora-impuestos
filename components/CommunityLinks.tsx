import React from 'react';
import Link from 'next/link';
import type { ComunidadITPData } from '@/lib/itp';

const CHEVRON_SIZE = 18;

export interface CommunityLinksProps {
  comunidades: ComunidadITPData[];
}

/** Desplegable (cerrado por defecto) con un enlace a la página de ITP de cada comunidad. */
export function CommunityLinks({ comunidades }: CommunityLinksProps) {
  return (
    <details className="community-details">
      <summary className="link-card">
        <span>Ver el ITP por comunidad autónoma ({comunidades.length})</span>
        <svg
          className="community-chevron"
          viewBox="0 0 24 24"
          width={CHEVRON_SIZE}
          height={CHEVRON_SIZE}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </summary>
      <div className="communities-grid">
        {comunidades.map(com => (
          <Link key={com.slug} href={`/itp-coche-segunda-mano/${com.slug}`} className="community-pill">
            <span className="com-name">{com.nombre}</span>
            <span className="com-rate">{com.tipoGeneral.toLocaleString('es-ES')} %</span>
          </Link>
        ))}
      </div>
    </details>
  );
}
