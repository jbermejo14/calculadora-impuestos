import test from 'node:test';
import assert from 'node:assert/strict';
import { calcularITP, getCoeficienteDepreciacion, getComunidadesList } from '../lib/itp';

test('Cálculos del ITP de vehículos usados y depreciación BOE sin red', async (t) => {
  const anio = 2026;

  await t.test('Fronteras exactas de la tabla de depreciación BOE (Anexo IV)', () => {
    // Hasta 1 año: 100%
    assert.equal(getCoeficienteDepreciacion(anio, 0).coeficiente, 1.00);
    assert.equal(getCoeficienteDepreciacion(anio, 0.5).coeficiente, 1.00);
    assert.equal(getCoeficienteDepreciacion(anio, 1.0).coeficiente, 1.00);

    // Más de 1 año hasta 2 años: 84%
    assert.equal(getCoeficienteDepreciacion(anio, 1.01).coeficiente, 0.84);
    assert.equal(getCoeficienteDepreciacion(anio, 1.5).coeficiente, 0.84);
    assert.equal(getCoeficienteDepreciacion(anio, 2.0).coeficiente, 0.84);

    // Más de 2 años hasta 3 años: 67%
    assert.equal(getCoeficienteDepreciacion(anio, 2.01).coeficiente, 0.67);
    assert.equal(getCoeficienteDepreciacion(anio, 3.0).coeficiente, 0.67);

    // Más de 3 años hasta 4 años: 56%
    assert.equal(getCoeficienteDepreciacion(anio, 3.01).coeficiente, 0.56);
    assert.equal(getCoeficienteDepreciacion(anio, 4.0).coeficiente, 0.56);

    // Más de 4 años hasta 5 años: 47%
    assert.equal(getCoeficienteDepreciacion(anio, 4.01).coeficiente, 0.47);
    assert.equal(getCoeficienteDepreciacion(anio, 5.0).coeficiente, 0.47);

    // Más de 5 años hasta 6 años: 39%
    assert.equal(getCoeficienteDepreciacion(anio, 5.01).coeficiente, 0.39);
    assert.equal(getCoeficienteDepreciacion(anio, 6.0).coeficiente, 0.39);

    // Más de 6 años hasta 7 años: 34%
    assert.equal(getCoeficienteDepreciacion(anio, 6.01).coeficiente, 0.34);
    assert.equal(getCoeficienteDepreciacion(anio, 7.0).coeficiente, 0.34);

    // Más de 7 años hasta 8 años: 28%
    assert.equal(getCoeficienteDepreciacion(anio, 7.01).coeficiente, 0.28);
    assert.equal(getCoeficienteDepreciacion(anio, 8.0).coeficiente, 0.28);

    // Más de 8 años hasta 9 años: 24%
    assert.equal(getCoeficienteDepreciacion(anio, 8.01).coeficiente, 0.24);
    assert.equal(getCoeficienteDepreciacion(anio, 9.0).coeficiente, 0.24);

    // Más de 9 años hasta 10 años: 19%
    assert.equal(getCoeficienteDepreciacion(anio, 9.01).coeficiente, 0.19);
    assert.equal(getCoeficienteDepreciacion(anio, 10.0).coeficiente, 0.19);

    // Más de 10 años hasta 11 años: 17%
    assert.equal(getCoeficienteDepreciacion(anio, 10.01).coeficiente, 0.17);
    assert.equal(getCoeficienteDepreciacion(anio, 11.0).coeficiente, 0.17);

    // Más de 11 años hasta 12 años: 13%
    assert.equal(getCoeficienteDepreciacion(anio, 11.01).coeficiente, 0.13);
    assert.equal(getCoeficienteDepreciacion(anio, 12.0).coeficiente, 0.13);

    // Más de 12 años: 10%
    assert.equal(getCoeficienteDepreciacion(anio, 12.01).coeficiente, 0.10);
    assert.equal(getCoeficienteDepreciacion(anio, 15.0).coeficiente, 0.10);
    assert.equal(getCoeficienteDepreciacion(anio, 25.0).coeficiente, 0.10);
  });

  await t.test('Verificación de ITP para cada una de las 19 comunidades/ciudades autónomas', () => {
    const comunidades = getComunidadesList(anio);
    assert.equal(comunidades.length, 19);

    for (const com of comunidades) {
      const res = calcularITP({
        anio,
        comunidadSlug: com.slug,
        precioContrato: 10000,
        valorNuevoBoe: 20000,
        antiguedadAnios: 3.5, // 56% -> valor fiscal = 11.200 € (mayor que precio contrato)
        incluirTasaDgt: false,
        incluirGestoria: false
      });

      assert.equal(res.comunidad.slug, com.slug);
      assert.equal(res.criterioBase, 'valor_fiscal');
      assert.equal(res.baseLiquidable, 11200.0);
      assert.ok(res.cuotaITP >= 0);
      assert.ok(res.tipoPorcentajeAplicado > 0);
      assert.ok(res.norma.length > 5);
      assert.ok(res.fuente.startsWith('http'));
    }
  });

  await t.test('Caso Especial: Compraventa profesional (concesionario)', () => {
    const res = calcularITP({
      anio,
      comunidadSlug: 'madrid',
      precioContrato: 15000,
      valorNuevoBoe: 25000,
      antiguedadAnios: 4,
      esCompraventaProfesional: true,
      incluirTasaDgt: true
    });

    assert.equal(res.cuotaITP, 0.0);
    assert.equal(res.esExentoOcuotaCero, true);
    assert.equal(res.criterioBase, 'exento_profesional');
    assert.equal(res.tasaDgtImporte, 55.70); // Tasa 1.5 DGT
    assert.equal(res.totalGastosTransferencia, 55.70);
  });

  await t.test('Caso Especial: Ciclomotores exentos en Cataluña, Baleares y Navarra', () => {
    const resCat = calcularITP({ anio, comunidadSlug: 'catalunya', precioContrato: 1200, valorNuevoBoe: 2000, antiguedadAnios: 2, esCiclomotor: true, incluirTasaDgt: true });
    assert.equal(resCat.cuotaITP, 0.0);
    assert.equal(resCat.esExentoOcuotaCero, true);
    assert.equal(resCat.tasaDgtImporte, 27.85); // Tasa reducida 1.2 DGT

    const resBal = calcularITP({ anio, comunidadSlug: 'baleares', precioContrato: 1200, valorNuevoBoe: 2000, antiguedadAnios: 2, esCiclomotor: true, incluirTasaDgt: true });
    assert.equal(resBal.cuotaITP, 0.0);
    assert.equal(resBal.esExentoOcuotaCero, true);
    assert.equal(resBal.tasaDgtImporte, 27.85);

    const resNav = calcularITP({ anio, comunidadSlug: 'navarra', precioContrato: 1200, valorNuevoBoe: 2000, antiguedadAnios: 2, esCiclomotor: true, incluirTasaDgt: true });
    assert.equal(resNav.cuotaITP, 0.0);
    assert.equal(resNav.esExentoOcuotaCero, true);
    assert.equal(resNav.tasaDgtImporte, 27.85);

    // En Madrid pagan el 4% ordinario con tasa DGT de ciclomotor 27.85 €
    const resMad = calcularITP({ anio, comunidadSlug: 'madrid', precioContrato: 1000, valorNuevoBoe: 1000, antiguedadAnios: 1, esCiclomotor: true, incluirTasaDgt: true });
    assert.equal(resMad.cuotaITP, 40.0);
    assert.equal(resMad.tasaDgtImporte, 27.85);
  });

  await t.test('Caso Especial: Cataluña exención > 10 años y valor < 40.000 € (salvo históricos)', () => {
    // Coche normal de 11 años con valor BOE de 15.000 € -> valor depreciado = 15000 * 0.13 = 1950 € (< 40.000 €) -> Exento (0 €)
    const resExento = calcularITP({
      anio,
      comunidadSlug: 'catalunya',
      precioContrato: 2000,
      valorNuevoBoe: 15000,
      antiguedadAnios: 11.5,
      esHistorico: false,
      incluirTasaDgt: false
    });
    assert.equal(resExento.cuotaITP, 0.0);
    assert.equal(resExento.esExentoOcuotaCero, true);

    // Si es vehículo histórico, NO aplica la exención
    const resHistorico = calcularITP({
      anio,
      comunidadSlug: 'catalunya',
      precioContrato: 2000,
      valorNuevoBoe: 15000,
      antiguedadAnios: 11.5,
      esHistorico: true,
      incluirTasaDgt: false
    });
    assert.equal(resHistorico.esExentoOcuotaCero, false);
    assert.equal(resHistorico.tipoPorcentajeAplicado, 5.0);
    assert.equal(resHistorico.cuotaITP, 100.0); // 2000 € * 5%
  });

  await t.test('Caso Especial: vehículo histórico en Comunitat Valenciana no recibe cuota fija ni se fuerza al 8 %', () => {
    // Ley 13/1997, art. 13.Tres.3: el 8 % es para vehículos de hasta 5 años con más de 2.000 cc o de valor
    // igual o superior a 20.000 €; los históricos quedan excluidos de las cuotas fijas y tributan al 6 %.
    const res = calcularITP({
      anio,
      comunidadSlug: 'comunidad-valenciana',
      precioContrato: 8000,
      valorNuevoBoe: 12000,
      antiguedadAnios: 15,
      esHistorico: true,
      incluirTasaDgt: false
    });
    assert.equal(res.tipoPorcentajeAplicado, 6.0);
    assert.equal(res.cuotaITP, 480.0); // 8000 * 0.06
  });

  await t.test('Caso Especial: Tipo incrementado por potencia fiscal > 15 CVF en Andalucía (8 %)', () => {
    const resAltaPotencia = calcularITP({
      anio,
      comunidadSlug: 'andalucia',
      precioContrato: 25000,
      valorNuevoBoe: 50000,
      antiguedadAnios: 5, // 47% -> 23.500 € (precio contrato 25.000 € es mayor)
      potenciaFiscalCVF: 18.5,
      incluirTasaDgt: false
    });
    assert.equal(resAltaPotencia.tipoPorcentajeAplicado, 8.0);
    assert.equal(resAltaPotencia.cuotaITP, 2000.0); // 25000 * 0.08

    const resPotenciaNormal = calcularITP({
      anio,
      comunidadSlug: 'andalucia',
      precioContrato: 25000,
      valorNuevoBoe: 50000,
      antiguedadAnios: 5,
      potenciaFiscalCVF: 11.0,
      incluirTasaDgt: false
    });
    assert.equal(resPotenciaNormal.tipoPorcentajeAplicado, 4.0);
    assert.equal(resPotenciaNormal.cuotaITP, 1000.0); // 25000 * 0.04
  });

  await t.test('Caso Especial: Etiqueta CERO emisiones en Galicia (0 %) y Andalucía (1 %)', () => {
    const resGalicia = calcularITP({
      anio,
      comunidadSlug: 'galicia',
      precioContrato: 20000,
      valorNuevoBoe: 30000,
      antiguedadAnios: 2,
      esCeroEmisiones: true,
      incluirTasaDgt: false
    });
    assert.equal(resGalicia.tipoPorcentajeAplicado, 0.0);
    assert.equal(resGalicia.cuotaITP, 0.0);
    assert.equal(resGalicia.esExentoOcuotaCero, true);

    const resAndalucia = calcularITP({
      anio,
      comunidadSlug: 'andalucia',
      precioContrato: 20000,
      valorNuevoBoe: 30000,
      antiguedadAnios: 2,
      esCeroEmisiones: true,
      incluirTasaDgt: false
    });
    assert.equal(resAndalucia.tipoPorcentajeAplicado, 1.0);
    assert.equal(resAndalucia.baseLiquidable, 25200.0);
    assert.equal(resAndalucia.cuotaITP, 252.0); // 25200 * 0.01
  });
});

type ParamsITP = Parameters<typeof calcularITP>[0];

const ITP_PRUEBA_ANIO = 2026;

/** Vehículo antiguo de bajo valor: la base y el valor fiscal no interfieren con las cuotas fijas. */
function itpPrueba(comunidadSlug: string, extra: Partial<ParamsITP>) {
  return calcularITP({
    anio: ITP_PRUEBA_ANIO,
    comunidadSlug,
    precioContrato: 3000,
    valorNuevoBoe: 15000,
    antiguedadAnios: 13,
    incluirTasaDgt: false,
    ...extra
  });
}

function itpCuotas(slug: string, antiguedad: number, cilindradas: number[], extra: Partial<ParamsITP> = {}): number[] {
  return cilindradas.map(cc => itpPrueba(slug, { antiguedadAnios: antiguedad, cilindradaCC: cc, ...extra }).cuotaITP);
}

test('Cuotas fijas por antigüedad y cilindrada (motor de reglas de datos)', async t => {
  await t.test('Aragón: más de 10 años, límites de cilindrada 1.000, 1.500 y 2.000 cc', () => {
    assert.deepEqual(itpCuotas('aragon', 10.5, [1000, 1001, 1500, 1501, 2000]), [0, 20, 20, 30, 30]);
    // Antigüedad exacta (10) no es "más de 10": tipo general 4 % sobre el valor fiscal 15.000 * 0,19 = 2.850 €
    // frente al contrato de 3.000 €.
    assert.equal(itpPrueba('aragon', { antiguedadAnios: 10, cilindradaCC: 1400 }).cuotaITP, 120);
    // Más de 2.000 cc: tipo general
    assert.equal(itpPrueba('aragon', { antiguedadAnios: 10.5, cilindradaCC: 2001 }).tipoPorcentajeAplicado, 4);
  });

  await t.test('Canarias: más de 10 años, turismos no históricos', () => {
    assert.deepEqual(itpCuotas('canarias', 10.5, [1000, 1001, 1500, 1501, 2000]), [40, 70, 70, 115, 115]);
    assert.equal(itpPrueba('canarias', { antiguedadAnios: 10, cilindradaCC: 1400 }).tipoPorcentajeAplicado, 5.5);
    assert.equal(itpPrueba('canarias', { antiguedadAnios: 10.5, cilindradaCC: 2001 }).tipoPorcentajeAplicado, 5.5);
    assert.equal(itpPrueba('canarias', { antiguedadAnios: 11, cilindradaCC: 1400, esHistorico: true }).tipoPorcentajeAplicado, 5.5);
    assert.equal(itpPrueba('canarias', { antiguedadAnios: 11, cilindradaCC: 1400, tipoVehiculo: 'motocicleta' }).tipoPorcentajeAplicado, 5.5);
  });

  await t.test('Cantabria: más de 10 años, límites 999, 1.499 y 1.999 cc inclusivos', () => {
    assert.deepEqual(itpCuotas('cantabria', 10.5, [999, 1000, 1499, 1500, 1999]), [45, 60, 60, 90, 90]);
    assert.equal(itpPrueba('cantabria', { antiguedadAnios: 10.5, cilindradaCC: 2000 }).tipoPorcentajeAplicado, 6);
    assert.equal(itpPrueba('cantabria', { antiguedadAnios: 10, cilindradaCC: 1400 }).tipoPorcentajeAplicado, 6);
    assert.equal(itpPrueba('cantabria', { antiguedadAnios: 11, cilindradaCC: 1400, esHistorico: true }).tipoPorcentajeAplicado, 6);
  });

  await t.test('Galicia: quince o más años, límites 1.199 y 1.599 cc', () => {
    assert.deepEqual(itpCuotas('galicia', 15, [1199, 1200, 1599]), [22, 38, 38]);
    assert.equal(itpPrueba('galicia', { antiguedadAnios: 15, cilindradaCC: 1600 }).tipoPorcentajeAplicado, 3);
    // Menos de 15 años: tipo del 3 % (valor fiscal 15.000 * 0,10 = 1.500 €; contrato 3.000 €)
    const res = itpPrueba('galicia', { antiguedadAnios: 14.5, cilindradaCC: 1000 });
    assert.equal(res.tipoPorcentajeAplicado, 3);
    assert.equal(res.cuotaITP, 90);
  });

  await t.test('Murcia: más de 12 años, límites 1.000, 1.500 y 2.000 cc; la cuota 0 es cuota cero', () => {
    assert.deepEqual(itpCuotas('murcia', 13, [1000, 1001, 1500, 1501, 2000, 2001]), [0, 30, 30, 50, 50, 75]);
    assert.equal(itpPrueba('murcia', { antiguedadAnios: 13, cilindradaCC: 1000 }).esExentoOcuotaCero, true);
    // Exactamente 12 años no es "más de 12": 4 % sobre el contrato de 3.000 €
    assert.equal(itpPrueba('murcia', { antiguedadAnios: 12, cilindradaCC: 1400 }).cuotaITP, 120);
    // La regla es para todos los vehículos, también motocicletas
    assert.equal(itpPrueba('murcia', { antiguedadAnios: 13, cilindradaCC: 1200, tipoVehiculo: 'motocicleta' }).cuotaITP, 30);
  });

  await t.test('Comunitat Valenciana: más de 12 años, turismos, límites 1.500 y 2.000 cc', () => {
    assert.deepEqual(itpCuotas('comunidad-valenciana', 13, [1500, 1501, 2000, 2001]), [40, 60, 60, 140]);
  });

  await t.test('Comunitat Valenciana: de 5 (exclusivo) a 12 años (inclusivo)', () => {
    assert.deepEqual(itpCuotas('comunidad-valenciana', 12, [1500, 1501, 2000, 2001]), [120, 180, 180, 280]);
    assert.deepEqual(itpCuotas('comunidad-valenciana', 5.5, [1400]), [120]);
    // 5 años exactos no entra: tipo general del 6 % sobre el valor fiscal 15.000 * 0,47 = 7.050 € (> contrato)
    assert.equal(itpPrueba('comunidad-valenciana', { antiguedadAnios: 5, cilindradaCC: 1400 }).tipoPorcentajeAplicado, 6);
  });

  await t.test('Comunitat Valenciana: motocicletas y ciclomotores, límites 250, 550 y 750 cc', () => {
    const cc = [250, 251, 550, 551, 750, 751];
    assert.deepEqual(itpCuotas('comunidad-valenciana', 13, cc, { tipoVehiculo: 'motocicleta' }), [10, 20, 20, 35, 35, 55]);
    assert.deepEqual(itpCuotas('comunidad-valenciana', 13, cc, { tipoVehiculo: 'ciclomotor' }), [10, 20, 20, 35, 35, 55]);
    assert.deepEqual(itpCuotas('comunidad-valenciana', 8, [250, 751], { tipoVehiculo: 'motocicleta' }), [30, 140]);
  });

  await t.test('Comunitat Valenciana: límite de 20.000 € sobre el valor fiscal (estrictamente menor)', () => {
    // 6,5 años: coeficiente 0,34. 58.000 * 0,34 = 19.720 € -> cuota fija
    const bajo = itpPrueba('comunidad-valenciana', { antiguedadAnios: 6.5, valorNuevoBoe: 58000, precioContrato: 1000, cilindradaCC: 1400 });
    assert.equal(bajo.cuotaITP, 120);
    // 60.000 * 0,34 = 20.400 € -> sin cuota fija, tipo del 8 % por valor igual o superior a 20.000 €
    const alto = itpPrueba('comunidad-valenciana', { antiguedadAnios: 6.5, valorNuevoBoe: 60000, precioContrato: 1000, cilindradaCC: 1400 });
    assert.equal(alto.tipoPorcentajeAplicado, 8);
    assert.equal(alto.cuotaITP, 1632); // 20.400 * 0,08
  });

  await t.test('Comunitat Valenciana: 8 % hasta 5 años con más de 2.000 cc; 6 % para CERO e híbridos de menos de 2.000 cc', () => {
    const base = { antiguedadAnios: 3, valorNuevoBoe: 20000, precioContrato: 10000 };
    assert.equal(itpPrueba('comunidad-valenciana', { ...base, cilindradaCC: 2001 }).tipoPorcentajeAplicado, 8);
    assert.equal(itpPrueba('comunidad-valenciana', { ...base, cilindradaCC: 2000 }).tipoPorcentajeAplicado, 6);
    assert.equal(itpPrueba('comunidad-valenciana', { ...base, antiguedadAnios: 5, cilindradaCC: 2001 }).tipoPorcentajeAplicado, 8);
    // CERO con más de 2.000 cc solo puede ser un híbrido enchufable: art. 13.Tres.3 lo grava al 8 %.
    assert.equal(itpPrueba('comunidad-valenciana', { ...base, cilindradaCC: 2001, distintivo: 'cero' }).tipoPorcentajeAplicado, 8);
    assert.equal(itpPrueba('comunidad-valenciana', { ...base, cilindradaCC: 0, distintivo: 'cero' }).tipoPorcentajeAplicado, 6);
    assert.equal(itpPrueba('comunidad-valenciana', { ...base, cilindradaCC: 1600, distintivo: 'eco' }).tipoPorcentajeAplicado, 6);
    assert.equal(itpPrueba('comunidad-valenciana', { ...base, cilindradaCC: 2001, distintivo: 'eco' }).tipoPorcentajeAplicado, 8);
  });

  await t.test('El motivo de una cuota fija cita la norma de la comunidad', () => {
    const res = itpPrueba('murcia', { antiguedadAnios: 13, cilindradaCC: 1400 });
    assert.ok(res.motivoExencionOCuotaCero?.includes('30,00 €'));
    assert.ok(res.motivoExencionOCuotaCero?.includes('Decreto Legislativo 1/2010'));
  });

  await t.test('Sin cilindrada informada (0 cc) no se aplican cuotas fijas', () => {
    assert.equal(itpPrueba('murcia', { antiguedadAnios: 13, cilindradaCC: 0 }).tipoPorcentajeAplicado, 4);
  });

  await t.test('Los datos de cada regla son coherentes y no quedan cuotas fijas sin reglas', () => {
    for (const com of getComunidadesList(ITP_PRUEBA_ANIO)) {
      if (!com.cuotasFijasAntiguedad) continue;
      assert.ok(com.cuotasFijasAntiguedad.reglas.length > 0, `Sin reglas en ${com.slug}`);
      for (const regla of com.cuotasFijasAntiguedad.reglas) {
        assert.ok(regla.cuota >= 0);
        if (regla.cilindradaMinima !== null && regla.cilindradaMaxima !== null) {
          assert.ok(regla.cilindradaMinima < regla.cilindradaMaxima, `Tramo invertido en ${com.slug}`);
        }
        assert.equal(regla.valorMaximo === null, regla.valorReferencia === null, `Límite de valor incompleto en ${com.slug}`);
      }
    }
  });
});

test('Exoneración de diez años en Cataluña y Navarra', async t => {
  await t.test('Cataluña: diez años exactos entra; menos no', () => {
    const exacto = itpPrueba('catalunya', { antiguedadAnios: 10 });
    assert.equal(exacto.cuotaITP, 0);
    assert.equal(exacto.esExentoOcuotaCero, true);
    assert.equal(itpPrueba('catalunya', { antiguedadAnios: 9.5 }).tipoPorcentajeAplicado, 5);
  });

  await t.test('Cataluña: el límite de 40.000 € usa el precio medio sin depreciar', () => {
    // 40.000 € exactos: "igual o superior" no exonera, aunque el valor depreciado sea ínfimo
    const limite = itpPrueba('catalunya', { antiguedadAnios: 11.5, valorNuevoBoe: 40000, precioContrato: 5000 });
    assert.equal(limite.esExentoOcuotaCero, false);
    assert.equal(limite.tipoPorcentajeAplicado, 5);
    const debajo = itpPrueba('catalunya', { antiguedadAnios: 11.5, valorNuevoBoe: 39999, precioContrato: 5000 });
    assert.equal(debajo.esExentoOcuotaCero, true);
  });

  await t.test('Cataluña: el motivo aclara que no es una exención', () => {
    const res = itpPrueba('catalunya', { antiguedadAnios: 10 });
    assert.ok(res.motivoExencionOCuotaCero?.includes('Sin obligación de presentar autoliquidación (no es una exención)'));
  });

  await t.test('Navarra: diez años exactos entra; el límite de 40.000 € compara el valor fiscal', () => {
    assert.equal(itpPrueba('navarra', { antiguedadAnios: 10 }).esExentoOcuotaCero, true);
    assert.equal(itpPrueba('navarra', { antiguedadAnios: 9.5 }).esExentoOcuotaCero, false);
    // 400.000 * 0,13 = 52.000 € de valor fiscal: supera el límite y tributa al 4 %
    const alta = itpPrueba('navarra', { antiguedadAnios: 11.5, valorNuevoBoe: 400000, precioContrato: 1000 });
    assert.equal(alta.esExentoOcuotaCero, false);
    assert.equal(alta.cuotaITP, 2080);
    // 300.000 * 0,13 = 39.000 € de valor fiscal: por debajo del límite, aunque el precio pactado sea mayor
    assert.equal(itpPrueba('navarra', { antiguedadAnios: 11.5, valorNuevoBoe: 300000, precioContrato: 45000 }).esExentoOcuotaCero, true);
  });
});

test('Ceuta y Melilla: bonificación del 50 % solo para residentes', async t => {
  for (const slug of ['ceuta', 'melilla']) {
    await t.test(`${slug}: residente al 2 % (por defecto), no residente al 4 %`, () => {
      const base = { antiguedadAnios: 5, precioContrato: 10000, valorNuevoBoe: 10000 };
      const porDefecto = itpPrueba(slug, base);
      assert.equal(porDefecto.tipoPorcentajeAplicado, 2);
      assert.equal(porDefecto.cuotaITP, 200);
      const residente = itpPrueba(slug, { ...base, esResidenteCiudadAutonoma: true });
      assert.equal(residente.cuotaITP, 200);
      const noResidente = itpPrueba(slug, { ...base, esResidenteCiudadAutonoma: false });
      assert.equal(noResidente.tipoPorcentajeAplicado, 4);
      assert.equal(noResidente.cuotaITP, 400);
    });
  }
});

test('Distintivos ambientales y otros tipos', async t => {
  await t.test('Baleares: ECO al 2 %, CERO al 0 %, sin distintivo al 4 %', () => {
    const base = { antiguedadAnios: 2, precioContrato: 20000, valorNuevoBoe: 20000 };
    assert.equal(itpPrueba('baleares', { ...base, distintivo: 'eco' }).cuotaITP, 400);
    assert.equal(itpPrueba('baleares', { ...base, distintivo: 'cero' }).esExentoOcuotaCero, true);
    assert.equal(itpPrueba('baleares', { ...base, distintivo: 'ninguno' }).cuotaITP, 800);
  });

  await t.test('El distintivo ECO no cambia el tipo donde no hay tipoEco', () => {
    const res = itpPrueba('madrid', { antiguedadAnios: 2, precioContrato: 20000, valorNuevoBoe: 20000, distintivo: 'eco' });
    assert.equal(res.tipoPorcentajeAplicado, 4);
  });

  await t.test('Compatibilidad: esCeroEmisiones y esCiclomotor siguen funcionando', () => {
    const cero = itpPrueba('galicia', { antiguedadAnios: 2, esCeroEmisiones: true });
    assert.equal(cero.esExentoOcuotaCero, true);
    const ciclo = itpPrueba('baleares', { antiguedadAnios: 2, esCiclomotor: true, incluirTasaDgt: true });
    assert.equal(ciclo.esExentoOcuotaCero, true);
    assert.equal(ciclo.tasaDgtImporte, 27.85);
  });

  await t.test('Andalucía: el 8 % por potencia solo afecta a turismos', () => {
    const base = { antiguedadAnios: 5, precioContrato: 25000, valorNuevoBoe: 50000, potenciaFiscalCVF: 18 };
    assert.equal(itpPrueba('andalucia', { ...base, tipoVehiculo: 'motocicleta' }).tipoPorcentajeAplicado, 4);
    assert.equal(itpPrueba('andalucia', { ...base, tipoVehiculo: 'turismo' }).tipoPorcentajeAplicado, 8);
  });

  await t.test('Extremadura: 4 % solo si el comprador declara vehículo comercial con actividad económica', () => {
    const base = { antiguedadAnios: 5, precioContrato: 10000, valorNuevoBoe: 10000 };
    assert.equal(itpPrueba('extremadura', base).tipoPorcentajeAplicado, 6);
    const comercial = itpPrueba('extremadura', { ...base, esComercialConActividad: true });
    assert.equal(comercial.tipoPorcentajeAplicado, 4);
    assert.equal(comercial.cuotaITP, 400);
    assert.equal(itpPrueba('madrid', { ...base, esComercialConActividad: true }).tipoPorcentajeAplicado, 4);
  });
});

test('Avisos del resultado', async t => {
  await t.test('País Vasco muestra la nota de territorios históricos', () => {
    const res = itpPrueba('pais-vasco', { antiguedadAnios: 5 });
    assert.ok(res.avisos.some(a => a.includes('Cada territorio histórico (Álava, Bizkaia, Gipuzkoa) tiene su norma foral. Cálculo con el tipo común del 4 %')));
  });

  await t.test('Una comunidad sin limitaciones no devuelve avisos', () => {
    assert.deepEqual(itpPrueba('madrid', { antiguedadAnios: 5 }).avisos, []);
  });

  await t.test('Galicia documenta en notas el tipo general del 8 % de otros bienes muebles', () => {
    const galicia = getComunidadesList(ITP_PRUEBA_ANIO).find(c => c.slug === 'galicia');
    assert.ok(galicia?.notas.includes('8 %'));
    assert.equal(galicia?.tipoGeneral, 3);
  });
});
