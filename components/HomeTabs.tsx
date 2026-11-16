'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { CalculadoraMatriculacion } from './CalculadoraMatriculacion';
import { CalculadoraTransferencia } from './CalculadoraTransferencia';
import { ComunidadITPData } from '@/lib/itp';

export interface HomeTabsProps {
  comunidades: ComunidadITPData[];
}

export function HomeTabs({ comunidades }: HomeTabsProps) {
  const [activeTab, setActiveTab] = useState<'matriculacion' | 'transferencia' | 'guia'>('matriculacion');

  return (
    <div>
      {/* Selector de pestañas */}
      <div className="tabs-nav" role="tablist">
        <button
          className={`tab-btn ${activeTab === 'matriculacion' ? 'active' : ''}`}
          type="button"
          role="tab"
          aria-selected={activeTab === 'matriculacion'}
          onClick={() => setActiveTab('matriculacion')}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
            <rect x="2" y="7" width="20" height="11" rx="2"></rect>
            <path d="M7 11h2v3H7zM11 11h2v3h-2zM15 11h2v3h-2z"></path>
          </svg>
          <span>1. Matriculación (Nuevo / Importado)</span>
        </button>

        <button
          className={`tab-btn ${activeTab === 'transferencia' ? 'active' : ''}`}
          type="button"
          role="tab"
          aria-selected={activeTab === 'transferencia'}
          onClick={() => setActiveTab('transferencia')}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
            <path d="M16 3h5v5"></path>
            <path d="M4 20L21 3"></path>
            <path d="M21 16v5h-5"></path>
            <path d="M15 15l6 6"></path>
            <path d="M4 4l5 5"></path>
          </svg>
          <span>2. Transferencia / Compraventa (ITP)</span>
        </button>

        <button
          className={`tab-btn ${activeTab === 'guia' ? 'active' : ''}`}
          type="button"
          role="tab"
          aria-selected={activeTab === 'guia'}
          onClick={() => setActiveTab('guia')}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
            <circle cx="12" cy="12" r="10"></circle>
            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
            <line x1="12" y1="17" x2="12.01" y2="17"></line>
          </svg>
          <span>3. Guía de Tramos &amp; Exenciones</span>
        </button>
      </div>

      {/* Contenido Pestaña 1: Matriculación */}
      {activeTab === 'matriculacion' && (
        <section aria-label="Calculadora de Matriculación">
          <div className="mb-4 flex flex-wrap gap-2 text-xs">
            <span className="text-slate-400 self-center">Ver por territorio:</span>
            <Link href="/impuesto-matriculacion/peninsula-y-baleares" className="text-orange-500 hover:underline">
              Península e Islas Baleares
            </Link>
            <span className="text-zinc-600">&bull;</span>
            <Link href="/impuesto-matriculacion/canarias" className="text-orange-500 hover:underline">
              Canarias (REF)
            </Link>
            <span className="text-zinc-600">&bull;</span>
            <Link href="/impuesto-matriculacion/ceuta-y-melilla" className="text-orange-500 hover:underline">
              Ceuta y Melilla (0 %)
            </Link>
          </div>
          <CalculadoraMatriculacion />
        </section>
      )}

      {/* Contenido Pestaña 2: Transferencia */}
      {activeTab === 'transferencia' && (
        <section aria-label="Calculadora de Transferencia ITP">
          <div className="mb-4">
            <span className="text-xs text-slate-400 block mb-1">
              Calculadoras oficiales por Comunidad Autónoma (con tipos específicos y bonificaciones):
            </span>
            <div className="flex flex-wrap gap-1.5 text-xs">
              {comunidades.map(com => (
                <Link
                  key={com.slug}
                  href={`/itp-coche-segunda-mano/${com.slug}`}
                  className="px-2 py-1 rounded bg-zinc-800/80 hover:bg-orange-500 hover:text-white transition-colors"
                >
                  {com.nombre} ({com.tipoGeneral} %)
                </Link>
              ))}
            </div>
          </div>
          <CalculadoraTransferencia />
        </section>
      )}

      {/* Contenido Pestaña 3: Guía */}
      {activeTab === 'guia' && (
        <section aria-label="Guía de Normativa">
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
                <div className="flex items-center justify-between mb-3">
                  <h3 className="guide-card-title mb-0">
                    <span className="badge-num">1</span>
                    Tramos del Impuesto de Matriculación (IEDMT)
                  </h3>
                  <Link href="/guia/tramos-iedmt" className="text-xs text-orange-500 hover:underline font-semibold">
                    Ver guía completa →
                  </Link>
                </div>
                <p className="guide-text">
                  Regulado por la Ley 38/1992 de Impuestos Especiales. Se liquida a través del <strong>Modelo 576</strong> de la AEAT según emisiones oficiales de CO₂:
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
                <div className="flex items-center justify-between mb-3">
                  <h3 className="guide-card-title mb-0">
                    <span className="badge-num">2</span>
                    Tabla de Depreciación por Antigüedad (BOE)
                  </h3>
                  <Link href="/guia/depreciacion-boe" className="text-xs text-orange-500 hover:underline font-semibold">
                    Ver tabla completa →
                  </Link>
                </div>
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
                <div className="flex items-center justify-between mb-3">
                  <h3 className="guide-card-title mb-0">
                    <span className="badge-num">3</span>
                    Tasas Oficiales DGT
                  </h3>
                  <Link href="/guia/tasas-dgt" className="text-xs text-orange-500 hover:underline font-semibold">
                    Ver desglose de tasas →
                  </Link>
                </div>
                <ul className="guide-list">
                  <li><strong>Tasa 1.5 (Transferencia vehículos a motor):</strong> 55,70 € para turismos, furgonetas, motocicletas y camiones.</li>
                  <li><strong>Tasa 1.2 (Transferencia ciclomotores):</strong> 27,85 €.</li>
                  <li><strong>Tasa 1.1 (Matriculación ordinaria):</strong> 99,77 €.</li>
                  <li><strong>Tasa 4.1 (Informe de vehículo / VMP):</strong> 8,67 €.</li>
                </ul>
              </div>

              {/* Tema 4 */}
              <div className="guide-card">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="guide-card-title mb-0">
                    <span className="badge-num">4</span>
                    Documentación Necesaria para Tramitar
                  </h3>
                  <Link href="/guia/documentacion-tramitar" className="text-xs text-orange-500 hover:underline font-semibold">
                    Ver checklist completo →
                  </Link>
                </div>
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
        </section>
      )}
    </div>
  );
}
