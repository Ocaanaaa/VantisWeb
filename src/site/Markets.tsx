import { motion } from "framer-motion";
import { copy } from "../content";
import { useReducedMotion } from "../lib/motion";

/**
 * Dos origenes operativos: UE y Estados Unidos.
 *
 * El esquema de rutas se dibuja aqui en SVG en lugar de servir una lamina
 * generada. Asi las etiquetas son texto real (seleccionable, traducible y
 * legible por un lector de pantalla), el numero de rutas no puede
 * contradecir a la lista de abajo, y no cuesta una generacion cada vez que
 * cambian los mercados.
 *
 * En movil el esquema se oculta: a 350 px de ancho su tipografia quedaria
 * por debajo de lo legible, y los dos paneles ya cuentan lo mismo.
 */
export default function Markets() {
  const { markets } = copy;
  const reduced = useReducedMotion();
  const [ue, us] = markets.routes;

  return (
    <section id="mercados" className="relative overflow-hidden bg-graphite py-20 text-bone md:py-28">
      <div className="mx-auto w-full max-w-[1440px] px-5 md:px-10">
        <header className="grid-page mb-14 items-end md:mb-20">
          <div className="col-span-4 md:col-span-7">
            <p className="label mb-5">{markets.eyebrow}</p>
            <h2 className="display text-[13vw] md:text-[5.4vw]">{markets.title}</h2>
          </div>
          <p className="col-span-4 mt-6 max-w-[42ch] text-[14px] leading-[1.55] text-bone/60 md:col-span-4 md:col-start-9 md:mt-0">{markets.body}</p>
        </header>

        <figure className="mb-14 hidden border border-bone/15 md:mb-20 md:block">
          <svg viewBox="0 0 1000 280" preserveAspectRatio="xMidYMid meet" className="h-auto w-full" role="img"
               aria-label={`${ue.name} ${ue.transit}, ${us.name} ${us.transit}, con destino ${markets.destination}.`}>
            {/* Trazos: origen -> destino */}
            <path d="M232,68 C420,68 560,140 758,140" className="stroke-bone/30" strokeWidth="1" fill="none" />
            <path d="M232,212 C420,212 560,140 758,140" className="stroke-bone/30" strokeWidth="1" fill="none" />
            <circle cx="232" cy="68" r="3" className="fill-bone/50" />
            <circle cx="232" cy="212" r="3" className="fill-bone/50" />
            <path d="M748,134 L760,140 L748,146 Z" className="fill-port" />

            {/* Origenes */}
            <g>
              <rect x="30" y="26" width="202" height="84" className="fill-none stroke-bone/25" strokeWidth="1" />
              <text x="52" y="70" className="fill-bone font-display" fontSize="30" letterSpacing="1">{ue.code}</text>
              <text x="52" y="94" className="fill-bone/50 font-mono" fontSize="13">{ue.name}</text>
            </g>
            <g>
              <rect x="30" y="170" width="202" height="84" className="fill-none stroke-bone/25" strokeWidth="1" />
              <text x="52" y="214" className="fill-bone font-display" fontSize="30" letterSpacing="1">{us.code}</text>
              <text x="52" y="238" className="fill-bone/50 font-mono" fontSize="13">{us.name}</text>
            </g>

            {/* Plazos sobre cada trazo */}
            <text x="491" y="96" textAnchor="middle" className="fill-bone/70 font-mono" fontSize="13">{ue.transit}</text>
            <text x="491" y="198" textAnchor="middle" className="fill-bone/70 font-mono" fontSize="13">{us.transit}</text>

            {/* Destino */}
            <g>
              <rect x="758" y="98" width="212" height="84" className="fill-none stroke-port/70" strokeWidth="1" />
              <text x="782" y="142" className="fill-port font-display" fontSize="30" letterSpacing="1">ES</text>
              <text x="782" y="166" className="fill-port/70 font-mono" fontSize="13">{markets.destination}</text>
            </g>
          </svg>
          <figcaption className="label border-t border-bone/15 px-5 py-3">{markets.diagramCaption}</figcaption>
        </figure>

        <div className="grid gap-px border border-bone/15 bg-bone/15 md:grid-cols-2">
          {markets.routes.map((r, i) => (
            <motion.article
              key={r.code}
              initial={reduced ? false : { opacity: 0, y: 16 }}
              whileInView={reduced ? undefined : { opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-10% 0px" }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1], delay: i * 0.06 }}
              className="bg-graphite p-8 md:p-10"
            >
              <div className="flex items-baseline justify-between gap-4">
                <span className="font-mono text-[11px] text-port">{r.code}</span>
                <span className="font-mono text-[10px] uppercase tracking-label text-bone/40">{r.eu ? "UE" : "No UE"}</span>
              </div>
              <h3 className="display mt-4 text-[8vw] leading-none md:text-[2.6vw]">{r.name}</h3>
              <p className="mt-5 max-w-[42ch] text-[14px] leading-[1.55] text-bone/60">{r.note}</p>
              <dl className="mt-8 border-t border-bone/15">
                <Row k={markets.labels.transit} v={r.transit} accent />
                <Row k={markets.labels.duty} v={r.duty} />
                <Row k={markets.labels.approval} v={r.approval} />
                <Row k={markets.labels.sourcing} v={r.sourcing} />
              </dl>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}

function Row({ k, v, accent = false }: { k: string; v: string; accent?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-6 border-b border-bone/15 py-3.5">
      <dt className="font-mono text-[10px] uppercase tracking-label text-bone/40">{k}</dt>
      <dd className={`text-right font-mono text-[12px] ${accent ? "text-port" : "text-bone/80"}`}>{v}</dd>
    </div>
  );
}
