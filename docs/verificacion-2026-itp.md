# Verificación del ITP de vehículos usados, ejercicio 2026

Fecha de verificación: 17/11/2026. Fichero verificado: `data/2026/itp.json`.

Método: se descargaron los textos consolidados del BOE (que reproducen la norma autonómica o foral) y se leyeron los artículos aplicables. Para modelo y organismo se leyeron las páginas de las agencias tributarias. Las fechas "última actualización" son las del texto consolidado del BOE.

Resultado: 15 entradas verificadas y 4 pendientes (Aragón, Cantabria, La Rioja y País Vasco). La raíz del fichero sigue `pendiente`.

## Cambios de valores respecto al fichero anterior

| Comunidad | Campo | Antes | Después | Fuente |
|---|---|---|---|---|
| Aragón | Cuotas fijas (más de 10 años) | 1.001-1.500 cc: 40 €; 1.501-2.000 cc: 60 €; más de 2.000 cc: tipo general | 1.001-1.500 cc: 20 €; 1.501-2.000 cc: 30 €; resto: tipo general | DL 1/2005, art. 121-6 |
| Baleares | Tipo cero emisiones | no existía | 0 % | DL 1/2014, art. 14.3 |
| Canarias | Cuotas fijas (más de 10 años) | no existían | 40 / 70 / 115 € | DL 1/2009, art. 38 ter |
| Cataluña | Tipo cero emisiones | no existía | 0 % | DL 1/2024 (Código tributario), art. 641-1.4 |
| Comunitat Valenciana | Cuotas fijas | más de 12 años: 40 € (hasta 1.199 cc), 60 € (1.200-1.599), 140 € (1.600-1.999); 8 % desde 2.000 cc | más de 12 años: 40 € (hasta 1.500 cc), 60 € (1.501-2.000), 140 € (más de 2.000); más de 5 y hasta 12 años: 120 / 180 / 280 €; solo vehículos de menos de 20.000 € | Ley 13/1997, art. 13.Tres.3 |
| Murcia | Cuotas fijas | sin importes | más de 12 años: 0 / 30 / 50 / 75 € | DL 1/2010, art. 6.10 |
| Ceuta, Melilla | Organismo | Servicios Tributarios del Ayuntamiento | AEAT (delegaciones de Ceuta y Melilla) | web AEAT, modelo 620 |
| Andalucía | Modelo | 621 (telemático) / 620 (presencial) | 621 | web ATRIAN |
| Canarias | Modelo | 620 canario / 430 | 620 | web ATC |

Se corrigieron además normas y URL erróneas de casi todas las entradas. Muchos identificadores BOE del fichero anterior apuntaban a otros documentos (por ejemplo `BOE-A-2021-18239` es un convenio del Ministerio de Defensa). Artículos corregidos: Andalucía 46 y 47 (antes 43); Cantabria 11 (antes 3 bis); Galicia 14.Seis (antes 14 bis); La Rioja 44.2 (antes 36); Madrid 27 (antes 30 bis); Navarra 8.c y 35.I.B.23 (antes 35); Ceuta y Melilla 11.1.a y 57 bis.3.c (se citaba la Ley 22/2009, que no regula esto). Los valores de tipo general, tipo incrementado, umbral de 15 CVF, tipo cero emisiones de Galicia y Andalucía, y las exenciones de Navarra y Baleares ya eran correctos.

## Secciones por comunidad

### Andalucía (verificado)
- Valor: general 4 %; 8 % para turismos y todoterrenos de más de 15 CVF; 1 % para turismos, ciclomotores y motocicletas 0 emisiones (el 1 % excluye el 8 %).
- Norma: Ley 5/2021, arts. 46 y 47 (consolidado a 31/12/2025). El 4 % es el supletorio del RDL 1/1993, art. 11.1.a.
- URL: https://www.boe.es/buscar/act.php?id=BOE-A-2021-17915#a4-9
- Modelo: 621 (la web de ATRIAN indica "deberá presentar e ingresar, el modelo 621"; el 600 es para bicicletas y VMP).

### Aragón (pendiente)
- Valor: general 4 %. Más de 10 años: hasta 1.000 cc, 0 €; 1.001-1.500 cc, 20 €; 1.501-2.000 cc, 30 €.
- Norma: DL 1/2005, art. 121-6 (consolidado a 07/07/2025). Confirmado en la página del Gobierno de Aragón.
- URL: https://www.boe.es/buscar/act.php?id=BOA-d-2005-90006#a1-9
- Motivo: no se leyó en fuente primaria el número de modelo. La página de Aragón no lo indica y la guía en PDF tampoco. Un resultado de búsqueda sobre el BOA menciona los modelos 601, 602, 603, 621 y 623, pero no se leyó la norma. El fichero lo marca como pendiente.

### Asturias (verificado)
- Valor: general 4 %; 8 % para turismos y todoterrenos de más de 15 CVF.
- Norma: DL 2/2014, art. 32.a y 32.b (consolidado a 31/12/2025).
- URL: https://www.boe.es/buscar/act.php?id=BOE-A-2015-945#a32
- Modelo 620 y Ente Público de Servicios Tributarios: BOPA n.º 103 de 06/05/2011 (Resolución de 4 de abril de 2011).

### Baleares (verificado)
- Valor: ciclomotores 0 % (sin obligación de autoliquidar); turismos y todoterrenos de más de 15 CVF 8 %; 0 emisiones 0 %; distintivo ECO 2 %; resto 4 % supletorio.
- Norma: DL 1/2014, art. 14 (apartados 3 y 4 añadidos por Decreto-ley 4/2022, BOE-A-2022-9389).
- URL: https://www.boe.es/buscar/act.php?id=BOE-A-2014-6925#a1-6
- Modelo 620 (página de ATIB).

### Canarias (verificado)
- Valor: general 5,5 % para bienes muebles. Turismos con más de 10 años de matriculación: hasta 1.000 cc, 40 €; 1.001-1.500 cc, 70 €; 1.501-2.000 cc, 115 €; los históricos tributan al tipo general.
- Norma: DL 1/2009, art. 31.1.d y art. 38 ter (añadido por Ley 4/2012). Consolidado a 29/12/2025.
- URL: https://www.boe.es/buscar/act.php?id=BOC-j-2009-90008#a31
- Modelo 620 (la sede de la ATC lo lista como "Compraventa de vehículos, embarcaciones o aeronaves usados"). No se encontró el modelo 430 asociado a esta operación.

### Cantabria (pendiente)
- Valor: general 6 %. Más de 10 años (turismos y todoterrenos no históricos): hasta 999 cc, 45 €; 1.000-1.499 cc, 60 €; 1.500-1.999 cc, 90 €. El resto tributa al 6 %.
- Norma: DL 62/2008, art. 11 (modificado por la Ley 3/2024, consolidado a 30/04/2026).
- URL: https://www.boe.es/buscar/act.php?id=BOCT-c-2008-90028#a1-3
- Motivo: la sede de Cantabria indica que el justificante es el modelo 620 y la oficina virtual de la ACAT presenta el modelo 621 como autoliquidación de medios de transporte usados. Se contradicen y no se pudo resolver.

### Castilla-La Mancha (verificado)
- Valor: 6 % para bienes muebles y semovientes, sin tipos especiales para vehículos.
- Norma: Ley 8/2013, art. 20 (consolidado a 30/03/2026). El identificador anterior (Ley 9/2012, BOE-A-2012-15286) no regula el ITP de vehículos.
- URL: https://www.boe.es/buscar/act.php?id=BOE-A-2014-1368#a20
- Modelo 620 y Consejería de Hacienda, Administraciones Públicas y Transformación Digital (portal tributario).

### Castilla y León (verificado)
- Valor: general 5 %; 8 % para turismos y todoterrenos de más de 15 CVF.
- Norma: DL 1/2013, art. 24.1.b y art. 25.2. El texto consolidado está a 14/05/2024; la web de Tributos de Castilla y León confirma los mismos tipos.
- URL: https://www.boe.es/buscar/act.php?id=BOCL-h-2013-90254#a24
- Modelo 620, oficina: Servicios Territoriales de Hacienda.

### Cataluña (verificado, con salvedad de modelo)
- Valor: general 5 %; 0 emisiones 0 % (aún con obligación de presentar); ciclomotores y vehículos de diez o más años sin obligación de autoliquidar, salvo históricos o valor igual o superior a 40.000 € sin depreciar.
- Norma: DL 1/2024, art. 641-1.3 y 641-1.4; art. 683-6 (consolidado a 22/05/2026). La referencia anterior (DL 3/2008) es la ley de tasas y la Ley 5/2020 no es la norma del ITP.
- URL: https://www.boe.es/buscar/act.php?id=BOE-A-2024-6951#a6-85
- La ATC indica que "la norma exonera pero no establece una exención". El fichero conserva `exencionCiclomotores` y `exencionDiezAnios` porque el efecto práctico es cuota cero, pero no son exenciones legales. Véase la sección de limitaciones.

### Ceuta (verificado)
- Valor: tipo estatal del 4 % para bienes muebles; bonificación del 50 % en la cuota solo si el adquirente reside en Ceuta o Melilla (tipo efectivo 2 %).
- Norma: RDL 1/1993, art. 11.1.a (tipo supletorio) y art. 57 bis.3.c (bonificación). Consolidado a 21/03/2026.
- URL: https://www.boe.es/buscar/act.php?id=BOE-A-1993-25359#a57bis
- Régimen: Ceuta no es comunidad autónoma ni tiene tributos cedidos. El ITP lo gestiona la AEAT con el modelo 620 (web de la AEAT: "A 50 per cent rebate on the instalment is granted"). Las instrucciones PDF de la AEAT no se pudieron leer.

### Comunitat Valenciana (verificado)
- Valor: 6 % para bienes muebles. 8 % para vehículos con antigüedad de hasta 5 años y más de 2.000 cc (incluidos híbridos) o con valor igual o superior a 20.000 €. 2 % para vehículos al final de su vida útil. Cuotas fijas solo para vehículos no históricos de menos de 20.000 €, con los importes de la tabla de cambios.
- Norma: Ley 13/1997, art. 13.Tres.3 (consolidado a 10/08/2026).
- URL: https://www.boe.es/buscar/act.php?id=BOE-A-1998-8202#a13
- Modelo 620 con carta de pago 917 (web de la ATV).

### Extremadura (verificado)
- Valor: 6 % para bienes muebles; 4 % para vehículos comerciales e industriales ligeros usados de hasta 3.500 kg adquiridos por contribuyentes con actividad económica y afectos a ella.
- Norma: DL 1/2018, arts. 38 y 45 (consolidado a 04/08/2026).
- URL: https://www.boe.es/buscar/act.php?id=BOE-A-2018-8159#a3-10
- Modelo 620 (presencial) y 623 (telemático), Portal Tributario de la Junta de Extremadura.

### Galicia (verificado)
- Valor: 3 % para medios de transporte terrestre usados; 0 % para 0 emisiones; turismos y todoterrenos con uso igual o superior a quince años: hasta 1.199 cc, 22 €; 1.200-1.599 cc, 38 €. El tipo general para otros bienes muebles es el 8 %.
- Norma: DL 1/2011, art. 14.Seis (consolidado a 27/03/2026).
- URL: https://www.boe.es/buscar/act.php?id=BOE-A-2011-18161#a14
- Modelo 620 y Atriga (web de Atriga).

### La Rioja (pendiente)
- Valor: 4 % para bienes muebles.
- Norma: Ley 10/2017, art. 44.2 (consolidado a 29/10/2026).
- URL: https://www.boe.es/buscar/act.php?id=BOE-A-2017-13750#a4-6
- Motivo: el portal de Tributos de La Rioja respondió 403 a todas las peticiones y no se pudieron leer el modelo ni el organismo.

### Madrid (verificado)
- Valor: 4 % (tipo estatal supletorio). El artículo 27 y siguientes solo fijan tipos para inmuebles.
- Norma: DL 1/2010, arts. 27 y 28, y RDL 1/1993, art. 11.1.a (consolidado a 10/07/2026).
- URL: https://www.boe.es/buscar/act.php?id=BOCM-m-2010-90068#a27
- Modelo 620 y 4 % (web de la Comunidad de Madrid).

### Melilla (verificado)
Mismo régimen que Ceuta (véase arriba).

### Murcia (verificado)
- Valor: 4 % (tipo estatal supletorio). Más de 12 años: hasta 1.000 cc, 0 €; 1.001-1.500 cc, 30 €; 1.501-2.000 cc, 50 €; más de 2.000 cc, 75 €.
- Norma: DL 1/2010, art. 6.10 (consolidado a 24/07/2025).
- URL: https://www.boe.es/buscar/act.php?id=BOE-A-2011-10542#a6
- Modelo 620 y ATRM (web de la ATRM).

### Navarra (verificado)
- Valor: 4 % para bienes muebles. Exentos ciclomotores y motocicletas, turismos y todoterrenos de diez o más años (salvo históricos o base imponible igual o superior a 40.000 €).
- Norma: Decreto Foral Legislativo 129/1999, arts. 8.c y 35.I.B.23 (consolidado a 20/04/2026). El artículo 35 de la referencia anterior es el de beneficios fiscales; el tipo está en el 8.
- URL: https://www.boe.es/buscar/act.php?id=BON-n-1999-90001#a8
- Modelo 620 (trámite en navarra.es). La página no nombra expresamente a Hacienda Foral de Navarra, solo remite a hacienda.navarra.es.

### País Vasco (pendiente)
- Álava: Norma Foral 11/2003, art. 43.d: 4 % para bienes muebles. Sin exención de ciclomotores ni de vehículos antiguos (la exención de reventa de vehículos es el art. 69.18). Texto actualizado con el Decreto Normativo de Urgencia Fiscal 2/2026.
- Bizkaia: Norma Foral 1/2011, art. 13.d: 4 %. Sin exención de ciclomotores ni de vehículos antiguos (el art. 13.f aplica 0 % a algunas compras de particulares a empresarios, como vehículos para desguace).
- Gipuzkoa: no verificado. Toda la web gipuzkoa.eus respondió 503 durante la sesión. Un resultado de búsqueda atribuye el 4 % al art. 11.1.d de la Norma Foral 18/1987, pero no se leyó el texto.
- Los tres territorios coinciden en el 4 % solo donde se pudo leer (Álava y Bizkaia). La coincidencia de Gipuzkoa queda por confirmar. El campo `fuente` apunta a la norma foral de Bizkaia.

## Reglas que el modelo de datos o `lib/itp.ts` no recogen

1. **Cuotas fijas por antigüedad**. `lib/itp.ts` tiene importes y tramos fijados en código solo para Cantabria, Comunitat Valenciana y Galicia. Aragón, Canarias y Murcia caen en la rama genérica, que calcula tipo por base y no la cuota fija. Los tramos de Valencia del código (1.199, 1.599, 1.999 cc) no coinciden con la norma (1.500 y 2.000 cc). Valencia además exige valor inferior a 20.000 € y tiene un segundo tramo de 5 a 12 años que el código no calcula.
2. **Comunitat Valenciana: históricos**. El código aplica 8 % a los históricos y el test lo espera. La norma (art. 13.Tres.3) solo fija el 8 % para vehículos de hasta 5 años con más de 2.000 cc o valor igual o superior a 20.000 €; los históricos quedan excluidos de las cuotas fijas y no consta que tributen al 8 %. No se modificó el test porque `lib/itp.ts` no se puede tocar y el test pasaría a fallar.
3. **Baleares: ECO 2 %**. El campo `tipoCeroEmisiones` cubre el 0 %, pero no existe campo para el tipo del 2 % de los vehículos ECO.
4. **Andalucía y Baleares: ciclomotores y motocicletas 0 emisiones**. Andalucía aplica el 1 % también a ciclomotores y motocicletas, y Baleares el 0 %. `lib/itp.ts` usa `esCeroEmisiones` para cualquier vehículo, lo que coincide.
5. **Cataluña: exoneración no es exención**. La norma exonera de presentar autoliquidación a ciclomotores y vehículos de diez o más años, pero no los exime. El modelo trata ambos casos como cuota cero.
6. **Umbrales de antigüedad**. Navarra y Cataluña dicen "diez o más años" y Galicia "quince o más", pero `lib/itp.ts` compara con `>` (estrictamente mayor). Los vehículos con exactamente 10 o 15 años se calculan mal.
7. **Cataluña y Navarra: valor de 40.000 €**. La norma compara el precio medio de venta del primer año (sin depreciar) o la base imponible según la Orden Foral. `lib/itp.ts` compara con el valor fiscal depreciado, lo que casi nunca llega a 40.000 € y por tanto exime vehículos que no deberían estarlo.
8. **Extremadura: 4 % comercial**. El campo `tipoReducidoComercial` existe en el modelo de datos, pero `lib/itp.ts` no lo usa en el cálculo.
9. **Ceuta y Melilla**. `lib/itp.ts` aplica siempre el `tipoEfectivo` del 2 %, pero la bonificación del 50 % solo corresponde a adquirentes residentes o con domicilio fiscal en Ceuta o Melilla. Un adquirente no residente tributa al 4 %.
10. **Cantabria**. La norma fija además cuotas para vehículos comerciales e industriales (más de 5 años) y para ciclomotores y motocicletas en su primer año. No hay campos para ello.
11. **Valencia, otros tipos**. 6 % para eléctricos, pila de combustible e híbridos de menos de 2.000 cc, y 2 % para vehículos al final de su vida útil. No hay campos para ello.
12. **Andalucía**. La norma excluye del 8 % a los vehículos con el 1 %. El código lo resuelve por orden de ramas (cero emisiones antes que incrementado), lo que coincide.
13. **Galicia**. El tipo del 3 % es el de vehículos usados; el general para otros bienes muebles es el 8 %. El campo `tipoGeneral` solo almacena el 3 %.
14. **País Vasco**. Un solo registro para tres territorios con normas distintas; si Gipuzkoa difiriera, no se podría representar.

## Pendiente

- Aragón: número de modelo de autoliquidación.
- Cantabria: modelo 620 o 621.
- La Rioja: modelo y organismo (portal con 403).
- País Vasco: texto de Gipuzkoa (web con 503).
