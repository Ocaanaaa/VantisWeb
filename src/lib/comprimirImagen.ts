/**
 * Convierte una foto a WebP en el navegador antes de subirla.
 *
 * Se hace en el cliente a propósito: evita meter `sharp` (un binario nativo de
 * decenas de MB) en una función de Vercel, y sobre todo evita subir 8 MB por
 * foto desde el móvil para tirar el 90% en el servidor.
 *
 * Los WebP que ya hay en public/media salieron del mismo tratamiento: lado
 * mayor a 2048 px y calidad 0.8. Una foto de cámara de 8 MB queda en torno a
 * 300 KB sin diferencia visible en pantalla.
 *
 * Si el navegador no sabe escribir WebP, devuelve el archivo original: subir
 * una foto grande es mejor que no poder subirla.
 */

const LADO_MAXIMO = 2048;
const CALIDAD = 0.8;

export type FotoLista = { archivo: File; vistaPrevia: string; original: number };

function cargar(archivo: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(archivo);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error(`No se ha podido leer «${archivo.name}». ¿Es una imagen?`));
    };
    img.src = url;
  });
}

export async function comprimirImagen(archivo: File): Promise<FotoLista> {
  const original = archivo.size;
  const img = await cargar(archivo);

  const escala = Math.min(1, LADO_MAXIMO / Math.max(img.naturalWidth, img.naturalHeight));
  const ancho = Math.round(img.naturalWidth * escala);
  const alto = Math.round(img.naturalHeight * escala);

  const lienzo = document.createElement("canvas");
  lienzo.width = ancho;
  lienzo.height = alto;
  const ctx = lienzo.getContext("2d");
  if (!ctx) return { archivo, vistaPrevia: URL.createObjectURL(archivo), original };
  ctx.drawImage(img, 0, 0, ancho, alto);

  const blob = await new Promise<Blob | null>((r) => lienzo.toBlob(r, "image/webp", CALIDAD));
  // toBlob devuelve null, o un PNG disfrazado, si no hay codificador WebP.
  if (!blob || blob.type !== "image/webp") {
    return { archivo, vistaPrevia: URL.createObjectURL(archivo), original };
  }

  const nombre = archivo.name.replace(/\.[^.]+$/, "") + ".webp";
  const convertido = new File([blob], nombre, { type: "image/webp" });
  return { archivo: convertido, vistaPrevia: URL.createObjectURL(convertido), original };
}
