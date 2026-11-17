/** Estado de verificación de un dato fiscal frente a su fuente. */
export type EstadoVerificacion = 'pendiente' | 'verificado';

export interface VerificacionDato {
  estadoVerificacion: EstadoVerificacion;
  /** Fecha ISO (YYYY-MM-DD) de la verificación real; null mientras esté pendiente. */
  fechaVerificacion: string | null;
}

const FECHA_ISO = /^(\d{4})-(\d{2})-(\d{2})$/;

/**
 * Devuelve el texto de estado de verificación que se muestra al usuario.
 * Solo afirma "Verificado el {fecha}" si el estado es verificado y la fecha ISO es válida.
 */
export function textoVerificacion(dato: VerificacionDato, anio: number): string {
  const partes = dato.fechaVerificacion ? FECHA_ISO.exec(dato.fechaVerificacion) : null;
  if (dato.estadoVerificacion === 'verificado' && partes) {
    return `Verificado el ${partes[3]}/${partes[2]}/${partes[1]}`;
  }
  return `Datos fiscales de ${anio} pendientes de revisión contra la fuente. Cálculo orientativo.`;
}

/** Etiqueta corta para insignias: "Verificado 2026" solo si el dato está verificado. */
export function etiquetaVerificacion(estado: EstadoVerificacion, anio: number): string {
  return estado === 'verificado' ? `Verificado ${anio}` : `Pendiente de revisión ${anio}`;
}

/**
 * Aviso legal de un cálculo, construido a partir del estado real del dato:
 * no afirma "pendiente" si está verificado ni "verificado" si no lo está.
 * @param liquidador Organismo que realiza la liquidación oficial definitiva.
 */
export function avisoLegalVerificacion(dato: VerificacionDato, anio: number, liquidador: string): string {
  const estado = textoVerificacion(dato, anio);
  const verificado = estado.startsWith('Verificado');
  const introduccion = verificado ? `${estado}. Cálculo orientativo.` : estado;
  return `${introduccion} La liquidación oficial definitiva la realiza ${liquidador}.`;
}
