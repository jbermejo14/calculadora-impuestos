import Link from 'next/link';
import { getComunidadesList } from '@/lib/itp';

export default function NotFound() {
  const comunidades = getComunidadesList(2026);

  return (
    <main className="main-wrapper">
      <div className="card text-center max-w-2xl mx-auto py-16">
        <div className="text-6xl font-extrabold text-accent font-mono mb-4">404</div>
        <h1 className="text-2xl font-bold mb-3">Página no encontrada</h1>
        <p className="text-muted mb-8 text-sm">
          El trámite, comunidad autónoma o guía solicitada no existe o ha cambiado de dirección.
        </p>

        <div className="flex justify-center gap-4 mb-8">
          <Link href="/" className="btn btn-secondary">
            ← Volver a la Calculadora Principal
          </Link>
        </div>

        <div className="border-t border-line pt-6 text-left">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted mb-3 text-center">
            Calculadoras de ITP por Comunidad Autónoma:
          </h2>
          <div className="flex flex-wrap justify-center gap-2">
            {comunidades.map(com => (
              <Link
                key={com.slug}
                href={`/itp-coche-segunda-mano/${com.slug}`}
                className="text-xs px-3 py-1.5 rounded bg-elevated border border-line hover:border-accent hover:text-accent transition-colors"
              >
                {com.nombre}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
