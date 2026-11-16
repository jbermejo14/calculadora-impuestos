import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import guias2026 from '@/data/2026/guias.json';
import { absoluteUrl } from '@/lib/site';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { VerificationNotice } from '@/components/VerificationNotice';
import { getDepreciacionData } from '@/lib/itp';
import { getTasasDgtData } from '@/lib/fees';

export const dynamicParams = false;

export async function generateStaticParams() {
  return Object.keys(guias2026.temas).map(slug => ({
    tema: slug
  }));
}

export async function generateMetadata({
  params
}: {
  params: Promise<{ tema: string }>;
}): Promise<Metadata> {
  const { tema: slug } = await params;
  const guia = (guias2026.temas as Record<string, any>)[slug];

  if (!guia) {
    return {
      title: 'Guía no encontrada | AutoTax'
    };
  }

  const title = `${guia.titulo} 2026 | AutoTax`;
  const description = guia.descripcion;
  const canonical = absoluteUrl(`/guia/${guia.slug}`);

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
      type: 'article',
      locale: 'es_ES',
      siteName: 'AutoTax'
    }
  };
}

export default async function GuiaTemaPage({
  params
}: {
  params: Promise<{ tema: string }>;
}) {
  const { tema: slug } = await params;
  const guia = (guias2026.temas as Record<string, any>)[slug];

  if (!guia) {
    notFound();
  }

  const otrosTemas = Object.values(guias2026.temas).filter((g: any) => g.slug !== guia.slug) as any[];
  const depreciacionData = getDepreciacionData(2026);
  const tasasData = getTasasDgtData(2026);

  return (
    <main className="main-wrapper">
      <Breadcrumbs
        items={[
          { name: 'Inicio', url: '/' },
          { name: 'Guías y Normativa', url: '/#guia' },
          { name: guia.titulo, url: `/guia/${guia.slug}` }
        ]}
      />

      <div className="mb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/15 text-orange-500 text-xs font-bold uppercase tracking-wider mb-2">
          Normativa Vigente 2026
        </div>
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight mb-2">
          {guia.titulo}
        </h1>
        <p className="text-sm md:text-base text-slate-400">
          {guia.descripcion}
        </p>
      </div>

      <div className="card mb-8">
        <div className="prose prose-invert max-w-none text-sm text-slate-300 leading-relaxed mb-6">
          <p className="text-base">{guia.contenido.resumen}</p>
        </div>

        {/* Contenido Específico según el Tema */}
        {slug === 'tramos-iedmt' && (
          <div>
            <h2 className="text-lg font-bold mb-3">Tramos de Emisiones de CO₂ y Tipos Impositivos (Península e Islas Baleares)</h2>
            <div className="table-responsive mb-6">
              <table className="guide-table">
                <thead>
                  <tr>
                    <th>Epígrafe</th>
                    <th>Emisiones oficiales de CO₂</th>
                    <th>Tipo Impositivo</th>
                  </tr>
                </thead>
                <tbody>
                  {guia.contenido.tramosGeneral.map((tr: any) => (
                    <tr key={tr.epigrafe}>
                      <td><span className={`tag ${tr.destacado ? 'tag-green' : ''}`}>{tr.epigrafe}</span></td>
                      <td>{tr.rango}</td>
                      <td className="bold orange">{tr.tipo}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <h3 className="text-base font-bold mb-2">Bonificaciones y Exenciones Oficiales</h3>
            <ul className="guide-list mb-6">
              {guia.contenido.bonificaciones.map((b: any) => (
                <li key={b.titulo}>
                  <strong>{b.titulo}:</strong> {b.detalle}
                </li>
              ))}
            </ul>

            <div className="pt-4 border-t border-zinc-800">
              <Link href="/#matriculacion" className="btn btn-secondary">
                Ir a la Calculadora de Matriculación →
              </Link>
            </div>
          </div>
        )}

        {slug === 'depreciacion-boe' && (
          <div>
            <h2 className="text-lg font-bold mb-2">Escala de Porcentajes de Depreciación por Antigüedad (Anexo IV)</h2>
            <p className="text-xs text-slate-400 mb-4">{guia.contenido.reglaHacienda}</p>

            <div className="table-responsive mb-6">
              <table className="guide-table">
                <thead>
                  <tr>
                    <th>Años de utilización</th>
                    <th>Porcentaje s/ valor de nuevo</th>
                    <th>Coeficiente aplicable</th>
                  </tr>
                </thead>
                <tbody>
                  {depreciacionData.tramos.map(tr => (
                    <tr key={tr.etiqueta}>
                      <td className="font-medium text-slate-200">{tr.etiqueta}</td>
                      <td className="bold orange">{tr.porcentaje} %</td>
                      <td className="font-mono text-slate-300">{tr.coeficiente.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="pt-4 border-t border-zinc-800">
              <Link href="/#transferencia" className="btn btn-secondary">
                Calcular valor venal de tu coche →
              </Link>
            </div>
          </div>
        )}

        {slug === 'tasas-dgt' && (
          <div>
            <h2 className="text-lg font-bold mb-3">Tarifas Oficiales de la Jefatura Central de Tráfico (DGT)</h2>
            <div className="table-responsive mb-6">
              <table className="guide-table">
                <thead>
                  <tr>
                    <th>Código de Tasa</th>
                    <th>Concepto del Trámite</th>
                    <th>Importe Oficial</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.values(tasasData.tasas).map(tasa => (
                    <tr key={tasa.codigo}>
                      <td><span className="tag">{tasa.codigo}</span></td>
                      <td>{tasa.concepto}</td>
                      <td className="bold orange">{tasa.importe.toFixed(2).replace('.', ',')} €</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="pt-4 border-t border-zinc-800">
              <Link href="/#transferencia" className="btn btn-secondary">
                Calcular transferencia con tasas DGT →
              </Link>
            </div>
          </div>
        )}

        {slug === 'documentacion-tramitar' && (
          <div>
            <h2 className="text-lg font-bold mb-3">Requisitos Documentales para Tráfico y Hacienda</h2>
            <ul className="guide-list mb-6">
              {guia.contenido.requisitos.map((req: string, idx: number) => (
                <li key={idx}>{req}</li>
              ))}
            </ul>

            <div className="pt-4 border-t border-zinc-800">
              <Link href="/#transferencia" className="btn btn-secondary">
                Ir a la Calculadora de Transferencia →
              </Link>
            </div>
          </div>
        )}

        <div className="mt-6">
          <VerificationNotice
            anio={2026}
            fechaVerificacion={guia.fechaVerificacion}
            fuente={guia.fuente}
            norma={guia.norma}
          />
        </div>
      </div>

      {/* Otras Guías */}
      <div className="card">
        <h2 className="text-lg font-bold mb-2">Otras Guías Fiscales y de Tráfico</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
          {otrosTemas.map((otra: any) => (
            <Link
              key={otra.slug}
              href={`/guia/${otra.slug}`}
              className="p-3 rounded-lg bg-zinc-800 border border-zinc-700 hover:border-orange-500 hover:text-white transition-colors text-sm"
            >
              <div className="font-bold mb-1">{otra.titulo}</div>
              <div className="text-xs text-slate-400 line-clamp-2">{otra.descripcion}</div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
