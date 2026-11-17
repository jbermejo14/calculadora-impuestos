import { avisoLegalVerificacion, type EstadoVerificacion } from '@/lib/verification';
import iedmt2026 from '../data/2026/iedmt.json';
import { getTasaMatriculacion } from './fees';

export type VehiculoTramoIEDMT = 'turismo' | 'motocicleta' | null;

export interface TramoIEDMT {
  epigrafe: string;
  /** Epígrafe agrupado del art. 70.2 al que pertenece el tipo (1y6, 2y7, 3y8, 4y9 o 5). */
  grupoTipo: string;
  /** Vehículos a los que se aplican los límites de CO₂; null si el epígrafe no se decide por CO₂. */
  vehiculo: VehiculoTramoIEDMT;
  descripcion: string;
  co2Min: number | null;
  co2MinIncluido: boolean;
  co2Max: number | null;
  co2MaxIncluido: boolean;
  tipoPorcentaje: number;
  norma: string;
  fuente: string;
  estadoVerificacion: EstadoVerificacion;
  fechaVerificacion: string | null;
}

export interface TerritorioIEDMT {
  nombre: string;
  slug: string;
  norma: string;
  fuente: string;
  estadoVerificacion: EstadoVerificacion;
  fechaVerificacion: string | null;
  tramos: TramoIEDMT[];
}

export interface BonificacionIEDMT {
  nombre: string;
  porcentajeReduccionBase?: number;
  porcentajeExencion?: number;
  plazasMinimas?: number;
  plazasMaximas?: number;
  descripcion: string;
  norma: string;
  fuente: string;
  estadoVerificacion: EstadoVerificacion;
  fechaVerificacion: string | null;
}

export interface IvaIEDMT {
  nombre: string;
  porcentaje: number;
  descripcion: string;
  norma: string;
  fuente: string;
  estadoVerificacion: EstadoVerificacion;
  fechaVerificacion: string | null;
}

/** Umbrales de no sujeción de motocicletas (art. 65.1.a, número 5.º). */
export interface NoSujecionMotocicletasIEDMT {
  nombre: string;
  /** Motor de combustión interna: no sujeta si la cilindrada no excede este valor. */
  cilindradaMaximaCc: number;
  /** Resto de motores: no sujeta si la potencia máxima neta no excede este valor. */
  potenciaMaximaKw: number;
  descripcion: string;
  norma: string;
  fuente: string;
  estadoVerificacion: EstadoVerificacion;
  fechaVerificacion: string | null;
}

export interface IEDMTData {
  anio: number;
  norma: string;
  fuente: string;
  estadoVerificacion: EstadoVerificacion;
  fechaVerificacion: string | null;
  territorios: Record<string, TerritorioIEDMT>;
  iva: IvaIEDMT;
  noSujecionMotocicletas: NoSujecionMotocicletasIEDMT;
  bonificaciones: {
    familiaNumerosa: BonificacionIEDMT;
    minusvalia: BonificacionIEDMT;
    comercial: BonificacionIEDMT;
    autocaravana: BonificacionIEDMT;
  };
}

export type TipoVehiculoIEDMT = 'turismo' | 'motocicleta' | 'autocaravana' | 'quad' | 'comercial';

export interface CalculoIEDMTParams {
  anio?: number;
  baseImponible: number;
  emisionesCO2: number;
  territorio?: 'peninsula-y-baleares' | 'canarias' | 'ceuta-y-melilla' | string;
  tipoVehiculo?: TipoVehiculoIEDMT;
  esFamiliaNumerosa?: boolean;
  /** Plazas homologadas, incluido el conductor. Por defecto 5. */
  plazas?: number;
  esMinusvalia?: boolean;
  /** Un solo motor que no sea de combustión interna (epígrafe 1.º b). */
  esMotorNoCombustion?: boolean;
  /** Emisiones de CO₂ exigibles pero no acreditadas (epígrafes 4.º b y 9.º b). */
  co2NoAcreditado?: boolean;
  /** Cilindrada de la motocicleta en cm³. Sin informar, no se evalúa la no sujeción por cilindrada. */
  cilindradaCC?: number;
  /** Motocicleta con motor que no es de combustión y potencia máxima neta ≤ 16 kW (art. 65.1.a, 5.º). */
  esPotenciaNetaHasta16kW?: boolean;
  /** Motocicleta con potencia ≥ 74 kW y relación potencia/masa ≥ 0,66 kW/kg (epígrafe 9.º c). */
  esMotoAltaPotencia?: boolean;
  /** Autocaravana de categoría N2/N3 acondicionada como vivienda (epígrafe 4.º c). */
  esN2N3Vivienda?: boolean;
  incluirIva?: boolean;
  incluirTasaDgt?: boolean;
  esCiclomotor?: boolean;
}

export interface CalculoIEDMTResultado {
  anio: number;
  territorio: {
    slug: string;
    nombre: string;
    norma: string;
    fuente: string;
    estadoVerificacion: EstadoVerificacion;
    fechaVerificacion: string | null;
  };
  baseImponibleOriginal: number;
  baseImponibleAplicada: number;
  reduccionBasePorcentaje: number;
  reduccionBaseImporte: number;
  emisionesCO2: number;
  epigrafe: string;
  tipoPorcentaje: number;
  cuotaIEDMT: number;
  ivaPorcentaje: number;
  cuotaIva: number;
  tasaDgtImporte: number;
  tasaDgtCodigo: string;
  tasaDgtNorma: string;
  tasaDgtFuente: string;
  totalImpuestosYTasas: number;
  totalConVehiculo: number;
  tramoDescripcion: string;
  exencionAplicada: string | null;
  /** Explicaciones de reducciones no aplicadas, supuestos interpretativos y casos dudosos. */
  avisos: string[];
  /** Texto fijo sobre el origen de los tipos aplicados. */
  notaTipos: string;
  norma: string;
  fuente: string;
  estadoVerificacion: EstadoVerificacion;
  fechaVerificacion: string | null;
  avisoLegal: string;
}

const REGISTRO_IEDMT_POR_ANIO: Record<number, IEDMTData> = {
  2026: iedmt2026 as unknown as IEDMTData
};

const IEDMT_TERRITORIO_POR_DEFECTO = 'peninsula-y-baleares';
const IEDMT_TERRITORIO_CEUTA_MELILLA = 'ceuta-y-melilla';
const IEDMT_TERRITORIOS_VALIDOS = 'peninsula-y-baleares, canarias, ceuta-y-melilla';
const IEDMT_PLAZAS_POR_DEFECTO = 5;
const IEDMT_TERRITORIO_CANARIAS = 'canarias';
const IEDMT_TERRITORIOS_SIN_IVA = [IEDMT_TERRITORIO_CANARIAS, IEDMT_TERRITORIO_CEUTA_MELILLA];
const IEDMT_PORCENTAJE_TOTAL = 100;
const IEDMT_DECIMALES = 2;

const IEDMT_EPIGRAFE_PRIMERO = '1.º';
const IEDMT_EPIGRAFE_CUARTO = '4.º';
const IEDMT_EPIGRAFE_NOVENO = '9.º';

const IEDMT_NOTA_TIPOS =
  'Se aplican los tipos estatales del art. 70.2.b. Una comunidad autónoma puede aprobar tipos propios (art. 70.2.a).';
const IEDMT_MOTIVO_COMERCIAL =
  'No sujeto si se afecta significativamente a una actividad económica (art. 65.1.a Ley 38/1992). Si se acondiciona como vivienda, sí está sujeto';
const IEDMT_MOTIVO_MINUSVALIA =
  'Exención para vehículos matriculados a nombre de personas con discapacidad para su uso exclusivo (art. 66.1.d Ley 38/1992). Requiere reconocimiento previo de la AEAT';
const IEDMT_MOTIVO_CEUTA_MELILLA = 'Tipo del 0 % en Ceuta y Melilla (art. 70.2.c Ley 38/1992)';
const IEDMT_AVISO_MINUSVALIA_NO_AUTOMOVIL =
  'La exención por discapacidad (art. 66.1.d) solo se aplica a vehículos automóviles: no se aplica a este tipo de vehículo.';
const IEDMT_AVISO_FAMILIA_NO_AUTOMOVIL =
  'La reducción por familia numerosa (art. 66.4) solo se aplica a vehículos automóviles: no se aplica a este tipo de vehículo.';
const IEDMT_AVISO_ELECTRICA_ALTA_POTENCIA =
  'Moto eléctrica de alta potencia: se aplica el epígrafe 9.º c ("cualesquiera que sean sus emisiones"). Es una interpretación; confírmala con la AEAT.';
// Impuesto indirecto propio de los territorios donde no rige el IVA. Solo se nombra: no hay tipo verificado.
const IEDMT_IMPUESTO_PROPIO_POR_TERRITORIO: Record<string, string> = {
  [IEDMT_TERRITORIO_CANARIAS]: 'IGIC (Impuesto General Indirecto Canario)',
  [IEDMT_TERRITORIO_CEUTA_MELILLA]: 'IPSI (Impuesto sobre la Producción, los Servicios y la Importación)'
};
const IEDMT_LIQUIDADOR =
  'la Agencia Estatal de Administración Tributaria (AEAT) o el órgano tributario de la comunidad autónoma correspondiente';
const IEDMT_AVISO_REDUCCIONES_SUCESIVAS =
  'Concurren autocaravana y familia numerosa: se aplican sucesivamente sobre la base, primero el 30 % (art. 66.5) y después el 50 % (art. 66.4). Es una interpretación; confírmala con la AEAT.';

/** Datos normalizados de entrada: evita repetir valores por defecto en cada función. */
interface IEDMTEntrada {
  baseOriginal: number;
  emisiones: number;
  tipoVehiculo: TipoVehiculoIEDMT;
  plazas: number;
  esFamiliaNumerosa: boolean;
  esMinusvalia: boolean;
  esMotorNoCombustion: boolean;
  co2NoAcreditado: boolean;
  esMotoAltaPotencia: boolean;
  esN2N3Vivienda: boolean;
  cilindradaCC: number | null;
  esPotenciaNetaHasta16kW: boolean;
}

interface IEDMTReduccion {
  factor: number;
  avisos: string[];
}

/**
 * Carga los datos del IEDMT para el año fiscal especificado
 */
export function getIEDMTData(anio: number = 2026): IEDMTData {
  const data = REGISTRO_IEDMT_POR_ANIO[anio];
  if (!data) {
    throw new Error(`No existen datos fiscales de IEDMT para el año fiscal ${anio}`);
  }
  return data;
}

function iedmtGetTerritorio(anio: number, territorioSlug: string): TerritorioIEDMT {
  const territorio = getIEDMTData(anio).territorios[territorioSlug];
  if (!territorio) {
    throw new Error(`Territorio no reconocido: "${territorioSlug}". Opciones válidas: ${IEDMT_TERRITORIOS_VALIDOS}`);
  }
  return territorio;
}

/**
 * Obtiene los tramos vigentes para un territorio y año fiscal
 */
export function getTramosIEDMT(anio: number = 2026, territorioSlug: string = IEDMT_TERRITORIO_POR_DEFECTO): TramoIEDMT[] {
  return iedmtGetTerritorio(anio, territorioSlug).tramos;
}

function iedmtCumpleLimites(tramo: TramoIEDMT, co2: number): boolean {
  const superaMinimo =
    tramo.co2Min === null || (tramo.co2MinIncluido ? co2 >= tramo.co2Min : co2 > tramo.co2Min);
  const respetaMaximo =
    tramo.co2Max === null || (tramo.co2MaxIncluido ? co2 <= tramo.co2Max : co2 < tramo.co2Max);
  return superaMinimo && respetaMaximo;
}

/**
 * Determina el tramo de CO2 correspondiente a unas emisiones en un territorio y año.
 * Con `vehiculo = 'motocicleta'` usa los epígrafes 6.º a 9.º; en otro caso, los 1.º a 4.º.
 */
export function determinarTramoCO2(
  anio: number = 2026,
  emisionesCO2: number,
  territorioSlug: string = IEDMT_TERRITORIO_POR_DEFECTO,
  vehiculo: 'turismo' | 'motocicleta' = 'turismo'
): TramoIEDMT {
  const emisiones = Math.max(0, emisionesCO2);
  const candidatos = getTramosIEDMT(anio, territorioSlug).filter(t => t.vehiculo === vehiculo);
  const tramo = candidatos.find(t => iedmtCumpleLimites(t, emisiones));
  if (!tramo) {
    throw new Error(`Los datos de IEDMT no cubren unas emisiones de ${emisiones} g/km para ${vehiculo}`);
  }
  return tramo;
}

function iedmtBuscarTramo(anio: number, territorioSlug: string, epigrafe: string): TramoIEDMT {
  const tramo = getTramosIEDMT(anio, territorioSlug).find(t => t.epigrafe === epigrafe);
  if (!tramo) {
    throw new Error(`Los datos de IEDMT de "${territorioSlug}" no incluyen el epígrafe ${epigrafe}`);
  }
  return tramo;
}

function iedmtEsAutomovil(tipo: TipoVehiculoIEDMT): boolean {
  return tipo === 'turismo' || tipo === 'autocaravana';
}

/** Epígrafe de una motocicleta (art. 70.1: epígrafes 1.º b, 6.º a 9.º). */
function iedmtTramoMotocicleta(anio: number, territorio: string, entrada: IEDMTEntrada): TramoIEDMT {
  // El 9.º c prevalece sobre el 1.º b: dice "cualesquiera que sean sus emisiones".
  if (entrada.esMotoAltaPotencia) {
    return iedmtBuscarTramo(anio, territorio, IEDMT_EPIGRAFE_NOVENO);
  }
  if (entrada.esMotorNoCombustion) {
    return iedmtBuscarTramo(anio, territorio, IEDMT_EPIGRAFE_PRIMERO);
  }
  if (entrada.co2NoAcreditado) {
    return iedmtBuscarTramo(anio, territorio, IEDMT_EPIGRAFE_NOVENO);
  }
  return determinarTramoCO2(anio, entrada.emisiones, territorio, 'motocicleta');
}

/** Epígrafe de turismos, autocaravanas, quads y comerciales (art. 70.1: 1.º a 4.º). */
function iedmtTramoAutomovil(anio: number, territorio: string, entrada: IEDMTEntrada): TramoIEDMT {
  // Quad (4.º d) y camión vivienda N2/N3 (4.º c) son los casos más específicos:
  // se evalúan antes que el 1.º b, que también los alcanzaría en el caso eléctrico del N2/N3.
  if (entrada.tipoVehiculo === 'quad' || (entrada.tipoVehiculo === 'autocaravana' && entrada.esN2N3Vivienda)) {
    return iedmtBuscarTramo(anio, territorio, IEDMT_EPIGRAFE_CUARTO);
  }
  if (entrada.esMotorNoCombustion) {
    return iedmtBuscarTramo(anio, territorio, IEDMT_EPIGRAFE_PRIMERO);
  }
  if (entrada.co2NoAcreditado) {
    return iedmtBuscarTramo(anio, territorio, IEDMT_EPIGRAFE_CUARTO);
  }
  return determinarTramoCO2(anio, entrada.emisiones, territorio, 'turismo');
}

function iedmtDeterminarTramo(anio: number, territorio: string, entrada: IEDMTEntrada): TramoIEDMT {
  return entrada.tipoVehiculo === 'motocicleta'
    ? iedmtTramoMotocicleta(anio, territorio, entrada)
    : iedmtTramoAutomovil(anio, territorio, entrada);
}

function iedmtFamiliaNumerosaAplicable(
  entrada: IEDMTEntrada,
  bonificacion: BonificacionIEDMT
): { aplica: boolean; aviso: string | null } {
  if (!entrada.esFamiliaNumerosa) {
    return { aplica: false, aviso: null };
  }
  if (!iedmtEsAutomovil(entrada.tipoVehiculo)) {
    return { aplica: false, aviso: IEDMT_AVISO_FAMILIA_NO_AUTOMOVIL };
  }
  const minimo = bonificacion.plazasMinimas ?? 0;
  const maximo = bonificacion.plazasMaximas ?? Infinity;
  if (entrada.plazas < minimo || entrada.plazas > maximo) {
    return {
      aplica: false,
      aviso: `La reducción por familia numerosa (art. 66.4) exige entre ${minimo} y ${maximo} plazas homologadas (incluido el conductor); con ${entrada.plazas} no se aplica.`
    };
  }
  return { aplica: true, aviso: null };
}

/**
 * Factor multiplicador de la base tras las reducciones del art. 66.4 y 66.5.
 * Supuesto interpretativo: si concurren ambas, se aplican sucesivamente (primero 30 %, después 50 %).
 */
function iedmtCalcularReduccion(data: IEDMTData, entrada: IEDMTEntrada): IEDMTReduccion {
  const avisos: string[] = [];
  let factor = 1;
  const esAutocaravana = entrada.tipoVehiculo === 'autocaravana';
  if (esAutocaravana) {
    const porcentaje = data.bonificaciones.autocaravana.porcentajeReduccionBase ?? 0;
    factor *= 1 - porcentaje / IEDMT_PORCENTAJE_TOTAL;
  }
  const familia = iedmtFamiliaNumerosaAplicable(entrada, data.bonificaciones.familiaNumerosa);
  if (familia.aviso) {
    avisos.push(familia.aviso);
  }
  if (familia.aplica) {
    const porcentaje = data.bonificaciones.familiaNumerosa.porcentajeReduccionBase ?? 0;
    factor *= 1 - porcentaje / IEDMT_PORCENTAJE_TOTAL;
    if (esAutocaravana) {
      avisos.push(IEDMT_AVISO_REDUCCIONES_SUCESIVAS);
    }
  }
  return { factor, avisos };
}

/** Motivo de no sujeción de una motocicleta de baja cilindrada o potencia (art. 65.1.a, 5.º), o null. */
function iedmtMotivoMotoNoSujeta(entrada: IEDMTEntrada, umbrales: NoSujecionMotocicletasIEDMT): string | null {
  if (entrada.tipoVehiculo !== 'motocicleta') {
    return null;
  }
  if (entrada.esMotorNoCombustion) {
    return entrada.esPotenciaNetaHasta16kW
      ? `No sujeta: motocicleta con potencia máxima neta no superior a ${umbrales.potenciaMaximaKw} kW (art. 65.1.a, número 5.º, Ley 38/1992)`
      : null;
  }
  if (entrada.cilindradaCC !== null && entrada.cilindradaCC <= umbrales.cilindradaMaximaCc) {
    return `No sujeta: motocicleta de cilindrada no superior a ${umbrales.cilindradaMaximaCc} cm³ (art. 65.1.a, número 5.º, Ley 38/1992)`;
  }
  return null;
}

/** Motivo por el que la cuota es 0, o null si se calcula con normalidad. */
function iedmtMotivoExencion(entrada: IEDMTEntrada, territorioSlug: string, data: IEDMTData): string | null {
  if (entrada.tipoVehiculo === 'comercial') {
    return IEDMT_MOTIVO_COMERCIAL;
  }
  const motivoMoto = iedmtMotivoMotoNoSujeta(entrada, data.noSujecionMotocicletas);
  if (motivoMoto) {
    return motivoMoto;
  }
  if (entrada.esMinusvalia && iedmtEsAutomovil(entrada.tipoVehiculo)) {
    return IEDMT_MOTIVO_MINUSVALIA;
  }
  if (territorioSlug === IEDMT_TERRITORIO_CEUTA_MELILLA) {
    return IEDMT_MOTIVO_CEUTA_MELILLA;
  }
  return null;
}

function iedmtAvisosEpigrafe(entrada: IEDMTEntrada): string[] {
  const avisos: string[] = [];
  if (entrada.esMinusvalia && !iedmtEsAutomovil(entrada.tipoVehiculo) && entrada.tipoVehiculo !== 'comercial') {
    avisos.push(IEDMT_AVISO_MINUSVALIA_NO_AUTOMOVIL);
  }
  if (entrada.tipoVehiculo === 'motocicleta' && entrada.esMotoAltaPotencia && entrada.esMotorNoCombustion) {
    avisos.push(IEDMT_AVISO_ELECTRICA_ALTA_POTENCIA);
  }
  return avisos;
}

function iedmtNormalizarEntrada(params: CalculoIEDMTParams): IEDMTEntrada {
  return {
    baseOriginal: Math.max(0, params.baseImponible),
    emisiones: Math.max(0, params.emisionesCO2),
    tipoVehiculo: params.tipoVehiculo || 'turismo',
    plazas: params.plazas ?? IEDMT_PLAZAS_POR_DEFECTO,
    esFamiliaNumerosa: !!params.esFamiliaNumerosa,
    esMinusvalia: !!params.esMinusvalia,
    esMotorNoCombustion: !!params.esMotorNoCombustion,
    co2NoAcreditado: !!params.co2NoAcreditado,
    esMotoAltaPotencia: !!params.esMotoAltaPotencia,
    esN2N3Vivienda: !!params.esN2N3Vivienda,
    cilindradaCC: params.cilindradaCC ?? null,
    esPotenciaNetaHasta16kW: !!params.esPotenciaNetaHasta16kW
  };
}

/** Indica si el IVA rige en el territorio: no rige en Canarias (IGIC) ni en Ceuta y Melilla (IPSI). */
export function territorioTieneIvaIEDMT(territorioSlug: string): boolean {
  return !IEDMT_TERRITORIOS_SIN_IVA.includes(territorioSlug);
}

function iedmtAvisoSinIva(territorio: TerritorioIEDMT): string {
  const impuesto = IEDMT_IMPUESTO_PROPIO_POR_TERRITORIO[territorio.slug];
  return `En ${territorio.nombre} no rige el IVA sino el ${impuesto}. No se incluye en el cálculo porque su tipo no figura entre los datos verificados de esta calculadora.`;
}

/** Avisos sobre el IVA: territorios donde no rige y tipo aún sin verificar. */
function iedmtAvisosIva(data: IEDMTData, territorio: TerritorioIEDMT, aplicaIva: boolean): string[] {
  if (!territorioTieneIvaIEDMT(territorio.slug)) {
    return [iedmtAvisoSinIva(territorio)];
  }
  if (aplicaIva && data.iva.estadoVerificacion !== 'verificado') {
    return [`El tipo de IVA del ${data.iva.porcentaje} % (${data.iva.norma}) no se ha verificado contra la fuente.`];
  }
  return [];
}

function iedmtRedondear(valor: number): number {
  return Number(valor.toFixed(IEDMT_DECIMALES));
}

/**
 * Calcula el Impuesto de Matriculación (IEDMT) y costes asociados
 */
export function calcularIEDMT(params: CalculoIEDMTParams): CalculoIEDMTResultado {
  const anio = params.anio ?? 2026;
  const territorioSlug = params.territorio || IEDMT_TERRITORIO_POR_DEFECTO;
  const data = getIEDMTData(anio);
  const territorio = iedmtGetTerritorio(anio, territorioSlug);
  const entrada = iedmtNormalizarEntrada(params);
  const incluirIva = params.incluirIva !== false;
  const incluirTasa = params.incluirTasaDgt !== false;

  const tramo = iedmtDeterminarTramo(anio, territorioSlug, entrada);
  const esComercial = entrada.tipoVehiculo === 'comercial';
  const reduccion: IEDMTReduccion = esComercial ? { factor: 1, avisos: [] } : iedmtCalcularReduccion(data, entrada);
  const baseAplicada = entrada.baseOriginal * reduccion.factor;

  const exencionAplicada = iedmtMotivoExencion(entrada, territorioSlug, data);
  // En Ceuta y Melilla el tipo de los datos ya es 0 %; el motivo solo explica ese resultado.
  const cuotaIEDMT = exencionAplicada ? 0 : (baseAplicada * tramo.tipoPorcentaje) / IEDMT_PORCENTAJE_TOTAL;

  // IVA ordinario sobre la base imponible sin impuestos especiales; no rige en Canarias, Ceuta ni Melilla
  const aplicaIva = incluirIva && territorioTieneIvaIEDMT(territorioSlug);
  const ivaPorcentaje = aplicaIva ? data.iva.porcentaje : 0;
  const cuotaIva = (entrada.baseOriginal * ivaPorcentaje) / IEDMT_PORCENTAJE_TOTAL;

  // Tasa DGT de primera matriculación (Tasa 1.1 o 1.2)
  let tasaDgtImporte = 0;
  let tasaDgtCodigo = '1.1';
  let tasaDgtNorma = '';
  let tasaDgtFuente = '';

  if (incluirTasa) {
    const tasaInfo = getTasaMatriculacion(anio, !!params.esCiclomotor);
    tasaDgtImporte = tasaInfo.importe;
    tasaDgtCodigo = tasaInfo.codigo;
    tasaDgtNorma = tasaInfo.norma;
    tasaDgtFuente = tasaInfo.fuente;
  }

  const totalImpuestosYTasas = cuotaIEDMT + cuotaIva + tasaDgtImporte;

  return {
    anio,
    territorio: {
      slug: territorio.slug,
      nombre: territorio.nombre,
      norma: territorio.norma,
      fuente: territorio.fuente,
      estadoVerificacion: territorio.estadoVerificacion,
      fechaVerificacion: territorio.fechaVerificacion
    },
    baseImponibleOriginal: iedmtRedondear(entrada.baseOriginal),
    baseImponibleAplicada: iedmtRedondear(baseAplicada),
    reduccionBasePorcentaje: iedmtRedondear((1 - reduccion.factor) * IEDMT_PORCENTAJE_TOTAL),
    reduccionBaseImporte: iedmtRedondear(entrada.baseOriginal - baseAplicada),
    emisionesCO2: entrada.emisiones,
    epigrafe: tramo.epigrafe,
    tipoPorcentaje: tramo.tipoPorcentaje,
    cuotaIEDMT: iedmtRedondear(cuotaIEDMT),
    ivaPorcentaje,
    cuotaIva: iedmtRedondear(cuotaIva),
    tasaDgtImporte: iedmtRedondear(tasaDgtImporte),
    tasaDgtCodigo,
    tasaDgtNorma,
    tasaDgtFuente,
    totalImpuestosYTasas: iedmtRedondear(totalImpuestosYTasas),
    totalConVehiculo: iedmtRedondear(entrada.baseOriginal + totalImpuestosYTasas),
    tramoDescripcion: tramo.descripcion,
    exencionAplicada,
    avisos: [...iedmtAvisosEpigrafe(entrada), ...reduccion.avisos, ...iedmtAvisosIva(data, territorio, aplicaIva)],
    notaTipos: IEDMT_NOTA_TIPOS,
    norma: tramo.norma,
    fuente: tramo.fuente,
    estadoVerificacion: tramo.estadoVerificacion,
    fechaVerificacion: tramo.fechaVerificacion,
    avisoLegal: avisoLegalVerificacion(
      { estadoVerificacion: tramo.estadoVerificacion, fechaVerificacion: tramo.fechaVerificacion },
      anio,
      IEDMT_LIQUIDADOR
    )
  };
}
