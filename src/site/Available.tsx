import { copy } from "../content";

/**
 * Unidades localizadas que siguen a la venta.
 *
 * Deliberadamente sin fotos: son unidades de terceros que rotan a diario, y
 * una foto generica al lado de un VIN concreto confunde mas que ayuda. La
 * fila lleva solo dato verificable, que es lo que decide una compra.
 */
export default function Available() {
  const { available } = copy;
  return (
    <section id="disponibles" className="bg-bone py-20 md:py-28">
      <div className="mx-auto w-full max-w-[1440px] px-5 md:px-10">
        <p className="label">{available.eyebrow}</p>
        <h2 className="display mt-4 max-w-[14ch] text-[12vw] md:text-[4.6vw]">{available.title}</h2>
        <p className="mt-6 max-w-[62ch] text-[15px] leading-[1.5] text-steel">{available.body}</p>

        <ul className="mt-14 border-t border-steel/25">
          {available.items.map((u) => (
            <li key={u.id} className="rule group border-t-0 border-b border-steel/25 py-6 md:py-7">
              <div className="grid grid-cols-4 items-baseline gap-x-4 gap-y-3 md:grid-cols-12 md:gap-x-6">
                <p className="col-span-4 md:col-span-4">
                  <span className="mr-3 font-mono text-[10px] uppercase tracking-label text-steel">{u.id}</span>
                  <span className="display text-[19px] md:text-[21px]">{u.model}</span>
                </p>

                <Cell className="md:col-span-1" label={available.labels.year} value={u.year} />
                <Cell className="md:col-span-2" label={available.labels.km} value={u.km} />
                <Cell className="md:col-span-2" label={available.labels.market} value={u.market} />
                <Cell className="md:col-span-2" label={available.labels.price} value={u.price} strong />

                <p className="col-span-4 md:col-span-1 md:text-right">
                  <span
                    className={`inline-block border px-2 py-1 font-mono text-[10px] uppercase tracking-label ${
                      u.reserved ? "border-steel/40 text-steel" : "border-port-ink/50 text-port-ink"
                    }`}>
                    {u.reserved ? available.status.reserved : available.status.available}
                  </span>
                </p>
              </div>
            </li>
          ))}
        </ul>

        <div className="mt-10 flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <p className="max-w-[62ch] font-mono text-[11px] leading-[1.6] text-steel">{available.note}</p>
          <a href="#encargo" className="group inline-flex shrink-0 items-center gap-3 bg-graphite px-6 py-4 font-mono text-[11px] uppercase tracking-label text-bone transition-transform duration-300 hover:-translate-y-0.5">
            {available.cta}
            <span className="inline-block h-px w-6 bg-port transition-all duration-300 group-hover:w-9" />
          </a>
        </div>
      </div>
    </section>
  );
}

function Cell({ label, value, className = "", strong = false }: { label: string; value: string; className?: string; strong?: boolean }) {
  return (
    <p className={`col-span-2 ${className}`}>
      <span className="block font-mono text-[9px] uppercase tracking-label text-steel">{label}</span>
      <span className={`mt-1 block text-[14px] ${strong ? "text-graphite" : "text-steel"}`}>{value}</span>
    </p>
  );
}
