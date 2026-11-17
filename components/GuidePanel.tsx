import React from 'react';
import Link from 'next/link';

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
                <tr>
                  <td><span className="tag tag-green">Epígrafe 1.º</span></td>
                  <td>≤ 120 g/km</td>
                  <td className="bold orange">0,0 % (Exento)</td>
                </tr>
                <tr>
                  <td><span className="tag">Epígrafe 2.º</span></td>
                  <td>&gt; 120 y &lt; 160 g/km</td>
                  <td className="bold">4,75 %</td>
                </tr>
                <tr>
                  <td><span className="tag">Epígrafe 3.º</span></td>
                  <td>≥ 160 y &lt; 200 g/km</td>
                  <td className="bold">9,75 %</td>
                </tr>
                <tr>
                  <td><span className="tag tag-red">Epígrafe 4.º</span></td>
                  <td>≥ 200 g/km</td>
                  <td className="bold orange">14,75 %</td>
                </tr>
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
                  <th>Coeficiente</th>
                  <th>Antigüedad</th>
                  <th>Coeficiente</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Hasta 1 año</td>
                  <td className="orange bold">100 %</td>
                  <td>6 a 7 años</td>
                  <td className="orange bold">34 %</td>
                </tr>
                <tr>
                  <td>1 a 2 años</td>
                  <td className="orange bold">84 %</td>
                  <td>7 a 8 años</td>
                  <td className="orange bold">28 %</td>
                </tr>
                <tr>
                  <td>2 a 3 años</td>
                  <td className="orange bold">67 %</td>
                  <td>8 a 9 años</td>
                  <td className="orange bold">24 %</td>
                </tr>
                <tr>
                  <td>3 a 4 años</td>
                  <td className="orange bold">56 %</td>
                  <td>9 a 10 años</td>
                  <td className="orange bold">19 %</td>
                </tr>
                <tr>
                  <td>4 a 5 años</td>
                  <td className="orange bold">47 %</td>
                  <td>10 a 11 años</td>
                  <td className="orange bold">17 %</td>
                </tr>
                <tr>
                  <td>5 a 6 años</td>
                  <td className="orange bold">39 %</td>
                  <td>&gt; 12 años</td>
                  <td className="orange bold">10 %</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Tema 3 */}
        <div className="guide-card">
          <GuideCardHeader number={3} title="Tasas DGT" href="/guia/tasas-dgt" linkLabel="Ver desglose de tasas →" />
          <ul className="guide-list">
            <li><strong>Tasa 1.5 (Transferencia vehículos a motor):</strong> 55,70 € para turismos, furgonetas, motocicletas y camiones.</li>
            <li><strong>Tasa 1.2 (Transferencia ciclomotores):</strong> 27,85 €.</li>
            <li><strong>Tasa 1.1 (Matriculación ordinaria):</strong> 99,77 €.</li>
            <li><strong>Tasa 4.1 (Informe de vehículo / VMP):</strong> 8,67 €.</li>
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
