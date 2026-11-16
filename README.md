# AutoTax: Calculadora de Impuestos de Vehículos (2026)

Aplicación web desarrollada con **Next.js (App Router)** para calcular de forma orientativa los tributos exigidos en España al registrar o transferir un vehículo:

1. **Impuesto Especial sobre Determinados Medios de Transporte (IEDMT - Modelo 576 AEAT):** Primera matriculación de vehículos nuevos o de importación según emisiones de $CO_2$ (WLTP), con regímenes diferenciados para Península y Baleares, Canarias (REF) y Ceuta y Melilla (0 %).
2. **Impuesto de Transmisiones Patrimoniales Onerosas (ITP - Modelos 620 y 621):** Compraventa de vehículos usados entre particulares según las normas de las 17 Comunidades Autónomas y de las Ciudades Autónomas de Ceuta y Melilla. Aplica la tabla de depreciación por antigüedad del BOE (Anexo IV) y calcula la base liquidable mínima de Hacienda para evitar liquidaciones complementarias (paralelas).
3. **Tasas de la DGT:** Tarifas actualizadas de Tráfico para cambio de titularidad (Tasa 1.5 de 55,70 € o Tasa 1.2 de 27,85 € para ciclomotores) y matriculación ordinaria (Tasa 1.1 de 99,77 €).

---

## 🚀 Requisitos e Instalación

### Requisitos previos
- Node.js `v20` o superior (probado en Node.js `v22.12.0`).
- npm `v10` o superior.

### Instalación de dependencias
Las versiones exactas configuradas son `next@16.4.6`, `react@19.3.0`, `react-dom@19.3.0` y `tailwindcss@4.3.3`:

```bash
npm install
```

### Ejecución en desarrollo
```bash
npm run dev
```
La aplicación estará disponible en `http://localhost:3000`.

### Compilación y generación estática (SSG)
```bash
npm run build
```
Genera de forma estática (SSG) todas las 27 páginas indexables del portal.

---

## ⚙️ Variables de Entorno

Configura el archivo `.env.local` tomando como base `.env.example`:

```bash
cp .env.example .env.local
```

| Variable | Descripción | Valor por defecto |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_SITE_URL` | URL base absoluta del sitio para canonical, sitemap.xml, robots.txt y Open Graph | `http://localhost:3000` |

Ejemplo en producción:
```env
NEXT_PUBLIC_SITE_URL=https://calculadoraimpuestosvehiculos.es
```

---

## 🧪 Ejecución de Pruebas Automatizadas

El proyecto cuenta con una suite completa de pruebas unitarias y de integridad fiscal **sin dependencias de red**:

```bash
npm test
```

### Qué verifican las pruebas:
1. **Integridad de Fuentes y Datos (`tests/data-sources.test.ts`):** Falla si falta algún archivo fiscal del año en curso, si falta la URL de la fuente en algún dato, si no se especifica la norma legal, si el estado de verificación no es válido o si un dato verificado no lleva fecha ISO (los pendientes deben llevar `null`). `tests/verification.test.ts` cubre el texto "Verificado el {fecha}".
2. **Impuesto de Matriculación (`tests/iedmt.test.ts`):** Comprueba cada tramo de $CO_2$ en Península (0 %, 4,75 %, 9,75 %, 14,75 %), Canarias (0 %, 3,75 %, 8,75 %, 13,75 %), Ceuta y Melilla (0 %), bonificación del 50 % por Familia Numerosa, exención por Minusvalía y exención para vehículos comerciales.
3. **ITP y Depreciación BOE (`tests/itp.test.ts`):** Comprueba el ITP de las 17 comunidades autónomas y de Ceuta y Melilla con al menos un caso real, las fronteras exactas de los 13 tramos de depreciación del Anexo IV del BOE, compraventa profesional (no sujeta a ITP), ciclomotores exentos, vehículos históricos, exención de coches de más de 10 años en Cataluña y Navarra, y bonificación etiqueta CERO emisiones.
4. **Rutas Estáticas y SEO (`tests/routes-and-sitemap.test.ts`):** Valida todos los slugs de comunidades, territorios y guías, respuesta 404 para slugs inválidos, y la generación íntegra del sitemap (27 páginas canónicas) y robots.txt.

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
│   ├── globals.css                       # Variables CSS negro/naranja, estilos y print
│   ├── layout.tsx                        # Layout raíz con fuentes y tema oscuro/claro
│   ├── not-found.tsx                     # Página 404 personalizada
│   ├── page.tsx                          # Home: calculadoras matriculación e ITP
│   ├── robots.ts                         # Generación dinámica de robots.txt
│   ├── sitemap.ts                        # Generación dinámica de sitemap.xml
│   ├── guia/[tema]/page.tsx              # 4 páginas estáticas de guías
│   ├── impuesto-matriculacion/[territorio]/page.tsx  # 3 páginas por territorio
│   └── itp-coche-segunda-mano/[comunidad]/page.tsx   # 19 páginas por CCAA
├── components/
│   ├── Breadcrumbs.tsx                   # Migas de pan + Schema.org BreadcrumbList
│   ├── CalculadoraMatriculacion.tsx      # Calculadora interactiva IEDMT
│   ├── CalculadoraTransferencia.tsx      # Calculadora interactiva ITP
│   ├── Footer.tsx                        # Pie de página y enlaces institucionales
│   ├── Header.tsx                        # Cabecera con botón Modo Oscuro/Claro
│   ├── HomeTabs.tsx                      # Pestañas de navegación de la home
│   └── VerificationNotice.tsx            # Aviso de verificación con enlace a norma
├── data/
│   └── 2026/                             # Datos fiscales versionados con fuente
│       ├── depreciacion.json
│       ├── guias.json
│       ├── iedmt.json
│       ├── itp.json
│       └── tasas-dgt.json
├── lib/
│   ├── fees.ts                           # Lógica pura de tasas DGT
│   ├── iedmt.ts                          # Lógica pura de matriculación
│   ├── itp.ts                            # Lógica pura de ITP y depreciación BOE
│   └── site.ts                           # Helper de URLs canónicas absolutas
├── tests/
│   ├── data-sources.test.ts              # Prueba de fuentes e integridad de datos
│   ├── iedmt.test.ts                     # Pruebas de tramos y bonificaciones IEDMT
│   ├── itp.test.ts                       # Pruebas de comunidades y fronteras BOE
│   └── routes-and-sitemap.test.ts        # Pruebas de slugs, 404 y sitemap
└── README.md
```
