import React from 'react';
import Link from 'next/link';
import { getDepreciacionData } from '@/lib/itp';
import { getIEDMTData, type TramoIEDMT } from '@/lib/iedmt';
import { getTasasDgtData } from '@/lib/fees';

const GUIDE_ANIO = 2026;
const GUIDE_TERRITORIO_GENERAL = 'peninsula-y-baleares';
const GUIDE_EPIGRAFES_TURISMO = ['1.º', '2.º', '3.º', '4.º'];

function guideFormatPercent(value: number): string {
  return `${value.toFixed(2).replace('.', ',')} %`;
}

function guideFormatEuros(value: number): string {
  return `${value.toFixed(2).replace('.', ',')} €`;
}

function guideTagClass(tramo: TramoIEDMT): string {
  if (tramo.tipoPorcentaje === 0) return 'tag tag-green';
  return tramo.epigrafe === GUIDE_EPIGRAFES_TURISMO[GUIDE_EPIGRAFES_TURISMO.length - 1] ? 'tag tag-red' : 'tag';
}

interface GuideCardHeaderProps {
  number: number;
  title: string;
  href: string;
  linkLabel: string;
}

/** Cabecera de cada tarjeta de la guía: número, título y enlace a la guía completa. */
function GuideCardHeader({ number, title, href, linkLabel }: GuideCardHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-3">
      <h3 className="guide-card-title mb-0">
        <span className="badge-num">{number}</span>
        {title}
      </h3>
      <Link
        href={href}
        className="inline-flex min-h-11 items-center text-xs text-accent hover:underline font-semibold"
      >
        {linkLabel}
      </Link>
    </div>
  );
}

/** Contenido del panel "Tramos": resumen de normativa con enlaces a las guías completas. */
export function GuidePanel() {
  const tramosTurismo = getIEDMTData(GUIDE_ANIO).territorios[GUIDE_TERRITORIO_GENERAL].tramos.filter(tramo =>
    GUIDE_EPIGRAFES_TURISMO.includes(tramo.epigrafe)
  );
  const tramosDepreciacion = getDepreciacionData(GUIDE_ANIO).tramos;
  const tasas = Object.entries(getTasasDgtData(GUIDE_ANIO).tasas);

  return (
    <div className="card">
      <div className="card-header">
        <div>
          <h2 className="card-title">Normativa y Referencias Fiscales en España (2026)</h2>
          <p className="card-desc">Resumen claro de la legislación vigente para matriculaciones y transferencias de vehículos.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Tema 1 */}
        <div className="guide-card">
          <GuideCardHeader number={1} title="Tramos del Impuesto de Matriculación (IEDMT)" href="/guia/tramos-iedmt" linkLabel="Ver guía completa →" />
          <p className="guide-text">
            Regulado por la Ley 38/1992 de Impuestos Especiales. Se liquida a través del <strong>Modelo 576</strong> de la AEAT según emisiones de CO₂:
          </p>
          <div className="table-responsive">
            <table className="guide-table">
              <thead>
                <tr>
                  <th>Epígrafe</th>
                  <th>Emisiones CO₂</th>
                  <th>Tipo General</th>
                </tr>
              </thead>
              <tbody>
                {tramosTurismo.map(tramo => (
                  <tr key={tramo.epigrafe}>
                    <td><span className={guideTagClass(tramo)}>Epígrafe {tramo.epigrafe}</span></td>
                    <td>{tramo.descripcion}</td>
                    <td className="bold orange">{guideFormatPercent(tramo.tipoPorcentaje)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Tema 2 */}
        <div className="guide-card">
          <GuideCardHeader number={2} title="Tabla de Depreciación por Antigüedad (BOE)" href="/guia/depreciacion-boe" linkLabel="Ver tabla completa →" />
          <p className="guide-text">
            Regulado en el Anexo IV de la Orden Ministerial anual de precios medios de venta. Determina el valor venal residual:
          </p>
          <div className="table-responsive">
            <table className="guide-table compact">
              <thead>
                <tr>
                  <th>Antigüedad</th>
                  <th>Porcentaje s/ valor de nuevo</th>
                </tr>
              </thead>
              <tbody>
                {tramosDepreciacion.map(tramo => (
                  <tr key={tramo.etiqueta}>
                    <td>{tramo.etiqueta}</td>
                    <td className="orange bold">{tramo.porcentaje} %</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Tema 3 */}
        <div className="guide-card">
          <GuideCardHeader number={3} title="Tasas DGT" href="/guia/tasas-dgt" linkLabel="Ver desglose de tasas →" />
          <ul className="guide-list">
            {tasas.map(([clave, tasa]) => (
              <li key={clave}>
                <strong>Tasa {tasa.codigo} ({tasa.concepto}):</strong> {guideFormatEuros(tasa.importe)}.
              </li>
            ))}
          </ul>
        </div>

        {/* Tema 4 */}
        <div className="guide-card">
          <GuideCardHeader number={4} title="Documentación Necesaria para Tramitar" href="/guia/documentacion-tramitar" linkLabel="Ver checklist completo →" />
          <ul className="guide-list">
            <li>Contrato de compraventa firmado por comprador y vendedor (original y copias).</li>
            <li>DNI / NIE en vigor de ambas partes.</li>
            <li>Permiso de circulación original del vehículo.</li>
            <li>Ficha técnica / Tarjeta ITV con la inspección periódica en vigor.</li>
            <li>Justificante de pago o exención del ITP (Modelo 620 o 621 con CSV).</li>
            <li>Impuesto sobre Vehículos de Tracción Mecánica (IVTM / numerito) al día.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
