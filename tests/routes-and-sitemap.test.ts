import test from 'node:test';
import assert from 'node:assert/strict';
import sitemap from '../app/sitemap';
import { getComunidadITP, getComunidadesList } from '../lib/itp';
import { getIEDMTData } from '../lib/iedmt';
import { buildFaqJsonLd } from '../components/FaqSection';
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
    const homeEntry = siteMapEntries.find(e => e.url.endsWith('/es/impuestos') || !e.url.includes('/itp-') && !e.url.includes('/impuesto-') && !e.url.includes('/guia/'));
    assert.ok(homeEntry, 'Falta la home en el sitemap');
    assert.equal(homeEntry.priority, 1.0);

    // Todas las entradas deben tener URL válida, priority y changeFrequency
    for (const entry of siteMapEntries) {
      assert.ok(entry.url.startsWith('http'), `URL no válida en sitemap: ${entry.url}`);
      assert.ok(entry.priority && entry.priority > 0, `Priority inválida en sitemap para ${entry.url}`);
      assert.ok(entry.changeFrequency, `Falta changeFrequency en ${entry.url}`);
    }
  });

  await t.test('FAQPage en ITP por comunidad y guías, enlace a llamadas a revisión y imagen OG', () => {
    const read = (...parts: string[]) => fs.readFileSync(path.join(process.cwd(), ...parts), 'utf-8');
    const itpPage = read('app', 'itp-coche-segunda-mano', '[comunidad]', 'page.tsx');
    const guiaPage = read('app', 'guia', '[tema]', 'page.tsx');
    const faqComponent = read('components', 'FaqSection.tsx');
    const reviewCard = read('components', 'FaqReviewCallsCard.tsx');
    const layout = read('app', 'layout.tsx');

    assert.ok(faqComponent.includes("'FAQPage'"), 'El componente FAQ debe emitir schema FAQPage');
    assert.ok(itpPage.includes('<FaqSection'), 'Ficha ITP debe usar FaqSection');
    assert.ok(guiaPage.includes('<FaqSection'), 'Guías deben usar FaqSection');

    assert.ok(itpPage.includes('<FaqReviewCallsCard'), 'Ficha ITP debe mostrar la tarjeta de llamadas a revisión');
    assert.ok(reviewCard.includes("'/es/llamadas-revision'"), 'La tarjeta debe enlazar a /es/llamadas-revision');
    assert.ok(!reviewCard.includes('next/link'), 'El enlace a otra sección del dominio no usa next/link');

    assert.ok(layout.includes('/brand/ododex-og.png'), 'El layout debe declarar la imagen OG');
    assert.ok(layout.includes('summary_large_image'), 'El layout debe declarar twitter summary_large_image');
  });

  await t.test('buildFaqJsonLd genera un FAQPage con una pregunta por elemento', () => {
    const items = [{ question: 'Pregunta', answer: 'Respuesta' }];
    const json = buildFaqJsonLd(items);
    assert.equal(json['@type'], 'FAQPage');
    assert.equal(json.mainEntity.length, 1);
    assert.equal(json.mainEntity[0].acceptedAnswer.text, 'Respuesta');
  });
});
