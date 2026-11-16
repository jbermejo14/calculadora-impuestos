import test from 'node:test';
import assert from 'node:assert/strict';
import { calcularIEDMT, determinarTramoCO2 } from '../lib/iedmt';

test('Cálculos del Impuesto de Matriculación (IEDMT) sin red', async (t) => {
  const anio = 2026;

  await t.test('Península e Islas Baleares: Epígrafe 1 (≤ 120 g/km CO2 -> 0 %)', () => {
    const res = calcularIEDMT({
      anio,
      baseImponible: 20000,
      emisionesCO2: 110,
      territorio: 'peninsula-y-baleares',
      incluirIva: false,
      incluirTasaDgt: false
    });
    assert.equal(res.epigrafe, '1.º');
    assert.equal(res.tipoPorcentaje, 0.0);
    assert.equal(res.cuotaIEDMT, 0.0);
  });

  await t.test('Península e Islas Baleares: Epígrafe 2 (> 120 y < 160 g/km CO2 -> 4,75 %)', () => {
    const res = calcularIEDMT({
      anio,
      baseImponible: 20000,
      emisionesCO2: 135,
      territorio: 'peninsula-y-baleares',
      incluirIva: false,
      incluirTasaDgt: false
    });
    assert.equal(res.epigrafe, '2.º');
    assert.equal(res.tipoPorcentaje, 4.75);
    assert.equal(res.cuotaIEDMT, 950.0); // 20000 * 0.0475
  });

  await t.test('Península e Islas Baleares: Epígrafe 3 (≥ 160 y < 200 g/km CO2 -> 9,75 %)', () => {
    const res = calcularIEDMT({
      anio,
      baseImponible: 20000,
      emisionesCO2: 175,
      territorio: 'peninsula-y-baleares',
      incluirIva: false,
      incluirTasaDgt: false
    });
    assert.equal(res.epigrafe, '3.º');
    assert.equal(res.tipoPorcentaje, 9.75);
    assert.equal(res.cuotaIEDMT, 1950.0); // 20000 * 0.0975
  });

  await t.test('Península e Islas Baleares: Epígrafe 4 (≥ 200 g/km CO2 -> 14,75 %)', () => {
    const res = calcularIEDMT({
      anio,
      baseImponible: 20000,
      emisionesCO2: 210,
      territorio: 'peninsula-y-baleares',
      incluirIva: false,
      incluirTasaDgt: false
    });
    assert.equal(res.epigrafe, '4.º');
    assert.equal(res.tipoPorcentaje, 14.75);
    assert.equal(res.cuotaIEDMT, 2950.0); // 20000 * 0.1475
  });

  await t.test('Canarias: tipos especiales reducidos (0 %, 3,75 %, 8,75 %, 13,75 %)', () => {
    const res1 = calcularIEDMT({ anio, baseImponible: 10000, emisionesCO2: 90, territorio: 'canarias', incluirIva: false, incluirTasaDgt: false });
    assert.equal(res1.tipoPorcentaje, 0.0);
    assert.equal(res1.cuotaIEDMT, 0.0);

    const res2 = calcularIEDMT({ anio, baseImponible: 10000, emisionesCO2: 130, territorio: 'canarias', incluirIva: false, incluirTasaDgt: false });
    assert.equal(res2.tipoPorcentaje, 3.75);
    assert.equal(res2.cuotaIEDMT, 375.0);

    const res3 = calcularIEDMT({ anio, baseImponible: 10000, emisionesCO2: 170, territorio: 'canarias', incluirIva: false, incluirTasaDgt: false });
    assert.equal(res3.tipoPorcentaje, 8.75);
    assert.equal(res3.cuotaIEDMT, 875.0);

    const res4 = calcularIEDMT({ anio, baseImponible: 10000, emisionesCO2: 220, territorio: 'canarias', incluirIva: false, incluirTasaDgt: false });
    assert.equal(res4.tipoPorcentaje, 13.75);
    assert.equal(res4.cuotaIEDMT, 1375.0);
  });

  await t.test('Ceuta y Melilla: tipo del 0 % en todos los epígrafes', () => {
    const res = calcularIEDMT({
      anio,
      baseImponible: 30000,
      emisionesCO2: 250,
      territorio: 'ceuta-y-melilla',
      incluirIva: false,
      incluirTasaDgt: false
    });
    assert.equal(res.tipoPorcentaje, 0.0);
    assert.equal(res.cuotaIEDMT, 0.0);
  });

  await t.test('Bonificación Familia Numerosa: reducción 50 % en la base imponible', () => {
    const res = calcularIEDMT({
      anio,
      baseImponible: 30000,
      emisionesCO2: 140, // 4.75%
      territorio: 'peninsula-y-baleares',
      esFamiliaNumerosa: true,
      incluirIva: false,
      incluirTasaDgt: false
    });
    assert.equal(res.baseImponibleOriginal, 30000);
    assert.equal(res.baseImponibleAplicada, 15000);
    assert.equal(res.cuotaIEDMT, 712.5); // 15000 * 0.0475
  });

  await t.test('Exención Minusvalía / Movilidad Reducida: cuota IEDMT 0 €', () => {
    const res = calcularIEDMT({
      anio,
      baseImponible: 40000,
      emisionesCO2: 220, // 14.75%
      territorio: 'peninsula-y-baleares',
      esMinusvalia: true,
      incluirIva: false,
      incluirTasaDgt: false
    });
    assert.equal(res.cuotaIEDMT, 0.0);
    assert.ok(res.exencionAplicada?.includes('Minusvalía'));
  });

  await t.test('Exención Vehículo Comercial afecto: cuota IEDMT 0 €', () => {
    const res = calcularIEDMT({
      anio,
      baseImponible: 35000,
      emisionesCO2: 180,
      territorio: 'peninsula-y-baleares',
      tipoVehiculo: 'comercial',
      incluirIva: false,
      incluirTasaDgt: false
    });
    assert.equal(res.cuotaIEDMT, 0.0);
    assert.ok(res.exencionAplicada?.includes('comercial'));
  });

  await t.test('Cálculo con IVA (21 %) y Tasa DGT de primera matriculación (99,77 €)', () => {
    const res = calcularIEDMT({
      anio,
      baseImponible: 25000,
      emisionesCO2: 135, // 4.75% -> 1187.5 €
      territorio: 'peninsula-y-baleares',
      incluirIva: true, // 5250 €
      incluirTasaDgt: true // 99.77 €
    });
    assert.equal(res.cuotaIEDMT, 1187.5);
    assert.equal(res.cuotaIva, 5250.0);
    assert.equal(res.tasaDgtImporte, 99.77);
    assert.equal(res.totalImpuestosYTasas, 6537.27);
    assert.equal(res.totalConVehiculo, 31537.27);
  });
});
