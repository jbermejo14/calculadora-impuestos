# Verificación 2026 de datos estatales (17/11/2026)

Alcance: data/2026/iedmt.json, tasas-dgt.json, depreciacion.json y guias.json. No incluye itp.json.

## IEDMT (Ley 38/1992). Fuente: https://www.boe.es/buscar/act.php?id=BOE-A-1992-28741
Texto consolidado leído vía API de BOE (bloques a65, a66, a70). Última versión del art. 70: vigencia 11/07/2021 (sin cambios posteriores). El texto transitorio de 144/192/240 g/km solo valió hasta el 31/12/2021.

| Valor | Fichero | Norma | Estado | Nota |
|---|---|---|---|---|
| Umbrales CO2 120/160/200 g/km | iedmt.json | art. 70.1 epígrafes 1.º a 4.º | verificado | Sin cambios |
| Península y Baleares: 0 / 4,75 / 9,75 / 14,75 % | iedmt.json | art. 70.2.b | verificado | Sin cambios. Referencia de norma corregida (antes 70.1) |
| Canarias: 0 / 3,75 / 8,75 / 13,75 % | iedmt.json | art. 70.2.b | verificado | Sin cambios. Referencia corregida (antes 70.2.a, que es el supuesto de tipos aprobados por la CA) |
| Ceuta y Melilla: 0 % en todos | iedmt.json | art. 70.2.c | verificado | Sin cambios. Referencia corregida (antes 70.3) |
| Familia numerosa: reducción 50 % base, 5 a 9 plazas | iedmt.json | art. 66.4 | verificado | Sin cambios |
| Minusvalía: exención 100 % | iedmt.json | art. 66.1.d | verificado | Norma corregida (antes 65.1.a) |
| Vehículo comercial: no sujeción | iedmt.json | art. 65.1.a nºs 1.º, 3.º y 8.º | verificado | Norma corregida; la ley habla de afectación significativa, no exclusiva |
| Nodos raíz y territorios | iedmt.json | | verificado | Todos los hijos verificados |

Texto no modelado en el JSON (no se añadieron campos):
- Epígrafe 5.º (12 % Península/Baleares, 11 % Canarias): vehículos no incluidos en 1.º-4.º y 6.º-9.º, embarcaciones, aeronaves.
- Epígrafes 6.º a 9.º (motocicletas, umbrales 100/120/140 g/km) y epígrafe 4.º b)-e) (CO2 no acreditado, N2/N3 vivienda, quad, moto náutica).
- Epígrafe 1.º b): vehículos con un solo motor no de combustión interna (eléctricos), 0 % con independencia del CO2.
- Reducción del 30 % de la base para autocaravanas y vehículos vivienda (art. 66.5).
- Exenciones del art. 66.1 (taxis, autoescuelas, alquiler, traslado de residencia, etc.).
- Art. 70.2.a: las CCAA pueden aprobar tipos propios que sustituyen a los estatales (art. 43 Ley 21/2001).
- Art. 70.4-6: coeficientes por importación definitiva desde Ceuta/Melilla y diferencias de tipo Canarias a Península.

## Tasas DGT. Fuente: https://sedeclave.dgt.gob.es/WEB_Tasas/jsp/tasas/download/catalogoPrecioTasas.pdf (catálogo oficial enlazado desde sede.dgt.gob.es)
Norma: Ley 16/1979, art. 6 (BOE-A-1979-23768). El texto consolidado del BOE solo recoge las cuantías de 2018 (97,80 / 54,60 / 27,30 / 8,50); la ley indica que se actualizan cada año por la Ley de Presupuestos Generales del Estado. No se localizó la ley presupuestaria concreta. El importe vigente se lee en el catálogo de la DGT, que declara actualizarse a inicios de cada año. El PDF no lleva fecha visible.

| Tasa | Importe | Estado | Nota |
|---|---|---|---|
| 1.1 Matriculación ordinaria | 99,77 | verificado | Sin cambios |
| 1.2 Ciclomotores (matriculación y transferencia) | 27,85 | verificado | Sin cambios |
| 1.5 Transferencia | 55,70 | verificado | Sin cambios |
| 4.1 Anotaciones, datos, certificaciones, informe | 8,67 | verificado | Importe sin cambios. `norma` del fichero antes citaba RDLeg 6/2015 (incorrecto); `concepto` ajustado a la descripción oficial |

## Depreciación. Orden HAC/1501/2025, de 17 de diciembre (BOE-A-2025-26357, BOE 23/12/2025, en vigor 01/01/2026)
Fuente: https://www.boe.es/diario_boe/txt.php?id=BOE-A-2025-26357 . Sustituye los anexos I a IV de la Orden HAC/1484/2024. El identificador anterior del fichero (BOE-A-2024-27387) no correspondía a esa orden.
Anexo IV, vehículos distintos de vivienda: 100, 84, 67, 56, 47, 39, 34, 28, 24, 19, 17, 13 y 10 % (mismos que el fichero). Los 13 tramos quedan verificados sin cambio de valor.
No modelado: tabla propia de autocaravanas, campers y vehículos vivienda (19 tramos, 100 % a 10 %) y reducción al 70 % para vehículos de autoescuela de más de seis meses.

## guias.json
- tramos-iedmt, depreciacion-boe y tasas-dgt: verificados. Valores numéricos coinciden con los ficheros anteriores.
- Corregido en tramos-iedmt: "discapacidad superior al 33 %" no figura en el art. 66.1.d (dice minusválidos y certificación previa); y "afecto de forma exclusiva" en comerciales (la ley dice afectación significativa).
- Actualizadas norma y fuente de depreciacion-boe (HAC/1501/2025) y tasas-dgt (Ley 16/1979 y catálogo DGT).
- documentacion-tramitar: pendiente. Es una lista de documentos (RD 2822/1998), sin valores numéricos; no se contrastó.
