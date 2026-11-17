'use client';

import { etiquetaVerificacion } from '@/lib/verification';
import React, { useState, useId } from 'react';
import { calcularITP, getComunidadesList } from '@/lib/itp';
import { VerificationNotice } from './VerificationNotice';

export interface CalculadoraTransferenciaProps {
  initialComunidad?: string;
  initialPrecioContrato?: number;
  initialValorNuevoBoe?: number;
  initialAntiguedad?: number;
}

function formatEUR(val: number): string {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(val);
}

export function CalculadoraTransferencia({
  initialComunidad = 'madrid',
  initialPrecioContrato = 8500,
  initialValorNuevoBoe = 22000,
  initialAntiguedad = 5.5
}: CalculadoraTransferenciaProps) {
  const comunidades = getComunidadesList(2026);

  const [comunidadSlug, setComunidadSlug] = useState<string>(initialComunidad);
  const [precioContrato, setPrecioContrato] = useState<number>(initialPrecioContrato);
  const [valorNuevoBoe, setValorNuevoBoe] = useState<number>(initialValorNuevoBoe);
  const [antiguedadAnios, setAntiguedadAnios] = useState<number>(initialAntiguedad);

  // Casos especiales
  const [esProfesional, setEsProfesional] = useState<boolean>(false);
  const [esCiclomotor, setEsCiclomotor] = useState<boolean>(false);
  const [esHistorico, setEsHistorico] = useState<boolean>(false);
  const [esCeroEmisiones, setEsCeroEmisiones] = useState<boolean>(false);
  const [potenciaFiscalCVF, setPotenciaFiscalCVF] = useState<number>(11);
  const [incluirTasaDgt, setIncluirTasaDgt] = useState<boolean>(true);
  const [incluirGestoria, setIncluirGestoria] = useState<boolean>(false);

  const comSelectId = useId();
  const precioInputId = useId();
  const boeInputId = useId();
  const antigSelectId = useId();

  const resultado = calcularITP({
    anio: 2026,
    comunidadSlug,
    precioContrato,
    valorNuevoBoe,
    antiguedadAnios,
    esCompraventaProfesional: esProfesional,
    esCiclomotor,
    esHistorico,
    esCeroEmisiones,
    potenciaFiscalCVF,
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
    setEsCiclomotor(false);
    setEsHistorico(false);
    setEsCeroEmisiones(false);
    setPotenciaFiscalCVF(11);
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
                <option value="0.5">Hasta 1 año (100 % valor)</option>
                <option value="1.5">Más de 1 año y hasta 2 (84 %)</option>
                <option value="2.5">Más de 2 años y hasta 3 (67 %)</option>
                <option value="3.5">Más de 3 años y hasta 4 (56 %)</option>
                <option value="4.5">Más de 4 años y hasta 5 (47 %)</option>
                <option value="5.5">Más de 5 años y hasta 6 (39 %)</option>
                <option value="6.5">Más de 6 años y hasta 7 (34 %)</option>
                <option value="7.5">Más de 7 años y hasta 8 (28 %)</option>
                <option value="8.5">Más de 8 años y hasta 9 (24 %)</option>
                <option value="9.5">Más de 9 años y hasta 10 (19 %)</option>
                <option value="10.5">Más de 10 años y hasta 11 (17 %)</option>
                <option value="11.5">Más de 11 años y hasta 12 (13 %)</option>
                <option value="13.0">Más de 12 años (10 % valor residual)</option>
              </select>
            </div>
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
                  <strong>Compraventa profesional</strong> (Comprado a concesionario / empresa: Sujeto a IVA o REBU, <strong>Exento de ITP</strong>)
                </span>
              </label>

              <label className="custom-checkbox">
                <input
                  type="checkbox"
                  checked={esCiclomotor}
                  onChange={e => setEsCiclomotor(e.target.checked)}
                />
                <span className="checkmark"></span>
                <span className="chk-label">
                  Es ciclomotor (Tasa reducida DGT: <strong>27,85 €</strong>; exento en Cataluña, Baleares y Navarra)
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

              <label className="custom-checkbox">
                <input
                  type="checkbox"
                  checked={esCeroEmisiones}
                  onChange={e => setEsCeroEmisiones(e.target.checked)}
                />
                <span className="checkmark"></span>
                <span className="chk-label">
                  Etiqueta 0 Emisiones (CERO) (Bonificado en Galicia al 0 % y en Andalucía al 1 %)
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
                  Añadir Tasa DGT de cambio de titularidad ({esCiclomotor ? '27,85 €' : '55,70 €'})
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
                  Estimar honorarios de gestoría telemática (+ 60,00 €)
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
              <span className="item-title">Impuesto de Transmisiones (ITP)</span>
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
