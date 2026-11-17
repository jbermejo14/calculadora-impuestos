import React from 'react';
import Link from 'next/link';

interface TerritoryLink {
  slug: string;
  name: string;
  hint: string;
}

const TERRITORIES: TerritoryLink[] = [
  { slug: 'peninsula-y-baleares', name: 'Península y Baleares', hint: 'Régimen general' },
  { slug: 'canarias', name: 'Canarias', hint: 'Tipos reducidos (REF)' },
  { slug: 'ceuta-y-melilla', name: 'Ceuta y Melilla', hint: 'Tipo 0 %' }
];

/** Tarjetas de enlace a las páginas del impuesto de matriculación por territorio. */
export function TerritoryLinks() {
  return (
    <nav aria-labelledby="territory-links-title">
      <h2 id="territory-links-title" className="link-section-title">
        Ver por territorio
      </h2>
      <div className="territory-grid">
        {TERRITORIES.map(territory => (
          <Link
            key={territory.slug}
            href={`/impuesto-matriculacion/${territory.slug}`}
            className="link-card"
          >
            <span>
              <span className="link-card-name">{territory.name}</span>
              <span className="link-card-hint">{territory.hint}</span>
            </span>
            <span className="link-card-arrow" aria-hidden="true">→</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}
