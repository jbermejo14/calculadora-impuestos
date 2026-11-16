/**
 * AutoTax - Calculadora de Impuestos de Vehículos
 * Lógica de cálculo de Matriculación (IEDMT) y Transferencia (ITP)
 */

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initTabs();
  initMatriculacion();
  initTransferencia();
  initPresets();
  initPrintButtons();
});

/* ==========================================================================
   1. GESTIÓN DE TEMA (MODO OSCURO / CLARO)
   ========================================================================== */
function initTheme() {
  const themeToggleBtn = document.getElementById('themeToggleBtn');
  const themeLabelText = document.getElementById('themeLabelText');
  const root = document.documentElement;

  // Comprobar preferencia guardada o preferencia del sistema
  const savedTheme = localStorage.getItem('autotax_theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const initialTheme = savedTheme || (prefersDark ? 'dark' : 'dark'); // Por defecto diseño negro

  applyTheme(initialTheme);

  themeToggleBtn.addEventListener('click', () => {
    const currentTheme = root.getAttribute('data-theme') || 'dark';
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    applyTheme(newTheme);
    localStorage.setItem('autotax_theme', newTheme);
  });

  function applyTheme(theme) {
    root.setAttribute('data-theme', theme);
    if (themeLabelText) {
      themeLabelText.textContent = theme === 'dark' ? 'Modo Oscuro' : 'Modo Claro';
    }
  }
}

/* ==========================================================================
   2. NAVEGACIÓN POR PESTAÑAS (TABS)
   ========================================================================== */
function initTabs() {
  const tabButtons = document.querySelectorAll('.tab-btn');
  const tabContents = document.querySelectorAll('.tab-content');

  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-tab');

      // Actualizar estado botones
      tabButtons.forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-selected', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');

      // Actualizar paneles
      tabContents.forEach(content => {
        if (content.id === targetId) {
          content.classList.add('active');
        } else {
          content.classList.remove('active');
        }
      });
    });
  });
}

/* Formateador de moneda en Euros */
function formatEUR(val) {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(val);
}

function formatNumber(val, decimals = 2) {
  return new Intl.NumberFormat('es-ES', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(val);
}

/* ==========================================================================
   3. CALCULADORA DE MATRICULACIÓN (IEDMT - MODELO 576)
   ========================================================================== */
function initMatriculacion() {
  const matBaseImponible = document.getElementById('matBaseImponible');
  const matBaseRange = document.getElementById('matBaseRange');
  const matEmisiones = document.getElementById('matEmisiones');
  const matEmisionesRange = document.getElementById('matEmisionesRange');
  const matTipoVehiculo = document.getElementById('matTipoVehiculo');
  const matFamiliaNumerosa = document.getElementById('matFamiliaNumerosa');
  const matMinusvalia = document.getElementById('matMinusvalia');
  const matIncluirIva = document.getElementById('matIncluirIva');
  const matIncluirTasaDgt = document.getElementById('matIncluirTasaDgt');
  const btnResetMat = document.getElementById('btnResetMat');

  // Elementos de salida
  const matTramoEpigrafe = document.getElementById('matTramoEpigrafe');
  const matTramoPct = document.getElementById('matTramoPct');
  const matTramoText = document.getElementById('matTramoText');
  const matResTotalImpuestos = document.getElementById('matResTotalImpuestos');
  const matResGranTotal = document.getElementById('matResGranTotal');
  const matResTramoDetalle = document.getElementById('matResTramoDetalle');
  const matResImpuestoMat = document.getElementById('matResImpuestoMat');
  const matResIva = document.getElementById('matResIva');
  const matResTasaDgt = document.getElementById('matResTasaDgt');
  const matResBaseFinal = document.getElementById('matResBaseFinal');
  const matResBaseDetalle = document.getElementById('matResBaseDetalle');
  const rowIva = document.getElementById('rowIva');
  const rowTasaMat = document.getElementById('rowTasaMat');
  const matAlertBox = document.getElementById('matAlertBox');

  // Sincronizar input numérico y slider de Base Imponible
  matBaseImponible.addEventListener('input', () => {
    matBaseRange.value = matBaseImponible.value || 0;
    calculateMatriculacion();
  });
  matBaseRange.addEventListener('input', () => {
    matBaseImponible.value = matBaseRange.value;
    calculateMatriculacion();
  });

  // Sincronizar input numérico y slider de Emisiones
  matEmisiones.addEventListener('input', () => {
    matEmisionesRange.value = matEmisiones.value || 0;
    calculateMatriculacion();
  });
  matEmisionesRange.addEventListener('input', () => {
    matEmisiones.value = matEmisionesRange.value;
    calculateMatriculacion();
  });

  // Cambios en selectores y checkboxes
  [matTipoVehiculo, matFamiliaNumerosa, matMinusvalia, matIncluirIva, matIncluirTasaDgt].forEach(elem => {
    elem.addEventListener('change', calculateMatriculacion);
  });

  btnResetMat.addEventListener('click', () => {
    matBaseImponible.value = 25000;
    matBaseRange.value = 25000;
    matEmisiones.value = 135;
    matEmisionesRange.value = 135;
    matTipoVehiculo.value = 'turismo';
    matFamiliaNumerosa.checked = false;
    matMinusvalia.checked = false;
    matIncluirIva.checked = true;
    matIncluirTasaDgt.checked = true;
    calculateMatriculacion();
  });

  function calculateMatriculacion() {
    const base = parseFloat(matBaseImponible.value) || 0;
    const co2 = parseFloat(matEmisiones.value) || 0;
    const tipo = matTipoVehiculo.value;
    const esFamNumerosa = matFamiliaNumerosa.checked;
    const esMinusvalia = matMinusvalia.checked;
    const incluirIva = matIncluirIva.checked;
    const incluirTasa = matIncluirTasaDgt.checked;

    let pct = 0;
    let epigrafe = 'Epígrafe 1';
    let tramoDesc = 'Hasta 120 g/km CO₂';

    // Determinar epígrafe según normativa estatal
    if (tipo === 'comercial') {
      epigrafe = 'Exención Comercial';
      pct = 0;
      tramoDesc = 'Afecto a actividad profesional / 100% exento';
    } else if (co2 <= 120) {
      epigrafe = 'Epígrafe 1';
      pct = 0.0;
      tramoDesc = 'Emisiones ≤ 120 g/km (Exento)';
    } else if (co2 < 160) {
      epigrafe = 'Epígrafe 2';
      pct = 4.75;
      tramoDesc = 'Emisiones entre 121 y 159 g/km';
    } else if (co2 < 200) {
      epigrafe = 'Epígrafe 3';
      pct = 9.75;
      tramoDesc = 'Emisiones entre 160 y 199 g/km';
    } else {
      epigrafe = 'Epígrafe 4';
      pct = 14.75;
      tramoDesc = 'Emisiones ≥ 200 g/km';
    }

    // Actualizar badge visual del tramo
    matTramoEpigrafe.textContent = epigrafe;
    matTramoPct.textContent = `${pct.toFixed(2).replace('.', ',')}%`;
    matTramoText.textContent = tramoDesc;

    // Base de cálculo para IEDMT
    let baseIedmt = base;
    let detalleBase = 'Valor neto de adquisición';

    if (esFamNumerosa) {
      baseIedmt = base * 0.5;
      detalleBase += ' (-50% bono Familia Numerosa)';
    }

    // Cálculo IEDMT
    let cuotaIedmt = 0;
    if (esMinusvalia) {
      cuotaIedmt = 0;
      matResTramoDetalle.textContent = 'Exención total por Movilidad Reducida / Minusvalía (0 €)';
    } else if (tipo === 'comercial') {
      cuotaIedmt = 0;
      matResTramoDetalle.textContent = 'Exento por afectación a actividad comercial';
    } else {
      cuotaIedmt = (baseIedmt * pct) / 100;
      matResTramoDetalle.textContent = `Tipo aplicable: ${pct}% sobre base ${formatEUR(baseIedmt)}`;
    }

    // IVA (21% sobre la base completa)
    const cuotaIva = incluirIva ? (base * 0.21) : 0;
    rowIva.style.display = incluirIva ? 'flex' : 'none';

    // Tasa DGT (99.77 € ordinaria)
    const cuotaTasaDgt = incluirTasa ? 99.77 : 0;
    rowTasaMat.style.display = incluirTasa ? 'flex' : 'none';

    // Totales
    const totalImpuestos = cuotaIedmt + cuotaIva + cuotaTasaDgt;
    const precioFinal = base + totalImpuestos;

    // Pintar valores
    matResTotalImpuestos.textContent = formatEUR(totalImpuestos);
    matResGranTotal.textContent = `Precio final total: ${formatEUR(precioFinal)}`;
    matResImpuestoMat.textContent = formatEUR(cuotaIedmt);
    matResIva.textContent = formatEUR(cuotaIva);
    matResTasaDgt.textContent = formatEUR(cuotaTasaDgt);
    matResBaseFinal.textContent = formatEUR(base);
    matResBaseDetalle.textContent = detalleBase;

    // Nota informativa dinámica
    if (co2 <= 120) {
      matAlertBox.innerHTML = `
        <div class="alert-icon">🌱</div>
        <div class="alert-content">
          <strong>¡Exento de Impuesto de Matriculación!</strong> Al tener emisiones de ${co2} g/km (≤ 120 g/km), tributa al <strong>0,0%</strong> de IEDMT. Solo abonas el IVA y la tasa de Tráfico.
        </div>
      `;
    } else if (pct >= 14.75) {
      matAlertBox.innerHTML = `
        <div class="alert-icon">⚠️</div>
        <div class="alert-content">
          <strong>Tramo Máximo (14,75%):</strong> Vehículo de altas emisiones (≥ 200 g/km). Revisa si en tu Comunidad Autónoma existe un recargo autonómico adicional de hasta el 16%.
        </div>
      `;
    } else {
      matAlertBox.innerHTML = `
        <div class="alert-icon">💡</div>
        <div class="alert-content">
          <strong>Tramo ordinario:</strong> Se liquida telemáticamente a través del <strong>Modelo 576</strong> de la Agencia Tributaria con certificado digital o Cl@ve.
        </div>
      `;
    }
  }

  // Ejecución inicial
  calculateMatriculacion();
}

/* ==========================================================================
   4. CALCULADORA DE TRANSFERENCIA / ITP (MODELO 620 / 621)
   ========================================================================== */
function initTransferencia() {
  const itpComunidad = document.getElementById('itpComunidad');
  const groupPctManual = document.getElementById('groupPctManual');
  const itpPctManual = document.getElementById('itpPctManual');
  const itpPrecioContrato = document.getElementById('itpPrecioContrato');
  const itpValorNuevoBoe = document.getElementById('itpValorNuevoBoe');
  const itpAntiguedad = document.getElementById('itpAntiguedad');
  const itpIncluirTasaDgt = document.getElementById('itpIncluirTasaDgt');
  const itpCiclomotor = document.getElementById('itpCiclomotor');
  const itpGestoria = document.getElementById('itpGestoria');
  const btnResetItp = document.getElementById('btnResetItp');

  // Elementos de salida
  const itpResTotalGastos = document.getElementById('itpResTotalGastos');
  const itpResGranTotal = document.getElementById('itpResGranTotal');
  const itpResPctDetalle = document.getElementById('itpResPctDetalle');
  const itpResImpuesto = document.getElementById('itpResImpuesto');
  const itpResTasaDgt = document.getElementById('itpResTasaDgt');
  const itpResGestoria = document.getElementById('itpResGestoria');
  const rowItpTasa = document.getElementById('rowItpTasa');
  const rowItpGestoria = document.getElementById('rowItpGestoria');
  const itpResValorFiscalDeprec = document.getElementById('itpResValorFiscalDeprec');
  const itpResBoeDeprecInfo = document.getElementById('itpResBoeDeprecInfo');
  const itpResPrecioContratoShow = document.getElementById('itpResPrecioContratoShow');
  const itpResBaseMayor = document.getElementById('itpResBaseMayor');
  const itpResBaseExplicacion = document.getElementById('itpResBaseExplicacion');

  // Tabla de porcentajes por CCAA
  const tasasCCAA = {
    madrid: 4.0,
    andalucia: 4.0,
    catalunya: 5.0,
    valencia: 6.0,
    galicia: 8.0,
    castilla_leon: 5.0,
    castilla_mancha: 6.0,
    canarias: 5.5,
    baleares: 4.0,
    aragon: 4.0,
    asturias: 4.0,
    murcia: 4.0,
    extremadura: 6.0,
    navarra: 4.0,
    pais_vasco: 4.0,
    cantabria: 8.0,
    rioja: 4.0,
    personalizado: 4.0
  };

  itpComunidad.addEventListener('change', () => {
    if (itpComunidad.value === 'personalizado') {
      groupPctManual.style.display = 'block';
    } else {
      groupPctManual.style.display = 'none';
    }
    calculateTransferencia();
  });

  [itpPctManual, itpPrecioContrato, itpValorNuevoBoe, itpAntiguedad, itpIncluirTasaDgt, itpCiclomotor, itpGestoria].forEach(input => {
    input.addEventListener('input', calculateTransferencia);
    input.addEventListener('change', calculateTransferencia);
  });

  btnResetItp.addEventListener('click', () => {
    itpComunidad.value = 'madrid';
    groupPctManual.style.display = 'none';
    itpPctManual.value = 4.0;
    itpPrecioContrato.value = 8500;
    itpValorNuevoBoe.value = 22000;
    itpAntiguedad.value = '0.39';
    itpIncluirTasaDgt.checked = true;
    itpCiclomotor.checked = false;
    itpGestoria.checked = false;
    calculateTransferencia();
  });

  function calculateTransferencia() {
    const ctaaKey = itpComunidad.value;
    let pct = tasasCCAA[ctaaKey] || 4.0;
    if (ctaaKey === 'personalizado') {
      pct = parseFloat(itpPctManual.value) || 0;
    }

    const precioContrato = parseFloat(itpPrecioContrato.value) || 0;
    const valorNuevoBoe = parseFloat(itpValorNuevoBoe.value) || 0;
    const coefDeprec = parseFloat(itpAntiguedad.value) || 1.0;
    const esCiclomotor = itpCiclomotor.checked;
    const incluirTasa = itpIncluirTasaDgt.checked;
    const incluirGestoria = itpGestoria.checked;

    // Valor fiscal mínimo de tablas BOE depreciado por años
    const valorFiscal = valorNuevoBoe * coefDeprec;
    const pctDeprecTexto = `${Math.round(coefDeprec * 100)}%`;

    // Base imponible según normativa: la mayor entre precio de contrato y tablas BOE
    let baseLiquidable = 0;
    let explicacionBase = '';

    if (precioContrato >= valorFiscal) {
      baseLiquidable = precioContrato;
      explicacionBase = '(Hacienda aplica el precio de contrato por ser igual o superior al valor BOE)';
    } else {
      baseLiquidable = valorFiscal;
      explicacionBase = '(Hacienda exige el valor mínimo del BOE para evitar liquidación complementaria)';
    }

    // Cuota ITP
    const cuotaItp = (baseLiquidable * pct) / 100;

    // Tasa DGT
    let tasaDgt = 0;
    if (incluirTasa) {
      tasaDgt = esCiclomotor ? 27.85 : 55.70;
    }
    rowItpTasa.style.display = incluirTasa ? 'flex' : 'none';
    itpResTasaDgt.textContent = formatEUR(tasaDgt);

    // Gestoría
    const cuotaGestoria = incluirGestoria ? 60.0 : 0;
    rowItpGestoria.style.display = incluirGestoria ? 'flex' : 'none';
    itpResGestoria.textContent = formatEUR(cuotaGestoria);

    // Totales
    const totalGastos = cuotaItp + tasaDgt + cuotaGestoria;
    const totalConCoche = precioContrato + totalGastos;

    // Pintar resultados
    itpResTotalGastos.textContent = formatEUR(totalGastos);
    itpResGranTotal.textContent = `Compra (${formatEUR(precioContrato)}) + Gastos: ${formatEUR(totalConCoche)}`;
    itpResImpuesto.textContent = formatEUR(cuotaItp);
    itpResPctDetalle.textContent = `Aplicado ${pct.toFixed(2).replace('.', ',')}% sobre ${formatEUR(baseLiquidable)}`;

    itpResValorFiscalDeprec.textContent = formatEUR(valorFiscal);
    itpResBoeDeprecInfo.textContent = `${formatEUR(valorNuevoBoe)} × ${pctDeprecTexto}`;
    itpResPrecioContratoShow.textContent = formatEUR(precioContrato);
    itpResBaseMayor.textContent = formatEUR(baseLiquidable);
    itpResBaseExplicacion.textContent = explicacionBase;
  }

  // Ejecución inicial
  calculateTransferencia();
}

/* ==========================================================================
   5. PRESETS RÁPIDOS
   ========================================================================== */
function initPresets() {
  const quickPresetSelect = document.getElementById('quickPresetSelect');
  if (!quickPresetSelect) return;

  const tabMatriculacionBtn = document.getElementById('tab-matriculacion');
  const tabTransferenciaBtn = document.getElementById('tab-transferencia');

  quickPresetSelect.addEventListener('change', () => {
    const val = quickPresetSelect.value;
    if (!val) return;

    if (val === 'electric_new') {
      tabMatriculacionBtn.click();
      document.getElementById('matBaseImponible').value = 38000;
      document.getElementById('matBaseRange').value = 38000;
      document.getElementById('matEmisiones').value = 0;
      document.getElementById('matEmisionesRange').value = 0;
      document.getElementById('matTipoVehiculo').value = 'turismo';
      document.getElementById('matFamiliaNumerosa').checked = false;
      document.getElementById('matMinusvalia').checked = false;
      document.getElementById('matIncluirIva').checked = true;
      document.getElementById('matIncluirTasaDgt').checked = true;
      triggerInput('matBaseImponible');
    } else if (val === 'suv_hybrid') {
      tabMatriculacionBtn.click();
      document.getElementById('matBaseImponible').value = 28500;
      document.getElementById('matBaseRange').value = 28500;
      document.getElementById('matEmisiones').value = 132;
      document.getElementById('matEmisionesRange').value = 132;
      document.getElementById('matTipoVehiculo').value = 'turismo';
      document.getElementById('matFamiliaNumerosa').checked = false;
      document.getElementById('matMinusvalia').checked = false;
      document.getElementById('matIncluirIva').checked = true;
      document.getElementById('matIncluirTasaDgt').checked = true;
      triggerInput('matBaseImponible');
    } else if (val === 'sports_car') {
      tabMatriculacionBtn.click();
      document.getElementById('matBaseImponible').value = 54000;
      document.getElementById('matBaseRange').value = 54000;
      document.getElementById('matEmisiones').value = 215;
      document.getElementById('matEmisionesRange').value = 215;
      document.getElementById('matTipoVehiculo').value = 'turismo';
      document.getElementById('matFamiliaNumerosa').checked = false;
      document.getElementById('matMinusvalia').checked = false;
      document.getElementById('matIncluirIva').checked = true;
      document.getElementById('matIncluirTasaDgt').checked = true;
      triggerInput('matBaseImponible');
    } else if (val === 'used_5y') {
      tabTransferenciaBtn.click();
      document.getElementById('itpComunidad').value = 'madrid';
      document.getElementById('itpPrecioContrato').value = 10000;
      document.getElementById('itpValorNuevoBoe').value = 24000;
      document.getElementById('itpAntiguedad').value = '0.39'; // 5 a 6 años
      document.getElementById('itpIncluirTasaDgt').checked = true;
      document.getElementById('itpCiclomotor').checked = false;
      document.getElementById('itpGestoria').checked = false;
      triggerInput('itpPrecioContrato');
    } else if (val === 'used_10y') {
      tabTransferenciaBtn.click();
      document.getElementById('itpComunidad').value = 'catalunya';
      document.getElementById('itpPrecioContrato').value = 3500;
      document.getElementById('itpValorNuevoBoe').value = 18000;
      document.getElementById('itpAntiguedad').value = '0.17'; // 10 a 11 años
      document.getElementById('itpIncluirTasaDgt').checked = true;
      document.getElementById('itpCiclomotor').checked = false;
      document.getElementById('itpGestoria').checked = false;
      triggerInput('itpPrecioContrato');
    }

    // Reset select indicator
    quickPresetSelect.value = '';
  });

  function triggerInput(id) {
    const el = document.getElementById(id);
    if (el) {
      el.dispatchEvent(new Event('input', { bubbles: true }));
    }
  }
}

/* ==========================================================================
   6. BOTONES DE IMPRESIÓN / GUARDAR RESUMEN
   ========================================================================== */
function initPrintButtons() {
  const btnPrintMat = document.getElementById('btnPrintMat');
  const btnPrintItp = document.getElementById('btnPrintItp');

  if (btnPrintMat) {
    btnPrintMat.addEventListener('click', () => {
      window.print();
    });
  }

  if (btnPrintItp) {
    btnPrintItp.addEventListener('click', () => {
      window.print();
    });
  }
}
