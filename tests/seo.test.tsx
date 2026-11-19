import { test } from 'node:test';
import assert from 'node:assert/strict';
import { renderToStaticMarkup } from 'react-dom/server';
import guias2026 from '../data/2026/guias.json';
import { getComunidadesList } from '../lib/itp';
import { getIEDMTData } from '../lib/iedmt';
import { absoluteUrl, SITE_NAME } from '../lib/site';
import {
  DESCRIPTION_MAX_LENGTH,
  DESCRIPTION_MIN_LENGTH,
  HOME_DESCRIPTION,
  HOME_TITLE,
  TITLE_MAX_LENGTH,
  descriptionItpComunidad,
  descriptionMatriculacionTerritorio,
  homeWebApplicationJsonLd,
  seoShortName,
  titleGuia,
  titleItpComunidad,
  titleMatriculacionTerritorio
} from '../lib/seo';
import HomePage from '../app/page';

const FISCAL_YEAR = 2026;
const HOME_TITLE_MAX = 60;
const HOME_DESCRIPTION_MAX = 160;
const BRAND_SUFFIX = ` | ${SITE_NAME}`;

function fullTitle(title: string): string {
  return `${title}${BRAND_SUFFIX}`;
}

test('título de ITP: palabra clave al principio, dato clave y marca dentro de 65 en las 19 comunidades', () => {
  const comunidades = getComunidadesList(FISCAL_YEAR);
  assert.equal(comunidades.length, 19);
  for (const com of comunidades) {
    const title = titleItpComunidad(com.nombre, com.tipoGeneral);
    assert.ok(title.startsWith('ITP coche'), title);
    assert.ok(fullTitle(title).length <= TITLE_MAX_LENGTH, `${fullTitle(title)} (${fullTitle(title).length})`);
  }
});

test('título y descripción de ITP en Ceuta usan el tipo general (4 %), no el efectivo', () => {
  assert.equal(titleItpComunidad('Ceuta', 4), 'ITP coche segunda mano en Ceuta 2026: 4 %');
  assert.ok(descriptionItpComunidad('Ceuta', 4).includes('4 %'));
});

test('título de ITP: ejemplos concretos', () => {
  assert.equal(titleItpComunidad('Aragón', 4), 'ITP coche segunda mano en Aragón 2026: 4 %');
  assert.equal(titleItpComunidad('Canarias', 5.5), 'ITP coche segunda mano en Canarias 2026: 5,5 %');
  assert.equal(titleItpComunidad('País Vasco (Álava, Bizkaia, Gipuzkoa)', 4).includes('('), false);
});

test('descripción de ITP: de 120 a 160 caracteres en las 19 comunidades', () => {
  for (const com of getComunidadesList(FISCAL_YEAR)) {
    const description = descriptionItpComunidad(com.nombre, com.tipoGeneral);
    assert.ok(description.length >= DESCRIPTION_MIN_LENGTH && description.length <= DESCRIPTION_MAX_LENGTH, `${com.slug}: ${description.length}`);
  }
});

test('título y descripción de matriculación dentro de los límites en todos los territorios', () => {
  const territorios = Object.values(getIEDMTData(FISCAL_YEAR).territorios);
  assert.equal(territorios.length, 3);
  for (const terr of territorios) {
    const title = titleMatriculacionTerritorio(terr.nombre);
    const description = descriptionMatriculacionTerritorio(terr.nombre);
    assert.ok(title.startsWith('Impuesto de matriculación'), title);
    assert.ok(fullTitle(title).length <= TITLE_MAX_LENGTH, `${fullTitle(title)} (${fullTitle(title).length})`);
    assert.ok(description.length >= DESCRIPTION_MIN_LENGTH && description.length <= DESCRIPTION_MAX_LENGTH, `${terr.slug}: ${description.length}`);
  }
});

test('título de guía: todas las guías reales dentro de 65', () => {
  for (const guia of Object.values(guias2026.temas as Record<string, { titulo: string; descripcion: string }>)) {
    const title = titleGuia(guia.titulo);
    assert.ok(fullTitle(title).length <= TITLE_MAX_LENGTH, `${fullTitle(title)} (${fullTitle(title).length})`);
    assert.ok(guia.descripcion.length >= DESCRIPTION_MIN_LENGTH && guia.descripcion.length <= DESCRIPTION_MAX_LENGTH, `${guia.titulo}: ${guia.descripcion.length}`);
  }
});

test('titleGuia no repite el año si ya está', () => {
  assert.equal(titleGuia('Guía 2026'), 'Guía 2026');
});

test('seoShortName quita la aclaración entre paréntesis', () => {
  assert.equal(seoShortName('País Vasco (Álava, Bizkaia, Gipuzkoa)'), 'País Vasco');
  assert.equal(seoShortName('Canarias'), 'Canarias');
});

test('portada: título con marca de hasta 60 y descripción de hasta 160', () => {
  assert.ok(HOME_TITLE.endsWith(SITE_NAME));
  assert.ok(HOME_TITLE.length <= HOME_TITLE_MAX, `${HOME_TITLE.length}`);
  assert.ok(HOME_DESCRIPTION.length <= HOME_DESCRIPTION_MAX && HOME_DESCRIPTION.length >= DESCRIPTION_MIN_LENGTH);
});

test('JSON-LD WebApplication de la portada', () => {
  const ld = homeWebApplicationJsonLd();
  assert.equal(ld['@context'], 'https://schema.org');
  assert.equal(ld['@type'], 'WebApplication');
  assert.equal(ld.url, absoluteUrl('/'));
  assert.equal(ld.description, HOME_DESCRIPTION);
  assert.equal(ld.applicationCategory, 'FinanceApplication');
  assert.equal(ld.operatingSystem, 'Any');
  assert.deepEqual(ld.offers, { '@type': 'Offer', price: '0', priceCurrency: 'EUR' });
  assert.ok(ld.name.length > 0);
});

test('la portada emite solo el bloque JSON-LD WebApplication', () => {
  const html = renderToStaticMarkup(<HomePage />);
  assert.equal(html.split('application/ld+json').length - 1, 1);
  assert.ok(html.includes('&quot;WebApplication&quot;') || html.includes('"WebApplication"'));
  assert.equal(html.includes('BreadcrumbList'), false);
});
