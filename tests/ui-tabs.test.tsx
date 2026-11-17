import { test } from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { HomeTabs, nextTabIndex } from '../components/HomeTabs';
import { GuidePanel } from '../components/GuidePanel';
import { CommunityLinks } from '../components/CommunityLinks';
import { TerritoryLinks } from '../components/TerritoryLinks';
import { BrandLogo } from '../components/BrandLogo';
import { getComunidadesList } from '../lib/itp';

const TAB_COUNT = 3;
const LAST_TAB = TAB_COUNT - 1;
const GUIDE_LINK_COUNT = 4;

function uiTabsMatches(html: string, pattern: RegExp): string[] {
  return [...html.matchAll(pattern)].map(match => match[1]);
}

function uiTabsRenderHome(): string {
  return renderToStaticMarkup(<HomeTabs comunidades={getComunidadesList(2026)} />);
}

test('pestañas: hay 3 paneles con role=tabpanel', () => {
  assert.equal(uiTabsMatches(uiTabsRenderHome(), /role="(tabpanel)"/g).length, TAB_COUNT);
});

test('pestañas: aria-controls apunta a un panel que referencia a su pestaña', () => {
  const html = uiTabsRenderHome();
  const tabs = [...html.matchAll(/<button[^>]*role="tab"[^>]*>/g)].map(match => match[0]);
  assert.equal(tabs.length, TAB_COUNT);
  for (const tag of tabs) {
    const tabId = /\sid="([^"]+)"/.exec(tag)?.[1];
    const panelId = /aria-controls="([^"]+)"/.exec(tag)?.[1];
    assert.ok(tabId && panelId, `Pestaña sin id o aria-controls: ${tag}`);
    const panel = new RegExp(`<section[^>]*id="${panelId}"[^>]*>`).exec(html);
    assert.ok(panel, `No existe el panel ${panelId}`);
    assert.ok(panel[0].includes(`aria-labelledby="${tabId}"`), `El panel ${panelId} no apunta a ${tabId}`);
  }
});

test('pestañas: las inactivas tienen tabindex=-1 y la activa 0', () => {
  const html = uiTabsRenderHome();
  assert.equal(uiTabsMatches(html, /(tabindex="-1")/g).length, TAB_COUNT - 1);
  assert.equal(uiTabsMatches(html, /(tabindex="0")/g).length, 1);
});

test('nextTabIndex: ArrowRight desde la última vuelve a 0', () => {
  assert.equal(nextTabIndex(LAST_TAB, 'ArrowRight', TAB_COUNT), 0);
});

test('nextTabIndex: ArrowLeft desde 0 va a la última', () => {
  assert.equal(nextTabIndex(0, 'ArrowLeft', TAB_COUNT), LAST_TAB);
});

test('nextTabIndex: otra tecla devuelve null', () => {
  assert.equal(nextTabIndex(0, 'Enter', TAB_COUNT), null);
});

test('comunidades: lista vacía muestra (0) y ningún enlace', () => {
  const html = renderToStaticMarkup(<CommunityLinks comunidades={[]} />);
  assert.ok(html.includes('(0)'));
  assert.ok(!html.includes('<a '));
});

test('territorios: exactamente 3 enlaces', () => {
  const html = renderToStaticMarkup(<TerritoryLinks />);
  assert.equal(uiTabsMatches(html, /<(a) /g).length, 3);
});

test('logo: las 2 imágenes llevan alt="Ododex"', () => {
  const html = renderToStaticMarkup(<BrandLogo />);
  assert.equal(uiTabsMatches(html, /<img[^>]*alt="(Ododex)"/g).length, 2);
});

test('guía: se renderiza con los 4 enlaces /guia/', () => {
  const html = renderToStaticMarkup(<GuidePanel />);
  assert.equal(uiTabsMatches(html, /href="(\/guia\/[^"]+)"/g).length, GUIDE_LINK_COUNT);
});
