import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import {
  getComunidadesList,
  getComunidadITP,
  calcularITP,
  getTipoEfectivoITP,
  etiquetaCuotaCeroITP,
  type ComunidadITPData
} from '@/lib/itp';
import { getTasaTransferencia } from '@/lib/fees';
import { etiquetaVerificacion } from '@/lib/verification';
import { absoluteUrl, SITE_NAME } from '@/lib/site';
import { descriptionItpComunidad, titleItpComunidad } from '@/lib/seo';
import { AdSlot } from '@/components/AdSlot';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { CalculadoraTransferencia } from '@/components/CalculadoraTransferencia';
import { VerificationNotice } from '@/components/VerificationNotice';
import { FaqSection, type FaqItem } from '@/components/FaqSection';
import { FaqReviewCallsCard } from '@/components/FaqReviewCallsCard';

export const dynamicParams = false;

const ANIO_FISCAL = 2026;
const DECIMALES_TIPO = 1;
const EJEMPLO_5_ANIOS = { precioContrato: 10000, valorNuevoBoe: 22000, antiguedadAnios: 5 };
const EJEMPLO_10_ANIOS = { precioContrato: 2500, valorNuevoBoe: 14000, antiguedadAnios: 10 };

export async function generateStaticParams() {
  const comunidades = getComunidadesList(2026);
  return comunidades.map(com => ({
    comunidad: com.slug
  }));
}

export async function generateMetadata({
  params
}: {
  params: Promise<{ comunidad: string }>;
}): Promise<Metadata> {
  const { comunidad: slug } = await params;
  try {
    const com = getComunidadITP(2026, slug);
    const title = titleItpComunidad(com.nombre, com.tipoGeneral);
    const description = descriptionItpComunidad(com.nombre, com.tipoGeneral);
    const canonical = absoluteUrl(`/itp-coche-segunda-mano/${com.slug}`);

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
  } catch {
    return {
      title: 'Comunidad no encontrada'
    };
  }
}

function formatTipo(tipo: number): string {
  return tipo.toFixed(DECIMALES_TIPO).replace('.', ',');
}

/** Texto bajo el tipo general: explica la bonificación de residencia (Ceuta y Melilla) si existe. */
function textoTipoEfectivo(com: ComunidadITPData): string {
  if (com.bonificacionResidencia === undefined) return 'Sobre la base imponible mayor';
  return `(Tipo general ${formatTipo(com.tipoGeneral)} % con bonificación de residencia del ${formatTipo(com.bonificacionResidencia)} % = efectivo ${formatTipo(getTipoEfectivoITP(com))} %)`;
}

function formatEUR(val: number): string {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(val);
}

function buildComunidadFaqs(
  com: ComunidadITPData,
  tasaOrdinaria: { codigo: string; importe: number },
  tasaCiclomotorImporte: number
): FaqItem[] {
  return [
    {
      question: `¿Qué tipo de ITP se aplica a un coche de segunda mano en ${com.nombre}?`,
      answer: `En ${com.nombre}, el tipo del Impuesto de Transmisiones Patrimoniales (ITP) para vehículos usados es del ${formatTipo(getTipoEfectivoITP(com))} %. Se liquida sobre el valor mayor entre el precio de venta en contrato y el valor mínimo fiscal de las tablas oficiales del BOE, con los coeficientes de depreciación por antigüedad.`
    },
    {
      question: `¿Qué modelo hay que presentar para pagar el ITP en ${com.nombre}?`,
      answer: `El trámite se liquida ante ${com.organismo} mediante el ${com.modelo}.`
    },
    {
      question: `¿Cuánto cuesta en total transferir un coche en ${com.nombre}?`,
      answer: `El coste total se compone de la cuota del ITP autonómico más la tasa ${tasaOrdinaria.codigo} de la DGT para el cambio de titularidad (${formatEUR(tasaOrdinaria.importe)} para turismos y motos, o ${formatEUR(tasaCiclomotorImporte)} para ciclomotores).`
    }
  ];
}

export default async function ComunidadPage({
  params
}: {
  params: Promise<{ comunidad: string }>;
}) {
  const { comunidad: slug } = await params;

  let com;
  try {
    com = getComunidadITP(2026, slug);
  } catch {
    notFound();
  }

  const todasComunidades = getComunidadesList(2026);
  const otrasComunidades = todasComunidades.filter(c => c.slug !== com.slug);

  // Ejemplo 1: Coche de 5 años (Valor nuevo BOE 22.000 €, depreciación 47 % -> 10.340 €)
  const ejemplo5 = calcularITP({
    anio: ANIO_FISCAL,
    comunidadSlug: com.slug,
    ...EJEMPLO_5_ANIOS,
    incluirTasaDgt: true
  });

  // Ejemplo 2: Coche de 10 años (Valor nuevo BOE 14.000 €, depreciación 19 % -> 2.660 €)
  const ejemplo10 = calcularITP({
    anio: ANIO_FISCAL,
    comunidadSlug: com.slug,
    ...EJEMPLO_10_ANIOS,
    incluirTasaDgt: true
  });
  const tasaOrdinaria = getTasaTransferencia(ANIO_FISCAL);
  const tasaCiclomotor = getTasaTransferencia(ANIO_FISCAL, true);

  return (
    <main className="main-wrapper">
      <Breadcrumbs
        items={[
          { name: 'Inicio', url: '/' },
          { name: 'ITP Vehículos Usados', url: '/#transferencia' },
          { name: com.nombre, url: `/itp-coche-segunda-mano/${com.slug}` }
        ]}
      />

      {/* Cabecera de la Comunidad */}
      <div className="mb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-soft text-accent text-xs font-bold uppercase tracking-wider mb-2">
          {etiquetaVerificacion(com.estadoVerificacion, ANIO_FISCAL)}
        </div>
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight mb-2">
          ITP de Vehículos Usados en {com.nombre} (2026)
        </h1>
        <p className="text-sm md:text-base text-muted">
          Guía tributaria, tipos impositivos aplicables, modelos de autoliquidación (<strong>{com.modelo}</strong>) y calculadora interactiva para la compraventa de coches de segunda mano entre particulares.
        </p>
      </div>

      {/* Ficha Resumen de la Comunidad */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="card py-4 px-5">
          <div className="text-xs text-muted font-semibold uppercase tracking-wider">Tipo General ITP</div>
          <div className="text-3xl font-extrabold text-accent font-mono mt-1">
            {formatTipo(getTipoEfectivoITP(com))} %
          </div>
          <div className="text-xs text-muted mt-1">
            {textoTipoEfectivo(com)}
          </div>
        </div>

        <div className="card py-4 px-5">
          <div className="text-xs text-muted font-semibold uppercase tracking-wider">Modelo de Tributación</div>
          <div className="text-lg font-bold text-fg mt-1">{com.modelo}</div>
          <div className="text-xs text-muted mt-1">{com.organismo}</div>
        </div>

        <div className="card py-4 px-5">
          <div className="text-xs text-muted font-semibold uppercase tracking-wider">Tasa DGT de Transferencia</div>
          <div className="text-2xl font-extrabold text-fg font-mono mt-1">{formatEUR(tasaOrdinaria.importe)}</div>
          <div className="text-xs text-muted mt-1">
            Tasa {tasaOrdinaria.codigo} DGT general (ciclomotores, tasa {tasaCiclomotor.codigo}: {formatEUR(tasaCiclomotor.importe)})
          </div>
        </div>
      </div>

      {/* Normativa y Bonificaciones Específicas */}
      <div className="card mb-8">
        <h2 className="text-lg font-bold mb-3">Particularidades Fiscales y Exenciones en {com.nombre}</h2>
        <ul className="guide-list text-sm">
          <li>
            <strong>Normativa reguladora:</strong> {com.norma}.
          </li>
          <li>
            <strong>Casos específicos:</strong> {com.notas}
          </li>
          {com.exencionDiezAnios && (
            <li>
              <strong>{com.exencionDiezAnios.clasificacion === 'exencion' ? 'Exención por antigüedad' : 'Sin obligación de autoliquidar por antigüedad'}:</strong> {com.exencionDiezAnios.descripcion}
            </li>
          )}
          {com.exencionCiclomotores && (
            <li>
              <strong>Ciclomotores:</strong> {com.exencionCiclomotoresDescripcion ?? `Cuota de ITP de 0 € en ${com.nombre}.`}
            </li>
          )}
          {com.cuotasFijasAntiguedad && (
            <li>
              <strong>Cuotas fijas por antigüedad:</strong> {com.cuotasFijasAntiguedad.descripcion}.
            </li>
          )}
        </ul>

        <div className="mt-4">
          <VerificationNotice
            anio={2026}
            estadoVerificacion={com.estadoVerificacion}
            fechaVerificacion={com.fechaVerificacion}
            fuente={com.fuente}
            norma={com.norma}
          />
        </div>
      </div>

      {/* Ejemplos Reales Calculados */}
      <div className="card mb-8">
        <h2 className="text-lg font-bold mb-2">Ejemplos Reales de Transferencia en {com.nombre}</h2>
        <p className="text-sm text-muted mb-6">
          Cálculos con cifras reales aplicando el valor fiscal según la Orden Ministerial del BOE, los coeficientes de depreciación y las tasas de Tráfico:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Ejemplo 1 */}
          <div className="p-4 rounded-lg bg-elevated border border-line">
            <div className="text-xs font-bold text-accent uppercase tracking-wider mb-1">Ejemplo 1: Turismo de 5 años</div>
            <div className="text-sm font-semibold mb-3">Seat León / VW Golf (Valor nuevo BOE: {formatEUR(EJEMPLO_5_ANIOS.valorNuevoBoe)})</div>
            <ul className="text-xs text-fg space-y-1.5 mb-4">
              <li>&bull; Precio pactado en contrato: <strong>{formatEUR(EJEMPLO_5_ANIOS.precioContrato)}</strong></li>
              <li>&bull; Coeficiente antigüedad ({EJEMPLO_5_ANIOS.antiguedadAnios} años): <strong>{ejemplo5.porcentajeDepreciacion} %</strong></li>
              <li>&bull; Valor fiscal mínimo BOE: <strong>{formatEUR(ejemplo5.valorFiscalDepreciado)}</strong></li>
              <li>&bull; Base imponible aplicada: <strong>{formatEUR(ejemplo5.baseLiquidable)}</strong> (la mayor)</li>
              <li>&bull; Cuota ITP ({ejemplo5.tipoPorcentajeAplicado} %): <strong className="text-accent">{formatEUR(ejemplo5.cuotaITP)}</strong></li>
              <li>&bull; Tasa DGT {ejemplo5.tasaDgtCodigo} cambio de nombre: <strong>{formatEUR(ejemplo5.tasaDgtImporte)}</strong></li>
            </ul>
            <div className="pt-3 border-t border-line flex justify-between items-center text-sm">
              <span className="font-bold">Total Gastos Transferencia:</span>
              <span className="font-mono font-extrabold text-accent">{formatEUR(ejemplo5.totalGastosTransferencia)}</span>
            </div>
          </div>

          {/* Ejemplo 2 */}
          <div className="p-4 rounded-lg bg-elevated border border-line">
            <div className="text-xs font-bold text-accent uppercase tracking-wider mb-1">Ejemplo 2: Turismo de 10 años</div>
            <div className="text-sm font-semibold mb-3">Renault Clio / Ford Fiesta (Valor nuevo BOE: {formatEUR(EJEMPLO_10_ANIOS.valorNuevoBoe)})</div>
            <ul className="text-xs text-fg space-y-1.5 mb-4">
              <li>&bull; Precio pactado en contrato: <strong>{formatEUR(EJEMPLO_10_ANIOS.precioContrato)}</strong></li>
              <li>&bull; Coeficiente antigüedad ({EJEMPLO_10_ANIOS.antiguedadAnios} años): <strong>{ejemplo10.porcentajeDepreciacion} %</strong></li>
              <li>&bull; Valor fiscal mínimo BOE: <strong>{formatEUR(ejemplo10.valorFiscalDepreciado)}</strong></li>
              <li>&bull; Base imponible aplicada: <strong>{formatEUR(ejemplo10.baseLiquidable)}</strong></li>
              <li>
                &bull; Cuota ITP ({ejemplo10.tipoPorcentajeAplicado} %):{' '}
                <strong className="text-accent">
                  {ejemplo10.clasificacionCuotaCero ? `${formatEUR(ejemplo10.cuotaITP)} (${etiquetaCuotaCeroITP(ejemplo10.clasificacionCuotaCero)})` : formatEUR(ejemplo10.cuotaITP)}
                </strong>
              </li>
              <li>&bull; Tasa DGT {ejemplo10.tasaDgtCodigo} cambio de nombre: <strong>{formatEUR(ejemplo10.tasaDgtImporte)}</strong></li>
            </ul>
            <div className="pt-3 border-t border-line flex justify-between items-center text-sm">
              <span className="font-bold">Total Gastos Transferencia:</span>
              <span className="font-mono font-extrabold text-accent">{formatEUR(ejemplo10.totalGastosTransferencia)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Calculadora Interactiva Preseleccionada */}
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-3">Calcula el ITP de tu coche en {com.nombre}</h2>
        <CalculadoraTransferencia initialComunidad={com.slug} />
      </div>

      <FaqSection
        title={`Preguntas Frecuentes sobre el ITP en ${com.nombre}`}
        items={buildComunidadFaqs(com, tasaOrdinaria, tasaCiclomotor.importe)}
      />

      <FaqReviewCallsCard />

      <AdSlot className="mb-8" />

      {/* Enlaces a Otras Comunidades Autónomas (Interlinking) */}
      <div className="card">
        <h2 className="text-lg font-bold mb-2">Calculadora de ITP en otras Comunidades Autónomas</h2>
        <p className="text-xs text-muted mb-4">
          Selecciona otra comunidad autónoma para ver sus tipos impositivos vigentes, exenciones y tasas de autoliquidación:
        </p>

        <div className="communities-grid">
          {otrasComunidades.map(otra => (
            <Link key={otra.slug} href={`/itp-coche-segunda-mano/${otra.slug}`} className="community-pill">
              <span className="com-name">{otra.nombre}</span>
              <span className="com-rate">{formatTipo(getTipoEfectivoITP(otra))} % ITP</span>
            </Link>
          ))}
        </div>
      </div>

      <AdSlot className="mt-8" />
    </main>
  );
}
