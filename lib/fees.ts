import tasasDgt2026 from '../data/2026/tasas-dgt.json';

export interface TasaDgtInfo {
  codigo: string;
  concepto: string;
  importe: number;
  norma: string;
  fuente: string;
  fechaVerificacion: string;
  verificado: boolean;
}

export interface TasasDgtData {
  anio: number;
  norma: string;
  fuente: string;
  fechaVerificacion: string;
  verificado: boolean;
  tasas: {
    transferenciaOrdinaria: TasaDgtInfo;
    transferenciaCiclomotor: TasaDgtInfo;
    matriculacionOrdinaria: TasaDgtInfo;
    matriculacionCiclomotor: TasaDgtInfo;
    informeVehiculo: TasaDgtInfo;
  };
}

const REGISTRO_TASAS_POR_ANIO: Record<number, TasasDgtData> = {
  2026: tasasDgt2026 as unknown as TasasDgtData
};

/**
 * Carga los datos de tasas DGT del año fiscal especificado
 */
export function getTasasDgtData(anio: number = 2026): TasasDgtData {
  const data = REGISTRO_TASAS_POR_ANIO[anio];
  if (!data) {
    throw new Error(`No existen datos fiscales de tasas DGT para el año fiscal ${anio}`);
  }
  return data;
}

/**
 * Devuelve la tasa DGT para cambio de titularidad / transferencia de vehículos
 * @param anio Año fiscal (ej. 2026)
 * @param esCiclomotor Indica si el vehículo es un ciclomotor (Tasa 1.2 en lugar de Tasa 1.5)
 */
export function getTasaTransferencia(anio: number = 2026, esCiclomotor: boolean = false): TasaDgtInfo {
  const data = getTasasDgtData(anio);
  return esCiclomotor ? data.tasas.transferenciaCiclomotor : data.tasas.transferenciaOrdinaria;
}

/**
 * Devuelve la tasa DGT para primera matriculación de vehículos
 * @param anio Año fiscal (ej. 2026)
 * @param esCiclomotor Indica si el vehículo es un ciclomotor
 */
export function getTasaMatriculacion(anio: number = 2026, esCiclomotor: boolean = false): TasaDgtInfo {
  const data = getTasasDgtData(anio);
  return esCiclomotor ? data.tasas.matriculacionCiclomotor : data.tasas.matriculacionOrdinaria;
}

/**
 * Devuelve la tasa DGT para informe de vehículo (cargas, embargos, titularidad)
 * @param anio Año fiscal (ej. 2026)
 */
export function getTasaInforme(anio: number = 2026): TasaDgtInfo {
  const data = getTasasDgtData(anio);
  return data.tasas.informeVehiculo;
}
