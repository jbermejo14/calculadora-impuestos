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
