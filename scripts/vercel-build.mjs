/**
 * Genera .vercel/output a partir de lo que emite `vite build`.
 *
 * POR QUE HACE FALTA
 * ------------------
 * `vite build` deja dos cosas: dist/client (estaticos) y dist/server/server.js
 * (un handler `fetch` estandar). Entre ellas NO hay index.html, porque la pagina
 * la renderiza el servidor en cada peticion.
 *
 * Si Vercel trata el proyecto como un sitio estatico -- que es lo que hace si no
 * reconoce el framework -- sirve dist/client tal cual, no encuentra index.html y
 * devuelve 404 en la raiz. Es exactamente el error que daba.
 *
 * Este script escribe la salida en el formato de la Build Output API, que Vercel
 * respeta siempre que exista, sin depender de que adivine nada:
 *
 *   .vercel/output/config.json              enrutado
 *   .vercel/output/static/                  dist/client
 *   .vercel/output/functions/index.func/    el servidor, como funcion Node
 *
 * El enrutado resuelve primero por sistema de archivos (asi /media/*.webp y
 * /assets/*.js se sirven como estaticos, sin pasar por la funcion) y todo lo
 * demas cae en la funcion.
 */
import { cp, mkdir, rm, writeFile } from "node:fs/promises";

const OUT = ".vercel/output";
const FUNC = `${OUT}/functions/index.func`;

/**
 * Lanzador de la funcion.
 *
 * Se escribe con la firma clasica de Node (req, res) a proposito: la firma web
 * (Request -> Response) depende de que el lanzador de Vercel la detecte, y si
 * se equivoca el fallo aparece solo en produccion. Convertir a mano es mas
 * codigo pero no deja nada a la deteccion.
 */
const LAUNCHER = `import server from "./server/server.js";

export default async function handler(req, res) {
  const host = req.headers["x-forwarded-host"] ?? req.headers.host ?? "localhost";
  const proto = req.headers["x-forwarded-proto"] ?? "https";

  // Las cabeceras de Node pueden traer arrays (set-cookie); Request no los acepta.
  const headers = new Headers();
  for (const [key, value] of Object.entries(req.headers)) {
    if (value === undefined) continue;
    for (const v of Array.isArray(value) ? value : [value]) headers.append(key, v);
  }

  const init = { method: req.method ?? "GET", headers };
  if (init.method !== "GET" && init.method !== "HEAD") {
    init.body = req;
    init.duplex = "half";
  }

  let response;
  try {
    response = await server.fetch(new Request(proto + "://" + host + req.url, init));
  } catch (error) {
    console.error(error);
    res.statusCode = 500;
    res.setHeader("content-type", "text/plain; charset=utf-8");
    return res.end("Error del servidor");
  }

  res.statusCode = response.status;
  for (const [key, value] of response.headers) res.setHeader(key, value);
  if (!response.body) return res.end();

  const reader = response.body.getReader();
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    res.write(value);
  }
  res.end();
}
`;

await rm(OUT, { recursive: true, force: true });
await mkdir(FUNC, { recursive: true });

await cp("dist/client", `${OUT}/static`, { recursive: true });
await cp("dist/server", `${FUNC}/server`, { recursive: true });
await writeFile(`${FUNC}/index.mjs`, LAUNCHER);

await writeFile(
  `${FUNC}/.vc-config.json`,
  JSON.stringify(
    {
      runtime: "nodejs22.x",
      handler: "index.mjs",
      launcherType: "Nodejs",
      shouldAddHelpers: false,
      supportsResponseStreaming: true,
    },
    null,
    2,
  ),
);

await writeFile(
  `${OUT}/config.json`,
  JSON.stringify(
    {
      version: 3,
      routes: [
        // Estaticos primero: /assets/*, /media/*, /favicon.svg.
        { handle: "filesystem" },
        // El resto lo renderiza el servidor.
        { src: "/(.*)", dest: "/index" },
      ],
    },
    null,
    2,
  ),
);

console.log("[vercel-build] .vercel/output listo");
