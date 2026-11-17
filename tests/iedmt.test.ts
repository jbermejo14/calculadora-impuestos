import test from 'node:test';
import assert from 'node:assert/strict';
import { calcularIEDMT, getIEDMTData, type CalculoIEDMTParams } from '../lib/iedmt';

const ANIO = 2026;
const PENINSULA = 'peninsula-y-baleares';
const BASE = 20000;

/** Llamada base sin IVA ni tasa DGT, para aislar la cuota del IEDMT. */
function calcular(extra: Partial<CalculoIEDMTParams>) {
  return calcularIEDMT({
    anio: ANIO,
    baseImponible: BASE,
    emisionesCO2: 0,
    territorio: PENINSULA,
    incluirIva: false,
    incluirTasaDgt: false,
    ...extra
  });
}

test('IEDMT: epígrafes de turismo (art. 70.1)', async (t) => {
  const casos: Array<[number, string, number]> = [
    [0, '1.º', 0],
    [120, '1.º', 0],
    [120.5, '2.º', 4.75],
    [159, '2.º', 4.75],
    [160, '3.º', 9.75],
    [199, '3.º', 9.75],
    [200, '4.º', 14.75]
  ];
  for (const [co2, epigrafe, tipo] of casos) {
    await t.test(`CO2 ${co2} g/km -> epígrafe ${epigrafe} al ${tipo} %`, () => {
      const res = calcular({ emisionesCO2: co2 });
      assert.equal(res.epigrafe, epigrafe);
      assert.equal(res.tipoPorcentaje, tipo);
      assert.equal(res.cuotaIEDMT, (BASE * tipo) / 100);
    });
  }

  await t.test('Un solo motor no de combustión: epígrafe 1.º con cualquier CO2', () => {
    const res = calcular({ emisionesCO2: 250, esMotorNoCombustion: true });
    assert.equal(res.epigrafe, '1.º');
    assert.equal(res.cuotaIEDMT, 0);
  });

  await t.test('CO2 no acreditado en turismo: epígrafe 4.º', () => {
    const res = calcular({ emisionesCO2: 0, co2NoAcreditado: true });
    assert.equal(res.epigrafe, '4.º');
    assert.equal(res.cuotaIEDMT, 2950);
  });
});

test('IEDMT: epígrafes de motocicleta (art. 70.1)', async (t) => {
  const casos: Array<[number, string, number]> = [
    [0, '6.º', 0],
    [100, '6.º', 0],
    [101, '7.º', 4.75],
    [120, '7.º', 4.75],
    [121, '8.º', 9.75],
    [139, '8.º', 9.75],
    [140, '9.º', 14.75]
  ];
  for (const [co2, epigrafe, tipo] of casos) {
    await t.test(`Moto con CO2 ${co2} g/km -> epígrafe ${epigrafe} al ${tipo} %`, () => {
      const res = calcular({ tipoVehiculo: 'motocicleta', emisionesCO2: co2 });
      assert.equal(res.epigrafe, epigrafe);
      assert.equal(res.tipoPorcentaje, tipo);
      assert.equal(res.cuotaIEDMT, (BASE * tipo) / 100);
    });
  }

  await t.test('Moto eléctrica: epígrafe 1.º al 0 %', () => {
    const res = calcular({ tipoVehiculo: 'motocicleta', emisionesCO2: 300, esMotorNoCombustion: true });
    assert.equal(res.epigrafe, '1.º');
    assert.equal(res.cuotaIEDMT, 0);
  });

  await t.test('Moto con CO2 no acreditado: epígrafe 9.º', () => {
    const res = calcular({ tipoVehiculo: 'motocicleta', emisionesCO2: 50, co2NoAcreditado: true });
    assert.equal(res.epigrafe, '9.º');
  });

  await t.test('Moto de alta potencia: epígrafe 9.º con bajas emisiones', () => {
    const res = calcular({ tipoVehiculo: 'motocicleta', emisionesCO2: 80, esMotoAltaPotencia: true });
    assert.equal(res.epigrafe, '9.º');
    assert.equal(res.cuotaIEDMT, 2950);
  });

  await t.test('Moto eléctrica de alta potencia: 9.º c y aviso de interpretación', () => {
    const res = calcular({
      tipoVehiculo: 'motocicleta',
      emisionesCO2: 0,
      esMotorNoCombustion: true,
      esMotoAltaPotencia: true
    });
    assert.equal(res.epigrafe, '9.º');
    assert.ok(res.avisos.some(a => a.includes('AEAT')));
  });
});

test('IEDMT: quad y comerciales', async (t) => {
  await t.test('Quad: siempre epígrafe 4.º, aunque emita poco CO2', () => {
    const res = calcular({ tipoVehiculo: 'quad', emisionesCO2: 50 });
    assert.equal(res.epigrafe, '4.º');
    assert.equal(res.cuotaIEDMT, 2950);
  });

  await t.test('Quad eléctrico: sigue en el 4.º (el 1.º b excluye a los quads)', () => {
    const res = calcular({ tipoVehiculo: 'quad', emisionesCO2: 0, esMotorNoCombustion: true });
    assert.equal(res.epigrafe, '4.º');
  });

  await t.test('Comercial (N1) afecto: cuota 0 con el motivo de no sujeción', () => {
    const res = calcular({ tipoVehiculo: 'comercial', emisionesCO2: 180 });
    assert.equal(res.cuotaIEDMT, 0);
    assert.equal(
      res.exencionAplicada,
      'No sujeto si se afecta significativamente a una actividad económica (art. 65.1.a Ley 38/1992). Si se acondiciona como vivienda, sí está sujeto'
    );
  });
});

test('IEDMT: autocaravana', async (t) => {
  await t.test('Autocaravana N1: epígrafe por CO2 y reducción del 30 % de la base', () => {
    const res = calcular({ tipoVehiculo: 'autocaravana', emisionesCO2: 135 });
    assert.equal(res.epigrafe, '2.º');
    assert.equal(res.reduccionBasePorcentaje, 30);
    assert.equal(res.baseImponibleAplicada, 14000);
    assert.equal(res.cuotaIEDMT, 665);
  });

  await t.test('Autocaravana N2/N3: epígrafe 4.º c con reducción del 30 %', () => {
    const res = calcular({ tipoVehiculo: 'autocaravana', emisionesCO2: 100, esN2N3Vivienda: true });
    assert.equal(res.epigrafe, '4.º');
    assert.equal(res.baseImponibleAplicada, 14000);
    assert.equal(res.cuotaIEDMT, 2065);
  });

  await t.test('La casilla N2/N3 solo cuenta en autocaravanas', () => {
    const res = calcular({ tipoVehiculo: 'turismo', emisionesCO2: 100, esN2N3Vivienda: true });
    assert.equal(res.epigrafe, '1.º');
  });

  await t.test('Autocaravana y familia numerosa: 30 % y después 50 %, con aviso', () => {
    const res = calcular({ tipoVehiculo: 'autocaravana', emisionesCO2: 135, esFamiliaNumerosa: true, plazas: 5 });
    assert.equal(res.baseImponibleAplicada, 7000);
    assert.equal(res.reduccionBasePorcentaje, 65);
    assert.equal(res.cuotaIEDMT, 332.5);
    assert.ok(res.avisos.some(a => a.includes('sucesivamente')));
  });
});

test('IEDMT: familia numerosa (art. 66.4)', async (t) => {
  const casos: Array<[number, boolean]> = [[4, false], [5, true], [9, true], [10, false]];
  for (const [plazas, aplica] of casos) {
    await t.test(`${plazas} plazas -> ${aplica ? 'reduce el 50 %' : 'no reduce y lo explica'}`, () => {
      const res = calcular({ emisionesCO2: 140, esFamiliaNumerosa: true, plazas });
      assert.equal(res.baseImponibleAplicada, aplica ? 10000 : BASE);
      assert.equal(res.cuotaIEDMT, aplica ? 475 : 950);
      assert.equal(res.avisos.length > 0, !aplica);
    });
  }

  await t.test('Por defecto se asumen 5 plazas', () => {
    const res = calcular({ emisionesCO2: 140, esFamiliaNumerosa: true });
    assert.equal(res.baseImponibleAplicada, 10000);
  });

  await t.test('En moto y quad no se aplica y se explica', () => {
    for (const tipoVehiculo of ['motocicleta', 'quad'] as const) {
      const res = calcular({ tipoVehiculo, emisionesCO2: 150, esFamiliaNumerosa: true, plazas: 5 });
      assert.equal(res.baseImponibleAplicada, BASE);
      assert.ok(res.avisos.some(a => a.includes('automóviles')));
    }
  });
});

test('IEDMT: minusvalía (art. 66.1.d)', async (t) => {
  await t.test('Turismo: exento con el motivo legal', () => {
    const res = calcular({ emisionesCO2: 220, esMinusvalia: true });
    assert.equal(res.cuotaIEDMT, 0);
    assert.equal(
      res.exencionAplicada,
      'Exención para vehículos matriculados a nombre de personas con discapacidad para su uso exclusivo (art. 66.1.d Ley 38/1992). Requiere reconocimiento previo de la AEAT'
    );
  });

  await t.test('Autocaravana: exenta', () => {
    const res = calcular({ tipoVehiculo: 'autocaravana', emisionesCO2: 220, esMinusvalia: true });
    assert.equal(res.cuotaIEDMT, 0);
  });

  await t.test('Motocicleta: no exime y avisa', () => {
    const res = calcular({ tipoVehiculo: 'motocicleta', emisionesCO2: 150, esMinusvalia: true });
    assert.equal(res.exencionAplicada, null);
    assert.equal(res.cuotaIEDMT, 2950);
    assert.ok(res.avisos.some(a => a.includes('automóviles')));
  });
});

test('IEDMT: territorios', async (t) => {
  await t.test('Canarias: 0, 3,75, 8,75 y 13,75 % (turismo) y 11 % del 5.º en los datos', () => {
    const tipos = [90, 130, 170, 220].map(
      co2 => calcular({ territorio: 'canarias', baseImponible: 10000, emisionesCO2: co2 }).tipoPorcentaje
    );
    assert.deepEqual(tipos, [0, 3.75, 8.75, 13.75]);
    const quinto = getIEDMTData(ANIO).territorios.canarias.tramos.find(tr => tr.epigrafe === '5.º');
    assert.equal(quinto?.tipoPorcentaje, 11);
  });

  await t.test('Canarias: moto en epígrafes 7.º a 9.º', () => {
    const res = calcular({ territorio: 'canarias', tipoVehiculo: 'motocicleta', emisionesCO2: 130, baseImponible: 10000 });
    assert.equal(res.epigrafe, '8.º');
    assert.equal(res.cuotaIEDMT, 875);
  });

  await t.test('Península: el 5.º se guarda al 12 %', () => {
    const quinto = getIEDMTData(ANIO).territorios[PENINSULA].tramos.find(tr => tr.epigrafe === '5.º');
    assert.equal(quinto?.tipoPorcentaje, 12);
  });

  await t.test('Ceuta y Melilla: 0 % con el motivo del art. 70.2.c', () => {
    const res = calcular({ territorio: 'ceuta-y-melilla', baseImponible: 30000, emisionesCO2: 250 });
    assert.equal(res.epigrafe, '4.º');
    assert.equal(res.tipoPorcentaje, 0);
    assert.equal(res.cuotaIEDMT, 0);
    assert.equal(res.exencionAplicada, 'Tipo del 0 % en Ceuta y Melilla (art. 70.2.c Ley 38/1992)');
  });

  await t.test('Territorio desconocido: error explicativo', () => {
    assert.throws(() => calcular({ territorio: 'marte' }), /Territorio no reconocido/);
  });
});

test('IEDMT: totales y texto fijo', async (t) => {
  await t.test('IVA 21 % y Tasa DGT 1.1 sobre un turismo del epígrafe 2.º', () => {
    const res = calcularIEDMT({
      anio: ANIO,
      baseImponible: 25000,
      emisionesCO2: 135,
      territorio: PENINSULA,
      incluirIva: true,
      incluirTasaDgt: true
    });
    assert.equal(res.cuotaIEDMT, 1187.5);
    assert.equal(res.cuotaIva, 5250);
    assert.equal(res.tasaDgtImporte, 99.77);
    assert.equal(res.totalImpuestosYTasas, 6537.27);
    assert.equal(res.totalConVehiculo, 31537.27);
  });

  await t.test('Nota fija sobre tipos estatales (art. 70.2.b)', () => {
    const res = calcular({ emisionesCO2: 100 });
    assert.equal(
      res.notaTipos,
      'Se aplican los tipos estatales del art. 70.2.b. Una comunidad autónoma puede aprobar tipos propios (art. 70.2.a).'
    );
  });

  await t.test('Todos los tramos nuevos (5.º a 9.º) están verificados con fuente y fecha', () => {
    for (const terr of Object.values(getIEDMTData(ANIO).territorios)) {
      const nuevos = terr.tramos.filter(tr => ['5.º', '6.º', '7.º', '8.º', '9.º'].includes(tr.epigrafe));
      assert.equal(nuevos.length, 5);
      for (const tr of nuevos) {
        assert.equal(tr.estadoVerificacion, 'verificado');
        assert.equal(tr.fechaVerificacion, '2026-11-17');
        assert.equal(tr.fuente, 'https://www.boe.es/buscar/act.php?id=BOE-A-1992-28741#a70');
      }
    }
  });
});
