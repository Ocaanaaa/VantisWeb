/**
 * Punto de entrada en Vercel.
 *
 * `vite build` emite dist/server/server.js, que exporta un handler `fetch`
 * estandar (Request -> Response). Vercel no despliega ese handler por si solo:
 * esta funcion es el puente. vercel.json reescribe hacia aqui todo lo que no
 * sea un archivo estatico de dist/client, e `includeFiles` garantiza que el
 * bundle del servidor viaje dentro de la funcion.
 */
import server from "../dist/server/server.js";

export default function handler(request) {
  return server.fetch(request);
}
