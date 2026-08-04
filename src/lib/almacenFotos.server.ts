import { randomBytes } from "node:crypto";

/**
 * Dónde acaban las fotos que se suben desde el panel.
 *
 * Dos destinos, y el que se use depende de qué variables haya puestas:
 *
 * - **Vercel Blob** si existe BLOB_READ_WRITE_TOKEN. Es lo que va a haber en
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
const DIR = process.env.MEDIA_DIR ?? "";

export const destino: Destino = TOKEN_BLOB ? "blob" : DIR ? "disco" : null;

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

  if (destino === "blob") {
    const { put } = await import("@vercel/blob");
    const { url } = await put(`unidades/${nombre}`, Buffer.from(datos), {
      access: "public",
      contentType: tipo,
      addRandomSuffix: false,
      token: TOKEN_BLOB,
    });
    return url;
  }

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
