import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getComunidadesList, getComunidadITP, calcularITP } from '@/lib/itp';
import { absoluteUrl } from '@/lib/site';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { CalculadoraTransferencia } from '@/components/CalculadoraTransferencia';
import { VerificationNotice } from '@/components/VerificationNotice';

export const dynamicParams = false;

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
    const title = `ITP Coche Segunda Mano en ${com.nombre} 2026: Tipo ${com.tipoGeneral} % y Calculadora`;
    const description = `Calcula el Impuesto de Transmisiones Patrimoniales (ITP) de vehículos usados en ${com.nombre} para 2026. Tipo aplicable del ${com.tipoGeneral} %, ${com.modelo}, bonificaciones y tasas DGT.`;
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
        siteName: 'AutoTax'
      }
    };
  } catch {
    return {
      title: 'Comunidad no encontrada | AutoTax'
    };
  }
}

function formatEUR(val: number): string {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(val);
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
    anio: 2026,
    comunidadSlug: com.slug,
    precioContrato: 10000,
    valorNuevoBoe: 22000,
    antiguedadAnios: 5,
    incluirTasaDgt: true
  });

  // Ejemplo 2: Coche de 10 años (Valor nuevo BOE 14.000 €, depreciación 19 % -> 2.660 €)
  const ejemplo10 = calcularITP({
    anio: 2026,
    comunidadSlug: com.slug,
    precioContrato: 2500,
    valorNuevoBoe: 14000,
    antiguedadAnios: 10,
    incluirTasaDgt: true
  });

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
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/15 text-orange-500 text-xs font-bold uppercase tracking-wider mb-2">
          Ejercicio Fiscal 2026: pendiente de revisión
        </div>
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight mb-2">
          ITP de Vehículos Usados en {com.nombre} (2026)
        </h1>
        <p className="text-sm md:text-base text-slate-400">
          Guía tributaria, tipos impositivos aplicables, modelos de autoliquidación (<strong>{com.modelo}</strong>) y calculadora interactiva para la compraventa de coches de segunda mano entre particulares.
        </p>
      </div>

      {/* Ficha Resumen de la Comunidad */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="card py-4 px-5">
          <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Tipo General ITP</div>
          <div className="text-3xl font-extrabold text-orange-500 font-mono mt-1">
            {(com.tipoEfectivo ?? com.tipoGeneral).toFixed(1).replace('.', ',')} %
          </div>
          <div className="text-xs text-slate-500 mt-1">
            {com.tipoEfectivo ? `(Tipo general 4 % con bonif. 50 % = efectivo ${com.tipoEfectivo} %)` : 'Sobre la base imponible mayor'}
          </div>
        </div>

        <div className="card py-4 px-5">
          <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Modelo de Tributación</div>
          <div className="text-lg font-bold text-slate-200 mt-1">{com.modelo}</div>
          <div className="text-xs text-slate-500 mt-1">{com.organismo}</div>
        </div>

        <div className="card py-4 px-5">
          <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Tasa DGT de Transferencia</div>
          <div className="text-2xl font-extrabold text-slate-200 font-mono mt-1">55,70 €</div>
          <div className="text-xs text-slate-500 mt-1">Tasa 1.5 DGT general (ciclomotores: 27,85 €)</div>
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
              <strong>Exención para coches con más de 10 años:</strong> {com.exencionDiezAnios.descripcion}
            </li>
          )}
          {com.exencionCiclomotores && (
            <li>
              <strong>Ciclomotores:</strong> Exención total del impuesto en esta comunidad autónoma (cuota ITP = 0 €).
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
        <p className="text-sm text-slate-400 mb-6">
          Cálculos con cifras reales aplicando el valor fiscal según la Orden Ministerial del BOE, los coeficientes de depreciación y las tasas de Tráfico:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Ejemplo 1 */}
          <div className="p-4 rounded-lg bg-zinc-900/60 border border-zinc-800">
            <div className="text-xs font-bold text-orange-500 uppercase tracking-wider mb-1">Ejemplo 1: Turismo de 5 años</div>
            <div className="text-sm font-semibold mb-3">Seat León / VW Golf (Valor nuevo BOE: 22.000 €)</div>
            <ul className="text-xs text-slate-300 space-y-1.5 mb-4">
              <li>&bull; Precio pactado en contrato: <strong>10.000,00 €</strong></li>
              <li>&bull; Coeficiente antigüedad (5 años): <strong>47 %</strong></li>
              <li>&bull; Valor fiscal mínimo BOE: <strong>{formatEUR(ejemplo5.valorFiscalDepreciado)}</strong></li>
              <li>&bull; Base imponible aplicada: <strong>{formatEUR(ejemplo5.baseLiquidable)}</strong> (la mayor)</li>
              <li>&bull; Cuota ITP ({ejemplo5.tipoPorcentajeAplicado} %): <strong className="text-orange-500">{formatEUR(ejemplo5.cuotaITP)}</strong></li>
              <li>&bull; Tasa DGT 1.5 cambio de nombre: <strong>55,70 €</strong></li>
            </ul>
            <div className="pt-3 border-t border-zinc-800 flex justify-between items-center text-sm">
              <span className="font-bold">Total Gastos Transferencia:</span>
              <span className="font-mono font-extrabold text-orange-500">{formatEUR(ejemplo5.totalGastosTransferencia)}</span>
            </div>
          </div>

          {/* Ejemplo 2 */}
          <div className="p-4 rounded-lg bg-zinc-900/60 border border-zinc-800">
            <div className="text-xs font-bold text-orange-500 uppercase tracking-wider mb-1">Ejemplo 2: Turismo de 10 años</div>
            <div className="text-sm font-semibold mb-3">Renault Clio / Ford Fiesta (Valor nuevo BOE: 14.000 €)</div>
            <ul className="text-xs text-slate-300 space-y-1.5 mb-4">
              <li>&bull; Precio pactado en contrato: <strong>2.500,00 €</strong></li>
              <li>&bull; Coeficiente antigüedad (10 años): <strong>19 %</strong></li>
              <li>&bull; Valor fiscal mínimo BOE: <strong>{formatEUR(ejemplo10.valorFiscalDepreciado)}</strong></li>
              <li>&bull; Base imponible aplicada: <strong>{formatEUR(ejemplo10.baseLiquidable)}</strong></li>
              <li>
                &bull; Cuota ITP ({ejemplo10.tipoPorcentajeAplicado} %):{' '}
                <strong className="text-orange-500">
                  {ejemplo10.esExentoOcuotaCero ? '0,00 € (Exento)' : formatEUR(ejemplo10.cuotaITP)}
                </strong>
              </li>
              <li>&bull; Tasa DGT 1.5 cambio de nombre: <strong>55,70 €</strong></li>
            </ul>
            <div className="pt-3 border-t border-zinc-800 flex justify-between items-center text-sm">
              <span className="font-bold">Total Gastos Transferencia:</span>
              <span className="font-mono font-extrabold text-orange-500">{formatEUR(ejemplo10.totalGastosTransferencia)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Calculadora Interactiva Preseleccionada */}
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-3">Calcula el ITP de tu coche en {com.nombre}</h2>
        <CalculadoraTransferencia initialComunidad={com.slug} />
      </div>

      {/* Enlaces a Otras Comunidades Autónomas (Interlinking) */}
      <div className="card">
        <h2 className="text-lg font-bold mb-2">Calculadora de ITP en otras Comunidades Autónomas</h2>
        <p className="text-xs text-slate-400 mb-4">
          Selecciona otra comunidad autónoma para ver sus tipos impositivos vigentes, exenciones y tasas de autoliquidación:
        </p>

        <div className="communities-grid">
          {otrasComunidades.map(otra => (
            <Link key={otra.slug} href={`/itp-coche-segunda-mano/${otra.slug}`} className="community-pill">
              <span className="com-name">{otra.nombre}</span>
              <span className="com-rate">{(otra.tipoEfectivo ?? otra.tipoGeneral).toFixed(1).replace('.', ',')} % ITP</span>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
