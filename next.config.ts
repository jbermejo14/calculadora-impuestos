import type { NextConfig } from 'next';

// Debe coincidir con BASE_PATH de lib/site.ts (lo comprueba tests/site.test.ts).
// No se importa de allí porque Next compila este fichero a ESM y no resuelve
// importaciones TypeScript sin extensión.
const BASE_PATH = '/es/impuestos';

const nextConfig: NextConfig = {
  basePath: BASE_PATH,
  reactStrictMode: true
};

export default nextConfig;
