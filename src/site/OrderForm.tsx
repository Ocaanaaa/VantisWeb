import { useState } from "react";
import { useSearch } from "@tanstack/react-router";
import { copy } from "../content";
import { submitOrder, whatsappHref, type Order } from "../lib/submitOrder";

const EMPTY = { spec: "", budget: "", timing: "", contact: "" };
type Key = keyof typeof EMPTY;

/**
 * Un solo paso, cuatro campos. Sin <form> con envío nativo: el estado se
 * gestiona con handlers y la salida pasa por submitOrder().
 */
export default function OrderForm() {
  const { form } = copy;
  const [values, setValues] = useState(EMPTY);
  const [touched, setTouched] = useState<Partial<Record<Key, boolean>>>({});
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [ref, setRef] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  // Campo trampa: no se ve, así que solo lo rellenan los robots.
  const [trampa, setTrampa] = useState("");
  // Unidad de la que viene el cliente, si ha llegado desde una ficha.
  //
  // Por el router y no por window.location: al pulsar «Contactar» desde una
  // ficha, la navegación es del lado del cliente, así que leer location en un
  // efecto de montaje da la anterior. Esto además funciona en el servidor.
  const busqueda = useSearch({ strict: false }) as { unidad?: string };
  const unidad = typeof busqueda.unidad === "string" ? busqueda.unidad.slice(0, 120) : null;

  const set = (k: Key) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setValues((v) => ({ ...v, [k]: e.target.value }));
  const blur = (k: Key) => () => setTouched((t) => ({ ...t, [k]: true }));

  const missing = (Object.keys(EMPTY) as Key[]).filter((k) => !values[k].trim());

  const onSend = async () => {
    if (status === "sending") return;
    if (missing.length) {
      setTouched(Object.fromEntries((Object.keys(EMPTY) as Key[]).map((k) => [k, true])));
      return;
    }
    setStatus("sending");
    setError(null);
    const res = await submitOrder({ ...values, unit: unidad ?? undefined, honeypot: trampa } as Order);
    if (res.ok) {
      setRef(res.ref ?? null); setStatus("sent"); setValues(EMPTY); setTouched({});
    } else {
      // El mensaje del servidor está escrito para el cliente y dice qué hacer;
      // el genérico solo se usa si no ha llegado ninguno.
      setError(res.error ?? null);
      setStatus("error");
    }
  };

  return (
    <section id="encargo" className="bg-graphite py-20 text-bone md:py-28">
      <div className="mx-auto w-full max-w-[1440px] px-5 md:px-10">
        <div className="grid-page">
          <div className="col-span-4 md:col-span-7">
            <p className="label mb-5">{form.eyebrow}</p>
            <h2 className="display mb-6 text-[13vw] md:text-[5.4vw]">{form.title}</h2>
            <p className="mb-12 max-w-[44ch] text-[14px] leading-[1.55] text-bone/60">{form.body}</p>

            {status === "sent" ? (
              <div role="status" aria-live="polite" className="border border-port/60 p-8 md:p-10">
                <p className="display text-[9vw] leading-none text-port md:text-[3vw]">{form.sent}</p>
                <p className="mt-4 max-w-[40ch] text-[14px] leading-[1.5] text-bone/70">{form.sentBody}</p>
                {ref ? <p className="mt-6 font-mono text-[11px] tracking-[0.12em] text-steel">{ref}</p> : null}
              </div>
            ) : (
              <div className="space-y-7">
                {unidad ? (
                  <p className="border-l-2 border-port pl-4 font-mono text-[11px] leading-[1.6] text-bone/70">
                    Sobre la unidad <span className="text-port">{unidad}</span>. Va con el encargo;
                    cuéntanos abajo qué buscas exactamente.
                  </p>
                ) : null}
                <Field n="01" id="spec" as="textarea" label={form.fields.spec.label} placeholder={form.fields.spec.placeholder} value={values.spec} onChange={set("spec")} onBlur={blur("spec")} invalid={Boolean(touched.spec) && !values.spec.trim()} required={form.required} />
                <Field n="02" id="budget" label={form.fields.budget.label} placeholder={form.fields.budget.placeholder} value={values.budget} onChange={set("budget")} onBlur={blur("budget")} invalid={Boolean(touched.budget) && !values.budget.trim()} required={form.required} />
                <Field n="03" id="timing" label={form.fields.timing.label} placeholder={form.fields.timing.placeholder} value={values.timing} onChange={set("timing")} onBlur={blur("timing")} invalid={Boolean(touched.timing) && !values.timing.trim()} required={form.required} />
                <Field n="04" id="contact" label={form.fields.contact.label} placeholder={form.fields.contact.placeholder} value={values.contact} onChange={set("contact")} onBlur={blur("contact")} invalid={Boolean(touched.contact) && !values.contact.trim()} required={form.required} />

                <div className="flex flex-wrap items-center gap-5 pt-2">
                  {/* Solo se bloquea mientras envía: un botón muerto sin explicación
                      deja al usuario sin saber qué falta. */}
                  <button type="button" onClick={onSend} disabled={status === "sending"}
                    className="group inline-flex items-center gap-3 bg-bone px-7 py-4 font-mono text-[11px] uppercase tracking-label text-graphite transition-transform duration-300 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-40">
                    {status === "sending" ? form.sending : form.submit}
                    <span className="inline-block h-px w-6 bg-port-ink transition-all duration-300 group-hover:w-9" />
                  </button>
                  {status === "error" ? (
                    <p role="alert" className="max-w-[42ch] font-mono text-[11px] leading-[1.6] text-port">
                      {error ?? form.error}
                    </p>
                  ) : null}
                </div>

                {/* Campo trampa. Fuera de la vista y fuera del tabulador, pero
                    sin display:none: hay robots que se saltan lo que está
                    oculto del todo. aria-hidden lo aparta de los lectores. */}
                <div aria-hidden="true" className="absolute left-[-9999px] h-px w-px overflow-hidden">
                  <label htmlFor="empresa">Empresa</label>
                  <input id="empresa" name="empresa" type="text" tabIndex={-1} autoComplete="off"
                    value={trampa} onChange={(e) => setTrampa(e.target.value)} />
                </div>
              </div>
            )}
          </div>

          <aside className="col-span-4 mt-16 md:col-span-4 md:col-start-9 md:mt-0">
            <div className="border border-bone/20 bg-bone/[0.03]">
              <div className="border-b border-bone/15 px-7 py-5">
                <p className="label">{form.whatsapp.label}</p>
              </div>
              <div className="px-7 py-7">
                <p className="font-mono text-[17px] tracking-[0.08em]">{form.whatsapp.number}</p>
                <a href={whatsappHref(form.whatsapp.number, form.whatsapp.prefill)} target="_blank" rel="noopener noreferrer"
                  className="group mt-6 inline-flex w-full items-center justify-between gap-3 border border-bone/30 px-5 py-3.5 font-mono text-[10px] uppercase tracking-label transition-colors duration-300 hover:border-port hover:text-port">
                  {form.whatsapp.action}
                  <span className="inline-block h-px w-6 bg-port transition-all duration-300 group-hover:w-9" />
                </a>
              </div>
            </div>
            <p className="mt-7 max-w-[36ch] border-l border-port/40 pl-4 font-mono text-[10px] leading-[1.7] text-steel">{form.discretion}</p>
          </aside>
        </div>
      </div>
    </section>
  );
}

function Field(props: {
  n: string; id: string; as?: "textarea"; label: string; placeholder: string; value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onBlur: () => void; invalid: boolean; required: string;
}) {
  const { n, id, as, label, placeholder, value, onChange, onBlur, invalid, required } = props;
  const errorId = `${id}-error`;
  /* Superficie propia en vez de solo un subrayado: sobre grafito, una linea
   * de 1 px no llega a leerse como zona pulsable, y en movil el area de
   * toque quedaba por debajo de lo comodo. */
  const cls = [
    "w-full resize-none bg-bone/[0.04] px-4 py-3.5 text-[15px] leading-[1.5] text-bone",
    "border transition-colors duration-200 placeholder:text-bone/25",
    "focus:bg-bone/[0.07] focus:outline-none",
    invalid ? "border-port" : "border-bone/15 hover:border-bone/30 focus:border-port",
  ].join(" ");
  return (
    <div>
      <label htmlFor={id} className="mb-2.5 flex items-baseline gap-3">
        <span className="font-mono text-[10px] tracking-label text-port">{n}</span>
        <span className="label">{label}</span>
      </label>
      {as === "textarea" ? (
        <textarea id={id} name={id} rows={3} value={value} onChange={onChange} onBlur={onBlur} placeholder={placeholder} aria-invalid={invalid || undefined} aria-describedby={invalid ? errorId : undefined} className={cls} />
      ) : (
        <input id={id} name={id} value={value} onChange={onChange} onBlur={onBlur} placeholder={placeholder} aria-invalid={invalid || undefined} aria-describedby={invalid ? errorId : undefined} className={cls} />
      )}
      {invalid ? <p id={errorId} className="mt-2 font-mono text-[10px] text-port">{required}</p> : null}
    </div>
  );
}
