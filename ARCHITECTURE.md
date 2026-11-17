# Arquitectura: calculadora-impuestos

## 1. Objetivo y alcance

Calculadora del Impuesto de Matriculación (IEDMT) y del ITP de vehículos usados en España, con páginas estáticas por territorio, comunidad autónoma y guía. Forma parte de la red Ododex (`ododex.com`).

Este documento cubre la capa de interfaz. La lógica fiscal (`lib/iedmt.ts`, `lib/itp.ts`, `lib/fees.ts`, `lib/verification.ts`) y los datos (`data/2026/*.json`) no cambian.

Fuera de alcance: rutas nuevas, anuncios, cambios de cálculo o de datos, el sistema de diseño común completo (prompt 17, encargo aparte).

## 2. Módulos de interfaz

### 2.1 Compilación de estilos (Tailwind 4 por PostCSS)

Responsabilidad: que las utilidades de Tailwind se generen igual con webpack y Turbopack, en Windows y en Linux.

- `postcss.config.mjs`: `plugins: ["./postcss-tailwind-windows.cjs", "@tailwindcss/postcss"]`.
- `postcss-tailwind-windows.cjs`: el mismo plugin que `multas-dgt/postcss-tailwind-windows.cjs`, con estas carpetas de origen: `app`, `components` y `lib`. En Windows, el escáner WASM de Tailwind no lee rutas `C:\`; el plugin extrae las clases con Node y las declara con `@source inline(...)`. En otras plataformas no hace nada.
- `package.json`:
  - Se quita `@tailwindcss/turbopack`.
  - Se añade `@tailwindcss/postcss` `4.3.3` (devDependency).
  - Se añade `@tailwindcss/oxide-wasm32-wasi` `4.3.3` (optionalDependency).
  - `build` pasa a ser `next build --webpack`.
- La instalación necesita `npm install --force`, porque el paquete WASI declara `cpu: wasm32`.

### 2.2 Tokens de color (`app/globals.css`)

Responsabilidad: un único juego de variables por tema, con contraste WCAG AA (4,5:1 para texto).

Valores tomados de `../prompts/00-diseno.md`:

| Token | Claro | Oscuro |
|---|---|---|
| `--bg-body` | `#FFFFFF` | `#0A0A0A` |
| `--bg-surface` | `#FAFAFA` | `#141414` |
| `--bg-surface-elevated` | `#F4F4F5` | `#1C1C1C` |
| `--border-color` | `#E4E4E7` | `#2A2A2A` |
| `--text-primary` | `#111111` | `#F5F5F5` |
| `--text-secondary` | `#525252` | `#A3A3A3` |
| `--text-muted` | `#525252` | `#A3A3A3` |
| `--accent-primary` | `#C2410C` | `#FF6B00` |
| `--accent-hover` | `#9A3412` | `#FF8533` |
| `--accent-subtle` | `#FFF7ED` | `#2A1708` |
| `--positive` | `#15803D` | `#4ADE80` |
| `--negative` | `#B91C1C` | `#F87171` |

Reglas:

- El texto naranja usa siempre `--accent-primary`, nunca `--orange-500` fijo: `#FF6B00` sobre blanco no llega a 4,5:1.
- El texto blanco sobre fondo naranja usa `--accent-primary` del tema claro (`#C2410C`) en los dos modos. Sobre `#FF6B00` el blanco tampoco llega a 4,5:1.
- `--text-muted` no puede bajar de 4,5:1 sobre `--bg-surface` ni sobre `--bg-surface-elevated`.
- Las etiquetas verde y roja (`.tag-green`, `.tag-red`, `.status-ready`) usan `--positive` y `--negative`.
- Se exponen a Tailwind con `@theme inline` como colores semánticos: `bg`, `surface`, `elevated`, `line`, `fg`, `muted`, `accent` y `accent-soft`. Así se pueden escribir `text-muted`, `bg-surface`, `border-line`, `text-accent`…
- Las páginas no usan colores de paleta fijos (`text-slate-*`, `bg-zinc-*`, `border-zinc-*`, `text-orange-500`). Esos colores solo funcionan en modo oscuro.

### 2.3 Marca y cabecera (`components/Header.tsx`, `components/BrandLogo.tsx`)

Responsabilidad: identidad Ododex y una cabecera compacta.

- `public/brand/`: copia sin modificar de `../brand/ododex-logo-light.svg`, `ododex-logo-dark.svg` y `ododex-favicon.svg`.
- `app/icon.svg`: copia de `ododex-favicon.svg`. Next lo sirve como favicon.
- `BrandLogo` (componente de servidor): renderiza dos `<img>`, uno para cada tema, con `alt="Ododex"`. CSS muestra uno u otro según `[data-theme]`. Altura de 28 px en móvil y 32 px desde `md`.
- Cabecera:
  - A la izquierda, enlace a `/` con el logo, un separador vertical y la etiqueta de sección "Impuestos de vehículos".
  - A la derecha, el conmutador de tema.
  - En móvil la etiqueta de sección se oculta, la altura es como máximo de 56 px y el conmutador es un botón cuadrado de 44 × 44 px con solo el icono.
  - Desde `md`, el conmutador muestra icono y texto.
- `lib/site.ts` exporta `SITE_NAME = 'Ododex'` y `SECTION_NAME = 'Impuestos de vehículos'`.
- `app/layout.tsx`:
  - Toda mención a "AutoTax" pasa a `SITE_NAME`: `template: '%s | Ododex'`, `siteName`, `authors`, `creator` y `publisher`.
  - Fuente: Inter con `next/font/google`, pesos 400, 500, 600 y 700. Sustituye a Plus Jakarta Sans. JetBrains Mono se mantiene para las cifras.
  - Script de tema: primero la elección guardada en `localStorage['ododex-theme']`; si no hay, `prefers-color-scheme`. Envuelto en `try/catch` por si `localStorage` no está disponible. El `<html>` no lleva `data-theme` fijo en el marcado.
- `Footer`: "AutoTax España" pasa a "Ododex". Los enlaces de comunidades usan `text-muted` y `hover:text-accent`.

### 2.4 Selector de calculadora (`components/HomeTabs.tsx`)

Responsabilidad: cambiar entre las 3 vistas con un control segmentado.

- Contenedor `grid grid-cols-3` a todo el ancho, sin scroll horizontal. Fondo `--bg-surface`, borde y radio de 14 px.
- Cada botón ocupa una columna y mide al menos 44 px de alto.
  - Móvil: icono de 18 px encima y la etiqueta corta debajo, a 12 px.
  - Desde `md`: icono a la izquierda y la etiqueta larga a 14–15 px.
- Etiquetas:

  | Corta | Larga |
  |---|---|
  | Matriculación | Matriculación (nuevo o importado) |
  | Transferencia | Transferencia / compraventa (ITP) |
  | Tramos | Guía de tramos y exenciones |

  Se quitan los números "1.", "2." y "3.".
- Activo: fondo `#C2410C`, texto blanco y sombra suave. Inactivo: `--text-secondary`; al pasar el ratón, `--text-primary` sobre `--bg-surface-elevated`.
- Accesibilidad:
  - `role="tablist"` en el contenedor; `role="tab"`, `aria-selected`, `aria-controls` e `id` en cada botón; `role="tabpanel"` y `aria-labelledby` en cada panel.
  - Las flechas izquierda y derecha mueven el foco entre pestañas.
  - Foco visible: anillo de 2 px `--accent-primary` con 2 px de separación.

### 2.5 Enlaces por territorio (`components/TerritoryLinks.tsx`)

Responsabilidad: los 3 enlaces a `/impuesto-matriculacion/[territorio]` como tarjetas.

- Entrada: ninguna; la lista es una constante del componente.

  | slug | Nombre | Pista |
  |---|---|---|
  | `peninsula-y-baleares` | Península y Baleares | Régimen general |
  | `canarias` | Canarias | Tipos reducidos (REF) |
  | `ceuta-y-melilla` | Ceuta y Melilla | Tipo 0 % |

- Título encima: "Ver por territorio", en 13 px, semibold y `--text-secondary`.
- Rejilla de 3 columnas desde `sm`. En móvil, 1 columna con filas compactas de unos 52 px.
- Cada tarjeta es un `<Link>` con fondo `--bg-surface`, borde `--border-color` y radio de 12 px. Contiene el nombre (semibold, `--text-primary`), la pista debajo (12 px, `--text-secondary`) y una flecha `→` a la derecha.
- Hover y foco: borde `--accent-primary`, la flecha se desplaza 2 px y la pista sigue legible. Sin subrayado.

### 2.6 Enlaces por comunidad (`components/CommunityLinks.tsx`)

Responsabilidad: los enlaces a `/itp-coche-segunda-mano/[comunidad]` en la pestaña de transferencia.

- Props: `{ comunidades: ComunidadITPData[] }`.
- Un `<details>` cerrado por defecto, con el `<summary>` "Ver el ITP por comunidad autónoma (N)", donde N es el número de comunidades. El summary tiene el estilo de las tarjetas de 2.5 y un chevron que gira al abrir.
- Dentro, la rejilla existente `.communities-grid` con `.community-pill`: el nombre y el "tipo general %" en `--accent-primary`. En móvil, 2 columnas (`minmax(140px, 1fr)`).

### 2.7 Calculadoras y páginas

Responsabilidad: que todo se lea bien de 360 a 1280 px y en los dos temas.

- Se definen en `globals.css` las clases que hoy se usan sin estilos:
  - `guide-card`, `guide-card-title`, `badge-num`, `guide-text`, `guide-list`
  - `form-actions`, `item-info`, `tramo-info`, `chk-label`
- `.card`: `padding: 1.25rem` en móvil y `2rem` desde 768 px.
- `.card-header`: en móvil, `flex-direction: column` para que la etiqueta de estado baje debajo del título.
- `.breakdown-item`: por debajo de 480 px, el importe va debajo del título, alineado a la izquierda.
- `.total-amount`: `clamp(1.9rem, 8vw, 2.35rem)`.
- `.results-card`: deja de ser sticky por debajo de 960 px.
- Iconos SVG en botones (imprimir, reiniciar): tamaño fijo con `width` y `height` en el propio SVG, sin depender solo de clases.
- `.main-wrapper`: `padding: 1.25rem 1rem 2.5rem` en móvil.
- El emoji 🛡️ de `VerificationNotice` se sustituye por un SVG de escudo con `aria-hidden` y el texto ya existente.
- En `app/page.tsx`, `app/impuesto-matriculacion/[territorio]/page.tsx`, `app/itp-coche-segunda-mano/[comunidad]/page.tsx`, `app/guia/[tema]/page.tsx` y `app/not-found.tsx`, los colores de paleta fijos pasan a los semánticos de 2.2.

## 2.8 Corrección del cálculo fiscal (noviembre de 2026)

Origen: verificación del 17/11/2026, en `docs/verificacion-2026-estatal.md` y `docs/verificacion-2026-itp.md`. Esos informes son la especificación legal de detalle: citan norma, artículo y URL. Este apartado prevalece sobre la sección 1 ("la lógica fiscal no cambia").

Reglas comunes:

- Ningún valor fiscal se escribe en el código. Todos están en `data/2026/*.json` con `norma`, `fuente`, `estadoVerificacion` y `fechaVerificacion`, y se respeta lo que exige `tests/data-sources.test.ts`.
- Un dato nuevo es `verificado` solo si su informe lo da por leído en la fuente primaria. Si no, es `pendiente`.
- Cuando la calculadora no modela un caso, lo dice al usuario con un texto, en lugar de calcular mal.

### 2.8.1 IEDMT (`lib/iedmt.ts`, `data/2026/iedmt.json`, `components/CalculadoraMatriculacion.tsx`)

Texto legal: Ley 38/1992, arts. 65, 66 y 70 (BOE-A-1992-28741, consolidado, última modificación del art. 70 en vigor desde el 11/07/2021).

1. **Tipo de vehículo** (`tipoVehiculo`):

   | Valor | Etiqueta | Regla |
   |---|---|---|
   | `turismo` | Turismo / todoterreno | Epígrafes 1.º a 4.º por CO₂ |
   | `motocicleta` | Motocicleta | Epígrafes 6.º a 9.º |
   | `autocaravana` | Autocaravana / vehículo vivienda | Ver punto 6 |
   | `quad` | Quad | Siempre epígrafe 4.º d |
   | `comercial` | Furgoneta o comercial (N1) afecto a actividad económica | No sujeto (art. 65.1.a.1.º) |

   - `comercial`: cuota 0 con el motivo "No sujeto si se afecta significativamente a una actividad económica (art. 65.1.a Ley 38/1992). Si se acondiciona como vivienda, sí está sujeto".
2. **Epígrafes de turismo** (art. 70.1):

   | Epígrafe | Condición |
   |---|---|
   | 1.º | CO₂ ≤ 120, o 1.º b: casilla nueva "Un solo motor, no de combustión (eléctrico puro)" (`esMotorNoCombustion`), con cualquier CO₂ |
   | 2.º | 120 < CO₂ < 160 |
   | 3.º | 160 ≤ CO₂ < 200 |
   | 4.º | CO₂ ≥ 200, o 4.º b: casilla nueva "CO₂ no acreditado" (`co2NoAcreditado`) |

3. **Epígrafes de motocicleta** (art. 70.1):

   | Epígrafe | Condición |
   |---|---|
   | 6.º | CO₂ ≤ 100 |
   | 7.º | 100 < CO₂ ≤ 120 |
   | 8.º | 120 < CO₂ < 140 |
   | 9.º | CO₂ ≥ 140, o CO₂ no acreditado, o casilla nueva "Potencia ≥ 74 kW y relación potencia/masa ≥ 0,66 kW/kg" (`esMotoAltaPotencia`) |

   - El epígrafe 1.º b (un solo motor que no sea de combustión) solo excluye a los quads, así que también alcanza a las motos: una moto eléctrica va al 1.º, al 0 %.
   - Excepción: una moto eléctrica de alta potencia cae en el 9.º c, que dice "cualesquiera que sean sus emisiones". Es un supuesto interpretativo: se documenta en un comentario y se avisa en el resultado de que debe confirmarse con la AEAT.
4. **Tipos** (art. 70.2.b y c): se guardan en `iedmt.json` por territorio y epígrafe agrupado: `1y6`, `2y7`, `3y8`, `4y9` y `5`.

   | Epígrafes | Península y Baleares | Canarias | Ceuta y Melilla |
   |---|---|---|---|
   | 1.º y 6.º | 0 % | 0 % | 0 % |
   | 2.º y 7.º | 4,75 % | 3,75 % | 0 % |
   | 3.º y 8.º | 9,75 % | 8,75 % | 0 % |
   | 4.º y 9.º | 14,75 % | 13,75 % | 0 % |
   | 5.º | 12 % | 11 % | 0 % |

   - El epígrafe 5.º (resto de vehículos) se guarda en los datos, pero ningún tipo de vehículo de la interfaz lleva a él.
   - Texto fijo bajo el resultado: "Se aplican los tipos estatales del art. 70.2.b. Una comunidad autónoma puede aprobar tipos propios (art. 70.2.a)".
5. **Familia numerosa** (art. 66.4): reducción del 50 % de la base.
   - Solo vehículos automóviles (turismo y autocaravana).
   - La casilla muestra un campo nuevo, "Plazas homologadas (incluido conductor)" (`plazas`, por defecto 5).
   - Solo se aplica con 5 ≤ plazas ≤ 9. Si no se cumple, el resultado explica por qué no se aplica.
   - En moto y quad, la casilla se deshabilita.
6. **Autocaravana**:
   - Reducción del 30 % de la base (art. 66.5).
   - Epígrafe por CO₂ como turismo, salvo con la casilla nueva "Categoría N2/N3 (camión vivienda)" (`esN2N3Vivienda`), que lleva al epígrafe 4.º c.
   - Si concurren familia numerosa y autocaravana, las reducciones se aplican sucesivamente sobre la base: primero el 30 %, después el 50 %. Se documenta como supuesto en un comentario y en el resultado.
7. **Minusvalía** (art. 66.1.d): exención solo en automóviles (turismo y autocaravana). Motivo: "Exención para vehículos matriculados a nombre de personas con discapacidad para su uso exclusivo (art. 66.1.d Ley 38/1992). Requiere reconocimiento previo de la AEAT".
8. **Ceuta y Melilla**: motivo "Tipo del 0 % en Ceuta y Melilla (art. 70.2.c Ley 38/1992)".
9. **Correcciones de texto**:
   - `components/GuidePanel.tsx`: la tasa 4.1 pasa a "Anotaciones, suministro de datos, certificaciones e informe de vehículo".
   - `components/Footer.tsx`: "Orden HAC/1484/2024" pasa a "Orden HAC/1501/2025".
   - Guía de tramos: añadir las filas de moto (6.º a 9.º) y del 5.º, si la guía lee la tabla de `guias.json`. Si no, solo en `iedmt.json` y en la página `/guia/tramos-iedmt`.

### 2.8.2 ITP (`lib/itp.ts`, `data/2026/itp.json`, `components/CalculadoraTransferencia.tsx`)

1. **Cuotas fijas estructuradas.** El texto de `cuotasFijasAntiguedad.descripcion` pasa a datos. Se mantiene `descripcion` y se añade `reglas: ReglaCuotaFija[]`:

   ```ts
   interface ReglaCuotaFija {
     tipoVehiculo: 'turismo' | 'motocicleta' | 'todos';
     antiguedadMinima: number;          // años
     incluyeAntiguedadMinima: boolean;  // true = "igual o más de", false = "más de"
     antiguedadMaxima: number | null;   // inclusive; null = sin tope
     cilindradaMinima: number | null;   // exclusiva (cc > min); null = sin mínimo
     cilindradaMaxima: number | null;   // inclusiva (cc <= max); null = sin tope
     cuota: number;                     // euros
     valorMaximo: number | null;        // valor (ver valorReferencia) estrictamente menor que este; null = sin límite
     valorReferencia: 'precioMedioNuevo' | 'valorFiscal' | null;
     excluyeHistoricos: boolean;
   }
   ```

   - Se rellenan Aragón, Canarias, Cantabria, Comunitat Valenciana, Galicia y Murcia con los importes y límites de `docs/verificacion-2026-itp.md`.
   - Ojo con los límites "hasta 999 / de 1.000 a 1.499" de Cantabria: se convierten con `cilindradaMaxima` inclusiva.
   - Si el vehículo cumple una regla, la cuota es la de la regla y el motivo cita la norma.
   - Si no cumple ninguna, se calcula por porcentaje.
   - Se borra del código toda lógica de cuotas fijas escrita a mano por comunidad.
2. **Exoneración de 10 años** (`exencionDiezAnios`, Cataluña y Navarra):
   - Se añade `incluyeAntiguedadMinima` ("diez o más años" = `true`).
   - El límite de 40.000 € se compara con `exencionDiezAnios.valorReferencia`:
     - Cataluña: `precioMedioNuevo` (precio medio sin depreciar).
     - Navarra: `valorFiscal`. El art. 35.I.B.23 del DFL 129/1999 habla de la base determinada según la Orden Foral navarra de precios medios. El cálculo usa las tablas estatales y lo avisa.
   - Navarra exime siempre a los ciclomotores, y a motos, turismos y todoterrenos desde los 10 años.
   - En Cataluña el motivo dice "Sin obligación de presentar autoliquidación (no es una exención)".
   - Navarra mantiene el texto de su norma según el informe.
3. **Cilindrada en el formulario**: campo nuevo "Cilindrada (cc)" (`cilindradaCC`, por defecto 1.400), visible siempre.
4. **Tipo de vehículo en el ITP**: un selector "Turismo / todoterreno", "Motocicleta" y "Ciclomotor" sustituye a la casilla de ciclomotor actual. Las reglas de cuota fija filtran por él.
5. **Ceuta y Melilla**:
   - Casilla "Comprador con residencia o domicilio fiscal en Ceuta/Melilla" (`esResidenteCiudadAutonoma`, por defecto marcada), visible solo en esas dos ciudades.
   - Con la casilla marcada se aplica la bonificación del 50 % (tipo efectivo 2 %); sin ella, el 4 %.
   - Norma: RDL 1/1993 art. 57 bis.
6. **Baleares, etiqueta ECO**:
   - Campo `tipoEco` (2 %) en datos, si el informe lo da por verificado. Si no, `pendiente`.
   - La casilla de cero emisiones pasa a un selector de distintivo: "Ninguno/B/C", "ECO" o "CERO". Solo cambia el tipo donde haya `tipoEco` o `tipoCeroEmisiones`.
7. **Comunitat Valenciana** (Ley 13/1997, art. 13.Tres.3):
   - Las cuotas fijas son excepciones al 6 % y prevalecen sobre el tipo por distintivo.
   - El límite de 20.000 € se compara con la base liquidable (el mayor entre contrato y valor fiscal), que es la lectura conservadora de "cuyo valor".
   - Lo demás: los tipos del 6 % (eléctricos e híbridos de menos de 2.000 cc) y del 8 % se modelan como dice el informe, si es posible con los campos existentes más `tipoEco`/`tipoCeroEmisiones`. Si no, se muestra un aviso en el resultado. Los históricos no reciben cuota fija y no se fuerzan al 8 %; la prueba actual se corrige citando la norma.
8. **Extremadura, `tipoReducidoComercial`**: se aplica si el informe describe sus condiciones con claridad. Si no, se quita del uso y se documenta.
9. **País Vasco, Aragón, Cantabria y La Rioja** siguen `pendiente`. País Vasco muestra la nota "Cada territorio histórico (Álava, Bizkaia, Gipuzkoa) tiene su norma foral. Cálculo con el tipo común del 4 %".
10. **Galicia**: `tipoGeneral` mantiene el 3 % de vehículos usados. Se añade a `notas` que el tipo general de otros bienes muebles es el 8 %.
11. **Terminología de la cuota cero.** El resultado añade `clasificacionCuotaCero: 'exencion' | 'tipoCero' | 'cuotaFijaCero' | 'noObligacion' | 'noSujeto' | null` (`null` si la cuota no es cero). `esExentoOcuotaCero` se mantiene.
    - `exencion`: exención legal real (Navarra a los 10 años y ciclomotores). Solo esta se muestra como "Exento".
    - `tipoCero`: tipo de gravamen del 0 % (distintivo CERO, ciclomotores de Baleares). Se muestra "Tipo 0 %".
    - `cuotaFijaCero`: cuota fija de 0 € (Aragón hasta 1.000 cc). Se muestra "Cuota 0 €".
    - `noObligacion`: sin obligación de autoliquidar, sin ser exención (Cataluña a los 10 años y ciclomotores).
    - `noSujeto`: compraventa profesional (art. 7.5 TR LITP).
    - Origen del dato: `exencionDiezAnios.clasificacion` (`exencion` o `noObligacion`) y `clasificacionCiclomotores` (por defecto `exencion`) en `itp.json`. `etiquetaCuotaCeroITP(clasificacion)` devuelve la etiqueta.
12. **Navarra**: el motivo de la exoneración cita el art. 35.I.B.23 del DFL 129/1999 y el resultado siempre incluye el aviso de que el valor fiscal usa las tablas estatales y no la Orden Foral navarra.
13. **IVA en el IEDMT**: `territorioTieneIvaIEDMT(slug)` es `false` en Canarias y en Ceuta y Melilla. En ellos no se suma IVA y el resultado avisa de que rige el IGIC o el IPSI, que no se calcula porque su tipo no está en los datos. La calculadora deshabilita la casilla de IVA en esos territorios.

### Criterios de aceptación de 2.8

- **IEDMT**, `tests/iedmt.test.ts`, una prueba por regla:
  - límites exactos de cada epígrafe: 120, 160, 200 para turismo y 100, 120, 140 para moto;
  - motor no de combustión;
  - CO₂ no acreditado en turismo y en moto;
  - moto de alta potencia;
  - quad;
  - autocaravana N1 y N2/N3;
  - familia numerosa con 4, 5, 9 y 10 plazas;
  - minusvalía en moto (no exime);
  - los tres territorios.
- **ITP**, `tests/itp.test.ts`:
  - cada comunidad con cuota fija, en el límite de antigüedad (exacto y +1) y en cada límite de cilindrada;
  - Valencia, con el límite de 20.000 € y un vehículo histórico;
  - Cataluña, a 10 años exactos y con un precio medio de 40.000 €;
  - Ceuta, residente y no residente;
  - Baleares ECO.
- `npm test` y `npm run build` pasan.

## 3. Orden de implementación

Todo es un único encargo de interfaz, en este orden:

1. Compilación de estilos (2.1).
2. Tokens (2.2).
3. Marca y cabecera (2.3).
4. Selector de calculadora (2.4).
5. Enlaces por territorio (2.5).
6. Enlaces por comunidad (2.6).
7. Calculadoras y páginas (2.7).

## 4. Criterios de aceptación

- `npm test` pasa, con las pruebas actuales intactas y estas nuevas en `tests/ui-*.test.ts`:
  - **Contraste**: lee `app/globals.css`, extrae los valores de los dos temas y comprueba ≥ 4,5:1 en estos pares:
    - `--text-primary`, `--text-secondary` y `--text-muted` sobre `--bg-body`, `--bg-surface` y `--bg-surface-elevated`;
    - `--accent-primary` sobre `--bg-body` y `--bg-surface`;
    - blanco sobre `#C2410C`.
  - **Marca**: ningún fichero de `app/`, `components/` ni `lib/` contiene "AutoTax", y `SITE_NAME` es "Ododex".
  - **Territorios**: `renderToStaticMarkup(<TerritoryLinks />)` contiene los 3 `href` esperados.
  - **Comunidades**: `CommunityLinks` con 2 comunidades de ejemplo renderiza 2 enlaces y "(2)" en el summary.
  - **Pestañas**: el marcado inicial de `HomeTabs` tiene 3 `role="tab"`, uno solo con `aria-selected="true"`, y las 3 etiquetas cortas y largas.
  - **Colores fijos**: ningún `.tsx` de `app/` ni `components/` contiene `text-slate-`, `bg-zinc-`, `border-zinc-` ni `text-orange-`.
- `npm run build` termina sin errores. El CSS generado en `.next/static/css` contiene las reglas de `grid-cols-3` y de `md:grid-cols-2`.
- Verificación en pantalla (sesión principal):
  - 375 y 1280 px, en tema claro y oscuro, sin desbordamiento horizontal.
  - Las pestañas caben en una fila en móvil.
  - Ningún enlace azul subrayado.
