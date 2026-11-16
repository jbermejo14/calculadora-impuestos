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

  await t.test('Caso Especial: Vehículo histórico en Comunitat Valenciana tributa al 8 %', () => {
    const res = calcularITP({
      anio,
      comunidadSlug: 'comunidad-valenciana',
      precioContrato: 8000,
      valorNuevoBoe: 12000,
      antiguedadAnios: 15,
      esHistorico: true,
      incluirTasaDgt: false
    });
    assert.equal(res.tipoPorcentajeAplicado, 8.0);
    assert.equal(res.cuotaITP, 640.0); // 8000 * 0.08
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
