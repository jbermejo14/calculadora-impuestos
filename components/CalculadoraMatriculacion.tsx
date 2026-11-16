'use client';

import React, { useState, useId } from 'react';
import { calcularIEDMT } from '@/lib/iedmt';
import { VerificationNotice } from './VerificationNotice';

export interface CalculadoraMatriculacionProps {
  initialTerritorio?: string;
  initialBase?: number;
  initialCO2?: number;
}

function formatEUR(val: number): string {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(val);
}

export function CalculadoraMatriculacion({
  initialTerritorio = 'peninsula-y-baleares',
  initialBase = 25000,
  initialCO2 = 135
}: CalculadoraMatriculacionProps) {
  const [baseImponible, setBaseImponible] = useState<number>(initialBase);
  const [emisionesCO2, setEmisionesCO2] = useState<number>(initialCO2);
  const [territorio, setTerritorio] = useState<string>(initialTerritorio);
  const [tipoVehiculo, setTipoVehiculo] = useState<'turismo' | 'motocicleta' | 'comercial' | 'autocaravana'>('turismo');
  const [esFamiliaNumerosa, setEsFamiliaNumerosa] = useState<boolean>(false);
  const [esMinusvalia, setEsMinusvalia] = useState<boolean>(false);
  const [incluirIva, setIncluirIva] = useState<boolean>(true);
  const [incluirTasaDgt, setIncluirTasaDgt] = useState<boolean>(true);

  const baseInputId = useId();
  const co2InputId = useId();
  const terrSelectId = useId();
  const tipoSelectId = useId();

  const resultado = calcularIEDMT({
    anio: 2026,
    baseImponible,
    emisionesCO2,
    territorio,
    tipoVehiculo,
    esFamiliaNumerosa,
    esMinusvalia,
    incluirIva,
    incluirTasaDgt
  });

  const handlePrint = () => {
    window.print();
  };

  const handleReset = () => {
    setBaseImponible(25000);
    setEmisionesCO2(135);
    setTerritorio(initialTerritorio);
    setTipoVehiculo('turismo');
    setEsFamiliaNumerosa(false);
    setEsMinusvalia(false);
    setIncluirIva(true);
    setIncluirTasaDgt(true);
  };

  return (
    <div className="calculator-grid">
      {/* Formulario */}
      <div className="card form-card">
        <div className="card-header">
          <div>
            <h2 className="card-title">Datos del Vehículo para Matriculación</h2>
            <p className="card-desc">Impuesto Especial sobre Determinados Medios de Transporte (Modelo 576 AEAT)</p>
          </div>
        </div>

        <form onSubmit={e => e.preventDefault()} className="calc-form">
          {/* Territorio */}
          <div className="form-group">
            <label htmlFor={terrSelectId} className="form-label">
              Territorio Fiscal de Matriculación
              <span className="tooltip-icon" title="Canarias y Ceuta/Melilla tienen regímenes y tipos de matriculación específicos.">ⓘ</span>
            </label>
            <select
              id={terrSelectId}
              className="form-control"
              value={territorio}
              onChange={e => setTerritorio(e.target.value)}
            >
              <option value="peninsula-y-baleares">Península e Islas Baleares (Régimen General)</option>
              <option value="canarias">Canarias (Tipos reducidos REF: 0 %, 3,75 %, 8,75 %, 13,75 %)</option>
              <option value="ceuta-y-melilla">Ceuta y Melilla (Tipo 0 % en todos los epígrafes)</option>
            </select>
          </div>

          {/* Base Imponible */}
          <div className="form-group">
            <label htmlFor={baseInputId} className="form-label">
              Base Imponible (€)
              <span className="tooltip-icon" title="Precio neto del coche sin IVA ni impuestos. Si compras a concesionario, suele ser el PVP sin el 21% de IVA.">ⓘ</span>
            </label>
            <div className="input-addon-group">
              <input
                type="number"
                id={baseInputId}
                className="form-control"
                value={baseImponible}
                min={0}
                step={100}
                onChange={e => setBaseImponible(parseFloat(e.target.value) || 0)}
              />
              <span className="addon">€</span>
            </div>
            <div className="range-container">
              <input
                type="range"
                min={3000}
                max={100000}
                step={500}
                value={Math.min(100000, Math.max(3000, baseImponible))}
                className="range-slider"
                onChange={e => setBaseImponible(parseFloat(e.target.value))}
              />
              <div className="range-marks">
                <span>3.000 €</span>
                <span>50.000 €</span>
                <span>100.000 €</span>
              </div>
            </div>
          </div>

          {/* Emisiones CO2 */}
          <div className="form-group">
            <label htmlFor={co2InputId} className="form-label">
              Emisiones de CO₂ (Ciclo WLTP / NEDC)
              <span className="tooltip-icon" title="Figuran en la ficha técnica (apartado V.7). Determina el tramo impositivo del 0% al 14.75%.">ⓘ</span>
            </label>
            <div className="input-addon-group">
              <input
                type="number"
                id={co2InputId}
                className="form-control"
                value={emisionesCO2}
                min={0}
                max={450}
                step={1}
                onChange={e => setEmisionesCO2(parseFloat(e.target.value) || 0)}
              />
              <span className="addon">g/km</span>
            </div>
            <div className="range-container">
              <input
                type="range"
                min={0}
                max={300}
                step={1}
                value={Math.min(300, Math.max(0, emisionesCO2))}
                className="range-slider"
                onChange={e => setEmisionesCO2(parseFloat(e.target.value))}
              />
              <div className="range-marks">
                <span>0 g (ECO/CERO)</span>
                <span>120 g</span>
                <span>160 g</span>
                <span>200+ g</span>
              </div>
            </div>
          </div>

          {/* Tramo Detectado */}
          <div className="tramo-banner">
            <div className="tramo-badge">{resultado.epigrafe}</div>
            <div className="tramo-info">
              <span className="tramo-rate">{resultado.tipoPorcentaje.toFixed(2).replace('.', ',')} %</span>
              <span className="tramo-desc">{resultado.tramoDescripcion}</span>
            </div>
          </div>

          {/* Tipo de Vehículo */}
          <div className="form-group">
            <label htmlFor={tipoSelectId} className="form-label">Tipo de Vehículo</label>
            <select
              id={tipoSelectId}
              className="form-control"
              value={tipoVehiculo}
              onChange={e => setTipoVehiculo(e.target.value as any)}
            >
              <option value="turismo">Turismo o Todoterreno común</option>
              <option value="motocicleta">Motocicleta (&gt; 125cc o &gt; 11kW)</option>
              <option value="comercial">Vehículo Mixto / Comercial afecto a actividad profesional (Exento)</option>
              <option value="autocaravana">Autocaravana o Vehículo Camper</option>
            </select>
          </div>

          {/* Bonificaciones */}
          <div className="form-group">
            <label className="form-label">Exenciones o Bonificaciones</label>
            <div className="checkbox-group">
              <label className="custom-checkbox">
                <input
                  type="checkbox"
                  checked={esFamiliaNumerosa}
                  onChange={e => setEsFamiliaNumerosa(e.target.checked)}
                />
                <span className="checkmark"></span>
                <span className="chk-label">
                  <strong>Familia Numerosa</strong> (50 % de descuento en la base imponible)
                </span>
              </label>

              <label className="custom-checkbox">
                <input
                  type="checkbox"
                  checked={esMinusvalia}
                  onChange={e => setEsMinusvalia(e.target.checked)}
                />
                <span className="checkmark"></span>
                <span className="chk-label">
                  <strong>Movilidad Reducida / Minusvalía</strong> (100 % Exento)
                </span>
              </label>

              <label className="custom-checkbox">
                <input
                  type="checkbox"
                  checked={incluirIva}
                  onChange={e => setIncluirIva(e.target.checked)}
                />
                <span className="checkmark"></span>
                <span className="chk-label">
                  Calcular también IVA general (21 %)
                </span>
              </label>

              <label className="custom-checkbox">
                <input
                  type="checkbox"
                  checked={incluirTasaDgt}
                  onChange={e => setIncluirTasaDgt(e.target.checked)}
                />
                <span className="checkmark"></span>
                <span className="chk-label">
                  Añadir Tasa DGT de Matriculación (99,77 €)
                </span>
              </label>
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={handleReset}>
              Restablecer
            </button>
          </div>
        </form>
      </div>

      {/* Resultados */}
      <div className="card results-card">
        <div className="card-header">
          <h2 className="card-title">Desglose de Costes de Matriculación</h2>
          <span className="status-pill status-ready">Verificado 2026</span>
        </div>

        <div className="total-highlight">
          <div className="total-label">Total Impuestos y Tasas</div>
          <div className="total-amount">{formatEUR(resultado.totalImpuestosYTasas)}</div>
          <div className="total-subtext">Precio final con vehículo: {formatEUR(resultado.totalConVehiculo)}</div>
        </div>

        <div className="breakdown-list">
          <div className="breakdown-item">
            <div className="item-info">
              <span className="item-title">Impuesto de Matriculación (Mod. 576)</span>
              <span className="item-detail">
                {resultado.exencionAplicada || `Tipo ${resultado.tipoPorcentaje.toFixed(2).replace('.', ',')} % sobre base ${formatEUR(resultado.baseImponibleAplicada)}`}
              </span>
            </div>
            <span className="item-val orange">{formatEUR(resultado.cuotaIEDMT)}</span>
          </div>

          {resultado.cuotaIva > 0 && (
            <div className="breakdown-item">
              <div className="item-info">
                <span className="item-title">IVA (21 %)</span>
                <span className="item-detail">Sobre la base imponible original</span>
              </div>
              <span className="item-val">{formatEUR(resultado.cuotaIva)}</span>
            </div>
          )}

          {resultado.tasaDgtImporte > 0 && (
            <div className="breakdown-item">
              <div className="item-info">
                <span className="item-title">Tasa DGT {resultado.tasaDgtCodigo} Matriculación</span>
                <span className="item-detail">Tasa administrativa DGT</span>
              </div>
              <span className="item-val">{formatEUR(resultado.tasaDgtImporte)}</span>
            </div>
          )}

          <div className="breakdown-item subtle">
            <div className="item-info">
              <span className="item-title">Base Imponible Neto</span>
              <span className="item-detail">
                {resultado.reduccionBasePorcentaje > 0 ? `Reducción aplicada: -${resultado.reduccionBasePorcentaje} %` : 'Valor inicial del vehículo'}
              </span>
            </div>
            <span className="item-val">{formatEUR(resultado.baseImponibleOriginal)}</span>
          </div>
        </div>

        {/* Verificación Obligatoria */}
        <VerificationNotice
          anio={resultado.anio}
          fechaVerificacion={resultado.fechaVerificacion}
          fuente={resultado.fuente}
          norma={resultado.norma}
        />

        <button className="btn btn-outline" type="button" onClick={handlePrint}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 mr-2 inline">
            <polyline points="6 9 6 2 18 2 18 9"></polyline>
            <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
            <rect x="6" y="14" width="12" height="8"></rect>
          </svg>
          Imprimir / Guardar Resumen
        </button>
      </div>
    </div>
  );
}
