import { absoluteUrl, SITE_NAME } from './site';

/** Longitud máxima permitida del título completo, con el sufijo de marca. */
export const TITLE_MAX_LENGTH = 65;

/** Longitud a la que apunta el título completo, con el sufijo de marca. */
export const TITLE_TARGET_LENGTH = 60;

/** Longitud mínima de una meta descripción. */
export const DESCRIPTION_MIN_LENGTH = 120;

/** Longitud máxima de una meta descripción. */
export const DESCRIPTION_MAX_LENGTH = 160;

/** Sufijo que añade la plantilla del layout (`%s | Ododex`). */
const TITLE_SUFFIX = ` | ${SITE_NAME}`;

const FISCAL_YEAR = 2026;
const DECIMAL_SEPARATOR = ',';
const FREE_PRICE = '0';
const PRICE_CURRENCY = 'EUR';
const APP_CATEGORY = 'FinanceApplication';
const APP_OPERATING_SYSTEM = 'Any';

/** Título de la portada: se usa tal cual, sin sufijo (ya lleva la marca). */
export const HOME_TITLE = `Calculadora de impuestos de vehículos ${FISCAL_YEAR} | ${SITE_NAME}`;

/** Nombre de la aplicación en el JSON-LD de la portada. */
export const HOME_APP_NAME = 'Calculadora de impuestos de vehículos';

/** Meta descripción de la portada. */
export const HOME_DESCRIPTION = `Calcula el impuesto de matriculación (IEDMT) y el ITP de coches de segunda mano en España con los tipos de ${FISCAL_YEAR} y las tasas de la DGT.`;

/**
 * Elige la primera variante cuyo título completo (con sufijo) cabe en el objetivo;
 * si ninguna, la primera que cabe en el máximo; si ninguna, la más corta (la última).
 */
export function seoPickTitle(variants: string[]): string {
  const fullLength = (variant: string) => variant.length + TITLE_SUFFIX.length;
  const onTarget = variants.find(variant => fullLength(variant) <= TITLE_TARGET_LENGTH);
  if (onTarget !== undefined) return onTarget;
  const withinMax = variants.find(variant => fullLength(variant) <= TITLE_MAX_LENGTH);
  return withinMax ?? variants[variants.length - 1];
}

/** Quita la aclaración entre paréntesis del nombre: "País Vasco (Álava, …)" → "País Vasco". */
export function seoShortName(name: string): string {
  return name.replace(/\s*\(.*\)\s*$/, '');
}

/** Formatea un tipo porcentual sin decimales sobrantes: 4 → "4", 5.5 → "5,5". */
export function seoFormatRate(rate: number): string {
  return String(rate).replace('.', DECIMAL_SEPARATOR);
}

/** Título (sin sufijo de marca) de la página de ITP de una comunidad. `rate` es el tipo general (no el efectivo con bonificación de residencia). */
export function titleItpComunidad(name: string, rate: number): string {
  const short = seoShortName(name);
  const tipo = seoFormatRate(rate);
  return seoPickTitle([
    `ITP coche segunda mano en ${short} ${FISCAL_YEAR}: ${tipo} %`,
    `ITP coche segunda mano en ${short}: ${tipo} %`,
    `ITP coche usado en ${short}: ${tipo} %`,
    `ITP coche usado en ${short}`
  ]);
}

/** Meta descripción de la página de ITP de una comunidad. `rate` es el tipo general (no el efectivo con bonificación de residencia). */
export function descriptionItpComunidad(name: string, rate: number): string {
  const short = seoShortName(name);
  const tipo = seoFormatRate(rate);
  return `Calcula el ITP de un coche de segunda mano en ${short} para ${FISCAL_YEAR}: tipo del ${tipo} %, valor fiscal del BOE, exenciones y tasa DGT de transferencia.`;
}

/** Título (sin sufijo de marca) de la página del impuesto de matriculación de un territorio. */
export function titleMatriculacionTerritorio(name: string): string {
  const short = seoShortName(name);
  return seoPickTitle([
    `Impuesto de matriculación en ${short} ${FISCAL_YEAR}: tramos CO2`,
    `Impuesto de matriculación en ${short} ${FISCAL_YEAR}`,
    `Impuesto de matriculación en ${short}`
  ]);
}

/** Meta descripción de la página del impuesto de matriculación de un territorio. */
export function descriptionMatriculacionTerritorio(name: string): string {
  const short = seoShortName(name);
  return `Consulta los tramos de CO2 y los tipos del Impuesto de Matriculación (IEDMT, Modelo 576) en ${short} para ${FISCAL_YEAR} y calcula su importe.`;
}

/** Título (sin sufijo de marca) de una guía: con el año si cabe y, si no, sin él. */
export function titleGuia(title: string): string {
  if (title.includes(String(FISCAL_YEAR))) return title;
  return seoPickTitle([`${title} ${FISCAL_YEAR}`, title]);
}

/** JSON-LD `WebApplication` de la portada. */
export function homeWebApplicationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: HOME_APP_NAME,
    description: HOME_DESCRIPTION,
    url: absoluteUrl('/'),
    applicationCategory: APP_CATEGORY,
    operatingSystem: APP_OPERATING_SYSTEM,
    inLanguage: 'es',
    offers: {
      '@type': 'Offer',
      price: FREE_PRICE,
      priceCurrency: PRICE_CURRENCY
    }
  };
}
