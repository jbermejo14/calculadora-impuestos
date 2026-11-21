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

const GUIDE_FAQS: Record<string, { question: string; answer: string }[]> = {
  'documentacion-tramitar': [
    {
      question: '¿Qué documentos son obligatorios para cambiar de titular un coche en la DGT?',
      answer: 'Es imprescindible el contrato de compraventa firmado por comprador y vendedor, fotocopia del DNI de ambas partes, permiso de circulación del vehículo, justificante de pago del ITP autonómico (Modelo 620 o 621) y el justificante de pago de la tasa 1.5 de la DGT.'
    },
    {
      question: '¿Qué plazo hay para pagar el ITP y tramitar la transferencia?',
      answer: 'El plazo legal para autoliquidar el ITP ante la Agencia Tributaria autonómica es generalmente de 30 días hábiles desde la fecha del contrato. Una vez pagado el ITP, se dispone del mismo plazo para solicitar el cambio de titularidad en la DGT.'
    },
    {
      question: '¿Quién debe pagar las tasas de transferencia de la DGT?',
      answer: 'Por norma general, las tasas de Tráfico (tasa 1.5 de 55,70 €) y el impuesto ITP corresponden al comprador, salvo acuerdo explícito en contrario reflejado en el contrato de compraventa.'
    }
  ],
  'depreciacion-boe': [
    {
      question: '¿Cómo calcula Hacienda el valor mínimo de un coche usado?',
      answer: 'Hacienda consulta las tablas de precios medios de venta publicadas anualmente en el BOE para cada marca, modelo y versión comercial, y aplica los coeficientes porcentuales reductores según los años de antigüedad del vehículo desde su primera matriculación.'
    },
    {
      question: '¿Qué ocurre si el precio del contrato es inferior al valor fiscal del BOE?',
      answer: 'La base imponible del ITP se calculará siempre sobre el valor fiscal depreciado del BOE si este es mayor que el precio de compraventa. Si se declara una cifra inferior al valor BOE, la Agencia Tributaria autonómica puede emitir una liquidación complementaria con recargo e intereses.'
    }
  ],
  'tasas-dgt': [
    {
      question: '¿Cuál es el importe de la tasa 1.5 de la DGT para cambio de titularidad en 2026?',
      answer: 'El importe oficial fijado por la DGT para turismos, furgonetas y motocicletas es de 55,70 €. Para ciclomotores se aplica la tasa reducida de 27,85 €.'
    },
    {
      question: '¿Se pueden pagar las tasas de la DGT en efectivo en las jefaturas?',
      answer: 'No. La DGT no admite pagos en metálico en sus oficinas. Las tasas deben abonarse con tarjeta de crédito/débito en ventanilla, telemáticamente a través de la sede electrónica de la DGT o mediante cargo en cuenta en entidades bancarias colaboradoras (Modelo 791).'
    }
  ],
  'tramos-iedmt': [
    {
      question: '¿Qué vehículos están exentos de pagar el Impuesto de Matriculación (IEDMT)?',
      answer: 'Están exentos (tipo del 0 %) los turismos cuyas emisiones oficiales de CO₂ no superen los 120 g/km (ciclo WLTP), los vehículos 100% eléctricos (BEV), así como los adaptados para personas con movilidad reducida o familias numerosas (bonificación del 50%).'
    },
    {
      question: '¿Cómo se liquida el Impuesto de Matriculación ante la Agencia Tributaria?',
      answer: 'Se presenta telemáticamente a través de la sede electrónica de la AEAT mediante el Modelo 576, requiriendo el certificado digital, DNI electrónico o Cl@ve PIN del titular.'
    }
  ]
};

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
  const faqs = GUIDE_FAQS[slug] || [];

  const jsonLdFaq = faqs.length > 0 ? {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(f => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: f.answer
      }
    }))
  } : null;

  return (
    <main className="main-wrapper">
      {jsonLdFaq && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdFaq) }}
        />
      )}
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
                    <th>Emisiones de CO₂</th>
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

            <h3 className="text-base font-bold mb-2">Bonificaciones y Exenciones</h3>
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
            estadoVerificacion={guia.estadoVerificacion}
            fechaVerificacion={guia.fechaVerificacion}
            fuente={guia.fuente}
            norma={guia.norma}
          />
        </div>
      </div>

      {/* Preguntas Frecuentes del Tema */}
      {faqs.length > 0 && (
        <div className="card mb-8">
          <h2 className="text-lg font-bold mb-3">Preguntas Frecuentes sobre {guia.titulo}</h2>
          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div key={idx} className="p-4 rounded-lg bg-zinc-900/60 border border-zinc-800">
                <h3 className="font-semibold text-sm text-slate-100 mb-1.5">{faq.question}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tarjeta de Enlazado Cruzado con Llamadas a Revisión */}
      <div className="card mb-8 border border-orange-500/30 bg-orange-500/5 p-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="text-xs font-bold text-orange-500 uppercase tracking-wider mb-1">
              Seguridad del vehículo de ocasión
            </div>
            <h3 className="text-base font-bold text-slate-100">
              ¿Vas a comprar este coche? Comprueba si tiene campañas de seguridad pendientes en la UE
            </h3>
            <p className="text-xs text-slate-400 mt-1 max-w-xl">
              Antes de tramitar el cambio de titularidad en la DGT, verifica gratis en el sistema oficial Safety Gate
              si la marca ha llamado a revisión este modelo por defectos de seguridad en airbags, frenos o dirección.
            </p>
          </div>
          <a
            href="https://ododex.com/es/llamadas-revision"
            className="btn btn-primary shrink-0 inline-flex items-center gap-2"
          >
            <span>Consultar llamadas a revisión</span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4" aria-hidden="true">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </a>
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
