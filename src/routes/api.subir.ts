import { createFileRoute } from "@tanstack/react-router";

/**
 * Subida de fotos propias de una unidad.
 *
 * Mismo token compartido que /api/unidades, y las mismas reservas: protege de
 * escrituras de fuera, no es un sistema de usuarios.
 *
 * Aquí solo llegan fotos que hayas hecho tú o que te haya pasado el vendedor
 * con permiso. Las del anuncio no se copian.
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

export const Route = createFileRoute("/api/subir")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        if (!autorizado(request)) return json({ error: "No autorizado" }, 401);
        // Solo qué variables existen, nunca su valor.
        const { destino, diagnostico } = await import("../lib/almacenFotos.server");
        return json({ destino, ...diagnostico });
      },

      POST: async ({ request }) => {
        if (!autorizado(request)) return json({ error: "No autorizado" }, 401);

        const { guardarFoto, destino, TIPOS_ACEPTADOS } = await import(
          "../lib/almacenFotos.server"
        );
        if (!destino) {
          return json(
            {
              error:
                "No hay almacenamiento de fotos. En Vercel: Storage → Create → Blob y vincúlalo al proyecto.",
            },
            503,
          );
        }

        let formulario: FormData;
        try {
          formulario = await request.formData();
        } catch {
          return json({ error: "Se esperaba un formulario multipart" }, 400);
        }

        const referencia = String(formulario.get("referencia") ?? "unidad");
        const archivos = formulario.getAll("foto").filter((v): v is File => v instanceof File);
        if (!archivos.length) return json({ error: "No se ha enviado ninguna foto" }, 400);

        const urls: string[] = [];
        try {
          for (const archivo of archivos) {
            if (!TIPOS_ACEPTADOS.includes(archivo.type)) {
              return json(
                { error: `«${archivo.name}» es ${archivo.type || "de tipo desconocido"}; se admiten ${TIPOS_ACEPTADOS.join(", ")}.` },
                400,
              );
            }
            urls.push(await guardarFoto(await archivo.arrayBuffer(), archivo.type, referencia));
          }
        } catch (e) {
          console.error(e);
          return json({ error: e instanceof Error ? e.message : "Error al guardar la foto" }, 500);
        }

        return json({ ok: true, urls, destino });
      },
    },
  },
});
