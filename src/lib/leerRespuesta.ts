/**
 * Lee la respuesta de la API sin atragantarse.
 *
 * Si algo devuelve HTML en vez de JSON -- una página de error del framework,
 * una pantalla de acceso de Vercel, un proxy por medio -- `res.json()` suelta
 * «Unexpected token '<', "<!doctype "... is not valid JSON», que no dice nada
 * de lo que ha pasado de verdad. Aquí se detecta y se devuelve un mensaje que
 * al menos apunta a dónde mirar.
 */
// El tipo por defecto deja el acceso a propiedades tan suelto como lo tenía
// `res.json()`: esto añade la red de seguridad, no cambia cómo se usa.
type Datos = Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any

export async function leerRespuesta<T extends Datos = Datos>(res: Response): Promise<T> {
  const texto = await res.text();

  try {
    return JSON.parse(texto) as T;
  } catch {
    const pareceHtml = texto.trimStart().startsWith("<");
    if (!pareceHtml) {
      return { error: `Respuesta ilegible (${res.status}): ${texto.slice(0, 200)}` } as unknown as T;
    }
    return {
      error:
        res.status >= 400
          ? `El servidor ha devuelto un error ${res.status} sin detalle. Mira /api/estado o los registros de Vercel.`
          : `El servidor ha devuelto una página en vez de datos (${res.status}). ` +
            "Suele ser que la ruta no existe en el despliegue actual.",
    } as unknown as T;
  }
}
