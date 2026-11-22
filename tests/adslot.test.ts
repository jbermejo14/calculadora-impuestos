import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { AdSlot, getAdSenseSlot } from '../components/AdSlot';
import { AdSenseScript, getAdSenseClient } from '../components/AdSenseScript';

const VALID_CLIENT = 'ca-pub-2749781881817715';
const VALID_SLOT = '8745518895';

function withEnv(client: string | undefined, slot: string | undefined, fn: () => void) {
  const prevClient = process.env.NEXT_PUBLIC_ADSENSE_CLIENT;
  const prevSlot = process.env.NEXT_PUBLIC_ADSENSE_SLOT;

  if (client === undefined) delete process.env.NEXT_PUBLIC_ADSENSE_CLIENT;
  else process.env.NEXT_PUBLIC_ADSENSE_CLIENT = client;

  if (slot === undefined) delete process.env.NEXT_PUBLIC_ADSENSE_SLOT;
  else process.env.NEXT_PUBLIC_ADSENSE_SLOT = slot;

  try {
    fn();
  } finally {
    if (prevClient === undefined) delete process.env.NEXT_PUBLIC_ADSENSE_CLIENT;
    else process.env.NEXT_PUBLIC_ADSENSE_CLIENT = prevClient;

    if (prevSlot === undefined) delete process.env.NEXT_PUBLIC_ADSENSE_SLOT;
    else process.env.NEXT_PUBLIC_ADSENSE_SLOT = prevSlot;
  }
}

describe('AdSenseScript & AdSlot en calculadora-impuestos', () => {
  test('getAdSenseClient valida el formato ca-pub-<16 dígitos>', () => {
    withEnv(undefined, undefined, () => assert.equal(getAdSenseClient(), null));
    withEnv('', undefined, () => assert.equal(getAdSenseClient(), null));
    withEnv('invalido', undefined, () => assert.equal(getAdSenseClient(), null));
    withEnv('pub-2749781881817715', undefined, () => assert.equal(getAdSenseClient(), null));
    withEnv(VALID_CLIENT, undefined, () => assert.equal(getAdSenseClient(), VALID_CLIENT));
  });

  test('getAdSenseSlot valida 10 dígitos numéricos', () => {
    withEnv(undefined, undefined, () => assert.equal(getAdSenseSlot(), null));
    withEnv(undefined, '123', () => assert.equal(getAdSenseSlot(), null));
    withEnv(undefined, 'abcdefghij', () => assert.equal(getAdSenseSlot(), null));
    withEnv(undefined, VALID_SLOT, () => assert.equal(getAdSenseSlot(), VALID_SLOT));
  });

  test('AdSenseScript renderiza script solo si client es válido', () => {
    withEnv(undefined, undefined, () => {
      assert.equal(AdSenseScript(), null);
    });
    withEnv(VALID_CLIENT, undefined, () => {
      const html = renderToStaticMarkup(React.createElement(AdSenseScript));
      assert.ok(html.includes('https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js'));
      assert.ok(html.includes(`client=${VALID_CLIENT}`));
    });
  });

  test('AdSlot no renderiza nada si falta client o slot', () => {
    withEnv(undefined, undefined, () => {
      assert.equal(renderToStaticMarkup(React.createElement(AdSlot)), '');
    });
    withEnv(VALID_CLIENT, undefined, () => {
      assert.equal(renderToStaticMarkup(React.createElement(AdSlot)), '');
    });
    withEnv(undefined, VALID_SLOT, () => {
      assert.equal(renderToStaticMarkup(React.createElement(AdSlot)), '');
    });
  });

  test('AdSlot renderiza bloque con ins y data-ad-slot si ambos son válidos', () => {
    withEnv(VALID_CLIENT, VALID_SLOT, () => {
      const html = renderToStaticMarkup(React.createElement(AdSlot));
      assert.ok(html.includes('class="ad-slot"'));
      assert.ok(html.includes('Publicidad'));
      assert.ok(html.includes(`data-ad-client="${VALID_CLIENT}"`));
      assert.ok(html.includes(`data-ad-slot="${VALID_SLOT}"`));
    });
  });
});
