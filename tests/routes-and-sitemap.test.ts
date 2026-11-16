import test from 'node:test';
import assert from 'node:assert/strict';
import sitemap from '../app/sitemap';
import robots from '../app/robots';
import { getComunidadITP, getComunidadesList } from '../lib/itp';
import { getIEDMTData } from '../lib/iedmt';
import fs from 'node:fs';
import path from 'node:path';

test('Verificación de rutas estáticas, slugs, 404 y sitemap sin red', async (t) => {
  const anio = 2026;

  await t.test('Slugs válidos de comunidades para ITP (/itp-coche-segunda-mano/[comunidad])', () => {
    const comunidades = getComunidadesList(anio);
    assert.equal(comunidades.length, 19);

    const slugsEsperados = [
      'andalucia', 'aragon', 'asturias', 'baleares', 'canarias', 'cantabria',
      'castilla-la-mancha', 'castilla-y-leon', 'catalunya', 'ceuta',
      'comunidad-valenciana', 'extremadura', 'galicia', 'la-rioja',
      'madrid', 'melilla', 'murcia', 'navarra', 'pais-vasco'
    ];

    const slugsReales = comunidades.map(c => c.slug).sort();
    assert.deepEqual(slugsReales, slugsEsperados.sort());

    for (const slug of slugsEsperados) {
      const com = getComunidadITP(anio, slug);
      assert.ok(com, `La comunidad con slug ${slug} debe existir`);
      assert.equal(com.slug, slug);
    }
  });

  await t.test('Slugs inexistentes de ITP deben fallar / devolver error (para 404)', () => {
    const slugsInvalidos = ['francia', 'madrid-norte', '123', 'null', 'undefined'];
    for (const slug of slugsInvalidos) {
      assert.throws(
        () => getComunidadITP(anio, slug),
        /no encontrada/,
        `El slug inválido "${slug}" no debe encontrarse y debe provocar un 404`
      );
    }
  });

  await t.test('Slugs válidos de territorios para Matriculación (/impuesto-matriculacion/[territorio])', () => {
    const data = getIEDMTData(anio);
    const territorios = Object.keys(data.territorios).sort();
    const esperados = ['canarias', 'ceuta-y-melilla', 'peninsula-y-baleares'].sort();
    assert.deepEqual(territorios, esperados);
  });

  await t.test('Slugs válidos de Guías (/guia/[tema])', () => {
    const guiasPath = path.join(process.cwd(), 'data', anio.toString(), 'guias.json');
    const data = JSON.parse(fs.readFileSync(guiasPath, 'utf-8'));
    const temas = Object.keys(data.temas).sort();
    const esperados = ['depreciacion-boe', 'documentacion-tramitar', 'tasas-dgt', 'tramos-iedmt'].sort();
    assert.deepEqual(temas, esperados);
  });

  await t.test('Generación de Sitemap XML: debe contener exactamente 27 páginas estáticas canónicas', () => {
    const siteMapEntries = sitemap();

    // 1 home + 19 comunidades + 3 territorios + 4 guías = 27 páginas
    assert.equal(siteMapEntries.length, 27, `Se esperaban 27 páginas en el sitemap, encontradas: ${siteMapEntries.length}`);

    // Home
    const homeEntry = siteMapEntries.find(e => !e.url.includes('/itp-') && !e.url.includes('/impuesto-') && !e.url.includes('/guia/'));
    assert.ok(homeEntry, 'Falta la home en el sitemap');
    assert.equal(homeEntry.priority, 1.0);

    // Todas las entradas deben tener URL válida, priority y changeFrequency
    for (const entry of siteMapEntries) {
      assert.ok(entry.url.startsWith('http'), `URL no válida en sitemap: ${entry.url}`);
      assert.ok(entry.priority && entry.priority > 0, `Priority inválida en sitemap para ${entry.url}`);
      assert.ok(entry.changeFrequency, `Falta changeFrequency en ${entry.url}`);
    }
  });

  await t.test('Generación de Robots.txt: debe permitir el rastreo y apuntar al sitemap', () => {
    const robotsConfig = robots();
    assert.ok(robotsConfig.sitemap, 'Falta sitemap en robots.txt');
    assert.ok(typeof robotsConfig.sitemap === 'string' && robotsConfig.sitemap.endsWith('/sitemap.xml'));
  });
});
