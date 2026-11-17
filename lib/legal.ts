import titularJson from '@/config/titular.json';

export type TipoTitular = 'persona-fisica' | 'empresa';

export interface Titular {
  tipo: TipoTitular;
  nombre: string;
  nif: string;
  domicilio: string;
  email: string;
  registroMercantil: string;
}

/** Fecha de la última revisión de los textos legales, ISO. */
export const FECHA_TEXTOS_LEGALES = '2026-11-17';

const TIPOS_TITULAR: readonly TipoTitular[] = ['persona-fisica', 'empresa'];
const CAMPOS_TEXTO = ['nombre', 'nif', 'domicilio', 'email', 'registroMercantil'] as const;
const CAMPOS_OBLIGATORIOS = ['nombre', 'nif', 'domicilio', 'email'] as const;

/**
 * Lee y valida config/titular.json. Lanza Error con el campo y el motivo
 * si falta una clave o el tipo no es válido.
 */
export function getTitular(): Titular {
  const datos = titularJson as Record<string, unknown>;
  const tipo = datos.tipo;
  if (typeof tipo !== 'string' || !TIPOS_TITULAR.includes(tipo as TipoTitular)) {
    throw new Error(
      `config/titular.json: el campo "tipo" debe ser "persona-fisica" o "empresa" (valor actual: ${JSON.stringify(tipo)}).`
    );
  }
  for (const campo of CAMPOS_TEXTO) {
    if (typeof datos[campo] !== 'string') {
      throw new Error(`config/titular.json: falta el campo "${campo}" o no es una cadena de texto.`);
    }
  }
  return {
    tipo: tipo as TipoTitular,
    nombre: datos.nombre as string,
    nif: datos.nif as string,
    domicilio: datos.domicilio as string,
    email: datos.email as string,
    registroMercantil: datos.registroMercantil as string
  };
}

function legalEstaVacio(valor: string): boolean {
  return valor.trim() === '';
}

/** Nombres de los campos obligatorios vacíos (registroMercantil solo cuenta para empresa). */
export function camposPendientes(titular: Titular): string[] {
  const campos: Array<keyof Titular> = [...CAMPOS_OBLIGATORIOS];
  if (titular.tipo === 'empresa') campos.push('registroMercantil');
  return campos.filter(campo => legalEstaVacio(titular[campo]));
}

/** Valor del campo o el marcador visible "[pendiente: <campo>]". */
export function valorOPendiente(titular: Titular, campo: keyof Titular): string {
  const valor = titular[campo];
  return legalEstaVacio(valor) ? `[pendiente: ${campo}]` : valor;
}
