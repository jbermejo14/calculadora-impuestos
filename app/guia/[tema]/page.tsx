import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import guias2026 from '@/data/2026/guias.json';
import { absoluteUrl, SITE_NAME } from '@/lib/site';
import { titleGuia } from '@/lib/seo';
import { AdSlot } from '@/components/AdSlot';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { VerificationNotice } from '@/components/VerificationNotice';
import { getDepreciacionData } from '@/lib/itp';
import { getTasasDgtData, getTasaTransferencia } from '@/lib/fees';
import { FaqSection, type FaqItem } from '@/components/FaqSection';
import { getIEDMTData } from '@/lib/iedmt';
import { etiquetaVerificacion } from '@/lib/verification';

export const dynamicParams = false;

const TERRITORIO_GENERAL = 'peninsula-y-baleares';
const TIPO_ALTO_MINIMO = 13;

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
      title: 'Guía no encontrada'
    };
  }

  const title = titleGuia(guia.titulo);
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
      siteName: SITE_NAME
    }
  };
}

function formatImporte(importe: number): string {
  return `${importe.toFixed(2).replace('.', ',')} €`;
}

/** Preguntas frecuentes por guía; solo se redactan con datos que existen en data/2026. */
function buildGuiaFaqs(slug: string, guia: any): FaqItem[] {
  const tasaTransferencia = getTasaTransferencia(2026);
  const tasaCiclomotor = getTasaTransferencia(2026, true);

  switch (slug) {
    case 'documentacion-tramitar':
      return [
        {
          question: '¿Qué documentos son obligatorios para cambiar de titular un coche en la DGT?',
          answer: `${(guia.contenido.requisitos as string[]).join(' ')}`
        },
        {
          question: '¿Cuánto cuesta la tasa de la DGT para el cambio de titularidad?',
          answer: `La tasa ${tasaTransferencia.codigo} de cambio de titularidad es de ${formatImporte(tasaTransferencia.importe)} para turismos y motocicletas; para ciclomotores, la tasa ${tasaCiclomotor.codigo} es de ${formatImporte(tasaCiclomotor.importe)}.`
        }
      ];
    case 'depreciacion-boe':
      return [
        {
          question: '¿Cómo calcula Hacienda el valor mínimo de un coche usado?',
          answer: guia.contenido.resumen
        },
        {
          question: '¿Qué base imponible se declara si el precio del contrato es inferior al valor del BOE?',
          answer: guia.contenido.reglaHacienda
        }
      ];
    case 'tasas-dgt':
      return [
        {
          question: `¿Cuál es el importe de la tasa ${tasaTransferencia.codigo} de la DGT para el cambio de titularidad en 2026?`,
          answer: `El importe fijado para turismos, furgonetas y motocicletas es de ${formatImporte(tasaTransferencia.importe)}. Para ciclomotores se aplica la tasa ${tasaCiclomotor.codigo}, de ${formatImporte(tasaCiclomotor.importe)}.`
        }
      ];
    case 'tramos-iedmt':
      return [
        {
          question: '¿Qué reducciones y exenciones tiene el Impuesto de Matriculación (IEDMT)?',
          answer: (guia.contenido.bonificaciones as { titulo: string; detalle: string }[])
            .map(b => `${b.titulo}: ${b.detalle}`)
            .join(' ')
        },
        {
          question: '¿Cómo se liquida el Impuesto de Matriculación ante la Agencia Tributaria?',
          answer: guia.contenido.resumen
        }
      ];
    default:
      return [];
  }
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
  const tramosIedmt = getIEDMTData(2026).territorios[TERRITORIO_GENERAL].tramos;

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
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-soft text-accent text-xs font-bold uppercase tracking-wider mb-2">
          {etiquetaVerificacion(guia.estadoVerificacion, 2026)}
        </div>
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight mb-2">
          {guia.titulo}
        </h1>
        <p className="text-sm md:text-base text-muted">
          {guia.descripcion}
        </p>
      </div>

      <div className="card mb-8">
        <div className="max-w-none text-sm text-fg leading-relaxed mb-6">
          <p className="text-base">{guia.contenido.resumen}</p>
        </div>

        {/* Contenido Específico según el Tema */}
        {slug === 'tramos-iedmt' && (
          <div>
            <h2 className="text-lg font-bold mb-3">Epígrafes y Tipos Impositivos (Península e Islas Baleares)</h2>
            <div className="table-responsive mb-6">
              <table className="guide-table">
                <thead>
                  <tr>
                    <th>Epígrafe</th>
                    <th>Emisiones de CO₂</th>
                    <th>Tipo Impositivo</th>
                  </tr>
                </thead>
                <tbody>
                  {tramosIedmt.map(tr => (
                    <tr key={tr.epigrafe}>
                      <td><span className={`tag ${tr.tipoPorcentaje === 0 ? 'tag-green' : tr.tipoPorcentaje >= TIPO_ALTO_MINIMO ? 'tag-red' : ''}`}>Epígrafe {tr.epigrafe}</span></td>
                      <td>{tr.descripcion}</td>
                      <td className="bold orange">{tr.tipoPorcentaje.toFixed(2).replace('.', ',')} %</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <h3 className="text-base font-bold mb-2">Bonificaciones y Exenciones</h3>
            <ul className="guide-list mb-6">
              {guia.contenido.bonificaciones.map((b: any) => (
                <li key={b.titulo}>
                  <strong>{b.titulo}:</strong> {b.detalle}
                </li>
              ))}
            </ul>

            <div className="pt-4 border-t border-line">
              <Link href="/#matriculacion" className="btn btn-secondary">
                Ir a la Calculadora de Matriculación →
              </Link>
            </div>
          </div>
        )}

        {slug === 'depreciacion-boe' && (
          <div>
            <h2 className="text-lg font-bold mb-2">Escala de Porcentajes de Depreciación por Antigüedad (Anexo IV)</h2>
            <p className="text-xs text-muted mb-4">{guia.contenido.reglaHacienda}</p>

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
                      <td className="font-medium text-fg">{tr.etiqueta}</td>
                      <td className="bold orange">{tr.porcentaje} %</td>
                      <td className="font-mono text-fg">{tr.coeficiente.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="pt-4 border-t border-line">
              <Link href="/#transferencia" className="btn btn-secondary">
                Calcular valor venal de tu coche →
              </Link>
            </div>
          </div>
        )}

        {slug === 'tasas-dgt' && (
          <div>
            <h2 className="text-lg font-bold mb-3">Tarifas de la Jefatura Central de Tráfico (DGT)</h2>
            <div className="table-responsive mb-6">
              <table className="guide-table">
                <thead>
                  <tr>
                    <th>Código de Tasa</th>
                    <th>Concepto del Trámite</th>
                    <th>Importe según la norma</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(tasasData.tasas).map(([clave, tasa]) => (
                    <tr key={clave}>
                      <td><span className="tag">{tasa.codigo}</span></td>
                      <td>{tasa.concepto}</td>
                      <td className="bold orange">{tasa.importe.toFixed(2).replace('.', ',')} €</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="pt-4 border-t border-line">
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

            <div className="pt-4 border-t border-line">
              <Link href="/#transferencia" className="btn btn-secondary">
                Ir a la Calculadora de Transferencia →
              </Link>
            </div>
          </div>
        )}

        <div className="mt-6">
          <VerificationNotice
            anio={2026}
            estadoVerificacion={guia.estadoVerificacion}
            fechaVerificacion={guia.fechaVerificacion}
            fuente={guia.fuente}
            norma={guia.norma}
          />
        </div>
      </div>

      <FaqSection title={`Preguntas Frecuentes sobre ${guia.titulo}`} items={buildGuiaFaqs(slug, guia)} />

      <AdSlot className="mb-8" />

      {/* Otras Guías */}
      <div className="card">
        <h2 className="text-lg font-bold mb-2">Otras Guías Fiscales y de Tráfico</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
          {otrosTemas.map((otra: any) => (
            <Link
              key={otra.slug}
              href={`/guia/${otra.slug}`}
              className="p-3 rounded-lg bg-elevated border border-line hover:border-accent hover:text-accent transition-colors text-sm"
            >
              <div className="font-bold mb-1">{otra.titulo}</div>
              <div className="text-xs text-muted line-clamp-2">{otra.descripcion}</div>
            </Link>
          ))}
        </div>
      </div>

      <AdSlot className="mt-8" />
    </main>
  );
}
