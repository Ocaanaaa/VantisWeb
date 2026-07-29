/**
 * Único punto de salida del formulario de encargo. Deliberadamente aislado:
 * cuando exista backend solo cambia el cuerpo de esta función.
 */
export interface Order { spec: string; budget: string; timing: string; contact: string }
export interface OrderResult { ok: boolean; ref?: string; error?: string }

const ENDPOINT = (import.meta.env.VITE_ORDER_ENDPOINT as string | undefined) ?? "";

export async function submitOrder(order: Order): Promise<OrderResult> {
  const payload = { ...order, ref: buildRef(), submittedAt: new Date().toISOString(), locale: "es-ES" };

  // Sin endpoint configurado no se inventa un envío: se resuelve en local.
  if (!ENDPOINT) return { ok: true, ref: payload.ref };

  try {
    const res = await fetch(ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) return { ok: false, error: `HTTP ${res.status}` };
    return { ok: true, ref: payload.ref };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "network" };
  }
}

function buildRef(): string {
  return `VNT-${Math.floor(Math.random() * 9000) + 1000}`;
}

export function whatsappHref(number: string, prefill: string): string {
  return `https://wa.me/${number.replace(/[^\d]/g, "")}?text=${encodeURIComponent(prefill)}`;
}
