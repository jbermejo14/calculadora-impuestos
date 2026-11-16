import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const FECHA_ISO = /^\d{4}-\d{2}-\d{2}$/;

/** Exige estado válido; fecha ISO solo si está verificado y null si está pendiente. */
function assertVerificacion(nodo: any, mensaje: string) {
  assert.ok(['pendiente', 'verificado'].includes(nodo.estadoVerificacion), `Estado de verificación inválido: ${mensaje}`);
  if (nodo.estadoVerificacion === 'verificado') {
    assert.match(nodo.fechaVerificacion, FECHA_ISO, `Falta fecha de verificación: ${mensaje}`);
  } else {
    assert.equal(nodo.fechaVerificacion, null, `Un dato pendiente no puede tener fecha: ${mensaje}`);
  }
}

test('Verificación de fuentes y datos del año fiscal en curso', async (t) => {
  const anioFiscal = 2026;
  const dataDir = path.join(process.cwd(), 'data', anioFiscal.toString());

  await t.test(`Debe existir el directorio de datos para el año en curso (${anioFiscal})`, () => {
    assert.ok(
      fs.existsSync(dataDir),
      `ERROR CRÍTICO: No existe la carpeta data/${anioFiscal} con los datos fiscales del año en curso`
    );
  });

  const archivosRequeridos = ['iedmt.json', 'depreciacion.json', 'itp.json', 'tasas-dgt.json', 'guias.json'];

  for (const archivo of archivosRequeridos) {
    await t.test(`Debe existir y ser JSON válido data/${anioFiscal}/${archivo}`, () => {
      const fullPath = path.join(dataDir, archivo);
      assert.ok(fs.existsSync(fullPath), `Falta el archivo fiscal obligatorio: ${archivo}`);
      const raw = fs.readFileSync(fullPath, 'utf-8');
      assert.doesNotThrow(() => JSON.parse(raw), `El archivo ${archivo} contiene JSON inválido`);
    });
  }

  await t.test('Todos los valores de IEDMT deben tener fuente, norma y estado de verificación coherente', () => {
    const raw = fs.readFileSync(path.join(dataDir, 'iedmt.json'), 'utf-8');
    const data = JSON.parse(raw);

    assert.ok(data.fuente && data.fuente.startsWith('http'), 'Falta fuente en la raíz de iedmt.json');
    assert.ok(data.norma && data.norma.length > 5, 'Falta norma en la raíz de iedmt.json');
    assertVerificacion(data, 'Fecha de verificación inválida en iedmt.json');

    // Verificar territorios y tramos
    for (const [slug, terr] of Object.entries<any>(data.territorios)) {
      assert.ok(terr.fuente?.startsWith('http'), `Falta fuente oficial para el territorio ${slug}`);
      assert.ok(terr.norma, `Falta norma oficial para el territorio ${slug}`);
      assertVerificacion(terr, `Fecha inválida en territorio ${slug}`);

      for (const tramo of terr.tramos) {
        assert.ok(tramo.fuente?.startsWith('http'), `Falta fuente en tramo ${tramo.epigrafe} de ${slug}`);
        assert.ok(tramo.norma, `Falta norma en tramo ${tramo.epigrafe} de ${slug}`);
        assertVerificacion(tramo, `Fecha inválida en tramo ${tramo.epigrafe} de ${slug}`);
      }
    }

    // Verificar bonificaciones
    for (const [key, bonif] of Object.entries<any>(data.bonificaciones)) {
      assert.ok(bonif.fuente?.startsWith('http'), `Falta fuente en bonificación ${key}`);
      assert.ok(bonif.norma, `Falta norma en bonificación ${key}`);
      assertVerificacion(bonif, `Fecha inválida en bonificación ${key}`);
    }
  });

  await t.test('Todos los tramos de depreciación BOE deben tener fuente, norma y fecha', () => {
    const raw = fs.readFileSync(path.join(dataDir, 'depreciacion.json'), 'utf-8');
    const data = JSON.parse(raw);

    assert.ok(data.fuente?.startsWith('http'), 'Falta fuente en depreciacion.json');
    assert.ok(data.norma, 'Falta norma en depreciacion.json');
    assertVerificacion(data, 'Fecha inválida en depreciacion.json');

    for (const tramo of data.tramos) {
      assert.ok(tramo.fuente?.startsWith('http'), `Falta fuente en tramo ${tramo.etiqueta}`);
      assert.ok(tramo.norma, `Falta norma en tramo ${tramo.etiqueta}`);
      assertVerificacion(tramo, `Fecha inválida en tramo ${tramo.etiqueta}`);
      assert.ok(typeof tramo.coeficiente === 'number' && tramo.coeficiente > 0 && tramo.coeficiente <= 1.0);
    }
  });

  await t.test('Todas las 19 comunidades/ciudades autónomas de ITP deben tener fuente oficial y norma verificada', () => {
    const raw = fs.readFileSync(path.join(dataDir, 'itp.json'), 'utf-8');
    const data = JSON.parse(raw);

    const comunidades = Object.keys(data.comunidades);
    assert.equal(comunidades.length, 19, `Deben existir 19 territorios (17 CCAA + Ceuta y Melilla), encontrados: ${comunidades.length}`);

    for (const [slug, com] of Object.entries<any>(data.comunidades)) {
      assert.ok(com.fuente?.startsWith('http'), `Falta URL oficial de fuente para la comunidad ${slug}`);
      assert.ok(com.norma && com.norma.length > 5, `Falta ley o norma legal para la comunidad ${slug}`);
      assertVerificacion(com, `Fecha de verificación inválida para ${slug}`);
      assert.ok(typeof com.tipoGeneral === 'number' && com.tipoGeneral > 0, `Tipo general inválido para ${slug}`);
      assert.ok(com.modelo, `Falta modelo de impreso para ${slug}`);
      assert.ok(com.organismo, `Falta organismo tributario para ${slug}`);
    }
  });

  await t.test('Todas las tasas DGT deben tener código oficial, fuente y norma del BOE/DGT', () => {
    const raw = fs.readFileSync(path.join(dataDir, 'tasas-dgt.json'), 'utf-8');
    const data = JSON.parse(raw);

    assert.ok(data.fuente?.startsWith('http'), 'Falta fuente en tasas-dgt.json');
    assert.ok(data.norma, 'Falta norma en tasas-dgt.json');

    for (const [key, tasa] of Object.entries<any>(data.tasas)) {
      assert.ok(tasa.fuente?.startsWith('http'), `Falta fuente oficial para tasa ${key}`);
      assert.ok(tasa.norma, `Falta norma oficial para tasa ${key}`);
      assertVerificacion(tasa, `Fecha inválida para tasa ${key}`);
      assert.ok(tasa.codigo, `Falta código oficial DGT para tasa ${key}`);
      assert.ok(typeof tasa.importe === 'number' && tasa.importe > 0, `Importe inválido para tasa ${key}`);
    }
  });

  await t.test('Todas las guías deben tener fuente, norma y fecha válida', () => {
    const raw = fs.readFileSync(path.join(dataDir, 'guias.json'), 'utf-8');
    const data = JSON.parse(raw);

    const temas = Object.keys(data.temas);
    assert.equal(temas.length, 4, 'Deben existir exactamente los 4 temas de guía');

    for (const [slug, guia] of Object.entries<any>(data.temas)) {
      assert.ok(guia.fuente?.startsWith('http'), `Falta fuente en guía ${slug}`);
      assert.ok(guia.norma, `Falta norma en guía ${slug}`);
      assertVerificacion(guia, `Fecha inválida en guía ${slug}`);
      assert.ok(guia.titulo, `Falta título en guía ${slug}`);
    }
  });
});
