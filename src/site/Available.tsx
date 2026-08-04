import { Link } from "@tanstack/react-router";
import { copy } from "../content";
import { Mark } from "./Logo";

/**
 * Unidades localizadas que siguen a la venta, en formato anuncio: foto,
 * ficha de datos y boton de contacto por unidad.
 *
 * `image` es opcional a proposito. Son coches de terceros que rotan a diario,
 * y una foto generica junto a un precio concreto enganaria: sin foto real, la
 * ficha muestra un marcador con el isotipo en vez de una imagen prestada.
 * Para publicar una: deja el archivo en public/media y pon su ruta en `image`
 * dentro de content/copy.es.ts.
 */
export default function Available() {
  const { available } = copy;
  return (
    <section id="disponibles" className="bg-bone py-20 md:py-28">
      <div className="mx-auto w-full max-w-[1440px] px-5 md:px-10">
        <p className="label">{available.eyebrow}</p>
        <h2 className="display mt-4 max-w-[14ch] text-[12vw] md:text-[4.6vw]">{available.title}</h2>
        <p className="mt-6 max-w-[62ch] text-[15px] leading-[1.5] text-steel">{available.body}</p>

        <ul className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {available.items.map((u) => (
            <li key={u.id} className="group flex flex-col border border-steel/25 bg-bone transition-colors duration-300 hover:border-graphite">
              <Link
                to="/unidades/$slug"
                params={{ slug: u.slug }}
                aria-label={`${available.more}: ${u.model}`}
                className="relative block aspect-[4/3] w-full overflow-hidden bg-graphite"
              >
                {u.image ? (
                  <img
                    src={u.image}
                    alt={u.model}
                    loading="lazy"
                    decoding="async"
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                  />
                ) : (
                  <div className="flex h-full w-full flex-col items-center justify-center gap-3">
                    <Mark className="h-9 w-10 opacity-40" />
                    <span className="font-mono text-[10px] uppercase tracking-label text-bone/35">
                      {available.photoPending}
                    </span>
                  </div>
                )}
                <span className="absolute left-0 top-0 bg-graphite px-3 py-2 font-mono text-[10px] tracking-[0.12em] text-bone">
                  {u.id}
                </span>
                <span
                  className={`absolute right-0 top-0 px-3 py-2 font-mono text-[10px] uppercase tracking-label ${
                    u.reserved ? "bg-steel/90 text-bone" : "bg-port text-graphite"
                  }`}
                >
                  {u.reserved ? available.status.reserved : available.status.available}
                </span>
              </Link>

              <div className="flex flex-1 flex-col p-6">
                <h3 className="display text-[19px] leading-tight md:text-[21px]">{u.model}</h3>

                <dl className="mt-5 border-t border-steel/25">
                  <Row k={available.labels.year} v={u.year} />
                  <Row k={available.labels.km} v={u.km} />
                  <Row k={available.labels.market} v={u.market} />
                </dl>

                {/* mt-auto empuja el bloque de precio y boton al fondo, asi
                    quedan alineados aunque el titulo ocupe una o dos lineas. */}
                <p className="mt-auto flex items-baseline justify-between gap-3 pt-5">
                  <span className="font-mono text-[9px] uppercase tracking-label text-steel">
                    {available.labels.price}
                  </span>
                  <span className="display text-[22px] text-graphite">{u.price}</span>
                </p>

                <div className="mt-6 grid grid-cols-2 gap-2">
                  <Link
                    to="/unidades/$slug"
                    params={{ slug: u.slug }}
                    className="inline-flex items-center justify-center border border-graphite bg-graphite px-3 py-3.5 text-center font-mono text-[10px] uppercase tracking-label text-bone transition-colors duration-300 hover:bg-transparent hover:text-graphite"
                  >
                    {available.more}
                  </Link>
                  <a
                    href="#encargo"
                    className="inline-flex items-center justify-center border border-graphite px-3 py-3.5 text-center font-mono text-[10px] uppercase tracking-label text-graphite transition-colors duration-300 hover:bg-graphite hover:text-bone"
                  >
                    {available.contact}
                  </a>
                </div>
              </div>
            </li>
          ))}
        </ul>

        <div className="mt-10 flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <p className="max-w-[62ch] font-mono text-[11px] leading-[1.6] text-steel">{available.note}</p>
          <a
            href="#encargo"
            className="group inline-flex shrink-0 items-center gap-3 bg-graphite px-6 py-4 font-mono text-[11px] uppercase tracking-label text-bone transition-transform duration-300 hover:-translate-y-0.5"
          >
            {available.cta}
            <span className="inline-block h-px w-6 bg-port transition-all duration-300 group-hover:w-9" />
          </a>
        </div>
      </div>
    </section>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-steel/25 py-2.5">
      <dt className="font-mono text-[9px] uppercase tracking-label text-steel">{k}</dt>
      <dd className="font-mono text-[12px] text-graphite">{v}</dd>
    </div>
  );
}
