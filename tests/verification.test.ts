import test from 'node:test';
import assert from 'node:assert/strict';
import { avisoLegalVerificacion, etiquetaVerificacion, textoVerificacion } from '../lib/verification';

test('Texto de estado de verificación', async (t) => {
  await t.test('Un dato pendiente no afirma verificación', () => {
    const texto = textoVerificacion({ estadoVerificacion: 'pendiente', fechaVerificacion: null }, 2026);
    assert.equal(texto, 'Datos fiscales de 2026 pendientes de revisión contra la fuente. Cálculo orientativo.');
  });

  await t.test('Un dato verificado con fecha muestra "Verificado el {fecha}"', () => {
    const texto = textoVerificacion({ estadoVerificacion: 'verificado', fechaVerificacion: '2026-03-07' }, 2026);
    assert.equal(texto, 'Verificado el 07/03/2026');
  });

  await t.test('Un dato verificado sin fecha válida sigue figurando como pendiente', () => {
    const texto = textoVerificacion({ estadoVerificacion: 'verificado', fechaVerificacion: null }, 2026);
    assert.match(texto, /pendientes de revisión/);
  });

  await t.test('Etiqueta de insignia según estado', () => {
    assert.equal(etiquetaVerificacion('pendiente', 2026), 'Pendiente de revisión 2026');
    assert.equal(etiquetaVerificacion('verificado', 2026), 'Verificado 2026');
  });
});

test('Aviso legal según el estado del dato', async (t) => {
  await t.test('Un dato verificado no dice "pendiente"', () => {
    const aviso = avisoLegalVerificacion({ estadoVerificacion: 'verificado', fechaVerificacion: '2026-11-17' }, 2026, 'la AEAT');
    assert.equal(aviso, 'Verificado el 17/11/2026. Cálculo orientativo. La liquidación oficial definitiva la realiza la AEAT.');
    assert.doesNotMatch(aviso, /pendiente/);
  });

  await t.test('Un dato pendiente conserva la advertencia de revisión', () => {
    const aviso = avisoLegalVerificacion({ estadoVerificacion: 'pendiente', fechaVerificacion: null }, 2026, 'la AEAT');
    assert.match(aviso, /pendientes de revisión contra la fuente/);
    assert.match(aviso, /La liquidación oficial definitiva la realiza la AEAT\.$/);
  });
});
