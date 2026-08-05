import type { SolicitudEntrante } from "./solicitudes";

/**
 * Aviso por correo cuando entra un encargo.
 *
 * Es un aviso, no el registro: el encargo ya está en la base de datos antes de
 * llamar aquí. Por eso esta función **nunca lanza**. Que el proveedor de
 * correo esté caído no puede hacer que el cliente vea un error y se piense
 * que su encargo no ha llegado, porque sí ha llegado.
 *
 * Usa Resend por HTTP directo, sin librería: es una petición POST con un JSON
 * y no compensa arrastrar una dependencia más dentro de la función.
 */

const CLAVE = process.env.RESEND_API_KEY ?? "";
const DESTINO = process.env.NOTIFY_EMAIL ?? "";
// Resend solo deja mandar desde un dominio verificado; onboarding@resend.dev
// funciona sin verificar nada, pero solo entrega al dueño de la cuenta.
const REMITENTE = process.env.NOTIFY_FROM ?? "Vantis Motors <onboarding@resend.dev>";

export const hayCorreo = Boolean(CLAVE && DESTINO);

export async function avisarEncargo(ref: string, s: SolicitudEntrante): Promise<boolean> {
  if (!hayCorreo) return false;

  const cuerpo = [
    `Encargo ${ref}`,
    "",
    `Contacto:     ${s.contacto}`,
    `Presupuesto:  ${s.presupuesto || "(sin indicar)"}`,
    `Plazo:        ${s.plazo || "(sin indicar)"}`,
    s.unidad ? `Sobre unidad: ${s.unidad}` : null,
    s.origen ? `Desde:        ${s.origen}` : null,
    "",
    "Descripción:",
    s.descripcion,
    "",
    "— Se ve también en /interno/solicitudes",
  ].filter((l) => l !== null).join("\n");

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        authorization: `Bearer ${CLAVE}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        from: REMITENTE,
        to: DESTINO.split(",").map((d) => d.trim()).filter(Boolean),
        subject: `Encargo ${ref} — ${s.contacto}`,
        text: cuerpo,
        // Responder al correo va al cliente si ha dejado uno.
        reply_to: /\S+@\S+\.\S+/.test(s.contacto) ? s.contacto.match(/\S+@\S+\.\S+/)![0] : undefined,
      }),
    });
    if (!res.ok) {
      console.error("Resend respondió", res.status, await res.text());
      return false;
    }
    return true;
  } catch (e) {
    console.error("No se ha podido avisar por correo:", e);
    return false;
  }
}
