import React from 'react';
import Link from 'next/link';
import { getComunidadesList } from '@/lib/itp';
import type { NetworkSection } from '@/lib/network';
import { SITE_NAME } from '@/lib/site';
import { ConsentSettingsButton } from '@/components/ConsentSettingsButton';

export interface FooterProps {
  /** Muestra el botón para cambiar el consentimiento; solo si AdSense está configurado. */
  mostrarConsentimiento?: boolean;
  /** Otras webs de la red (sin la propia). null o vacío: no se pinta el bloque. */
  redSecciones?: NetworkSection[] | null;
}

export function Footer({ mostrarConsentimiento = false, redSecciones = null }: FooterProps) {
  const comunidades = getComunidadesList(2026);

  return (
    <footer className="site-footer">
      <div className="footer-container">
        <p className="footer-text">
          <strong>{SITE_NAME}</strong> &bull; Calculadora fiscal de vehículos para particulares y profesionales.
        </p>
        <p className="footer-subtext">
          Valores fiscales del ejercicio 2026 verificados contra el BOE y las normas autonómicas (cada resultado indica la fecha de verificación y la fuente, y marca como pendiente cualquier dato sin verificar), basados en la Ley 38/1992 de Impuestos Especiales, la Orden HAC/1501/2025 de precios medios de venta y coeficientes de depreciación del BOE, las tasas de la DGT y las leyes autonómicas de tributos cedidos. El resultado es orientativo y no sustituye a la liquidación oficial. Sitio independiente: no es una web oficial de la DGT, de la AEAT ni de ninguna administración tributaria.
        </p>
        <nav aria-label="Información legal" className="footer-legal">
          <Link href="/aviso-legal">Aviso legal</Link>
          <Link href="/privacidad">Privacidad</Link>
          <Link href="/cookies">Cookies</Link>
          {mostrarConsentimiento && <ConsentSettingsButton />}
        </nav>
        {redSecciones && redSecciones.length > 0 && (
          <nav aria-label="Otras webs de Ododex" className="flex flex-wrap justify-center gap-x-3 gap-y-1 text-xs text-muted mt-2">
            <span>Otras webs de Ododex:</span>
            {redSecciones.map(seccion => (
              // Son webs de otra sección: <a> normal, sin next/link ni basePath propio.
              <a key={seccion.ruta} href={seccion.ruta} title={seccion.descripcion} className="text-muted hover:text-accent transition-colors">
                {seccion.nombre}
              </a>
            ))}
          </nav>
        )}
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
