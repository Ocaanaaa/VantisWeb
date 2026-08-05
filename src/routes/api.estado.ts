import { createFileRoute } from "@tanstack/react-router";

/**
 * Diagnóstico de la instalación. Protegido con el token interno.
 *
 * Existe porque desde fuera un fallo de base de datos y uno de configuración
 * se parecen demasiado: la web devuelve un error igual de mudo en los dos
 * casos, y los registros de Vercel no siempre están a mano. Esto dice qué hay
 * puesto y qué responde Postgres, con el mensaje de error tal cual.
 *
 * **No devuelve ningún valor secreto**: de las variables solo dice si existen,
 * y de la cadena de conexión solo el servidor y el puerto, nunca el usuario ni
 * la contraseña.
 */
function json(datos: unknown, status = 200): Response {
  return new Response(JSON.stringify(datos, null, 2), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" },
  });
}

/** Servidor y puerto, sin credenciales, para saber si es el pooler o directo. */
function servidorDe(cadena: string): string {
  if (!cadena) return "";
  try {
    const u = new URL(cadena);
    // Los parámetros mandan sobre la parte de la URL: así se ve el socket y el
    // puerto de verdad, no el que se deduce de la forma de la cadena.
    const servidor = u.searchParams.get("host") ?? u.hostname;
    const puerto = u.searchParams.get("port") ?? u.port ?? "5432";
    return `${servidor}:${puerto || "5432"}${u.pathname}`;
  } catch {
    return "(no se ha podido leer)";
  }
}

export const Route = createFileRoute("/api/estado")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const esperado = process.env.ADMIN_TOKEN;
        if (!esperado || request.headers.get("x-vantis-token") !== esperado) {
          return json({ error: "No autorizado" }, 401);
        }

        const cadena = process.env.POSTGRES_URL ?? process.env.DATABASE_URL ?? "";
        const variables = {
          POSTGRES_URL: Boolean(process.env.POSTGRES_URL),
          DATABASE_URL: Boolean(process.env.DATABASE_URL),
          ADMIN_TOKEN: true,
          BLOB_READ_WRITE_TOKEN: Boolean(process.env.BLOB_READ_WRITE_TOKEN),
          BLOB_STORE_ID: Boolean(process.env.BLOB_STORE_ID),
          RESEND_API_KEY: Boolean(process.env.RESEND_API_KEY),
          NOTIFY_EMAIL: Boolean(process.env.NOTIFY_EMAIL),
        };

        const pasos: Array<{ paso: string; ok: boolean; detalle?: string; codigo?: string }> = [];

        async function probar(paso: string, fn: () => Promise<string | void>) {
          const t0 = Date.now();
          try {
            const detalle = await fn();
            pasos.push({ paso, ok: true, detalle: `${detalle ?? "bien"} · ${Date.now() - t0} ms` });
          } catch (e) {
            const err = e as { message?: string; code?: string };
            pasos.push({
              paso, ok: false,
              detalle: `${err.message ?? String(e)} · ${Date.now() - t0} ms`,
              codigo: err.code,
            });
          }
        }

        if (cadena) {
          const { conexion } = await import("../lib/postgres.server");
          await probar("conectar y consultar", async () => {
            const { rows } = await conexion().query("select version() as v");
            return String(rows[0].v).slice(0, 60);
          });
          await probar("crear las tablas si faltan", async () => {
            const { prepararEsquema } = await import("../lib/unidades.server");
            await prepararEsquema();
          });
          await probar("leer unidades", async () => {
            const { rows } = await conexion().query("select count(*)::int as n from unidades");
            return `${rows[0].n} unidades`;
          });
          await probar("leer encargos", async () => {
            const { prepararEsquema } = await import("../lib/solicitudes.server");
            await prepararEsquema();
            const { rows } = await conexion().query("select count(*)::int as n from solicitudes");
            return `${rows[0].n} encargos`;
          });
        }

        return json({
          variables,
          postgres: {
            configurada: Boolean(cadena),
            servidor: servidorDe(cadena),
            cifrada: !/[?&]host=(%2F|\/)/i.test(cadena) && !/@(localhost|127\.0\.0\.1)/i.test(cadena),
          },
          pasos,
        });
      },
    },
  },
});
