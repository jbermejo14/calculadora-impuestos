/** Ruta de la sección de llamadas a revisión en ododex.com: otra web de la red; se enlaza con un <a> normal, sin basePath. */
export const REVIEW_CALLS_PATH = '/es/llamadas-revision';

/** Tarjeta contextual hacia la web de llamadas a revisión. */
export function FaqReviewCallsCard() {
  return (
    <div className="card mb-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-fg">¿Vas a comprar este coche?</h2>
          <p className="text-sm text-muted mt-1">
            Comprueba si tiene llamadas a revisión pendientes antes de firmar el contrato.
          </p>
        </div>
        <a href={REVIEW_CALLS_PATH} className="btn btn-secondary shrink-0">
          Consultar llamadas a revisión →
        </a>
      </div>
    </div>
  );
}
