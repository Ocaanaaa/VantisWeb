# Vantis Motors

Web de Vantis Motors. React 19 + TanStack Start con renderizado en servidor,
Tailwind v4 y GSAP. Sin dependencias de servicios externos: las imágenes y el
vídeo se sirven desde `public/media`.

## Desarrollo

Requiere **Node 22 o superior** (está fijado en `.nvmrc` y en `engines`).

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # dist/client + dist/server
npm run typecheck
```

## Despliegue en Vercel

Importa el repositorio en Vercel y despliega. `vercel.json` ya lleva la
configuración:

- `npm run build` genera `dist/client` (estáticos) y `dist/server/server.js`
  (un handler `fetch` estándar).
- `api/index.mjs` es el puente: Vercel no despliega ese handler por sí solo.
- Los `rewrites` mandan a la función todo lo que no sea un archivo estático,
  que Vercel resuelve antes por sistema de archivos.

No hace falta ninguna variable de entorno para que la web funcione.

## Estructura

```
src/site/        Las secciones de la página, una por archivo
src/content/     TODO el texto (copy.es.ts) y el manifiesto de assets
src/routes/      Raíz del documento, home, robots.txt y sitemap.xml
src/styles.css   Paleta y tipografía (tokens de Tailwind v4)
public/media/    Imágenes en WebP y el vídeo
```

**Todo el texto vive en `src/content/copy.es.ts`.** Ningún componente lleva
texto propio, así que para cambiar la web no hace falta tocar componentes.

## Pendiente

- `src/content/copy.es.ts` → `team.members`: nombres, cargos y bios reales.
- `src/content/copy.es.ts` → `available.items`: las unidades son de ejemplo.
- `deliveries.body` afirma «Datos reales, sin retoque» sobre fotos generadas.
- `costs.rows`: el arancel figura al 6,5%; para turismos importados a la UE
  suele ser el 10%. Confirmar con la gestoría.

## Formulario

`src/lib/submitOrder.ts` es el único punto de salida. Sin la variable
`VITE_ORDER_ENDPOINT` configurada no envía a ningún sitio: da el envío por
bueno en el navegador y muestra la confirmación. Para recibir los encargos de
verdad, define esa variable en Vercel apuntando a un endpoint que acepte POST
con JSON.
