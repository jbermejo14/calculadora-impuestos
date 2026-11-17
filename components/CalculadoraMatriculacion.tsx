'use client';

import { etiquetaVerificacion } from '@/lib/verification';
import React, { useState, useId } from 'react';
import { calcularIEDMT, getIEDMTData, territorioTieneIvaIEDMT, type TipoVehiculoIEDMT } from '@/lib/iedmt';
import { getTasaMatriculacion } from '@/lib/fees';
import { VerificationNotice } from './VerificationNotice';

export interface CalculadoraMatriculacionProps {
  initialTerritorio?: string;
  initialBase?: number;
  initialCO2?: number;
}

const PLAZAS_POR_DEFECTO = 5;
const TIPOS_SIN_FAMILIA_NUMEROSA: TipoVehiculoIEDMT[] = ['motocicleta', 'quad'];

const ANIO_FISCAL = 2026;

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
  const [tipoVehiculo, setTipoVehiculo] = useState<TipoVehiculoIEDMT>('turismo');
  const [plazas, setPlazas] = useState<number>(PLAZAS_POR_DEFECTO);
  const [esMotorNoCombustion, setEsMotorNoCombustion] = useState<boolean>(false);
  const [co2NoAcreditado, setCo2NoAcreditado] = useState<boolean>(false);
  const [esMotoAltaPotencia, setEsMotoAltaPotencia] = useState<boolean>(false);
  const [esN2N3Vivienda, setEsN2N3Vivienda] = useState<boolean>(false);
  const [esFamiliaNumerosa, setEsFamiliaNumerosa] = useState<boolean>(false);
  const [esMinusvalia, setEsMinusvalia] = useState<boolean>(false);
  const [incluirIva, setIncluirIva] = useState<boolean>(true);
  const [incluirTasaDgt, setIncluirTasaDgt] = useState<boolean>(true);

  const baseInputId = useId();
  const co2InputId = useId();
  const terrSelectId = useId();
  const tipoSelectId = useId();
  const plazasInputId = useId();

  const datosIedmt = getIEDMTData(ANIO_FISCAL);
  const territorios = Object.values(datosIedmt.territorios);
  const tieneIva = territorioTieneIvaIEDMT(territorio);
  const ivaPorcentaje = datosIedmt.iva.porcentaje;
  const reduccionFamiliaNumerosa = datosIedmt.bonificaciones.familiaNumerosa.porcentajeReduccionBase;
  const ivaTexto = ivaPorcentaje.toString().replace('.', ',');

  const resultado = calcularIEDMT({
    anio: ANIO_FISCAL,
    baseImponible,
    emisionesCO2,
    territorio,
    tipoVehiculo,
    esFamiliaNumerosa,
    plazas,
    esMinusvalia,
    esMotorNoCombustion,
    co2NoAcreditado,
    esMotoAltaPotencia,
    esN2N3Vivienda,
    incluirIva,
    incluirTasaDgt
  });

  const permiteFamiliaNumerosa = !TIPOS_SIN_FAMILIA_NUMEROSA.includes(tipoVehiculo);

  const handleTipoVehiculo = (nuevoTipo: TipoVehiculoIEDMT) => {
    setTipoVehiculo(nuevoTipo);
    if (TIPOS_SIN_FAMILIA_NUMEROSA.includes(nuevoTipo)) {
      setEsFamiliaNumerosa(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleReset = () => {
    setBaseImponible(25000);
    setEmisionesCO2(135);
    setTerritorio(initialTerritorio);
    setTipoVehiculo('turismo');
    setEsFamiliaNumerosa(false);
    setPlazas(PLAZAS_POR_DEFECTO);
    setEsMotorNoCombustion(false);
    setCo2NoAcreditado(false);
    setEsMotoAltaPotencia(false);
    setEsN2N3Vivienda(false);
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
              {territorios.map(terr => (
                <option key={terr.slug} value={terr.slug}>{terr.nombre}</option>
              ))}
            </select>
          </div>

          {/* Base Imponible */}
          <div className="form-group">
            <label htmlFor={baseInputId} className="form-label">
              Base Imponible (€)
              <span className="tooltip-icon" title="Precio neto del coche sin IVA ni impuestos. Si compras a concesionario, suele ser el PVP sin el IVA.">ⓘ</span>
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
              onChange={e => handleTipoVehiculo(e.target.value as TipoVehiculoIEDMT)}
            >
              <option value="turismo">Turismo / todoterreno</option>
              <option value="motocicleta">Motocicleta</option>
              <option value="autocaravana">Autocaravana / vehículo vivienda</option>
              <option value="quad">Quad</option>
              <option value="comercial">Furgoneta o comercial (N1) afecto a actividad económica</option>
            </select>
          </div>

          {/* Condiciones que cambian el epígrafe */}
          <div className="form-group">
            <label className="form-label">Condiciones del vehículo</label>
            <div className="checkbox-group">
              {tipoVehiculo !== 'quad' && tipoVehiculo !== 'comercial' && (
                <label className="custom-checkbox">
                  <input
                    type="checkbox"
                    checked={esMotorNoCombustion}
                    onChange={e => setEsMotorNoCombustion(e.target.checked)}
                  />
                  <span className="checkmark"></span>
                  <span className="chk-label">Un solo motor, no de combustión (eléctrico puro)</span>
                </label>
              )}

              {tipoVehiculo !== 'quad' && tipoVehiculo !== 'comercial' && (
                <label className="custom-checkbox">
                  <input
                    type="checkbox"
                    checked={co2NoAcreditado}
                    onChange={e => setCo2NoAcreditado(e.target.checked)}
                  />
                  <span className="checkmark"></span>
                  <span className="chk-label">CO₂ no acreditado</span>
                </label>
              )}

              {tipoVehiculo === 'motocicleta' && (
                <label className="custom-checkbox">
                  <input
                    type="checkbox"
                    checked={esMotoAltaPotencia}
                    onChange={e => setEsMotoAltaPotencia(e.target.checked)}
                  />
                  <span className="checkmark"></span>
                  <span className="chk-label">Potencia ≥ 74 kW y relación potencia/masa ≥ 0,66 kW/kg</span>
                </label>
              )}

              {tipoVehiculo === 'autocaravana' && (
                <label className="custom-checkbox">
                  <input
                    type="checkbox"
                    checked={esN2N3Vivienda}
                    onChange={e => setEsN2N3Vivienda(e.target.checked)}
                  />
                  <span className="checkmark"></span>
                  <span className="chk-label">Categoría N2/N3 (camión vivienda)</span>
                </label>
              )}
            </div>
          </div>

          {/* Bonificaciones */}
          <div className="form-group">
            <label className="form-label">Exenciones o Bonificaciones</label>
            <div className="checkbox-group">
              <label className="custom-checkbox">
                <input
                  type="checkbox"
                  checked={esFamiliaNumerosa}
                  disabled={!permiteFamiliaNumerosa}
                  onChange={e => setEsFamiliaNumerosa(e.target.checked)}
                />
                <span className="checkmark"></span>
                <span className="chk-label">
                  <strong>Familia Numerosa</strong> ({reduccionFamiliaNumerosa} % de descuento en la base imponible)
                </span>
              </label>

              {esFamiliaNumerosa && (
                <div className="form-group">
                  <label htmlFor={plazasInputId} className="form-label">Plazas homologadas (incluido conductor)</label>
                  <input
                    type="number"
                    id={plazasInputId}
                    className="form-control"
                    value={plazas}
                    min={1}
                    step={1}
                    onChange={e => setPlazas(parseInt(e.target.value, 10) || 0)}
                  />
                </div>
              )}

              <label className="custom-checkbox">
                <input
                  type="checkbox"
                  checked={esMinusvalia}
                  onChange={e => setEsMinusvalia(e.target.checked)}
                />
                <span className="checkmark"></span>
                <span className="chk-label">
                  <strong>Movilidad Reducida / Minusvalía</strong> (exención)
                </span>
              </label>

              <label className="custom-checkbox">
                <input
                  type="checkbox"
                  checked={tieneIva && incluirIva}
                  disabled={!tieneIva}
                  onChange={e => setIncluirIva(e.target.checked)}
                />
                <span className="checkmark"></span>
                <span className="chk-label">
                  {tieneIva ? `Calcular también IVA general (${ivaTexto} %)` : 'IVA no aplicable en este territorio (impuesto propio no incluido)'}
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
                  Añadir Tasa DGT de Matriculación ({formatEUR(getTasaMatriculacion(ANIO_FISCAL).importe)})
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
          <span className="status-pill status-ready">{etiquetaVerificacion(resultado.estadoVerificacion, resultado.anio)}</span>
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
                <span className="item-title">IVA ({ivaTexto} %)</span>
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

        {resultado.avisos.length > 0 && (
          <ul className="guide-list">
            {resultado.avisos.map(aviso => (
              <li key={aviso}>{aviso}</li>
            ))}
          </ul>
        )}

        <p className="card-desc">{resultado.notaTipos}</p>

        {/* Verificación Obligatoria */}
        <VerificationNotice
          anio={resultado.anio}
          estadoVerificacion={resultado.estadoVerificacion}
          fechaVerificacion={resultado.fechaVerificacion}
          fuente={resultado.fuente}
          norma={resultado.norma}
        />

        <button className="btn btn-outline" type="button" onClick={handlePrint}>
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
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
