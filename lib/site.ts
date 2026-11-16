/**
 * Helper para obtener la URL canónica absoluta del sitio
 */
export function getSiteUrl(): string {
  const url = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  return url.replace(/\/+$/, '');
}

/**
 * Genera una URL absoluta a partir de una ruta
 */
export function absoluteUrl(path: string): string {
  const base = getSiteUrl();
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${base}${cleanPath}`;
}
