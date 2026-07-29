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

**Add New → Project → Import este repositorio → Deploy.** No cambies nada en
la pantalla de importación:

| Ajuste | Valor |
|---|---|
| Framework Preset | el que detecte solo (TanStack Start) |
| Root Directory | **vacío** — el proyecto está en la raíz del repo |
| Build Command | por defecto (`npm run build`) |
| Output Directory | por defecto |
| Install Command | por defecto (`npm install`) |
| Variables de entorno | ninguna |

Vercel reconoce TanStack Start y se encarga del renderizado en servidor por su
cuenta. **No añadas un `vercel.json`**: declarar `framework: null` desactiva esa
detección y rompe el SSR — pasó, y costó un rato encontrarlo.

Con **Root Directory** ocurre lo mismo al revés: si apunta a una subcarpeta que
no existe, el build muere en un segundo con
`The specified Root Directory does not exist`.

Después de importar, cada push a `main` redespliega solo.

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
