import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { useState } from "react";
import { createServerFn } from "@tanstack/react-start";
import { copy } from "../content";
import { Mark } from "../site/Logo";
import Nav from "../site/Nav";
import Footer from "../site/Footer";
import { whatsappHref } from "../lib/submitOrder";

/**
 * Ficha individual de una unidad, con su propia URL.
 *
 * Deliberadamente una ruta y no un modal: cada coche necesita enlace propio,
 * titulo y foto para compartir, y entrada en el sitemap. Es como funcionan los
 * portales del sector, y es lo que hace que estas paginas valgan para buscar.
 *
 * Los datos salen de content/copy.es.ts. Cuando exista backend, esta ruta es el
 * unico punto que hay que cambiar: el resto del componente no sabe de donde
 * vienen.
 */
const cargarUnidad = createServerFn({ method: "GET" })
  .inputValidator((slug: string) => slug)
  .handler(async ({ data }) => {
    const { obtenerPorSlug } = await import("../lib/unidades.server");
    return obtenerPorSlug(data);
  });

export const Route = createFileRoute("/unidades/$slug")({
  loader: async ({ params }) => {
    const unit = await cargarUnidad({ data: params.slug });
    if (!unit) throw notFound();
    return unit;
  },
  head: ({ loaderData }) => {
    if (!loaderData) return {};
    const title = `${loaderData.model} · ${loaderData.year} · ${loaderData.km} — ${copy.meta.brand}`;
    const description = `${loaderData.model} de ${loaderData.year} con ${loaderData.km}, localizado en ${loaderData.market}. ${loaderData.price} puesto en España.`;
    const image = loaderData.image ?? "/media/master.webp";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:image", content: image },
        { property: "og:type", content: "product" },
      ],
    };
  },
  component: UnitPage,
});

function UnitPage() {
  const unit = Route.useLoaderData();
  const { available, form } = copy;
  const d = available.detail;
  const [shot, setShot] = useState(0);
  const gallery = unit.gallery ?? [];

  const spec: Array<[string, string | undefined]> = [
    [d.specLabels.year, unit.year],
    [d.specLabels.km, unit.km],
    [d.specLabels.firstReg, unit.spec.firstReg],
    [d.specLabels.engine, unit.spec.engine],
    [d.specLabels.power, unit.spec.power],
    [d.specLabels.fuel, unit.spec.fuel],
    [d.specLabels.transmission, unit.spec.transmission],
    [d.specLabels.drive, unit.spec.drive],
    [d.specLabels.body, unit.spec.body],
    [d.specLabels.doors, unit.spec.doors],
    [d.specLabels.seats, unit.spec.seats],
    [d.specLabels.color, unit.spec.color],
    [d.specLabels.upholstery, unit.spec.upholstery],
    [d.specLabels.market, unit.market],
    [d.specLabels.owners, unit.spec.owners],
    [d.specLabels.inspection, unit.spec.inspection],
  ];

  return (
    <>
      <Nav esPortada={false} />
      <main className="bg-bone pb-20 pt-28 md:pt-32">
        <div className="mx-auto w-full max-w-[1440px] px-5 md:px-10">
          <nav aria-label="Migas de pan" className="mb-8 font-mono text-[10px] uppercase tracking-label text-steel">
            <Link to="/" className="transition-colors hover:text-graphite">{d.breadcrumbHome}</Link>
            <span className="px-2">/</span>
            <Link to="/" hash="disponibles" className="transition-colors hover:text-graphite">{d.breadcrumbList}</Link>
            <span className="px-2">/</span>
            <span className="text-graphite">{unit.id}</span>
          </nav>

          <div className="grid gap-10 lg:grid-cols-12 lg:gap-12">
            {/* --- Galería --- */}
            <div className="lg:col-span-7">
              <div className="relative aspect-[4/3] w-full overflow-hidden border border-steel/25 bg-graphite">
                {gallery.length ? (
                  <img src={gallery[shot]} alt={unit.model} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full flex-col items-center justify-center gap-4">
                    <Mark className="h-12 w-14 opacity-40" />
                    <span className="font-mono text-[10px] uppercase tracking-label text-bone/35">
                      {d.galleryPending}
                    </span>
                  </div>
                )}
                <span
                  className={`absolute right-0 top-0 px-3 py-2 font-mono text-[10px] uppercase tracking-label ${
                    unit.reserved ? "bg-steel/90 text-bone" : "bg-port text-graphite"
                  }`}
                >
                  {unit.reserved ? available.status.reserved : available.status.available}
                </span>
              </div>

              {gallery.length > 1 ? (
                <ul className="mt-3 grid grid-cols-6 gap-2">
                  {gallery.map((src, i) => (
                    <li key={src}>
                      <button
                        type="button"
                        onClick={() => setShot(i)}
                        aria-label={`Foto ${i + 1} de ${gallery.length}`}
                        aria-current={i === shot}
                        className={`block aspect-[4/3] w-full overflow-hidden border transition-colors ${
                          i === shot ? "border-graphite" : "border-steel/25 hover:border-steel"
                        }`}
                      >
                        <img src={src} alt="" className="h-full w-full object-cover" />
                      </button>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>

            {/* --- Panel de precio y contacto --- */}
            <aside className="lg:col-span-5">
              <p className="font-mono text-[10px] uppercase tracking-label text-steel">
                {d.refLabel} {unit.id}
              </p>
              <h1 className="display mt-3 text-[9vw] leading-[1.05] md:text-[3.4vw]">{unit.model}</h1>

              <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 font-mono text-[12px] text-steel">
                <span>{unit.year}</span>
                <span>{unit.km}</span>
                <span>{unit.spec.power}</span>
                <span>{unit.market}</span>
              </div>

              <div className="mt-8 border-y border-steel/25 py-6">
                <p className="font-mono text-[9px] uppercase tracking-label text-steel">{d.priceLabel}</p>
                <p className="display mt-1 text-[34px] leading-none text-graphite">{unit.price}</p>
              </div>

              <div className="mt-8 flex flex-col gap-3">
                {/* Se lleva la referencia de la unidad para que el encargo
                    diga de dónde viene. Sin esto llega un encargo suelto y no
                    se sabe qué coche estaba mirando el cliente. */}
                <a
                  href={`/?unidad=${encodeURIComponent(`${unit.id} · ${unit.model}`)}#encargo`}
                  className="group inline-flex items-center justify-between gap-3 bg-graphite px-6 py-4 font-mono text-[11px] uppercase tracking-label text-bone transition-transform duration-300 hover:-translate-y-0.5"
                >
                  {d.askCta}
                  <span className="inline-block h-px w-6 bg-port transition-all duration-300 group-hover:w-9" />
                </a>
                <a
                  href={whatsappHref(form.whatsapp.number, `${form.whatsapp.prefill} Referencia ${unit.id} (${unit.model}).`)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-between gap-3 border border-graphite px-6 py-4 font-mono text-[11px] uppercase tracking-label text-graphite transition-colors duration-300 hover:bg-graphite hover:text-bone"
                >
                  {d.whatsappCta}
                </a>
              </div>

              <p className="mt-7 border-l border-port/40 pl-4 font-mono text-[10px] leading-[1.7] text-steel">
                {available.note}
              </p>
            </aside>
          </div>

          {/* --- Ficha técnica --- */}
          <section className="mt-16 md:mt-24">
            <h2 className="label">{d.specTitle}</h2>
            <dl className="mt-6 grid gap-x-10 border-t border-steel/25 sm:grid-cols-2 lg:grid-cols-3">
              {spec.map(([k, v]) =>
                v ? (
                  <div key={k} className="flex items-baseline justify-between gap-4 border-b border-steel/25 py-3.5">
                    <dt className="font-mono text-[10px] uppercase tracking-label text-steel">{k}</dt>
                    <dd className="text-right font-mono text-[12px] text-graphite">{v}</dd>
                  </div>
                ) : null,
              )}
            </dl>
          </section>

          {/* --- Equipamiento y descripción --- */}
          <div className="mt-16 grid gap-12 md:mt-20 md:grid-cols-2">
            <section>
              <h2 className="label">{d.equipmentTitle}</h2>
              <ul className="mt-6 flex flex-col gap-3">
                {unit.equipment.map((e) => (
                  <li key={e} className="flex items-baseline gap-3 text-[15px] leading-[1.5] text-graphite">
                    <span aria-hidden="true" className="mt-2 h-px w-4 shrink-0 bg-port-ink" />
                    {e}
                  </li>
                ))}
              </ul>
            </section>

            <section>
              <h2 className="label">{d.summaryTitle}</h2>
              <p className="mt-6 max-w-[52ch] text-[15px] leading-[1.6] text-steel">{unit.summary}</p>

              <h2 className="label mt-10">{d.importTitle}</h2>
              <p className="mt-6 max-w-[52ch] text-[15px] leading-[1.6] text-steel">{d.importBody}</p>
            </section>
          </div>

          <div className="mt-16 border-t border-steel/25 pt-8">
            <Link
              to="/"
              hash="disponibles"
              className="inline-flex items-center gap-3 font-mono text-[11px] uppercase tracking-label text-graphite transition-colors hover:text-port-ink"
            >
              <span aria-hidden="true" className="inline-block h-px w-6 bg-port-ink" />
              {d.back}
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
