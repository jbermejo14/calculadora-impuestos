import iedmt2026 from '../data/2026/iedmt.json';
import { getTasaMatriculacion } from './fees';

export interface TramoIEDMT {
  epigrafe: string;
  descripcion: string;
  co2Min: number;
  co2Max: number;
  tipoPorcentaje: number;
  norma: string;
  fuente: string;
  fechaVerificacion: string;
  verificado: boolean;
}

export interface TerritorioIEDMT {
  nombre: string;
  slug: string;
  norma: string;
  fuente: string;
  fechaVerificacion: string;
  verificado: boolean;
  tramos: TramoIEDMT[];
}

export interface BonificacionIEDMT {
  nombre: string;
  porcentajeReduccionBase?: number;
  porcentajeExencion?: number;
  descripcion: string;
  norma: string;
  fuente: string;
  fechaVerificacion: string;
  verificado: boolean;
}

export interface IEDMTData {
  anio: number;
  norma: string;
  fuente: string;
  fechaVerificacion: string;
  verificado: boolean;
  territorios: Record<string, TerritorioIEDMT>;
  bonificaciones: {
    familiaNumerosa: BonificacionIEDMT;
    minusvalia: BonificacionIEDMT;
    comercial: BonificacionIEDMT;
  };
}

export interface CalculoIEDMTParams {
  anio?: number;
  baseImponible: number;
  emisionesCO2: number;
  territorio?: 'peninsula-y-baleares' | 'canarias' | 'ceuta-y-melilla' | string;
  tipoVehiculo?: 'turismo' | 'motocicleta' | 'comercial' | 'autocaravana';
  esFamiliaNumerosa?: boolean;
  esMinusvalia?: boolean;
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
    fechaVerificacion: string;
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
  norma: string;
  fuente: string;
  fechaVerificacion: string;
  avisoLegal: string;
}

const REGISTRO_IEDMT_POR_ANIO: Record<number, IEDMTData> = {
  2026: iedmt2026 as unknown as IEDMTData
};

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

/**
 * Obtiene los tramos vigentes para un territorio y año fiscal
 */
export function getTramosIEDMT(anio: number = 2026, territorioSlug: string = 'peninsula-y-baleares'): TramoIEDMT[] {
  const data = getIEDMTData(anio);
  const territorio = data.territorios[territorioSlug];
  if (!territorio) {
    throw new Error(`Territorio no reconocido: "${territorioSlug}". Opciones válidas: peninsula-y-baleares, canarias, ceuta-y-melilla`);
  }
  return territorio.tramos;
}

/**
 * Determina el tramo de CO2 correspondiente a unas emisiones en un territorio y año
 */
export function determinarTramoCO2(anio: number = 2026, emisionesCO2: number, territorioSlug: string = 'peninsula-y-baleares'): TramoIEDMT {
  const tramos = getTramosIEDMT(anio, territorioSlug);
  const emisiones = Math.max(0, emisionesCO2);

  for (const tramo of tramos) {
    if (emisiones >= tramo.co2Min && emisiones <= tramo.co2Max) {
      return tramo;
    }
  }

  return tramos[tramos.length - 1];
}

/**
 * Calcula el Impuesto de Matriculación (IEDMT) y costes asociados
 */
export function calcularIEDMT(params: CalculoIEDMTParams): CalculoIEDMTResultado {
  const anio = params.anio ?? 2026;
  const territorioSlug = params.territorio || 'peninsula-y-baleares';
  const data = getIEDMTData(anio);
  const territorio = data.territorios[territorioSlug];

  if (!territorio) {
    throw new Error(`Territorio de matriculación no válido: "${territorioSlug}". Opciones: peninsula-y-baleares, canarias, ceuta-y-melilla`);
  }

  const baseOriginal = Math.max(0, params.baseImponible);
  const emisiones = Math.max(0, params.emisionesCO2);
  const tipoVehiculo = params.tipoVehiculo || 'turismo';
  const esFamNumerosa = !!params.esFamiliaNumerosa;
  const esMinusvalia = !!params.esMinusvalia;
  const esComercial = tipoVehiculo === 'comercial';
  const incluirIva = params.incluirIva !== false;
  const incluirTasa = params.incluirTasaDgt !== false;
  const esCiclomotor = !!params.esCiclomotor;

  const tramo = determinarTramoCO2(anio, emisiones, territorioSlug);

  // Reducción por familia numerosa (50% sobre la base imponible del IEDMT)
  let reduccionBasePct = 0;
  let baseAplicada = baseOriginal;
  if (esFamNumerosa) {
    reduccionBasePct = data.bonificaciones.familiaNumerosa.porcentajeReduccionBase || 50;
    baseAplicada = baseOriginal * (1 - reduccionBasePct / 100);
  }

  // Cuota IEDMT
  let tipoPorcentaje = tramo.tipoPorcentaje;
  let cuotaIEDMT = 0;
  let exencionAplicada: string | null = null;

  if (esMinusvalia) {
    cuotaIEDMT = 0;
    exencionAplicada = 'Exención total por Movilidad Reducida / Minusvalía (art. 65.1.a Ley 38/1992)';
  } else if (esComercial) {
    cuotaIEDMT = 0;
    exencionAplicada = 'No sujeción / exención para vehículo comercial o afecto a actividad económica (art. 65.1.a Ley 38/1992)';
  } else if (territorioSlug === 'ceuta-y-melilla') {
    cuotaIEDMT = 0;
    exencionAplicada = 'Tipo al 0 % aplicable en Ceuta y Melilla (art. 70.3 Ley 38/1992)';
  } else {
    cuotaIEDMT = (baseAplicada * tipoPorcentaje) / 100;
  }

  // IVA ordinario (21 % sobre la base imponible sin impuestos especiales)
  const cuotaIva = incluirIva ? (baseOriginal * 0.21) : 0;

  // Tasa DGT de primera matriculación (Tasa 1.1 o 1.2)
  let tasaDgtImporte = 0;
  let tasaDgtCodigo = '1.1';
  let tasaDgtNorma = '';
  let tasaDgtFuente = '';

  if (incluirTasa) {
    const tasaInfo = getTasaMatriculacion(anio, esCiclomotor);
    tasaDgtImporte = tasaInfo.importe;
    tasaDgtCodigo = tasaInfo.codigo;
    tasaDgtNorma = tasaInfo.norma;
    tasaDgtFuente = tasaInfo.fuente;
  }

  const reduccionBaseImporte = baseOriginal - baseAplicada;
  const totalImpuestosYTasas = cuotaIEDMT + cuotaIva + tasaDgtImporte;
  const totalConVehiculo = baseOriginal + totalImpuestosYTasas;

  return {
    anio,
    territorio: {
      slug: territorio.slug,
      nombre: territorio.nombre,
      norma: territorio.norma,
      fuente: territorio.fuente,
      fechaVerificacion: territorio.fechaVerificacion
    },
    baseImponibleOriginal: Number(baseOriginal.toFixed(2)),
    baseImponibleAplicada: Number(baseAplicada.toFixed(2)),
    reduccionBasePorcentaje: reduccionBasePct,
    reduccionBaseImporte: Number(reduccionBaseImporte.toFixed(2)),
    emisionesCO2: emisiones,
    epigrafe: tramo.epigrafe,
    tipoPorcentaje,
    cuotaIEDMT: Number(cuotaIEDMT.toFixed(2)),
    ivaPorcentaje: incluirIva ? 21.0 : 0,
    cuotaIva: Number(cuotaIva.toFixed(2)),
    tasaDgtImporte: Number(tasaDgtImporte.toFixed(2)),
    tasaDgtCodigo,
    tasaDgtNorma,
    tasaDgtFuente,
    totalImpuestosYTasas: Number(totalImpuestosYTasas.toFixed(2)),
    totalConVehiculo: Number(totalConVehiculo.toFixed(2)),
    tramoDescripcion: tramo.descripcion,
    exencionAplicada,
    norma: tramo.norma,
    fuente: tramo.fuente,
    fechaVerificacion: tramo.fechaVerificacion,
    avisoLegal: 'Cálculo orientativo con datos fiscales verificados. La liquidación oficial definitiva la realiza la Agencia Estatal de Administración Tributaria (AEAT) o el órgano tributario de la comunidad autónoma correspondiente.'
  };
}
