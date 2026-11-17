'use client';

import { etiquetaVerificacion } from '@/lib/verification';
import React, { useState, useId } from 'react';
import {
  calcularITP,
  etiquetaCuotaCeroITP,
  getCoeficienteDepreciacion,
  getComunidadesList,
  getComunidadITP,
  HONORARIOS_GESTORIA_ITP
} from '@/lib/itp';
import { getTasaTransferencia } from '@/lib/fees';
import type { DistintivoITP, TipoVehiculoITP } from '@/lib/itp';
import { VerificationNotice } from './VerificationNotice';

export interface CalculadoraTransferenciaProps {
  initialComunidad?: string;
  initialPrecioContrato?: number;
  initialValorNuevoBoe?: number;
  initialAntiguedad?: number;
}

const CILINDRADA_POR_DEFECTO = 1400;
const POTENCIA_FISCAL_POR_DEFECTO = 11;
const SLUGS_CIUDADES_AUTONOMAS = ['ceuta', 'melilla'];
const SLUG_EXTREMADURA = 'extremadura';

const ANIO_FISCAL = 2026;

/** Antigüedades representativas de cada tramo; el porcentaje de depreciación sale de los datos. */
const OPCIONES_ANTIGUEDAD = [
  { valor: 0.5, texto: 'Hasta 1 año' },
  { valor: 1.5, texto: 'Más de 1 año y hasta 2' },
  { valor: 2.5, texto: 'Más de 2 años y hasta 3' },
  { valor: 3.5, texto: 'Más de 3 años y hasta 4' },
  { valor: 4.5, texto: 'Más de 4 años y hasta 5' },
  { valor: 5.5, texto: 'Más de 5 años y hasta 6' },
  { valor: 6.5, texto: 'Más de 6 años y hasta 7' },
  { valor: 7.5, texto: 'Más de 7 años y hasta 8' },
  { valor: 8.5, texto: 'Más de 8 años y hasta 9' },
  { valor: 9.5, texto: 'Más de 9 años y menos de 10' },
  { valor: 10, texto: 'Exactamente 10 años' },
  { valor: 10.5, texto: 'Más de 10 años y hasta 11' },
  { valor: 11.5, texto: 'Más de 11 años y hasta 12' },
  { valor: 13, texto: 'Más de 12 años y menos de 15' },
  { valor: 15, texto: '15 años o más' }
];

function formatEUR(val: number): string {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(val);
}

/** Texto de la bonificación de residencia de la comunidad, tomado de los datos; vacío si no la tiene. */
function textoBonificacion(comunidadSlug: string): string {
  const com = getComunidadITP(ANIO_FISCAL, comunidadSlug);
  if (com.bonificacionResidencia === undefined) return '';
  return `bonificación del ${com.bonificacionResidencia} %; si no, tributa al ${com.tipoGeneral} %`;
}

export function CalculadoraTransferencia({
  initialComunidad = 'madrid',
  initialPrecioContrato = 8500,
  initialValorNuevoBoe = 22000,
  initialAntiguedad = 5.5
}: CalculadoraTransferenciaProps) {
  const comunidades = getComunidadesList(ANIO_FISCAL);

  const [comunidadSlug, setComunidadSlug] = useState<string>(initialComunidad);
  const [precioContrato, setPrecioContrato] = useState<number>(initialPrecioContrato);
  const [valorNuevoBoe, setValorNuevoBoe] = useState<number>(initialValorNuevoBoe);
  const [antiguedadAnios, setAntiguedadAnios] = useState<number>(initialAntiguedad);

  // Casos especiales
  const [esProfesional, setEsProfesional] = useState<boolean>(false);
  const [tipoVehiculo, setTipoVehiculo] = useState<TipoVehiculoITP>('turismo');
  const [esHistorico, setEsHistorico] = useState<boolean>(false);
  const [distintivo, setDistintivo] = useState<DistintivoITP>('ninguno');
  const [potenciaFiscalCVF, setPotenciaFiscalCVF] = useState<number>(POTENCIA_FISCAL_POR_DEFECTO);
  const [cilindradaCC, setCilindradaCC] = useState<number>(CILINDRADA_POR_DEFECTO);
  const [esResidenteCiudadAutonoma, setEsResidenteCiudadAutonoma] = useState<boolean>(true);
  const [esComercialConActividad, setEsComercialConActividad] = useState<boolean>(false);
  const [incluirTasaDgt, setIncluirTasaDgt] = useState<boolean>(true);
  const [incluirGestoria, setIncluirGestoria] = useState<boolean>(false);

  const comSelectId = useId();
  const precioInputId = useId();
  const boeInputId = useId();
  const antigSelectId = useId();
  const tipoVehiculoSelectId = useId();
  const distintivoSelectId = useId();
  const cilindradaInputId = useId();

  const esCiudadAutonoma = SLUGS_CIUDADES_AUTONOMAS.includes(comunidadSlug);
  const esCiclomotor = tipoVehiculo === 'ciclomotor';
  const textoBonificacionResidencia = textoBonificacion(comunidadSlug);

  const resultado = calcularITP({
    anio: ANIO_FISCAL,
    comunidadSlug,
    precioContrato,
    valorNuevoBoe,
    antiguedadAnios,
    esCompraventaProfesional: esProfesional,
    tipoVehiculo,
    esHistorico,
    distintivo,
    potenciaFiscalCVF,
    cilindradaCC,
    esResidenteCiudadAutonoma,
    esComercialConActividad,
    incluirTasaDgt,
    incluirGestoria
  });

  const handlePrint = () => {
    window.print();
  };

  const handleReset = () => {
    setComunidadSlug(initialComunidad);
    setPrecioContrato(8500);
    setValorNuevoBoe(22000);
    setAntiguedadAnios(5.5);
    setEsProfesional(false);
    setTipoVehiculo('turismo');
    setEsHistorico(false);
    setDistintivo('ninguno');
    setPotenciaFiscalCVF(POTENCIA_FISCAL_POR_DEFECTO);
    setCilindradaCC(CILINDRADA_POR_DEFECTO);
    setEsResidenteCiudadAutonoma(true);
    setEsComercialConActividad(false);
    setIncluirTasaDgt(true);
    setIncluirGestoria(false);
  };

  return (
    <div className="calculator-grid">
      {/* Formulario */}
      <div className="card form-card">
        <div className="card-header">
          <div>
            <h2 className="card-title">Datos para Transferencia / ITP (Segunda Mano)</h2>
            <p className="card-desc">Impuesto sobre Transmisiones Patrimoniales Onerosas ({resultado.comunidad.modelo})</p>
          </div>
        </div>

        <form onSubmit={e => e.preventDefault()} className="calc-form">
          {/* Comunidad Autónoma */}
          <div className="form-group">
            <label htmlFor={comSelectId} className="form-label">
              Comunidad Autónoma del Comprador
              <span className="tooltip-icon" title="El ITP se liquida obligatoriamente en la comunidad autónoma de residencia fiscal del comprador.">ⓘ</span>
            </label>
            <select
              id={comSelectId}
              className="form-control"
              value={comunidadSlug}
              onChange={e => setComunidadSlug(e.target.value)}
            >
              {comunidades.map(com => (
                <option key={com.slug} value={com.slug}>
                  {com.nombre} ({com.tipoGeneral.toFixed(1).replace('.', ',')} %)
                </option>
              ))}
            </select>
          </div>

          {/* Precio de compraventa en contrato */}
          <div className="form-group">
            <label htmlFor={precioInputId} className="form-label">
              Precio de Compraventa en Contrato (€)
              <span className="tooltip-icon" title="Precio pactado en el contrato de compraventa. La Agencia Tributaria exige tributar por el mayor entre este valor y el valor mínimo fiscal (tablas BOE).">ⓘ</span>
            </label>
            <div className="input-addon-group">
              <input
                type="number"
                id={precioInputId}
                className="form-control"
                value={precioContrato}
                min={0}
                step={100}
                onChange={e => setPrecioContrato(parseFloat(e.target.value) || 0)}
              />
              <span className="addon">€</span>
            </div>
          </div>

          {/* Valor BOE nuevo y Antigüedad */}
          <div className="form-row-2">
            <div className="form-group">
              <label htmlFor={boeInputId} className="form-label">
                Valor Tablas BOE (Nuevo)
                <span className="tooltip-icon" title="Precio que Hacienda asigna al modelo nuevo según la Orden Ministerial anual publicada en el BOE.">ⓘ</span>
              </label>
              <div className="input-addon-group">
                <input
                  type="number"
                  id={boeInputId}
                  className="form-control"
                  value={valorNuevoBoe}
                  min={0}
                  step={500}
                  onChange={e => setValorNuevoBoe(parseFloat(e.target.value) || 0)}
                />
                <span className="addon">€</span>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor={antigSelectId} className="form-label">
                Antigüedad del Vehículo
                <span className="tooltip-icon" title="Años transcurridos desde su primera matriculación (ficha técnica / permiso de circulación).">ⓘ</span>
              </label>
              <select
                id={antigSelectId}
                className="form-control"
                value={antiguedadAnios.toString()}
                onChange={e => setAntiguedadAnios(parseFloat(e.target.value))}
              >
                {OPCIONES_ANTIGUEDAD.map(opcion => (
                  <option key={opcion.valor} value={opcion.valor}>
                    {opcion.texto} ({getCoeficienteDepreciacion(ANIO_FISCAL, opcion.valor).porcentaje} %)
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Tipo de vehículo y cilindrada */}
          <div className="form-row-2">
            <div className="form-group">
              <label htmlFor={tipoVehiculoSelectId} className="form-label">
                Tipo de vehículo
                <span className="tooltip-icon" title="Las cuotas fijas por antigüedad y las exenciones dependen del tipo de vehículo.">ⓘ</span>
              </label>
              <select
                id={tipoVehiculoSelectId}
                className="form-control"
                value={tipoVehiculo}
                onChange={e => setTipoVehiculo(e.target.value as TipoVehiculoITP)}
              >
                <option value="turismo">Turismo / todoterreno</option>
                <option value="motocicleta">Motocicleta</option>
                <option value="ciclomotor">Ciclomotor (tasa DGT reducida)</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor={cilindradaInputId} className="form-label">
                Cilindrada (cc)
                <span className="tooltip-icon" title="Cilindrada de la ficha técnica. Determina las cuotas fijas por antigüedad y el tipo incrementado en algunas comunidades.">ⓘ</span>
              </label>
              <input
                type="number"
                id={cilindradaInputId}
                className="form-control"
                value={cilindradaCC}
                min={0}
                step={100}
                onChange={e => setCilindradaCC(parseFloat(e.target.value) || 0)}
              />
            </div>
          </div>

          {/* Distintivo ambiental */}
          <div className="form-group">
            <label htmlFor={distintivoSelectId} className="form-label">
              Distintivo ambiental
              <span className="tooltip-icon" title="Bonificado en Andalucía (CERO 1 %), Galicia, Baleares y Cataluña (CERO 0 %), Baleares (ECO 2 %) y Comunitat Valenciana (6 %).">ⓘ</span>
            </label>
            <select
              id={distintivoSelectId}
              className="form-control"
              value={distintivo}
              onChange={e => setDistintivo(e.target.value as DistintivoITP)}
            >
              <option value="ninguno">Ninguno / B / C</option>
              <option value="eco">ECO</option>
              <option value="cero">CERO</option>
            </select>
          </div>

          {/* Casos especiales */}
          <div className="form-group">
            <label className="form-label">Casos Especiales y Bonificaciones</label>
            <div className="checkbox-group">
              <label className="custom-checkbox">
                <input
                  type="checkbox"
                  checked={esProfesional}
                  onChange={e => setEsProfesional(e.target.checked)}
                />
                <span className="checkmark"></span>
                <span className="chk-label">
                  <strong>Compraventa profesional</strong> (Comprado a concesionario / empresa: Sujeto a IVA o REBU, <strong>No sujeto a ITP</strong>)
                </span>
              </label>

              <label className="custom-checkbox">
                <input
                  type="checkbox"
                  checked={esHistorico}
                  onChange={e => setEsHistorico(e.target.checked)}
                />
                <span className="checkmark"></span>
                <span className="chk-label">
                  Es vehículo histórico matriculado como tal (no aplican exenciones por antigüedad)
                </span>
              </label>

              {esCiudadAutonoma && (
                <label className="custom-checkbox">
                  <input
                    type="checkbox"
                    checked={esResidenteCiudadAutonoma}
                    onChange={e => setEsResidenteCiudadAutonoma(e.target.checked)}
                  />
                  <span className="checkmark"></span>
                  <span className="chk-label">
                    Comprador con residencia o domicilio fiscal en Ceuta/Melilla ({textoBonificacionResidencia})
                  </span>
                </label>
              )}

              {comunidadSlug === SLUG_EXTREMADURA && (
                <label className="custom-checkbox">
                  <input
                    type="checkbox"
                    checked={esComercialConActividad}
                    onChange={e => setEsComercialConActividad(e.target.checked)}
                  />
                  <span className="checkmark"></span>
                  <span className="chk-label">
                    Vehículo comercial o industrial ligero (hasta 3.500 kg) adquirido por un contribuyente con actividad económica y afecto a ella (4 %)
                  </span>
                </label>
              )}

              <label className="custom-checkbox">
                <input
                  type="checkbox"
                  checked={incluirTasaDgt}
                  onChange={e => setIncluirTasaDgt(e.target.checked)}
                />
                <span className="checkmark"></span>
                <span className="chk-label">
                  Añadir Tasa DGT de cambio de titularidad ({formatEUR(getTasaTransferencia(ANIO_FISCAL, esCiclomotor).importe)})
                </span>
              </label>

              <label className="custom-checkbox">
                <input
                  type="checkbox"
                  checked={incluirGestoria}
                  onChange={e => setIncluirGestoria(e.target.checked)}
                />
                <span className="checkmark"></span>
                <span className="chk-label">
                  Estimar honorarios de gestoría telemática (+ {formatEUR(HONORARIOS_GESTORIA_ITP)})
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
          <h2 className="card-title">Coste Total de la Transferencia</h2>
          <span className="status-pill status-ready">{etiquetaVerificacion(resultado.estadoVerificacion, resultado.anio)}</span>
        </div>

        <div className="total-highlight">
          <div className="total-label">Total Gastos de Transferencia</div>
          <div className="total-amount">{formatEUR(resultado.totalGastosTransferencia)}</div>
          <div className="total-subtext">Compra ({formatEUR(resultado.precioContrato)}) + Gastos = {formatEUR(resultado.totalConCompra)}</div>
        </div>

        <div className="breakdown-list">
          <div className="breakdown-item">
            <div className="item-info">
              <span className="item-title">
                  Impuesto de Transmisiones (ITP)
                  {resultado.clasificacionCuotaCero && ` · ${etiquetaCuotaCeroITP(resultado.clasificacionCuotaCero)}`}
                </span>
              <span className="item-detail">
                {resultado.motivoExencionOCuotaCero || `Tipo ${resultado.tipoPorcentajeAplicado.toFixed(2).replace('.', ',')} % sobre base ${formatEUR(resultado.baseLiquidable)}`}
              </span>
            </div>
            <span className="item-val orange">{formatEUR(resultado.cuotaITP)}</span>
          </div>

          {resultado.tasaDgtImporte > 0 && (
            <div className="breakdown-item">
              <div className="item-info">
                <span className="item-title">Tasa DGT {resultado.tasaDgtCodigo} {resultado.tasaDgtConcepto}</span>
                <span className="item-detail">Tasa administrativa DGT</span>
              </div>
              <span className="item-val">{formatEUR(resultado.tasaDgtImporte)}</span>
            </div>
          )}

          {resultado.cuotaGestoria > 0 && (
            <div className="breakdown-item">
              <div className="item-info">
                <span className="item-title">Honorarios de gestoría telemática</span>
                <span className="item-detail">Trámite online opcional</span>
              </div>
              <span className="item-val">{formatEUR(resultado.cuotaGestoria)}</span>
            </div>
          )}

          {/* Comparativa BOE vs Contrato */}
          {!resultado.esExentoOcuotaCero && (
            <div className="comparison-panel">
              <div className="comparison-col">
                <span className="comp-title">Valor Mínimo Hacienda (BOE)</span>
                <span className="comp-val">{formatEUR(resultado.valorFiscalDepreciado)}</span>
                <span className="comp-desc">
                  {formatEUR(resultado.valorNuevoBoe)} × {resultado.porcentajeDepreciacion} %
                </span>
              </div>
              <div className="comparison-divider">vs</div>
              <div className="comparison-col">
                <span className="comp-title">Precio en Contrato</span>
                <span className="comp-val">{formatEUR(resultado.precioContrato)}</span>
                <span className="comp-desc">Pactado compraventa</span>
              </div>
            </div>
          )}

          <div className="base-determinada-box">
            Base liquidable aplicada: <strong>{formatEUR(resultado.baseLiquidable)}</strong>
            <small>{resultado.justificacionBase}</small>
          </div>
        </div>

        {resultado.avisos.map(aviso => (
          <p key={aviso} className="card-desc">{aviso}</p>
        ))}

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
