import { getComunidadesList } from '@/lib/itp';
import { homeWebApplicationJsonLd } from '@/lib/seo';
import { AdSlot } from '@/components/AdSlot';
import { HomeTabs } from '@/components/HomeTabs';

export default function HomePage() {
  const comunidades = getComunidadesList(2026);

  return (
    <main className="main-wrapper">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(homeWebApplicationJsonLd()) }}
      />
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight mb-2">
          Calculadora de Impuestos de Vehículos (2026)
        </h1>
        <p className="text-sm md:text-base text-muted">
          Simulador del <strong>Impuesto de Matriculación (IEDMT)</strong> y del{' '}
          <strong>Impuesto de Transmisiones Patrimoniales (ITP)</strong> para compraventas de segunda mano con tasas DGT actualizadas.
        </p>
      </div>

      <HomeTabs comunidades={comunidades} />

      <AdSlot className="mt-8" />
    </main>
  );
}
