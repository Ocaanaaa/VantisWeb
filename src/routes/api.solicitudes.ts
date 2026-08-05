import { createFileRoute } from "@tanstack/react-router";

/**
 * Encargos del formulario.
 *
 * POST es **público**: lo llama el formulario de la portada y el de la ficha
 * de una unidad. GET y PATCH van con el token interno.
 *
 * Al ser público, tiene tres frenos: campos con tope de longitud, un campo
 * trampa que los robots rellenan y las personas no, y un límite por IP contado
 * en la base de datos.
 */

const MAX_POR_HORA = 5;

function json(datos: unknown, status = 200): Response {
  return new Response(JSON.stringify(datos), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" },
  });
}

function autorizado(request: Request): boolean {
  const esperado = process.env.ADMIN_TOKEN;
  if (!esperado) return false;
  return request.headers.get("x-vantis-token") === esperado;
}

/** La IP real del cliente; detrás del proxy de Vercel viene en la cabecera. */
function ipDe(request: Request): string {
  const reenviada = request.headers.get("x-forwarded-for") ?? "";
  return reenviada.split(",")[0].trim() || request.headers.get("x-real-ip") || "";
}

export const Route = createFileRoute("/api/solicitudes")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const {
          guardarSolicitud, enviosRecientes, hayBaseDeDatos, LIMITES,
        } = await import("../lib/solicitudes.server");

        let cuerpo: Record<string, unknown>;
        try {
          cuerpo = await request.json();
        } catch {
          return json({ error: "El cuerpo no es JSON válido" }, 400);
        }

        // Campo trampa: invisible en el formulario, así que si viene relleno
        // no lo ha escrito una persona. Se responde bien y no se guarda nada,
        // para no darle al robot ninguna señal de que se le ha detectado.
        if (typeof cuerpo.empresa === "string" && cuerpo.empresa.trim()) {
          return json({ ok: true, ref: "VNT-00-0000" });
        }

        const texto = (v: unknown) => (typeof v === "string" ? v.trim() : "");
        const solicitud = {
          descripcion: texto(cuerpo.descripcion),
          presupuesto: texto(cuerpo.presupuesto),
          plazo: texto(cuerpo.plazo),
          contacto: texto(cuerpo.contacto),
          unidad: texto(cuerpo.unidad) || null,
          origen: texto(cuerpo.origen) || null,
        };

        if (!solicitud.descripcion || !solicitud.contacto) {
          return json({ error: "Faltan la descripción y la forma de contacto." }, 400);
        }
        for (const [campo, tope] of Object.entries(LIMITES)) {
          const valor = solicitud[campo as keyof typeof solicitud];
          if (typeof valor === "string" && valor.length > tope) {
            return json({ error: `El campo «${campo}» supera los ${tope} caracteres.` }, 400);
          }
        }

        if (!hayBaseDeDatos) {
          // Sin sitio donde guardarlo, se dice. Antes esto devolvía una
          // confirmación falsa y el encargo se perdía sin que nadie lo supiera.
          return json(
            { error: "Ahora mismo no podemos registrar el encargo. Escríbenos por WhatsApp." },
            503,
          );
        }

        const ip = ipDe(request);
        try {
          if (await enviosRecientes(ip) >= MAX_POR_HORA) {
            return json(
              { error: "Has enviado varios encargos seguidos. Prueba dentro de un rato o escríbenos por WhatsApp." },
              429,
            );
          }

          const ref = await guardarSolicitud(solicitud, {
            ip,
            agente: request.headers.get("user-agent") ?? "",
          });

          // El aviso por correo va después de guardar y no puede tumbar la
          // respuesta: el encargo ya está a salvo.
          const { avisarEncargo } = await import("../lib/avisoCorreo.server");
          const avisado = await avisarEncargo(ref, solicitud);

          return json({ ok: true, ref, avisado });
        } catch (e) {
          console.error(e);
          return json(
            { error: "No se ha podido registrar el encargo. Escríbenos por WhatsApp." },
            500,
          );
        }
      },

      GET: async ({ request }) => {
        if (!autorizado(request)) return json({ error: "No autorizado" }, 401);
        // Si la consulta lanza y no se recoge aquí, el framework responde con
        // su página de error en HTML, el panel intenta leerla como JSON y lo
        // único que se ve es «Unexpected token '<'». Que salga el error real.
        try {
          const { listarSolicitudes, hayBaseDeDatos } = await import("../lib/solicitudes.server");
          const { hayCorreo } = await import("../lib/avisoCorreo.server");
          return json({ hayBaseDeDatos, hayCorreo, solicitudes: await listarSolicitudes() });
        } catch (e) {
          console.error(e);
          const err = e as { message?: string; code?: string };
          return json(
            { error: `La base de datos no responde: ${err.message ?? String(e)}`, codigo: err.code },
            500,
          );
        }
      },

      PATCH: async ({ request }) => {
        if (!autorizado(request)) return json({ error: "No autorizado" }, 401);
        const { actualizarSolicitud } = await import("../lib/solicitudes.server");
        let cuerpo: { id?: number; estado?: "nueva" | "atendida" | "descartada"; notas?: string };
        try {
          cuerpo = await request.json();
        } catch {
          return json({ error: "El cuerpo no es JSON válido" }, 400);
        }
        if (!cuerpo.id) return json({ error: "Falta el id" }, 400);
        if (cuerpo.estado && !["nueva", "atendida", "descartada"].includes(cuerpo.estado)) {
          return json({ error: "Estado no válido" }, 400);
        }
        try {
          await actualizarSolicitud(cuerpo.id, { estado: cuerpo.estado, notas: cuerpo.notas });
          return json({ ok: true });
        } catch (e) {
          console.error(e);
          return json({ error: e instanceof Error ? e.message : "Error al actualizar" }, 500);
        }
      },
    },
  },
});
