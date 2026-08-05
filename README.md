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

### El `vercel.json`

Lleva una sola línea: `installCommand: npm install --include=dev`.

Está ahí porque si alguien define una variable de entorno `NODE_ENV` con valor
`production`, npm se salta las devDependencies al instalar — y Vite, el plugin
de React y TypeScript están ahí. La instalación termina bien y el build muere
en el primer segundo con `Cannot find package '@vitejs/plugin-react'`. Con
`--include=dev` da igual lo que valga `NODE_ENV`.

**No pongas `framework: null` en ese archivo**: desactiva la detección y deja
el SSR sin ruta. Fue lo que rompió un intento anterior. Con solo
`installCommand`, la detección sigue funcionando.

Y **no apuntes el Root Directory a una subcarpeta** que no existe: el build
muere en un segundo con `The specified Root Directory does not exist`.

> Si el despliegue falla, lo primero que hay que mirar es
> **Settings → Environment Variables**: un `NODE_ENV` puesto a mano no debe
> estar ahí. Lo segundo, **Redeploy desmarcando «Use existing Build Cache»**.

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

### La traducción

Los anuncios llegan en alemán o en inglés, así que la ficha y el equipamiento
se traducen solos al pegar el texto: `Sitzheizung vorn` → «Calefacción de
asientos delanteros», `Leder, Schwarz` → «Cuero, Negro», `Kombi` → «Familiar».

Es un **glosario** (`src/lib/traducir.ts`), no un traductor automático. El
vocabulario de un anuncio de coche es cerrado —mobile.de y AutoScout24 usan
listas de casillas fijas—, así que un glosario lo cubre casi entero, no cuesta
nada por uso y siempre da la misma traducción. Un modelo de lenguaje traduciría
«Standheizung» de cinco formas distintas y algún día suavizaría un
«Unfallfahrzeug».

Lo que el glosario no conoce **se queda en su idioma y el panel lo lista** para
que lo corrijas antes de publicar. Suelen ser nombres de paquetes de fábrica
(«M Drive Professional»), que tampoco tienen traducción. Para ampliarlo, añade
entradas a `GLOSARIO` o `VALORES` en `src/lib/traducir.ts`; la clave va en
minúsculas, sin diéresis y sin puntuación.

### Lo que la herramienta no hace

No entra en mobile.de ni en AutoScout24: el texto del anuncio lo pegas tú.
Y **no copia las fotos del anuncio** — son del vendedor. Las fichas sin foto
propia muestran un marcador.

## Estructura

```
src/site/        Las secciones de la página, una por archivo
src/routes/      Home, ficha de unidad, paneles internos, API, robots y sitemap
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

## Encargos del formulario

El formulario envía a `/api/solicitudes`, que guarda el encargo en Postgres y
avisa por correo. Se leen en **`/interno/solicitudes`** con el mismo
`ADMIN_TOKEN`: se filtran por estado, se marcan como atendidas o descartadas y
admiten notas internas. No se borran — son el registro de con quién has
hablado.

Cada encargo recibe una referencia (`VNT-26-0001`) que se le enseña al cliente
en pantalla. Si llega desde la ficha de una unidad o desde el botón
«Contactar» de una tarjeta, el encargo guarda **de qué unidad venía**.

### Aviso por correo

Opcional. Con estas variables, cada encargo llega también al buzón:

| Variable | Para qué |
|---|---|
| `RESEND_API_KEY` | La clave de [Resend](https://resend.com) |
| `NOTIFY_EMAIL` | A dónde se avisa. Admite varios separados por coma |
| `NOTIFY_FROM` | Remitente. Por defecto `onboarding@resend.dev`, que solo entrega al dueño de la cuenta hasta que verifiques un dominio |

**El correo es un aviso, no el registro.** El encargo se guarda antes de
intentar enviarlo, y si el correo falla no se pierde nada: sigue en
`/interno/solicitudes`. Sin estas variables no se avisa y hay que entrar a
mirar.

### Sin base de datos

El endpoint responde 503 y el formulario enseña el mensaje con la salida por
WhatsApp. **Antes daba una confirmación falsa** —«Encargo enviado», con
referencia y todo— sin mandar nada a ningún sitio. Eso ya no pasa: si no se
puede registrar, se dice.

### Contra el spam

Tres frenos, porque el endpoint es público: tope de longitud por campo, un
campo trampa que los robots rellenan y las personas no ven, y un límite de 5
encargos por IP y hora contado en la base de datos (en memoria no serviría,
cada petición puede caer en una instancia distinta de la función).
