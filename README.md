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

## Si algo no va: `/interno/estado`

Abre esa página, pega el `ADMIN_TOKEN` y dale a Comprobar. Lo mismo desde la
terminal:

```bash
curl https://tu-dominio/api/estado -H "x-vantis-token: TU_ADMIN_TOKEN"
```

Dice qué variables están puestas, a qué servidor apunta `POSTGRES_URL` y qué
responde Postgres en cada paso, **con el mensaje de error tal cual**. No
devuelve ningún valor secreto: de las variables solo si existen, y de la
conexión solo servidor y puerto.

Existe porque desde fuera un fallo de base de datos y uno de configuración se
parecen demasiado, y los registros de Vercel no siempre están a mano.

> **Si la web se ve pero sin los últimos cambios**, mira en Vercel →
> Deployments si hay un *rollback* activo: la insignia `Production` en azul con
> una flecha circular sobre un despliegue viejo. Con eso puesto, cada push se
> construye pero no se promociona. Se suelta con **Promote to Production** en
> el despliegue más reciente.

## Publicar unidades

Las unidades se sirven desde Postgres si hay `POSTGRES_URL`; si no, desde
`src/content/copy.es.ts` en solo lectura. Ese respaldo permite que la web
funcione antes de montar nada.

**Para activar la publicación desde el panel:**

1. En Vercel: **Storage → Create Database**. Vercel ya no tiene un Postgres
   propio; ofrece los del marketplace. **Supabase o Neon valen igual**: lo
   único que importa es que al vincular la base al proyecto inyecte
   `POSTGRES_URL`. Compruébalo en Environment Variables.
2. También en **Storage → Create → Blob**, para las fotos. Vincularlo inyecta
   `BLOB_STORE_ID`, pero **no siempre el token de escritura**: comprueba que
   existe `BLOB_READ_WRITE_TOKEN` y, si no, créalo en el propio almacén
   (pestaña de tokens, uno de lectura y escritura) y añádelo a mano. Sin él la
   subida de fotos no funciona y el panel lo dice.
3. En **Settings → Environment Variables**, añade `ADMIN_TOKEN` con una
   contraseña larga que te inventes.
4. Redespliega. Las variables solo entran en despliegues nuevos.

Las tablas se crean solas en la primera consulta.

> El proveedor da igual mientras hable Postgres. La conexión está en
> `src/lib/postgres.server.ts`, en un solo sitio, y va cifrada con todo lo que
> no sea `localhost` o un socket Unix.
>
> Ahí se le quita el `sslmode` a la cadena de conexión antes de usarla. No es
> capricho: `pg` mezcla lo que trae la cadena **encima** de las opciones que se
> le pasan, así que el `?sslmode=require` con el que viene la de Supabase pisa
> la configuración de TLS y la conexión muere con «self-signed certificate in
> certificate chain».
>
> La conexión va cifrada pero **no se verifica el certificado del servidor**:
> los Postgres gestionados usan cadenas firmadas por su propia CA, que no está
> en el almacén de la función. Para verificarlo de verdad habría que traerse el
> certificado raíz del proveedor y pasarlo como `ca`.

Después, en `/interno/publicar`: pegas el enlace y el texto del anuncio,
se rellena la ficha, subes las fotos, la revisas y publicas. Las unidades
guardadas como borrador no salen en la web.

### El texto del anuncio

En el panel, **Redactar anuncio** escribe la descripción con la ficha que hay
en el formulario: titular, ficha técnica, equipamiento destacado, qué incluye
el precio, financiación, quiénes somos y contacto. Sale en texto plano con las
secciones en mayúsculas, que es lo único que respetan todos los portales, y el
botón **Copiar** lo deja listo para pegar en coches.net o Wallapop.

Es una plantilla, no un modelo de lenguaje. Un texto comercial generado diría
«impecable» de un coche que no ha visto nadie, y en un anuncio de venta eso no
es una floritura: es una afirmación sobre el estado de la unidad.

La prosa fija está en `copy.es.ts` → `anuncio`, para cambiarla sin tocar
código. Los huecos `{modelo}`, `{mercado}`, `{referencia}`… se rellenan con la
ficha. **Escribe cada hueco en su propia frase**: si el dato falta, se cae esa
frase entera en vez de dejar un «La traemos de , se inspecciona».

Del equipamiento se eligen doce: primero lo que vende (techo, cuero, head-up,
faros, asientos, navegación, sonido…) y fuera lo que lleva cualquier coche
desde hace veinte años.

> **La financiación no lleva cifras a propósito.** En cuanto un anuncio
> menciona un tipo, una cuota o cualquier importe del coste del crédito, la
> Ley 16/2011 obliga a incluir la TAE y un ejemplo representativo. Si quieres
> anunciar condiciones concretas, pídeselas a la financiera y añádelas con su
> TAE en `copy.es.ts`.

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

> **No uses el SDK `@vercel/blob` aquí.** Al importarlo busca un token en la
> configuración local del CLI de Vercel, y esa cadena de dependencias
> (`xdg-app-paths`) usa `require`, que no existe dentro del bundle ESM de la
> función: revienta al cargarse, con token o sin él. La subida llama a la
> misma API por HTTP, que son treinta líneas y ninguna dependencia.

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
