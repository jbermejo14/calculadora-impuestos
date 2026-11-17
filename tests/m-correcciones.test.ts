import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {
  calcularITP,
  etiquetaCuotaCeroITP,
  getTipoEfectivoITP,
  getComunidadITP,
  type CalculoITPParams
} from '../lib/itp';
import { calcularIEDMT, territorioTieneIvaIEDMT } from '../lib/iedmt';

const ANIO = 2026;
const RAIZ = process.cwd();
const IMPORTES_DGT_FIJOS = /55,70|27,85|99,77|8,67/;

function itpCaso(comunidadSlug: string, extra: Partial<CalculoITPParams>) {
  return calcularITP({
    anio: ANIO,
    comunidadSlug,
    precioContrato: 3000,
    valorNuevoBoe: 20000,
    antiguedadAnios: 5,
    incluirTasaDgt: false,
    ...extra
  });
}

function leerFichero(...partes: string[]): string {
  return fs.readFileSync(path.join(RAIZ, ...partes), 'utf-8');
}

function listarFuentes(carpeta: string): string[] {
  const ruta = path.join(RAIZ, carpeta);
  return fs.readdirSync(ruta, { recursive: true, encoding: 'utf-8' })
    .filter(nombre => /\.tsx?$/.test(nombre))
    .map(nombre => path.join(carpeta, nombre));
}

test('M3: clasificación de las cuotas cero del ITP', async t => {
  await t.test('Distintivo CERO con tipo 0 % es "Tipo 0 %", no exención', () => {
    const res = itpCaso('baleares', { distintivo: 'cero', cilindradaCC: 0 });
    assert.equal(res.esExentoOcuotaCero, true);
    assert.equal(res.clasificacionCuotaCero, 'tipoCero');
    assert.equal(etiquetaCuotaCeroITP('tipoCero'), 'Tipo 0 %');
  });

  await t.test('Aragón hasta 1.000 cc es "Cuota 0 €"', () => {
    const res = itpCaso('aragon', { antiguedadAnios: 12, cilindradaCC: 1000 });
    assert.equal(res.cuotaITP, 0);
    assert.equal(res.clasificacionCuotaCero, 'cuotaFijaCero');
    assert.equal(etiquetaCuotaCeroITP('cuotaFijaCero'), 'Cuota 0 €');
  });

  await t.test('Navarra: exención real a los 10 años y en ciclomotores', () => {
    assert.equal(itpCaso('navarra', { antiguedadAnios: 10 }).clasificacionCuotaCero, 'exencion');
    assert.equal(itpCaso('navarra', { tipoVehiculo: 'ciclomotor' }).clasificacionCuotaCero, 'exencion');
    assert.equal(etiquetaCuotaCeroITP('exencion'), 'Exento');
  });

  await t.test('Cataluña a 10 años y ciclomotores: sin obligación de autoliquidar', () => {
    assert.equal(itpCaso('catalunya', { antiguedadAnios: 10 }).clasificacionCuotaCero, 'noObligacion');
    assert.equal(itpCaso('catalunya', { tipoVehiculo: 'ciclomotor' }).clasificacionCuotaCero, 'noObligacion');
  });

  await t.test('Baleares ciclomotor: tipo 0 %', () => {
    assert.equal(itpCaso('baleares', { tipoVehiculo: 'ciclomotor' }).clasificacionCuotaCero, 'tipoCero');
  });

  await t.test('Compraventa profesional: no sujeto', () => {
    assert.equal(itpCaso('madrid', { esCompraventaProfesional: true }).clasificacionCuotaCero, 'noSujeto');
  });

  await t.test('Cuota distinta de cero: sin clasificación', () => {
    assert.equal(itpCaso('madrid', {}).clasificacionCuotaCero, null);
  });

  await t.test('Solo la exención legal se etiqueta como "Exento"', () => {
    const otras = (['tipoCero', 'cuotaFijaCero', 'noObligacion', 'noSujeto'] as const).map(etiquetaCuotaCeroITP);
    assert.ok(otras.every(etiqueta => !/exent/i.test(etiqueta)));
  });
});

test('M4: Navarra cita su norma y avisa de la Orden Foral', async t => {
  const exento = itpCaso('navarra', { antiguedadAnios: 10 });

  await t.test('El motivo cita el DFL 129/1999, art. 35.I.B.23', () => {
    assert.match(exento.motivoExencionOCuotaCero ?? '', /35\.I\.B\.23/);
    assert.match(exento.motivoExencionOCuotaCero ?? '', /129\/1999/);
    assert.match(exento.norma, /35\.I\.B\.23/);
  });

  await t.test('El resultado avisa de que Navarra usa su propia Orden Foral', () => {
    assert.ok(exento.avisos.some(aviso => aviso.includes('Orden Foral')));
    assert.ok(itpCaso('navarra', { antiguedadAnios: 3 }).avisos.some(aviso => aviso.includes('Orden Foral')));
  });

  await t.test('Los ciclomotores están exentos sin límite de antigüedad', () => {
    const res = itpCaso('navarra', { tipoVehiculo: 'ciclomotor', antiguedadAnios: 0.5 });
    assert.equal(res.cuotaITP, 0);
    assert.match(res.motivoExencionOCuotaCero ?? '', /35\.I\.B\.23/);
  });
});

test('M5: IVA territorial en el IEDMT', async t => {
  const base = { anio: ANIO, baseImponible: 20000, emisionesCO2: 150, incluirIva: true, incluirTasaDgt: false };

  await t.test('Canarias: sin IVA y con aviso que nombra el IGIC', () => {
    const res = calcularIEDMT({ ...base, territorio: 'canarias' });
    assert.equal(res.ivaPorcentaje, 0);
    assert.equal(res.cuotaIva, 0);
    assert.ok(res.avisos.some(aviso => aviso.includes('IGIC') && aviso.includes('no rige el IVA')));
  });

  await t.test('Ceuta y Melilla: sin IVA y con aviso que nombra el IPSI', () => {
    const res = calcularIEDMT({ ...base, territorio: 'ceuta-y-melilla' });
    assert.equal(res.cuotaIva, 0);
    assert.ok(res.avisos.some(aviso => aviso.includes('IPSI')));
    assert.ok(res.avisos.every(aviso => !aviso.includes('21')));
  });

  await t.test('Península: el IVA se calcula', () => {
    const res = calcularIEDMT({ ...base, territorio: 'peninsula-y-baleares' });
    assert.ok(res.cuotaIva > 0);
  });

  await t.test('territorioTieneIvaIEDMT distingue los territorios', () => {
    assert.equal(territorioTieneIvaIEDMT('peninsula-y-baleares'), true);
    assert.equal(territorioTieneIvaIEDMT('canarias'), false);
    assert.equal(territorioTieneIvaIEDMT('ceuta-y-melilla'), false);
  });
});

test('M1: tipo efectivo de Ceuta y Melilla sale de los datos', () => {
  for (const slug of ['ceuta', 'melilla']) {
    const com = getComunidadITP(ANIO, slug);
    assert.equal(getTipoEfectivoITP(com), com.tipoGeneral / 2);
  }
});

test('M2: sin importes de tasas DGT escritos en páginas ni componentes', async t => {
  const ficheros = [...listarFuentes('app'), ...listarFuentes('components')];

  await t.test('Ningún fichero de app/ ni components/ contiene importes DGT fijos', () => {
    const conImporte = ficheros.filter(fichero => IMPORTES_DGT_FIJOS.test(leerFichero(fichero)));
    assert.deepEqual(conImporte, []);
  });

  await t.test('guias.json no duplica los importes de tasas-dgt.json', () => {
    assert.ok(!IMPORTES_DGT_FIJOS.test(leerFichero('data', '2026', 'guias.json')));
  });
});

test('M1: ninguna página muestra "pendiente de revisión" fijo', () => {
  const paginas = [
    'app/guia/[tema]/page.tsx',
    'app/impuesto-matriculacion/[territorio]/page.tsx',
    'app/itp-coche-segunda-mano/[comunidad]/page.tsx',
    'app/layout.tsx',
    'components/Footer.tsx'
  ];
  for (const pagina of paginas) {
    assert.ok(!/pendiente de revisi[oó]n|pendientes de revisi[oó]n/i.test(leerFichero(pagina)), pagina);
  }
});
