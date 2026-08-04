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

### Cómo se despliega

`npm run build` hace dos cosas: `vite build` y luego
`scripts/vercel-build.mjs`, que escribe `.vercel/output` en el formato de la
[Build Output API](https://vercel.com/docs/build-output-api/v3). Vercel usa esa
carpeta siempre que exista, así que **el despliegue no depende de que reconozca
el framework**.

Esto no es opcional: entre `dist/client` y `dist/server` no hay `index.html`,
porque la página se renderiza en cada petición. Si Vercel trata el proyecto como
un sitio estático, sirve `dist/client`, no encuentra `index.html` y devuelve
**404 en la raíz**. Es lo que pasaba antes de añadir ese paso.

Dos cosas que rompieron intentos anteriores y conviene no repetir:

- **No añadas un `vercel.json`** con `framework: null`: desactiva la detección
  y deja el SSR sin ruta.
- **Root Directory apuntando a una subcarpeta** que no existe: el build muere
  en un segundo con `The specified Root Directory does not exist`.

Después de importar, cada push a `main` redespliega solo.

## Publicar unidades

Las unidades se sirven desde Postgres si hay `POSTGRES_URL`; si no, desde
`src/content/copy.es.ts` en solo lectura. Ese respaldo permite que la web
funcione antes de montar nada.

**Para activar la publicación desde el panel:**

1. En Vercel: **Storage → Create Database → Postgres**. Al vincularla al
   proyecto, Vercel inyecta `POSTGRES_URL` solo.
2. También en **Storage → Create → Blob**, para las fotos. Al vincularlo
   inyecta `BLOB_READ_WRITE_TOKEN` solo.
3. En **Settings → Environment Variables**, añade `ADMIN_TOKEN` con una
   contraseña larga que te inventes.
4. Redespliega.

La tabla se crea sola en la primera consulta.

Después, en `/interno/publicar`: pegas el enlace y el texto del anuncio,
se rellena la ficha, subes las fotos, la revisas y publicas. Las unidades
guardadas como borrador no salen en la web.

### Las fotos

Se eligen desde el panel y **se convierten a WebP en el navegador** antes de
subirse: lado mayor a 2048 px y calidad 0,8. Una foto de móvil de 8 MB acaba
en unos cientos de KB, así que subir desde el coche con datos móviles no es un
problema. Es el mismo tratamiento que tienen las imágenes de `public/media`.

La primera foto de la lista es la principal —la que sale en la home y en las
tarjetas de compartir—; el resto forman la galería de la ficha. Se puede
reordenar y quitar antes de publicar. Sin ninguna foto, la ficha muestra el
marcador de foto pendiente.

En local, define `MEDIA_DIR=public/media/subidas` y las fotos van a disco en
vez de a Blob. Esa carpeta está en `.gitignore`.

> **Estas rutas internas no tienen usuarios ni sesiones.** `ADMIN_TOKEN` es un
> secreto compartido que impide escrituras de fuera, y `/interno/*` es
> `noindex` pero accesible para quien adivine la URL. Antes de manejar
> operaciones reales hay que poner autenticación de verdad.

### Lo que la herramienta no hace

No entra en mobile.de ni en AutoScout24: el texto del anuncio lo pegas tú.
Y **no copia las fotos del anuncio** — son del vendedor. Las fichas sin foto
propia muestran un marcador.

## Estructura

```
src/site/        Las secciones de la página, una por archivo
src/routes/      Home, ficha de unidad, panel interno, API, robots y sitemap
src/content/     TODO el texto (copy.es.ts) y el manifiesto de assets
src/lib/         Capa de datos, analizador de anuncios y utilidades
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
