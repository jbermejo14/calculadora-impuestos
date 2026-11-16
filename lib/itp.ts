import type { EstadoVerificacion } from '@/lib/verification';
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

export interface ComunidadITPData {
  slug: string;
  nombre: string;
  tipoGeneral: number;
  tipoIncrementado?: number | null;
  potenciaFiscalIncrementada?: number;
  cilindradaIncrementada?: number;
  tipoCeroEmisiones?: number;
  tipoReducidoComercial?: number;
  bonificacionResidencia?: number;
  tipoEfectivo?: number;
  exencionCiclomotores: boolean;
  exencionDiezAnios?: {
    minAnios: number;
    maxValor: number;
    excluyeHistoricos: boolean;
    descripcion: string;
  };
  cuotasFijasAntiguedad?: {
    minAnios: number;
    aplica: boolean;
    descripcion: string;
  };
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
  esCiclomotor?: boolean;
  esCompraventaProfesional?: boolean;
  potenciaFiscalCVF?: number;
  cilindradaCC?: number;
  esCeroEmisiones?: boolean;
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
}

const REGISTRO_DEPRECIACION_POR_ANIO: Record<number, DepreciacionData> = {
  2026: depreciacion2026 as unknown as DepreciacionData
};

const REGISTRO_ITP_POR_ANIO: Record<number, ITPData> = {
  2026: itp2026 as unknown as ITPData
};

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

/**
 * Calcula el Impuesto de Transmisiones Patrimoniales (ITP) de compraventa de vehículos usados
 */
export function calcularITP(params: CalculoITPParams): CalculoITPResultado {
  const anio = params.anio ?? 2026;
  const com = getComunidadITP(anio, params.comunidadSlug);

  const precioContrato = Math.max(0, params.precioContrato);
  const valorNuevo = Math.max(0, params.valorNuevoBoe);
  const antiguedad = Math.max(0, params.antiguedadAnios);
  const esHistorico = !!params.esHistorico;
  const esCiclomotor = !!params.esCiclomotor;
  const esProfesional = !!params.esCompraventaProfesional;
  const potenciaFiscal = params.potenciaFiscalCVF || 0;
  const cilindrada = params.cilindradaCC || 0;
  const esCero = !!params.esCeroEmisiones;
  const incluirTasa = params.incluirTasaDgt !== false;
  const incluirGestoria = !!params.incluirGestoria;

  // Valor fiscal según tablas BOE
  const infoFiscal = calcularValorFiscal({ anio, valorNuevoBoe: valorNuevo, antiguedadAnios: antiguedad });
  const valorFiscal = infoFiscal.valorFiscal;

  // 1. Caso especial: Compraventa profesional (concesionario o compraventa)
  if (esProfesional) {
    const tasaDgtInfo = incluirTasa ? getTasaTransferencia(anio, esCiclomotor) : null;
    const tasaDgtImporte = tasaDgtInfo ? tasaDgtInfo.importe : 0;
    const cuotaGestoria = incluirGestoria ? 60.0 : 0;

    return {
      anio,
      comunidad: {
        slug: com.slug,
        nombre: com.nombre,
        modelo: com.modelo,
        organismo: com.organismo,
        norma: com.norma,
        fuente: com.fuente,
        estadoVerificacion: com.estadoVerificacion,
        fechaVerificacion: com.fechaVerificacion
      },
      precioContrato,
      valorNuevoBoe: valorNuevo,
      antiguedadAnios: antiguedad,
      coeficienteDepreciacion: infoFiscal.coeficiente,
      porcentajeDepreciacion: infoFiscal.porcentaje,
      valorFiscalDepreciado: valorFiscal,
      baseLiquidable: 0,
      criterioBase: 'exento_profesional',
      justificacionBase: 'Operación realizada por empresario o profesional en ejercicio de su actividad económica. No sujeta a ITP (tributa en IVA / REBU).',
      tipoPorcentajeAplicado: 0,
      cuotaITP: 0,
      esExentoOcuotaCero: true,
      motivoExencionOCuotaCero: 'Operación profesional sujeta a IVA / REBU. Exenta de ITP entre particulares (art. 7.5 TR Ley ITP).',
      tasaDgtImporte,
      tasaDgtCodigo: tasaDgtInfo ? tasaDgtInfo.codigo : '1.5',
      tasaDgtConcepto: tasaDgtInfo ? tasaDgtInfo.concepto : 'Cambio de titularidad',
      tasaDgtNorma: tasaDgtInfo ? tasaDgtInfo.norma : '',
      tasaDgtFuente: tasaDgtInfo ? tasaDgtInfo.fuente : '',
      cuotaGestoria,
      totalGastosTransferencia: tasaDgtImporte + cuotaGestoria,
      totalConCompra: precioContrato + tasaDgtImporte + cuotaGestoria,
      norma: com.norma,
      fuente: com.fuente,
      estadoVerificacion: com.estadoVerificacion,
      fechaVerificacion: com.fechaVerificacion,
      avisoLegal: 'Cálculo orientativo con datos fiscales pendientes de revisión contra la fuente. La liquidación oficial definitiva la realiza la administración tributaria autonómica correspondiente.'
    };
  }

  // Base liquidable: mayor entre precio de contrato y valor fiscal depreciado
  let baseLiquidable = valorFiscal;
  let criterioBase: 'contrato' | 'valor_fiscal' = 'valor_fiscal';
  let justificacionBase = '';

  if (precioContrato >= valorFiscal) {
    baseLiquidable = precioContrato;
    criterioBase = 'contrato';
    justificacionBase = 'Hacienda liquida sobre el precio de contrato por ser igual o superior al valor mínimo fiscal de las tablas del BOE.';
  } else {
    baseLiquidable = valorFiscal;
    criterioBase = 'valor_fiscal';
    justificacionBase = 'Hacienda exige liquidar al menos por el valor fiscal depreciado del BOE para evitar comprobación de valores y liquidación complementaria con recargo.';
  }

  // 2. Determinación del tipo o cuota fija
  let tipoAplicado = com.tipoEfectivo ?? com.tipoGeneral;
  let cuotaITP = 0;
  let esExentoOcuotaCero = false;
  let motivoExencionOCuotaCero: string | null = null;

  // A) Ciclomotores exentos en la comunidad (Cataluña, Baleares, Navarra)
  if (esCiclomotor && com.exencionCiclomotores) {
    esExentoOcuotaCero = true;
    tipoAplicado = 0;
    cuotaITP = 0;
    motivoExencionOCuotaCero = `Exención total de ITP para ciclomotores en ${com.nombre}.`;
  }
  // B) Exención por más de 10 años en Cataluña y Navarra (salvo históricos)
  else if (com.exencionDiezAnios && antiguedad > 10.0 && valorFiscal < com.exencionDiezAnios.maxValor && !esHistorico) {
    esExentoOcuotaCero = true;
    tipoAplicado = 0;
    cuotaITP = 0;
    motivoExencionOCuotaCero = `Exención total en ${com.nombre} para turismos/motos de más de 10 años y valor inferior a 40.000 € (salvo históricos).`;
  }
  // C) Vehículos históricos en Comunitat Valenciana tributan al 8%
  else if (esHistorico && com.slug === 'comunidad-valenciana') {
    tipoAplicado = 8.0;
    cuotaITP = (baseLiquidable * tipoAplicado) / 100;
  }
  // D) Bonificación Etiqueta CERO emisiones (Galicia 0%, Andalucía 1%)
  else if (esCero && com.tipoCeroEmisiones !== undefined) {
    tipoAplicado = com.tipoCeroEmisiones;
    cuotaITP = (baseLiquidable * tipoAplicado) / 100;
    if (tipoAplicado === 0) {
      esExentoOcuotaCero = true;
      motivoExencionOCuotaCero = `Bonificación del 100 % (tipo 0 %) en ${com.nombre} para vehículos CERO emisiones.`;
    }
  }
  // E) Tipo incrementado por alta potencia fiscal (>15 CVF en Andalucía, Asturias, Baleares, Castilla y León)
  else if (com.tipoIncrementado && com.potenciaFiscalIncrementada && potenciaFiscal > com.potenciaFiscalIncrementada) {
    tipoAplicado = com.tipoIncrementado;
    cuotaITP = (baseLiquidable * tipoAplicado) / 100;
  }
  // F) Tipo incrementado por alta cilindrada (>2.000 cc en Comunitat Valenciana)
  else if (com.tipoIncrementado && com.cilindradaIncrementada && cilindrada > com.cilindradaIncrementada) {
    tipoAplicado = com.tipoIncrementado;
    cuotaITP = (baseLiquidable * tipoAplicado) / 100;
  }
  // G) Cuotas fijas para vehículos antiguos (si no son históricos)
  else if (com.cuotasFijasAntiguedad && antiguedad > com.cuotasFijasAntiguedad.minAnios && !esHistorico && cilindrada > 0) {
    if (com.slug === 'cantabria') {
      if (cilindrada <= 999) cuotaITP = 45.0;
      else if (cilindrada <= 1499) cuotaITP = 60.0;
      else if (cilindrada <= 1999) cuotaITP = 90.0;
      else cuotaITP = (baseLiquidable * com.tipoGeneral) / 100;
    } else if (com.slug === 'comunidad-valenciana') {
      if (cilindrada <= 1199) cuotaITP = 40.0;
      else if (cilindrada <= 1599) cuotaITP = 60.0;
      else if (cilindrada <= 1999) cuotaITP = 140.0;
      else cuotaITP = (baseLiquidable * (com.tipoIncrementado || 8.0)) / 100;
    } else if (com.slug === 'galicia' && antiguedad > 15.0) {
      if (cilindrada < 1200) cuotaITP = 22.0;
      else if (cilindrada < 1600) cuotaITP = 38.0;
      else cuotaITP = (baseLiquidable * com.tipoGeneral) / 100;
    } else {
      cuotaITP = (baseLiquidable * tipoAplicado) / 100;
    }
  }
  // H) Tipo general estándar
  else {
    cuotaITP = (baseLiquidable * tipoAplicado) / 100;
  }

  // Tasa DGT
  let tasaDgtImporte = 0;
  let tasaDgtCodigo = '1.5';
  let tasaDgtConcepto = 'Cambio de titularidad';
  let tasaDgtNorma = '';
  let tasaDgtFuente = '';

  if (incluirTasa) {
    const tasaInfo = getTasaTransferencia(anio, esCiclomotor);
    tasaDgtImporte = tasaInfo.importe;
    tasaDgtCodigo = tasaInfo.codigo;
    tasaDgtConcepto = tasaInfo.concepto;
    tasaDgtNorma = tasaInfo.norma;
    tasaDgtFuente = tasaInfo.fuente;
  }

  const cuotaGestoria = incluirGestoria ? 60.0 : 0;
  const totalGastos = cuotaITP + tasaDgtImporte + cuotaGestoria;
  const totalConCompra = precioContrato + totalGastos;

  return {
    anio,
    comunidad: {
      slug: com.slug,
      nombre: com.nombre,
      modelo: com.modelo,
      organismo: com.organismo,
      norma: com.norma,
      fuente: com.fuente,
      estadoVerificacion: com.estadoVerificacion,
      fechaVerificacion: com.fechaVerificacion
    },
    precioContrato: Number(precioContrato.toFixed(2)),
    valorNuevoBoe: Number(valorNuevo.toFixed(2)),
    antiguedadAnios: antiguedad,
    coeficienteDepreciacion: infoFiscal.coeficiente,
    porcentajeDepreciacion: infoFiscal.porcentaje,
    valorFiscalDepreciado: Number(valorFiscal.toFixed(2)),
    baseLiquidable: Number(baseLiquidable.toFixed(2)),
    criterioBase,
    justificacionBase,
    tipoPorcentajeAplicado: Number(tipoAplicado.toFixed(2)),
    cuotaITP: Number(cuotaITP.toFixed(2)),
    esExentoOcuotaCero,
    motivoExencionOCuotaCero,
    tasaDgtImporte: Number(tasaDgtImporte.toFixed(2)),
    tasaDgtCodigo,
    tasaDgtConcepto,
    tasaDgtNorma,
    tasaDgtFuente,
    cuotaGestoria: Number(cuotaGestoria.toFixed(2)),
    totalGastosTransferencia: Number(totalGastos.toFixed(2)),
    totalConCompra: Number(totalConCompra.toFixed(2)),
    norma: com.norma,
    fuente: com.fuente,
    estadoVerificacion: com.estadoVerificacion,
    fechaVerificacion: com.fechaVerificacion,
    avisoLegal: 'Cálculo orientativo con datos fiscales pendientes de revisión contra la fuente. La liquidación oficial definitiva la realiza la administración tributaria autonómica correspondiente.'
  };
}
