import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getIEDMTData } from '@/lib/iedmt';
import { absoluteUrl, SITE_NAME } from '@/lib/site';
import { descriptionMatriculacionTerritorio, titleMatriculacionTerritorio } from '@/lib/seo';
import { AdSlot } from '@/components/AdSlot';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { CalculadoraMatriculacion } from '@/components/CalculadoraMatriculacion';
import { VerificationNotice } from '@/components/VerificationNotice';
import { etiquetaVerificacion } from '@/lib/verification';

export const dynamicParams = false;

export async function generateStaticParams() {
  const data = getIEDMTData(2026);
  return Object.keys(data.territorios).map(slug => ({
    territorio: slug
  }));
}

export async function generateMetadata({
  params
}: {
  params: Promise<{ territorio: string }>;
}): Promise<Metadata> {
  const { territorio: slug } = await params;
  const data = getIEDMTData(2026);
  const terr = data.territorios[slug];

  if (!terr) {
    return {
      title: 'Territorio no encontrado'
    };
  }

  const title = titleMatriculacionTerritorio(terr.nombre);
  const description = descriptionMatriculacionTerritorio(terr.nombre);
  const canonical = absoluteUrl(`/impuesto-matriculacion/${terr.slug}`);

  return {
    title,
    description,
    alternates: {
      canonical
    },
    openGraph: {
      title,
      description,
      url: canonical,
      type: 'website',
      locale: 'es_ES',
      siteName: SITE_NAME
    }
  };
}

export default async function TerritorioMatriculacionPage({
  params
}: {
  params: Promise<{ territorio: string }>;
}) {
  const { territorio: slug } = await params;
  const data = getIEDMTData(2026);
  const terr = data.territorios[slug];

  if (!terr) {
    notFound();
  }

  const otrosTerritorios = Object.values(data.territorios).filter(t => t.slug !== terr.slug);

  return (
    <main className="main-wrapper">
      <Breadcrumbs
        items={[
          { name: 'Inicio', url: '/' },
          { name: 'Impuesto de Matriculación', url: '/#matriculacion' },
          { name: terr.nombre, url: `/impuesto-matriculacion/${terr.slug}` }
        ]}
      />

      {/* Cabecera */}
      <div className="mb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-soft text-accent text-xs font-bold uppercase tracking-wider mb-2">
          {etiquetaVerificacion(terr.estadoVerificacion, 2026)}
        </div>
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight mb-2">
          Impuesto de Matriculación en {terr.nombre} (2026)
        </h1>
        <p className="text-sm md:text-base text-muted">
          Tipos impositivos del Modelo 576 de la AEAT según emisiones de CO₂ (ciclo WLTP) para {terr.nombre}.
        </p>
      </div>

      {/* Tabla de Tramos */}
      <div className="card mb-8">
        <h2 className="text-lg font-bold mb-3">Tramos de Emisiones de CO₂ en {terr.nombre}</h2>
        <div className="table-responsive mb-4">
          <table className="guide-table">
            <thead>
              <tr>
                <th>Epígrafe</th>
                <th>Rango de Emisiones de CO₂</th>
                <th>Tipo Aplicable (%)</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {terr.tramos.map(tramo => (
                <tr key={tramo.epigrafe}>
                  <td>
                    <span className={`tag ${tramo.tipoPorcentaje === 0 ? 'tag-green' : tramo.tipoPorcentaje >= 13 ? 'tag-red' : ''}`}>
                      Epígrafe {tramo.epigrafe}
                    </span>
                  </td>
                  <td>{tramo.descripcion}</td>
                  <td className="bold orange">{tramo.tipoPorcentaje.toFixed(2).replace('.', ',')} %</td>
                  <td>{tramo.tipoPorcentaje === 0 ? 'Tipo del 0 %' : 'Sujeto a gravamen'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <VerificationNotice
          anio={2026}
          estadoVerificacion={terr.estadoVerificacion}
          fechaVerificacion={terr.fechaVerificacion}
          fuente={terr.fuente}
          norma={terr.norma}
        />
      </div>

      {/* Calculadora Interactiva Preseleccionada */}
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-3">Calcula el Impuesto de Matriculación para {terr.nombre}</h2>
        <CalculadoraMatriculacion initialTerritorio={terr.slug} />
      </div>

      <AdSlot className="mb-8" />

      {/* Otros Territorios */}
      <div className="card">
        <h2 className="text-lg font-bold mb-2">Otros Territorios Fiscales</h2>
        <p className="text-xs text-muted mb-4">
          Consulta la escala de gravamen en los demás regímenes tributarios de España:
        </p>
        <div className="flex flex-wrap gap-3">
          {otrosTerritorios.map(otro => (
            <Link
              key={otro.slug}
              href={`/impuesto-matriculacion/${otro.slug}`}
              className="px-4 py-2 rounded-lg bg-elevated border border-line hover:border-accent hover:text-accent transition-colors text-sm font-semibold"
            >
              {otro.nombre} →
            </Link>
          ))}
        </div>
      </div>

      <AdSlot className="mt-8" />
    </main>
  );
}
