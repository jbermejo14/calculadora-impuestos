import { test } from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { TerritoryLinks } from '../components/TerritoryLinks';
import { CommunityLinks } from '../components/CommunityLinks';
import { HomeTabs } from '../components/HomeTabs';
import { getComunidadesList } from '../lib/itp';

const EXPECTED_TERRITORY_HREFS = [
  '/impuesto-matriculacion/peninsula-y-baleares',
  '/impuesto-matriculacion/canarias',
  '/impuesto-matriculacion/ceuta-y-melilla'
];

const SHORT_LABELS = ['Matriculación', 'Transferencia', 'Tramos'];
const LONG_LABELS = [
  'Matriculación (nuevo o importado)',
  'Transferencia / compraventa (ITP)',
  'Guía de tramos y exenciones'
];

function uiCount(text: string, pattern: RegExp): number {
  return (text.match(pattern) ?? []).length;
}

test('territorios: el marcado contiene los 3 enlaces esperados', () => {
  const html = renderToStaticMarkup(<TerritoryLinks />);
  for (const href of EXPECTED_TERRITORY_HREFS) {
    assert.ok(html.includes(`href="${href}"`), `Falta ${href}`);
  }
});

test('comunidades: 2 comunidades dan 2 enlaces y (2) en el summary', () => {
  const sample = getComunidadesList(2026).slice(0, 2);
  const html = renderToStaticMarkup(<CommunityLinks comunidades={sample} />);
  assert.equal(uiCount(html, /<a /g), 2);
  assert.match(html, /<summary[^>]*>.*\(2\)/);
  assert.ok(!html.includes('<details open'), 'El desplegable debe estar cerrado por defecto');
});

test('pestañas: 3 role=tab, uno solo seleccionado y todas las etiquetas', () => {
  const html = renderToStaticMarkup(<HomeTabs comunidades={getComunidadesList(2026)} />);
  assert.equal(uiCount(html, /role="tab"/g), 3);
  assert.equal(uiCount(html, /aria-selected="true"/g), 1);
  for (const label of [...SHORT_LABELS, ...LONG_LABELS]) {
    assert.ok(html.includes(`>${label}<`), `Falta la etiqueta ${label}`);
  }
});
