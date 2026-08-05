import { randomBytes } from "node:crypto";

/**
 * Dónde acaban las fotos que se suben desde el panel.
 *
 * Dos destinos, y el que se use depende de qué variables haya puestas:
 *
 * - **Vercel Blob** si hay almacén vinculado. Es lo que va a haber en
 *   producción: el sistema de archivos de una función es efímero y de solo
 *   lectura, así que escribir en disco allí no serviría de nada.
 * - **Disco** si existe MEDIA_DIR. Solo para desarrollo y para las pruebas de
 *   extremo a extremo, que así ejercitan el mismo camino que producción en vez
 *   de dar la subida por supuesta.
 *
 * Sin ninguna de las dos, la subida devuelve 503 y lo dice. No hay un tercer
 * modo que finja haber guardado algo.
 */

export type Destino = "blob" | "disco" | null;

const TOKEN_BLOB = process.env.BLOB_READ_WRITE_TOKEN ?? "";
const ID_BLOB = process.env.BLOB_STORE_ID ?? "";
const DIR = process.env.MEDIA_DIR ?? "";

/**
 * Se intenta Blob si hay token **o** si al menos hay un almacén vinculado.
 *
 * Vercel inyecta BLOB_STORE_ID al vincular el almacén, pero el token de
 * escritura hay que crearlo aparte, y es fácil quedarse a medias. Con solo el
 * identificador, antes salía un 503 de «no hay almacenamiento», que es
 * engañoso cuando el almacén sí existe. Ahora el error dice exactamente qué
 * falta y dónde se saca.
 */
export const destino: Destino = TOKEN_BLOB || ID_BLOB ? "blob" : DIR ? "disco" : null;

/** Para que el panel pueda decir qué falta sin enseñar ningún valor. */
export const diagnostico = {
  tieneTokenBlob: Boolean(TOKEN_BLOB),
  tieneIdBlob: Boolean(ID_BLOB),
  tieneDirectorio: Boolean(DIR),
};

/** Lo que el navegador puede convertir y lo que el sitio sabe servir. */
const TIPOS: Record<string, string> = {
  "image/webp": "webp",
  "image/jpeg": "jpg",
  "image/png": "png",
};

export const TIPOS_ACEPTADOS = Object.keys(TIPOS);

/** 12 MB. Una foto ya convertida a WebP pesa muy por debajo; esto es el tope duro. */
export const TAMANO_MAXIMO = 12 * 1024 * 1024;

/**
 * Nombre de archivo a partir de la referencia de la unidad.
 *
 * Lleva sufijo aleatorio a propósito: si republicas la misma unidad con otra
 * foto, la anterior no se queda cacheada en su sitio.
 */
function nombrarArchivo(referencia: string, tipo: string): string {
  const base = referencia
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "unidad";
  return `${base}-${randomBytes(4).toString("hex")}.${TIPOS[tipo]}`;
}

/**
 * Sube a Vercel Blob por HTTP, sin el SDK `@vercel/blob`.
 *
 * El SDK no se puede usar aquí: al importarlo intenta leer la configuración
 * local del CLI de Vercel para buscar un token, y esa cadena de dependencias
 * (`xdg-app-paths`) usa `require`, que no existe dentro del bundle ESM de la
 * función. Revienta al cargarlo, con token o sin él. Verificado contra el
 * simulador antes de escribir esto.
 *
 * Así que se llama a la misma API a la que llamaría el SDK, con `fetch` y
 * nada más -- igual que el aviso por correo, y por el mismo motivo.
 */
const API_BLOB = process.env.VERCEL_BLOB_API_URL ?? "https://vercel.com/api/blob";
const VERSION_API_BLOB = "12";

/** El identificador del almacén va dentro del token: vercel_blob_rw_<id>_<...> */
function idDelAlmacen(token: string): string {
  return token.split("_")[3] ?? "";
}

async function subirABlob(nombre: string, datos: ArrayBuffer, tipo: string): Promise<string> {
  if (!TOKEN_BLOB) {
    throw new Error(
      "El almacén de fotos está vinculado pero falta su token de escritura. " +
        "En Vercel: Storage → tu Blob Store → Tokens, crea uno de lectura y " +
        "escritura, y añádelo como BLOB_READ_WRITE_TOKEN en las variables de " +
        "entorno. Después hay que redesplegar.",
    );
  }

  const ruta = `unidades/${nombre}`;
  const res = await fetch(`${API_BLOB}/?pathname=${encodeURIComponent(ruta)}`, {
    method: "PUT",
    headers: {
      authorization: `Bearer ${TOKEN_BLOB}`,
      "x-api-version": VERSION_API_BLOB,
      "x-vercel-blob-store-id": ID_BLOB || idDelAlmacen(TOKEN_BLOB),
      "x-vercel-blob-access": "public",
      "x-content-type": tipo,
      // El nombre ya lleva su propio sufijo aleatorio.
      "x-add-random-suffix": "0",
    },
    body: Buffer.from(datos),
  });

  if (!res.ok) {
    const detalle = await res.text().catch(() => "");
    throw new Error(
      `Vercel Blob ha respondido ${res.status}. ${
        res.status === 403
          ? "El token de BLOB_READ_WRITE_TOKEN no vale para este almacén."
          : detalle.slice(0, 300)
      }`,
    );
  }

  const cuerpo = (await res.json()) as { url?: string };
  if (!cuerpo.url) throw new Error("Vercel Blob no ha devuelto la URL de la foto.");
  return cuerpo.url;
}

export async function guardarFoto(
  datos: ArrayBuffer,
  tipo: string,
  referencia: string,
): Promise<string> {
  if (!TIPOS[tipo]) throw new Error(`Tipo de imagen no admitido: ${tipo}`);
  if (datos.byteLength > TAMANO_MAXIMO) {
    throw new Error(`La imagen pesa ${(datos.byteLength / 1048576).toFixed(1)} MB; el máximo son 12 MB.`);
  }

  const nombre = nombrarArchivo(referencia, tipo);

  if (destino === "blob") return subirABlob(nombre, datos, tipo);

  if (destino === "disco") {
    const { mkdir, writeFile } = await import("node:fs/promises");
    const { join } = await import("node:path");
    await mkdir(DIR, { recursive: true });
    await writeFile(join(DIR, nombre), Buffer.from(datos));
    // MEDIA_DIR apunta a la carpeta que se sirve como /media/subidas.
    return `/media/subidas/${nombre}`;
  }

  throw new Error(
    "No hay almacenamiento de fotos configurado. En Vercel: Storage → Create → Blob, " +
      "y vincúlalo al proyecto para que inyecte BLOB_READ_WRITE_TOKEN.",
  );
}
