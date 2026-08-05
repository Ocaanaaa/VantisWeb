/**
 * Único punto de salida del formulario de encargo.
 *
 * Antes, sin `VITE_ORDER_ENDPOINT` configurada, esta función daba el envío por
 * bueno sin mandar nada: el cliente veía «Encargo enviado» y el encargo se
 * perdía. Ahora va contra /api/solicitudes, que lo guarda en la base de datos
 * y avisa por correo.
 *
 * Si no se puede registrar, se devuelve el error y el formulario enseña la
 * salida por WhatsApp. Una confirmación falsa es peor que un error.
 */
export interface Order {
  spec: string;
  budget: string;
  timing: string;
  contact: string;
  /** Referencia de la unidad, cuando el encargo sale de su ficha. */
  unit?: string;
  /** Campo trampa. Una persona lo deja vacío porque no lo ve. */
  honeypot?: string;
}

export interface OrderResult { ok: boolean; ref?: string; error?: string }

export async function submitOrder(order: Order): Promise<OrderResult> {
  try {
    const res = await fetch("/api/solicitudes", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        descripcion: order.spec,
        presupuesto: order.budget,
        plazo: order.timing,
        contacto: order.contact,
        unidad: order.unit ?? null,
        origen: typeof window !== "undefined" ? window.location.href : null,
        empresa: order.honeypot ?? "",
      }),
    });
    const datos = await res.json().catch(() => ({}));
    if (!res.ok) return { ok: false, error: datos.error ?? `HTTP ${res.status}` };
    return { ok: true, ref: datos.ref };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "network" };
  }
}

export function whatsappHref(number: string, prefill: string): string {
  return `https://wa.me/${number.replace(/[^\d]/g, "")}?text=${encodeURIComponent(prefill)}`;
}
