import { createFileRoute } from "@tanstack/react-router";
import type { Unidad } from "../lib/unidades";

/**
 * Endpoint interno de unidades.
 *
 * Protegido por un token compartido en la cabecera `x-vantis-token`, que sale
 * de la variable de entorno ADMIN_TOKEN. Es lo mínimo razonable: sirve para que
 * nadie de fuera escriba en la base de datos, pero NO es un sistema de
 * usuarios. Si esto va a manejar operaciones reales, hay que sustituirlo por
 * autenticación de verdad.
 *
 * Sin ADMIN_TOKEN definido el endpoint queda cerrado del todo, en vez de
 * quedarse abierto por descuido.
 */
function autorizado(request: Request): boolean {
  const esperado = process.env.ADMIN_TOKEN;
  if (!esperado) return false;
  return request.headers.get("x-vantis-token") === esperado;
}

function json(datos: unknown, status = 200): Response {
  return new Response(JSON.stringify(datos), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" },
  });
}

export const Route = createFileRoute("/api/unidades")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        if (!autorizado(request)) return json({ error: "No autorizado" }, 401);
        const { listarTodas, hayBaseDeDatos } = await import("../lib/unidades.server");
        return json({ hayBaseDeDatos, unidades: await listarTodas() });
      },

      POST: async ({ request }) => {
        if (!autorizado(request)) return json({ error: "No autorizado" }, 401);
        const { guardar, hayBaseDeDatos } = await import("../lib/unidades.server");
        if (!hayBaseDeDatos) {
          return json({ error: "No hay base de datos: falta POSTGRES_URL en Vercel." }, 503);
        }
        let cuerpo: { unidad?: Unidad; publicada?: boolean };
        try {
          cuerpo = await request.json();
        } catch {
          return json({ error: "El cuerpo no es JSON válido" }, 400);
        }
        const u = cuerpo.unidad;
        if (!u?.id || !u.slug || !u.model) {
          return json({ error: "Faltan campos obligatorios: id, slug y modelo" }, 400);
        }
        try {
          await guardar(u, Boolean(cuerpo.publicada));
          return json({ ok: true, slug: u.slug, publicada: Boolean(cuerpo.publicada) });
        } catch (e) {
          console.error(e);
          return json({ error: e instanceof Error ? e.message : "Error al guardar" }, 500);
        }
      },

      DELETE: async ({ request }) => {
        if (!autorizado(request)) return json({ error: "No autorizado" }, 401);
        const { borrar } = await import("../lib/unidades.server");
        const id = new URL(request.url).searchParams.get("id");
        if (!id) return json({ error: "Falta el parámetro id" }, 400);
        await borrar(id);
        return json({ ok: true });
      },
    },
  },
});
