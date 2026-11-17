import { avisoLegalVerificacion, type EstadoVerificacion } from '@/lib/verification';
import itp2026 from '../data/2026/itp.json';
import depreciacion2026 from '../data/2026/depreciacion.json';
import { getTasaTransferencia } from './fees';

export interface TramoDepreciacion {
  minAnios: number;
  maxAnios: number;
  etiqueta: string;
  coeficiente: number;
  porcentaje: number;
  norma: string;
  fuente: string;
  estadoVerificacion: EstadoVerificacion;
  fechaVerificacion: string | null;
}

export interface DepreciacionData {
  anio: number;
  norma: string;
  fuente: string;
  estadoVerificacion: EstadoVerificacion;
  fechaVerificacion: string | null;
  tramos: TramoDepreciacion[];
}

/** Tipo de vehículo que filtra las reglas de cuota fija. */
export type TipoVehiculoITP = 'turismo' | 'motocicleta' | 'ciclomotor';

/** Distintivo ambiental declarado por el comprador. */
export type DistintivoITP = 'ninguno' | 'eco' | 'cero';

/**
 * Valor con el que se compara el límite de una regla de cuota fija:
 * precio medio sin depreciar, valor fiscal depreciado o base liquidable
 * (el mayor entre el precio de contrato y el valor fiscal).
 */
export type ValorReferenciaITP = 'precioMedioNuevo' | 'valorFiscal' | 'baseLiquidable';

/**
 * Regla de cuota fija por antigüedad y cilindrada. Hereda el estado de
 * verificación de la comunidad que la contiene.
 */
export interface ReglaCuotaFija {
  tipoVehiculo: 'turismo' | 'motocicleta' | 'todos';
  /** Años de antigüedad mínima. */
  antiguedadMinima: number;
  /** true = "igual o más de"; false = "más de". */
  incluyeAntiguedadMinima: boolean;
  /** Años máximos, inclusive; null = sin tope. */
  antiguedadMaxima: number | null;
  /** Cilindrada mínima exclusiva (cc > mínimo); null = sin mínimo. */
  cilindradaMinima: number | null;
  /** Cilindrada máxima inclusiva (cc <= máximo); null = sin tope. */
  cilindradaMaxima: number | null;
  /** Cuota en euros. */
  cuota: number;
  /** El valor de referencia debe ser estrictamente menor; null = sin límite. */
  valorMaximo: number | null;
  valorReferencia: ValorReferenciaITP | null;
  excluyeHistoricos: boolean;
}

/**
 * Naturaleza de una cuota de ITP igual a cero:
 * - exencion: exención legal real.
 * - tipoCero: tipo de gravamen del 0 %.
 * - cuotaFijaCero: cuota fija de 0 €.
 * - noObligacion: sin obligación de autoliquidar, pero sin ser una exención.
 * - noSujeto: operación no sujeta (por ejemplo, compraventa profesional).
 */
export type ClasificacionCuotaCeroITP = 'exencion' | 'tipoCero' | 'cuotaFijaCero' | 'noObligacion' | 'noSujeto';

export interface ExencionDiezAniosITP {
  minAnios: number;
  /** true = "diez o más años"; false = "más de diez años". */
  incluyeAntiguedadMinima: boolean;
  /** Límite estricto: se exonera si el valor de referencia es menor. */
  maxValor: number;
  /** Cataluña compara el precio medio sin depreciar; Navarra, el valor según tablas de precios medios. */
  valorReferencia: 'precioMedioNuevo' | 'valorFiscal';
  excluyeHistoricos: boolean;
  /** Cataluña es 'noObligacion'; Navarra, 'exencion'. */
  clasificacion: Extract<ClasificacionCuotaCeroITP, 'exencion' | 'noObligacion'>;
  descripcion: string;
  /** Texto que se muestra al usuario cuando se aplica. */
  motivo: string;
}

export interface ComunidadITPData {
  slug: string;
  nombre: string;
  tipoGeneral: number;
  tipoIncrementado?: number | null;
  potenciaFiscalIncrementada?: number;
  cilindradaIncrementada?: number;
  /** Años máximos (inclusive) para que el incremento por cilindrada aplique. */
  antiguedadMaximaIncrementoCilindrada?: number;
  /** El tipo incrementado aplica si el valor de referencia es igual o superior. */
  valorMinimoIncrementado?: number;
  valorReferenciaIncrementado?: ValorReferenciaITP;
  tipoCeroEmisiones?: number;
  /** El tipo CERO solo aplica con cilindrada estrictamente menor (híbridos de menos de N cc). */
  cilindradaMaximaCero?: number;
  /** Si es true, la cuota fija prevalece sobre el tipo propio del distintivo (CERO/ECO). */
  cuotasFijasPrevalecenSobreDistintivo?: boolean;
  tipoEco?: number;
  /** El tipo ECO solo aplica con cilindrada estrictamente menor. */
  cilindradaMaximaEco?: number;
  tipoReducidoComercial?: number;
  /** Ceuta y Melilla: porcentaje de bonificación de la cuota para residentes. */
  bonificacionResidencia?: number;
  exencionCiclomotores: boolean;
  exencionCiclomotoresDescripcion?: string;
  /** Naturaleza del resultado 0 de los ciclomotores; por defecto 'exencion'. */
  clasificacionCiclomotores?: ClasificacionCuotaCeroITP;
  exencionDiezAnios?: ExencionDiezAniosITP;
  cuotasFijasAntiguedad?: {
    minAnios: number;
    aplica: boolean;
    descripcion: string;
    reglas: ReglaCuotaFija[];
  };
  /** Limitaciones del cálculo que se muestran en el resultado. */
  avisos?: string[];
  modelo: string;
  organismo: string;
  norma: string;
  fuente: string;
  estadoVerificacion: EstadoVerificacion;
  fechaVerificacion: string | null;
  notas: string;
}

export interface ITPData {
  anio: number;
  norma: string;
  fuente: string;
  estadoVerificacion: EstadoVerificacion;
  fechaVerificacion: string | null;
  comunidades: Record<string, ComunidadITPData>;
}

export interface CalculoITPParams {
  anio?: number;
  comunidadSlug: string;
  precioContrato: number;
  valorNuevoBoe: number;
  antiguedadAnios: number;
  esHistorico?: boolean;
  /** Compatibilidad: equivale a `tipoVehiculo: 'ciclomotor'`. */
  esCiclomotor?: boolean;
  tipoVehiculo?: TipoVehiculoITP;
  esCompraventaProfesional?: boolean;
  potenciaFiscalCVF?: number;
  /** Por defecto 1.400 cc. Con 0 no se aplican cuotas fijas. */
  cilindradaCC?: number;
  /** Compatibilidad: equivale a `distintivo: 'cero'`. */
  esCeroEmisiones?: boolean;
  distintivo?: DistintivoITP;
  /** Ceuta y Melilla: comprador residente o con domicilio fiscal allí. Por defecto true. */
  esResidenteCiudadAutonoma?: boolean;
  /** Extremadura: vehículo comercial o industrial ligero afecto a una actividad económica. */
  esComercialConActividad?: boolean;
  incluirTasaDgt?: boolean;
  incluirGestoria?: boolean;
}

export interface CalculoITPResultado {
  anio: number;
  comunidad: {
    slug: string;
    nombre: string;
    modelo: string;
    organismo: string;
    norma: string;
    fuente: string;
    estadoVerificacion: EstadoVerificacion;
    fechaVerificacion: string | null;
  };
  precioContrato: number;
  valorNuevoBoe: number;
  antiguedadAnios: number;
  coeficienteDepreciacion: number;
  porcentajeDepreciacion: number;
  valorFiscalDepreciado: number;
  baseLiquidable: number;
  criterioBase: 'contrato' | 'valor_fiscal' | 'exento_profesional';
  justificacionBase: string;
  tipoPorcentajeAplicado: number;
  cuotaITP: number;
  esExentoOcuotaCero: boolean;
  motivoExencionOCuotaCero: string | null;
  /** Naturaleza de la cuota cero; null si la cuota no es cero. Solo 'exencion' debe mostrarse como "Exento". */
  clasificacionCuotaCero: ClasificacionCuotaCeroITP | null;
  tasaDgtImporte: number;
  tasaDgtCodigo: string;
  tasaDgtConcepto: string;
  tasaDgtNorma: string;
  tasaDgtFuente: string;
  cuotaGestoria: number;
  totalGastosTransferencia: number;
  totalConCompra: number;
  norma: string;
  fuente: string;
  estadoVerificacion: EstadoVerificacion;
  fechaVerificacion: string | null;
  avisoLegal: string;
  /** Limitaciones del cálculo que el usuario debe conocer. */
  avisos: string[];
}

const REGISTRO_DEPRECIACION_POR_ANIO: Record<number, DepreciacionData> = {
  2026: depreciacion2026 as unknown as DepreciacionData
};

const REGISTRO_ITP_POR_ANIO: Record<number, ITPData> = {
  2026: itp2026 as unknown as ITPData
};

/**
 * Tipo efectivo para un residente: tipo general menos la bonificación de residencia.
 * Sin bonificación coincide con el tipo general.
 */
export function getTipoEfectivoITP(com: ComunidadITPData): number {
  return com.tipoGeneral * (1 - (com.bonificacionResidencia ?? 0) / ITP_PORCENTAJE_TOTAL);
}

const ITP_ETIQUETAS_CUOTA_CERO: Record<ClasificacionCuotaCeroITP, string> = {
  exencion: 'Exento',
  tipoCero: 'Tipo 0 %',
  cuotaFijaCero: 'Cuota 0 €',
  noObligacion: 'Sin obligación de autoliquidar',
  noSujeto: 'No sujeto'
};

/** Etiqueta corta para mostrar una cuota cero: "Exento" solo para exenciones legales reales. */
export function etiquetaCuotaCeroITP(clasificacion: ClasificacionCuotaCeroITP): string {
  return ITP_ETIQUETAS_CUOTA_CERO[clasificacion];
}

/**
 * Carga los datos de depreciación BOE para el año fiscal especificado
 */
export function getDepreciacionData(anio: number = 2026): DepreciacionData {
  const data = REGISTRO_DEPRECIACION_POR_ANIO[anio];
  if (!data) {
    throw new Error(`No existen datos fiscales de depreciación para el año fiscal ${anio}`);
  }
  return data;
}

/**
 * Carga los datos de ITP de las comunidades autónomas para el año fiscal especificado
 */
export function getITPData(anio: number = 2026): ITPData {
  const data = REGISTRO_ITP_POR_ANIO[anio];
  if (!data) {
    throw new Error(`No existen datos fiscales de ITP para el año fiscal ${anio}`);
  }
  return data;
}

/**
 * Obtiene la información fiscal de una comunidad autónoma
 */
export function getComunidadITP(anio: number = 2026, slug: string): ComunidadITPData {
  const data = getITPData(anio);
  const com = data.comunidades[slug];
  if (!com) {
    throw new Error(`Comunidad autónoma no encontrada para el slug: "${slug}".`);
  }
  return com;
}

/**
 * Lista todas las comunidades autónomas disponibles
 */
export function getComunidadesList(anio: number = 2026): ComunidadITPData[] {
  const data = getITPData(anio);
  return Object.values(data.comunidades);
}

/**
 * Obtiene el coeficiente de depreciación según los años de antigüedad
 * Cumple estrictamente con las fronteras del Anexo IV de la Orden Ministerial anual
 */
export function getCoeficienteDepreciacion(anio: number = 2026, antiguedadAnios: number): TramoDepreciacion {
  const data = getDepreciacionData(anio);
  const anios = Math.max(0, antiguedadAnios);

  if (anios <= 1.0) {
    return data.tramos[0];
  }

  for (let i = 1; i < data.tramos.length; i++) {
    const tramo = data.tramos[i];
    if (i === data.tramos.length - 1) {
      if (anios > 12.0) {
        return tramo;
      }
    } else {
      if (anios > (tramo.minAnios - 0.001) && anios <= tramo.maxAnios) {
        return tramo;
      }
    }
  }

  return data.tramos[data.tramos.length - 1];
}

/**
 * Calcula el valor fiscal mínimo según tablas de Hacienda (BOE)
 */
export function calcularValorFiscal(params: { anio?: number; valorNuevoBoe: number; antiguedadAnios: number }): {
  valorNuevoBoe: number;
  antiguedadAnios: number;
  coeficiente: number;
  porcentaje: number;
  valorFiscal: number;
  tramo: TramoDepreciacion;
} {
  const anio = params.anio ?? 2026;
  const valorNuevo = Math.max(0, params.valorNuevoBoe);
  const antiguedad = Math.max(0, params.antiguedadAnios);
  const tramo = getCoeficienteDepreciacion(anio, antiguedad);
  const valorFiscal = Number((valorNuevo * tramo.coeficiente).toFixed(2));

  return {
    valorNuevoBoe: valorNuevo,
    antiguedadAnios: antiguedad,
    coeficiente: tramo.coeficiente,
    porcentaje: tramo.porcentaje,
    valorFiscal,
    tramo
  };
}


const ITP_CILINDRADA_POR_DEFECTO = 1400;
/** Honorarios estimados de la gestoría telemática, en euros. */
export const HONORARIOS_GESTORIA_ITP = 60;
const ITP_DECIMALES = 2;
const ITP_CODIGO_TASA_POR_DEFECTO = '1.5';
const ITP_CONCEPTO_TASA_POR_DEFECTO = 'Cambio de titularidad';
const ITP_PORCENTAJE_TOTAL = 100;
const ITP_LIQUIDADOR = 'la administración tributaria autonómica correspondiente';
const ITP_AVISO_CUOTA_FIJA_SIN_CILINDRADA =
  'La cuota fija depende de la cilindrada y un vehículo eléctrico no la tiene: no se ha podido aplicar. Confirma el importe con la administración tributaria autonómica.';
const ITP_JUSTIFICACION_CONTRATO =
  'Hacienda liquida sobre el precio de contrato por ser igual o superior al valor mínimo fiscal de las tablas del BOE.';
const ITP_JUSTIFICACION_VALOR_FISCAL =
  'Hacienda exige liquidar al menos por el valor fiscal depreciado del BOE para evitar comprobación de valores y liquidación complementaria con recargo.';
const ITP_MOTIVO_PROFESIONAL =
  'Operación profesional sujeta a IVA / REBU. No sujeta a ITP (art. 7.5 TR LITP).';
const ITP_JUSTIFICACION_PROFESIONAL =
  'Operación realizada por empresario o profesional en ejercicio de su actividad económica. No sujeta a ITP (art. 7.5 TR LITP; tributa en IVA / REBU).';

/** Datos de entrada ya normalizados que comparten las reglas de liquidación. */
interface ItpContexto {
  com: ComunidadITPData;
  tipoVehiculo: TipoVehiculoITP;
  distintivo: DistintivoITP;
  antiguedad: number;
  esHistorico: boolean;
  cilindrada: number;
  potenciaFiscal: number;
  valorNuevo: number;
  valorFiscal: number;
  baseLiquidable: number;
  esResidenteCiudadAutonoma: boolean;
  esComercialConActividad: boolean;
}

interface ItpLiquidacion {
  tipo: number;
  cuota: number;
  esCuotaCero: boolean;
  motivo: string | null;
  clasificacion: ClasificacionCuotaCeroITP | null;
}

interface ItpTasaDgt {
  importe: number;
  codigo: string;
  concepto: string;
  norma: string;
  fuente: string;
}

function itpRedondear(valor: number): number {
  return Number(valor.toFixed(ITP_DECIMALES));
}

function itpFormatearEuros(valor: number): string {
  return valor.toFixed(ITP_DECIMALES).replace('.', ',');
}

function itpResolverTipoVehiculo(params: CalculoITPParams): TipoVehiculoITP {
  if (params.tipoVehiculo) return params.tipoVehiculo;
  return params.esCiclomotor ? 'ciclomotor' : 'turismo';
}

function itpResolverDistintivo(params: CalculoITPParams): DistintivoITP {
  if (params.distintivo) return params.distintivo;
  return params.esCeroEmisiones ? 'cero' : 'ninguno';
}

function itpCumpleAntiguedad(
  antiguedad: number,
  minima: number,
  incluyeMinima: boolean,
  maxima: number | null
): boolean {
  const superaMinima = incluyeMinima ? antiguedad >= minima : antiguedad > minima;
  return superaMinima && (maxima === null || antiguedad <= maxima);
}

function itpValorSegunReferencia(ctx: ItpContexto, referencia: ValorReferenciaITP): number {
  if (referencia === 'precioMedioNuevo') return ctx.valorNuevo;
  return referencia === 'baseLiquidable' ? ctx.baseLiquidable : ctx.valorFiscal;
}

// Los ciclomotores se agrupan con las motocicletas porque las normas autonómicas
// (por ejemplo Comunitat Valenciana) los tratan en la misma escala de cuotas.
function itpCoincideTipoVehiculo(regla: ReglaCuotaFija, tipo: TipoVehiculoITP): boolean {
  if (regla.tipoVehiculo === 'todos') return true;
  if (regla.tipoVehiculo === 'turismo') return tipo === 'turismo';
  return tipo === 'motocicleta' || tipo === 'ciclomotor';
}

function itpCumpleCilindrada(regla: ReglaCuotaFija, cilindrada: number): boolean {
  const superaMinima = regla.cilindradaMinima === null || cilindrada > regla.cilindradaMinima;
  const respetaMaxima = regla.cilindradaMaxima === null || cilindrada <= regla.cilindradaMaxima;
  return superaMinima && respetaMaxima;
}

function itpCumpleValorMaximo(regla: ReglaCuotaFija, ctx: ItpContexto): boolean {
  if (regla.valorMaximo === null || regla.valorReferencia === null) return true;
  return itpValorSegunReferencia(ctx, regla.valorReferencia) < regla.valorMaximo;
}

// Todo salvo la cilindrada: permite saber si una regla aplicaría de conocerse ese dato.
function itpReglaAplicaSinCilindrada(regla: ReglaCuotaFija, ctx: ItpContexto): boolean {
  if (regla.excluyeHistoricos && ctx.esHistorico) return false;
  return (
    itpCoincideTipoVehiculo(regla, ctx.tipoVehiculo) &&
    itpCumpleAntiguedad(ctx.antiguedad, regla.antiguedadMinima, regla.incluyeAntiguedadMinima, regla.antiguedadMaxima) &&
    itpCumpleValorMaximo(regla, ctx)
  );
}

function itpReglaAplica(regla: ReglaCuotaFija, ctx: ItpContexto): boolean {
  return itpReglaAplicaSinCilindrada(regla, ctx) && itpCumpleCilindrada(regla, ctx.cilindrada);
}

// Con cilindrada 0 (eléctricos o dato no informado) no hay tramo de cilindrada aplicable.
function itpBuscarReglaCuotaFija(ctx: ItpContexto): ReglaCuotaFija | undefined {
  const cuotas = ctx.com.cuotasFijasAntiguedad;
  if (!cuotas || !cuotas.aplica || ctx.cilindrada <= 0) return undefined;
  return cuotas.reglas.find(regla => itpReglaAplica(regla, ctx));
}

function itpCuotaFijaSinCilindrada(ctx: ItpContexto): boolean {
  const cuotas = ctx.com.cuotasFijasAntiguedad;
  if (!cuotas || !cuotas.aplica || ctx.cilindrada > 0) return false;
  return cuotas.reglas.some(regla => itpReglaAplicaSinCilindrada(regla, ctx));
}

function itpExencionDiezAniosAplica(ctx: ItpContexto, exencion: ExencionDiezAniosITP): boolean {
  if (exencion.excluyeHistoricos && ctx.esHistorico) return false;
  if (!itpCumpleAntiguedad(ctx.antiguedad, exencion.minAnios, exencion.incluyeAntiguedadMinima, null)) return false;
  const valor = exencion.valorReferencia === 'precioMedioNuevo' ? ctx.valorNuevo : ctx.valorFiscal;
  return valor < exencion.maxValor;
}

function itpLiquidacionPorTipo(ctx: ItpContexto, tipo: number, motivo: string | null = null): ItpLiquidacion {
  return {
    tipo,
    cuota: (ctx.baseLiquidable * tipo) / ITP_PORCENTAJE_TOTAL,
    esCuotaCero: tipo === 0,
    motivo,
    clasificacion: tipo === 0 ? 'tipoCero' : null
  };
}

function itpLiquidacionCero(motivo: string, clasificacion: ClasificacionCuotaCeroITP): ItpLiquidacion {
  return { tipo: 0, cuota: 0, esCuotaCero: true, motivo, clasificacion };
}

function itpLiquidacionCuotaFija(ctx: ItpContexto, regla: ReglaCuotaFija): ItpLiquidacion {
  const motivo = `Cuota fija de ${itpFormatearEuros(regla.cuota)} € por antigüedad y cilindrada según ${ctx.com.norma}.`;
  return {
    tipo: 0,
    cuota: regla.cuota,
    esCuotaCero: regla.cuota === 0,
    motivo,
    clasificacion: regla.cuota === 0 ? 'cuotaFijaCero' : null
  };
}

function itpLiquidacionCiclomotor(com: ComunidadITPData): ItpLiquidacion {
  const motivo = com.exencionCiclomotoresDescripcion ?? `Exención total de ITP para ciclomotores en ${com.nombre}.`;
  return itpLiquidacionCero(motivo, com.clasificacionCiclomotores ?? 'exencion');
}

// Devuelve el tipo propio del distintivo declarado, o null si la comunidad no lo regula.
function itpTipoPorDistintivo(ctx: ItpContexto): number | null {
  const { com, distintivo } = ctx;
  const cumpleLimiteCero = com.cilindradaMaximaCero === undefined || ctx.cilindrada < com.cilindradaMaximaCero;
  if (distintivo === 'cero' && com.tipoCeroEmisiones !== undefined && cumpleLimiteCero) return com.tipoCeroEmisiones;
  const cumpleLimiteEco = com.cilindradaMaximaEco === undefined || ctx.cilindrada < com.cilindradaMaximaEco;
  if (distintivo === 'eco' && com.tipoEco !== undefined && cumpleLimiteEco) return com.tipoEco;
  return null;
}

function itpLiquidacionDistintivo(ctx: ItpContexto, tipo: number): ItpLiquidacion {
  const nombre = ctx.distintivo === 'cero' ? 'CERO emisiones' : 'ECO';
  const motivo = tipo === 0 ? `Tipo del 0 % en ${ctx.com.nombre} para vehículos con distintivo ${nombre}.` : null;
  return itpLiquidacionPorTipo(ctx, tipo, motivo);
}

function itpAplicaIncrementoPotencia(ctx: ItpContexto): boolean {
  const limite = ctx.com.potenciaFiscalIncrementada;
  return ctx.tipoVehiculo === 'turismo' && limite !== undefined && ctx.potenciaFiscal > limite;
}

function itpAplicaIncrementoCilindrada(ctx: ItpContexto): boolean {
  const { com } = ctx;
  if (com.cilindradaIncrementada === undefined || ctx.cilindrada <= com.cilindradaIncrementada) return false;
  const maxima = com.antiguedadMaximaIncrementoCilindrada;
  return maxima === undefined || ctx.antiguedad <= maxima;
}

function itpAplicaIncrementoValor(ctx: ItpContexto): boolean {
  const { com } = ctx;
  if (com.valorMinimoIncrementado === undefined || com.valorReferenciaIncrementado === undefined) return false;
  return itpValorSegunReferencia(ctx, com.valorReferenciaIncrementado) >= com.valorMinimoIncrementado;
}

function itpAplicaTipoIncrementado(ctx: ItpContexto): boolean {
  return itpAplicaIncrementoPotencia(ctx) || itpAplicaIncrementoCilindrada(ctx) || itpAplicaIncrementoValor(ctx);
}

// Ceuta y Melilla: la bonificación del 50 % solo corresponde a residentes o con domicilio fiscal allí.
function itpTipoBase(ctx: ItpContexto): number {
  const { com } = ctx;
  if (com.bonificacionResidencia !== undefined && ctx.esResidenteCiudadAutonoma) return getTipoEfectivoITP(com);
  return com.tipoGeneral;
}

function itpLiquidar(ctx: ItpContexto): ItpLiquidacion {
  const { com } = ctx;
  if (ctx.tipoVehiculo === 'ciclomotor' && com.exencionCiclomotores) return itpLiquidacionCiclomotor(com);
  if (com.exencionDiezAnios && itpExencionDiezAniosAplica(ctx, com.exencionDiezAnios)) {
    return itpLiquidacionCero(com.exencionDiezAnios.motivo, com.exencionDiezAnios.clasificacion);
  }

  // Valencia (art. 13.Tres.3): el 6 % de CERO/ECO queda excepcionado por las cuotas fijas.
  const reglaPrioritaria = com.cuotasFijasPrevalecenSobreDistintivo ? itpBuscarReglaCuotaFija(ctx) : undefined;
  if (reglaPrioritaria) return itpLiquidacionCuotaFija(ctx, reglaPrioritaria);

  const tipoDistintivo = itpTipoPorDistintivo(ctx);
  if (tipoDistintivo !== null) return itpLiquidacionDistintivo(ctx, tipoDistintivo);

  if (ctx.esComercialConActividad && com.tipoReducidoComercial !== undefined) {
    return itpLiquidacionPorTipo(ctx, com.tipoReducidoComercial);
  }
  const regla = itpBuscarReglaCuotaFija(ctx);
  if (regla) return itpLiquidacionCuotaFija(ctx, regla);
  if (com.tipoIncrementado && itpAplicaTipoIncrementado(ctx)) return itpLiquidacionPorTipo(ctx, com.tipoIncrementado);
  return itpLiquidacionPorTipo(ctx, itpTipoBase(ctx));
}

function itpAvisoCeroCilindradaElevada(com: ComunidadITPData): string {
  const limite = com.cilindradaMaximaCero;
  return `Con distintivo CERO y ${limite} cc o más (híbrido) no se aplica el tipo reducido del ${com.tipoCeroEmisiones} %, que en ${com.nombre} alcanza solo a los híbridos de menos de ${limite} cc. Se aplica el tipo general o, si procede por antigüedad, el incrementado del ${com.tipoIncrementado} %.`;
}

/** Avisos que dependen de los datos introducidos, además de los fijos de la comunidad. */
function itpAvisosDeCalculo(ctx: ItpContexto): string[] {
  const avisos: string[] = [];
  if (itpCuotaFijaSinCilindrada(ctx)) avisos.push(ITP_AVISO_CUOTA_FIJA_SIN_CILINDRADA);
  const limiteCero = ctx.com.cilindradaMaximaCero;
  if (ctx.distintivo === 'cero' && limiteCero !== undefined && ctx.cilindrada >= limiteCero) {
    avisos.push(itpAvisoCeroCilindradaElevada(ctx.com));
  }
  return avisos;
}

function itpCalcularBase(
  precioContrato: number,
  valorFiscal: number
): Pick<CalculoITPResultado, 'baseLiquidable' | 'criterioBase' | 'justificacionBase'> {
  if (precioContrato >= valorFiscal) {
    return { baseLiquidable: precioContrato, criterioBase: 'contrato', justificacionBase: ITP_JUSTIFICACION_CONTRATO };
  }
  return { baseLiquidable: valorFiscal, criterioBase: 'valor_fiscal', justificacionBase: ITP_JUSTIFICACION_VALOR_FISCAL };
}

function itpTasaDgt(anio: number, esCiclomotor: boolean, incluirTasa: boolean): ItpTasaDgt {
  if (!incluirTasa) {
    return { importe: 0, codigo: ITP_CODIGO_TASA_POR_DEFECTO, concepto: ITP_CONCEPTO_TASA_POR_DEFECTO, norma: '', fuente: '' };
  }
  const tasa = getTasaTransferencia(anio, esCiclomotor);
  return { importe: tasa.importe, codigo: tasa.codigo, concepto: tasa.concepto, norma: tasa.norma, fuente: tasa.fuente };
}

function itpDatosComunidad(com: ComunidadITPData): CalculoITPResultado['comunidad'] {
  return {
    slug: com.slug,
    nombre: com.nombre,
    modelo: com.modelo,
    organismo: com.organismo,
    norma: com.norma,
    fuente: com.fuente,
    estadoVerificacion: com.estadoVerificacion,
    fechaVerificacion: com.fechaVerificacion
  };
}

function itpConstruirContexto(
  params: CalculoITPParams,
  com: ComunidadITPData,
  valores: { antiguedad: number; valorNuevo: number; valorFiscal: number; baseLiquidable: number }
): ItpContexto {
  return {
    com,
    tipoVehiculo: itpResolverTipoVehiculo(params),
    distintivo: itpResolverDistintivo(params),
    antiguedad: valores.antiguedad,
    esHistorico: !!params.esHistorico,
    cilindrada: params.cilindradaCC ?? ITP_CILINDRADA_POR_DEFECTO,
    potenciaFiscal: params.potenciaFiscalCVF || 0,
    valorNuevo: valores.valorNuevo,
    valorFiscal: valores.valorFiscal,
    baseLiquidable: valores.baseLiquidable,
    esResidenteCiudadAutonoma: params.esResidenteCiudadAutonoma ?? true,
    esComercialConActividad: !!params.esComercialConActividad
  };
}

/**
 * Calcula el Impuesto de Transmisiones Patrimoniales (ITP) de compraventa de vehículos usados.
 * Las cuotas fijas por comunidad se resuelven con las reglas de `data/<año>/itp.json`.
 */
export function calcularITP(params: CalculoITPParams): CalculoITPResultado {
  const anio = params.anio ?? 2026;
  const com = getComunidadITP(anio, params.comunidadSlug);

  const precioContrato = Math.max(0, params.precioContrato);
  const valorNuevo = Math.max(0, params.valorNuevoBoe);
  const antiguedad = Math.max(0, params.antiguedadAnios);
  const infoFiscal = calcularValorFiscal({ anio, valorNuevoBoe: valorNuevo, antiguedadAnios: antiguedad });
  const esProfesional = !!params.esCompraventaProfesional;

  const base = esProfesional
    ? { baseLiquidable: 0, criterioBase: 'exento_profesional' as const, justificacionBase: ITP_JUSTIFICACION_PROFESIONAL }
    : itpCalcularBase(precioContrato, infoFiscal.valorFiscal);
  const ctx = itpConstruirContexto(params, com, {
    antiguedad,
    valorNuevo,
    valorFiscal: infoFiscal.valorFiscal,
    baseLiquidable: base.baseLiquidable
  });
  const liquidacion = esProfesional ? itpLiquidacionCero(ITP_MOTIVO_PROFESIONAL, 'noSujeto') : itpLiquidar(ctx);

  const tasa = itpTasaDgt(anio, ctx.tipoVehiculo === 'ciclomotor', params.incluirTasaDgt !== false);
  const cuotaGestoria = params.incluirGestoria ? HONORARIOS_GESTORIA_ITP : 0;
  const totalGastos = liquidacion.cuota + tasa.importe + cuotaGestoria;

  return {
    anio,
    comunidad: itpDatosComunidad(com),
    precioContrato: itpRedondear(precioContrato),
    valorNuevoBoe: itpRedondear(valorNuevo),
    antiguedadAnios: antiguedad,
    coeficienteDepreciacion: infoFiscal.coeficiente,
    porcentajeDepreciacion: infoFiscal.porcentaje,
    valorFiscalDepreciado: itpRedondear(infoFiscal.valorFiscal),
    baseLiquidable: itpRedondear(base.baseLiquidable),
    criterioBase: base.criterioBase,
    justificacionBase: base.justificacionBase,
    tipoPorcentajeAplicado: itpRedondear(liquidacion.tipo),
    cuotaITP: itpRedondear(liquidacion.cuota),
    esExentoOcuotaCero: liquidacion.esCuotaCero,
    motivoExencionOCuotaCero: liquidacion.motivo,
    clasificacionCuotaCero: liquidacion.clasificacion,
    tasaDgtImporte: itpRedondear(tasa.importe),
    tasaDgtCodigo: tasa.codigo,
    tasaDgtConcepto: tasa.concepto,
    tasaDgtNorma: tasa.norma,
    tasaDgtFuente: tasa.fuente,
    cuotaGestoria: itpRedondear(cuotaGestoria),
    totalGastosTransferencia: itpRedondear(totalGastos),
    totalConCompra: itpRedondear(precioContrato + totalGastos),
    norma: com.norma,
    fuente: com.fuente,
    estadoVerificacion: com.estadoVerificacion,
    fechaVerificacion: com.fechaVerificacion,
    avisoLegal: avisoLegalVerificacion(
      { estadoVerificacion: com.estadoVerificacion, fechaVerificacion: com.fechaVerificacion },
      anio,
      ITP_LIQUIDADOR
    ),
    avisos: [...(com.avisos ?? []), ...(esProfesional ? [] : itpAvisosDeCalculo(ctx))]
  };
}
