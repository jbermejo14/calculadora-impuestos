import { test } from 'node:test';
import assert from 'node:assert/strict';
import { camposPendientes, FECHA_TEXTOS_LEGALES, getTitular, valorOPendiente, type Titular } from '../lib/legal';

const LEGAL_TITULAR_COMPLETO: Titular = {
  tipo: 'persona-fisica',
  nombre: 'Titular de prueba',
  nif: 'placeholder',
  domicilio: 'Calle de prueba 1',
  email: 'prueba@example.com',
  registroMercantil: ''
};

test('getTitular lee el fichero real con la forma esperada', () => {
  const titular = getTitular();
  assert.ok(['persona-fisica', 'empresa'].includes(titular.tipo));
  for (const campo of ['nombre', 'nif', 'domicilio', 'email', 'registroMercantil'] as const) {
    assert.equal(typeof titular[campo], 'string');
  }
});

test('camposPendientes: persona física ignora registroMercantil', () => {
  assert.deepEqual(camposPendientes(LEGAL_TITULAR_COMPLETO), []);
  const vacio: Titular = { ...LEGAL_TITULAR_COMPLETO, nombre: '', email: '  ' };
  assert.deepEqual(camposPendientes(vacio), ['nombre', 'email']);
});

test('camposPendientes: empresa exige registroMercantil', () => {
  const empresa: Titular = { ...LEGAL_TITULAR_COMPLETO, tipo: 'empresa' };
  assert.deepEqual(camposPendientes(empresa), ['registroMercantil']);
  assert.deepEqual(camposPendientes({ ...empresa, registroMercantil: 'Tomo 1' }), []);
});

test('valorOPendiente devuelve el valor o el marcador', () => {
  assert.equal(valorOPendiente(LEGAL_TITULAR_COMPLETO, 'nombre'), 'Titular de prueba');
  assert.equal(valorOPendiente(LEGAL_TITULAR_COMPLETO, 'registroMercantil'), '[pendiente: registroMercantil]');
});

test('FECHA_TEXTOS_LEGALES es una fecha ISO', () => {
  assert.match(FECHA_TEXTOS_LEGALES, /^\d{4}-\d{2}-\d{2}$/);
});
