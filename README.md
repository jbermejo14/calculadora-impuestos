# Ododex: Calculadora de Impuestos de Vehículos (2026)

Aplicación web desarrollada con **Next.js (App Router)** para calcular de forma orientativa los tributos exigidos en España al registrar o transferir un vehículo:

1. **Impuesto Especial sobre Determinados Medios de Transporte (IEDMT - Modelo 576 AEAT):** Primera matriculación de vehículos nuevos o de importación según emisiones de $CO_2$ (WLTP), con epígrafes para turismos, motocicletas, autocaravanas y quads, y regímenes diferenciados para Península y Baleares, Canarias (REF) y Ceuta y Melilla.
2. **Impuesto de Transmisiones Patrimoniales Onerosas (ITP - Modelos 620 y 621):** Compraventa de vehículos usados entre particulares según las normas de las 17 Comunidades Autónomas y de las Ciudades Autónomas de Ceuta y Melilla, con sus cuotas fijas, exenciones y tipos por distintivo ambiental. Aplica la tabla de depreciación por antigüedad del BOE (Anexo IV) y calcula la base liquidable mínima de Hacienda para evitar liquidaciones complementarias (paralelas).
3. **Tasas de la DGT:** Cambio de titularidad, ciclomotores y matriculación ordinaria. Los importes están en `data/{AÑO}/tasas-dgt.json`.

Todos los valores fiscales se contrastaron con el BOE y los boletines autonómicos. El detalle de cada verificación y lo que queda pendiente está en [`docs/verificacion-2026-estatal.md`](docs/verificacion-2026-estatal.md) y [`docs/verificacion-2026-itp.md`](docs/verificacion-2026-itp.md). El diseño de los módulos y sus contratos está en [`ARCHITECTURE.md`](ARCHITECTURE.md).

---

## 🚀 Requisitos e Instalación

### Requisitos previos
- Node.js `v20` o superior (probado en Node.js `v22.12.0`).
- npm `v10` o superior.

### Instalación de dependencias
Las versiones exactas configuradas son `next@16.4.6`, `react@19.3.0`, `react-dom@19.3.0` y `tailwindcss@4.3.3`:

```bash
npm install --force
```
`--force` hace falta en Windows para instalar la variante WASM de Tailwind (ver "Estilos y marca"). En Linux y macOS basta `npm install`.

Crea también el fichero del titular a partir de la plantilla (ver "Publicación en ododex.com"):
```bash
cp config/titular.example.json config/titular.json
```

### Ejecución en desarrollo
```bash
npm run dev
```
La aplicación estará disponible en `http://localhost:3000/es/impuestos` (la raíz `/` da 404 por la ruta base).

### Compilación y generación estática (SSG)
```bash
npm run build
```
Exporta el sitio como ficheros estáticos en `out/` (`output: 'export'` en `next.config.ts`): las 27 páginas indexables del sitemap y las 3 legales, que no se indexan. Con exportación estática no existe `npm run start`: para ver el resultado como en producción, usa `npm run preview` en `../ododex-sitio`.

---

## Estilos y marca

La marca es **Ododex** (`SITE_NAME` y `SECTION_NAME` en `lib/site.ts`; logos en `public/brand/`). Los colores son variables CSS por tema en `app/globals.css` (atributo `data-theme` de `<html>`, guardado en `localStorage['ododex-theme']`) y se exponen a Tailwind como `bg-surface`, `text-muted`, `border-line`, `text-accent`...

Tailwind 4 se compila por PostCSS (`postcss.config.mjs`) para que funcione igual con webpack y con Turbopack. En Windows, el escáner WASM de Tailwind no lee rutas `C:\`, así que `postcss-tailwind-windows.cjs` extrae las clases de `app`, `components` y `lib` con Node y las declara con `@source inline(...)` (en otras plataformas no hace nada). Consecuencias:

- Instalar con `npm install --force`, porque `@tailwindcss/oxide-wasm32-wasi` declara `cpu: wasm32`.
- `npm run build` usa `next build --webpack`.
- Si el CSS generado no cambia tras editar `app/globals.css`, es la caché de webpack: modifica el fichero y recompila.

---

## ⚙️ Variables de Entorno

Configura el archivo `.env.local` tomando como base `.env.example`:

```bash
cp .env.example .env.local
```

| Variable | Descripción | Valor por defecto |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_SITE_URL` | Origen del sitio (sin ruta ni barra final) para canonical, sitemap.xml y Open Graph | `http://localhost:3000` |
| `NEXT_PUBLIC_ADSENSE_CLIENT` | Identificador de AdSense (`ca-pub-` y 16 dígitos). Vacío: sin anuncios ni botón de cookies | vacío |

Ejemplo en producción:
```env
NEXT_PUBLIC_SITE_URL=https://ododex.com
```

## Publicación en ododex.com

- **Ruta base:** la web se sirve bajo `/es/impuestos` (`BASE_PATH` en `lib/site.ts`, aplicado como `basePath` en `next.config.ts`). En local, `http://localhost:3000/es/impuestos`.
- **`NEXT_PUBLIC_SITE_URL`:** solo el origen, `https://ododex.com`. Las URLs absolutas (canonical, sitemap, migas) añaden la ruta base solas.
- **`NEXT_PUBLIC_ADSENSE_CLIENT`:** `ca-pub-` y 16 dígitos. Si está vacía o es inválida no se carga AdSense ni se muestra el botón "Configurar cookies". El mensaje de consentimiento (TCF v2.2) se configura en AdSense, en Privacidad y mensajes.
- **`config/titular.json`:** datos del titular (`tipo`, `nombre`, `nif`, `domicilio`, `email` y, si es empresa, `registroMercantil`). No está en git porque contiene datos personales: se crea copiando `config/titular.example.json` y se rellena en cada máquina donde se compile la web. Si no existe, se usa la plantilla y los campos aparecen como `[pendiente: campo]` en las páginas legales. Hay que rellenarlo antes de publicar.
- **Despliegue:** el proyecto hermano `../ododex-sitio` compila esta web con las variables de producción, copia `out/` bajo `/es/impuestos` junto a las demás secciones y lo sube a Cloudflare Pages. También genera en la raíz de `ododex.com` el `robots.txt` (con `Sitemap: https://ododex.com/es/impuestos/sitemap.xml`) y el `ads.txt`, que solo valen en la raíz del dominio. Ver su README.

---

## 🧪 Ejecución de Pruebas Automatizadas

El proyecto cuenta con una suite completa de pruebas unitarias y de integridad fiscal **sin dependencias de red**:

```bash
npm test
```

### Qué verifican las pruebas:
1. **Integridad de Fuentes y Datos (`tests/data-sources.test.ts`):** Falla si falta algún archivo fiscal del año en curso, si falta la URL de la fuente en algún dato, si no se especifica la norma legal, si el estado de verificación no es válido o si un dato verificado no lleva fecha ISO (los pendientes deben llevar `null`). `tests/verification.test.ts` cubre el texto "Verificado el {fecha}".
2. **Impuesto de Matriculación (`tests/iedmt.test.ts`):** Comprueba los epígrafes 1.º a 9.º en cada territorio, la no sujeción de motos de hasta 250 cc y de comerciales afectos a actividad, quads, autocaravanas, familia numerosa y minusvalía.
3. **ITP y Depreciación BOE (`tests/itp.test.ts`):** Comprueba el ITP de las 17 comunidades autónomas y de Ceuta y Melilla con al menos un caso real, las fronteras exactas de los 13 tramos de depreciación del Anexo IV del BOE, las cuotas fijas por antigüedad y cilindrada, compraventa profesional (no sujeta), ciclomotores, vehículos históricos, la exoneración de diez años de Cataluña y Navarra y los distintivos CERO y ECO.
4. **Correcciones de la revisión (`tests/m-correcciones.test.ts`):** Distinción entre exención, tipo 0 %, cuota fija 0 € y no obligación; avisos de Navarra; IGIC e IPSI en lugar de IVA; ausencia de importes escritos a mano en páginas y componentes.
5. **Rutas Estáticas y SEO (`tests/routes-and-sitemap.test.ts`, `tests/site.test.ts`):** Valida todos los slugs de comunidades, territorios y guías, respuesta 404 para slugs inválidos, la generación íntegra del sitemap (27 páginas canónicas), las URLs absolutas con la ruta base y que `next.config.ts` y `lib/site.ts` usen la misma ruta base.
6. **Páginas legales (`tests/legal.test.ts`, `tests/legal-pages.test.tsx`):** Lectura y validación del titular, uso de la plantilla cuando falta `config/titular.json`, marcadores pendientes, contenido mínimo de cada página y carga condicional de AdSense.
7. **Interfaz (`tests/ui-*.test.ts(x)`):** Contraste de colores en los dos temas, marca Ododex, ausencia de colores fijos, enlaces por territorio y comunidad, y pestañas de la home.

---

## 📅 Cómo Actualizar los Datos Fiscales Cada Año

Los datos fiscales no están incrustados en componentes visuales, sino organizados en archivos JSON versionados por ejercicio fiscal en la carpeta `data/{AÑO}/`.

### Pasos para publicar un nuevo ejercicio fiscal (ejemplo: 2027):

1. **Crear el directorio del nuevo año:**
   ```bash
   mkdir data/2027
   ```

2. **Copiar y actualizar los ficheros JSON:**
   - `data/2027/depreciacion.json`: Comprobar la nueva Orden Ministerial de precios medios de venta y coeficientes de antigüedad publicada a finales de diciembre en el BOE.
   - `data/2027/tasas-dgt.json`: Comprobar las tasas de la Jefatura Central de Tráfico en la Ley de Presupuestos Generales del Estado y sede de la DGT.
   - `data/2027/itp.json`: Comprobar las leyes de medidas fiscales y tributos cedidos de las 17 comunidades autónomas y de Ceuta y Melilla.
   - `data/2027/iedmt.json`: Comprobar posibles modificaciones de los artículos 65 y 70 de la Ley 38/1992 de Impuestos Especiales.
   - `data/2027/guias.json`: Actualizar enlaces y citas normativas.

3. **Requisitos obligatorios de cada valor:**
   Todo dato debe incluir obligatoriamente:
   - `fuente`: URL directa al BOE o boletín oficial autonómico (`https://...`).
   - `norma`: Título del texto legal y artículo (ej. `Ley 5/2021, artículo 43`).
   - `estadoVerificacion`: `"pendiente"` (valor inicial) o `"verificado"`. Solo se pasa a `"verificado"` tras contrastar el valor con su fuente.
   - `fechaVerificacion`: `null` mientras esté pendiente; fecha ISO `YYYY-MM-DD` de la verificación real cuando esté `"verificado"`. La web muestra "Verificado el {fecha}" solo en ese caso; si no, "Datos fiscales pendientes de revisión contra la fuente. Cálculo orientativo."

4. **Registrar el año en los módulos de lib:**
   Importar el nuevo JSON en `lib/fees.ts`, `lib/iedmt.ts` e `lib/itp.ts`, y añadirlo al mapa de años correspondiente.

5. **Ejecutar la suite de pruebas:**
   ```bash
   npm test
   ```
   Si algún valor no tiene fuente o falta algún dato, el test fallará automáticamente impidiendo el despliegue de datos desactualizados o no contrastados.

---

## 📄 Estructura del Proyecto

```
calculadora-impuestos/
├── app/
│   ├── globals.css                       # Tokens de color por tema y estilos
│   ├── icon.svg                          # Favicon
│   ├── layout.tsx                        # Layout raíz: fuentes, tema, AdSense y pie
│   ├── not-found.tsx                     # Página 404 personalizada
│   ├── page.tsx                          # Home: calculadoras matriculación e ITP
│   ├── sitemap.ts                        # sitemap.xml con URLs absolutas
│   ├── aviso-legal/page.tsx              # Aviso legal (LSSI art. 10)
│   ├── privacidad/page.tsx               # Política de privacidad (RGPD art. 13)
│   ├── cookies/page.tsx                  # Política de cookies
│   ├── guia/[tema]/page.tsx              # 4 páginas estáticas de guías
│   ├── impuesto-matriculacion/[territorio]/page.tsx  # 3 páginas por territorio
│   └── itp-coche-segunda-mano/[comunidad]/page.tsx   # 19 páginas por CCAA
├── components/
│   ├── AdSenseScript.tsx                 # Script de AdSense y CMP de Google (si está configurado)
│   ├── BrandLogo.tsx                     # Logo Ododex claro/oscuro
│   ├── Breadcrumbs.tsx                   # Migas de pan + Schema.org BreadcrumbList
│   ├── CalculadoraMatriculacion.tsx      # Calculadora interactiva IEDMT
│   ├── CalculadoraTransferencia.tsx      # Calculadora interactiva ITP
│   ├── CommunityLinks.tsx                # Desplegable de páginas por comunidad
│   ├── ConsentSettingsButton.tsx         # Botón "Configurar cookies"
│   ├── Footer.tsx                        # Pie: avisos, enlaces legales y comunidades
│   ├── GuidePanel.tsx                    # Pestaña de guía de tramos y exenciones
│   ├── Header.tsx                        # Cabecera con marca y botón de tema
│   ├── HomeTabs.tsx                      # Pestañas de la home (sincronizadas con el hash)
│   ├── TerritoryLinks.tsx                # Enlaces a las páginas por territorio
│   └── VerificationNotice.tsx            # Aviso de verificación con enlace a norma
├── config/
│   └── titular.example.json              # Plantilla de datos del titular (titular.json no va a git)
├── data/
│   └── 2026/                             # Datos fiscales versionados con fuente
│       ├── depreciacion.json
│       ├── guias.json
│       ├── iedmt.json
│       ├── itp.json
│       └── tasas-dgt.json
├── docs/
│   ├── verificacion-2026-estatal.md      # Verificación de IEDMT, tasas y depreciación
│   └── verificacion-2026-itp.md          # Verificación del ITP por comunidad
├── lib/
│   ├── fees.ts                           # Lógica pura de tasas DGT
│   ├── iedmt.ts                          # Lógica pura de matriculación
│   ├── itp.ts                            # Lógica pura de ITP y depreciación BOE
│   ├── legal.ts                          # Lectura y validación de los datos del titular
│   ├── site.ts                           # Marca, ruta base y URLs absolutas
│   └── verification.ts                   # Textos según el estado de verificación
├── public/brand/                         # Logos y favicon de Ododex
├── tests/                                # Pruebas (ver "Ejecución de Pruebas Automatizadas")
├── next.config.ts                        # Ruta base /es/impuestos
├── postcss.config.mjs                    # Tailwind por PostCSS
├── postcss-tailwind-windows.cjs          # Extracción de clases para Tailwind WASM en Windows
├── ARCHITECTURE.md                       # Diseño y contratos de los módulos
└── README.md
```
