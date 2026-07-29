import { useRef } from "react";
import { motion } from "framer-motion";
import { copy, details, images, type ImageAsset } from "../content";
import { useReducedMotion, finePointer } from "../lib/motion";

const CARD_IMAGES = [images.master, images.cabin, images.wheelArch, images.rearThreeQuarter, details.brake, images.seat];

type Item = { id: string; title: string; origin: string; km: string; weeks: string; vin: string };
type Labels = { origin: string; km: string; weeks: string; vin: string };

/** Las tarjetas se inclinan en 3D al hover. Sin inclinación en táctil ni reduced-motion. */
export default function Deliveries() {
  const { deliveries } = copy;
  return (
    <section id="entregas" className="relative bg-bone py-20 md:py-28">
      <div className="mx-auto w-full max-w-[1440px] px-5 md:px-10">
        <header className="grid-page mb-12 items-end md:mb-16">
          <div className="col-span-4 md:col-span-7">
            <p className="label mb-5">{deliveries.eyebrow}</p>
            <h2 className="display text-[13vw] md:text-[5.4vw]">{deliveries.title}</h2>
          </div>
          <p className="col-span-4 mt-6 max-w-[40ch] text-[14px] leading-[1.5] text-steel md:col-span-4 md:col-start-9 md:mt-0">{deliveries.body}</p>
        </header>
        <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {deliveries.items.map((item, i) => (
            <TiltCard key={item.id} item={item} img={CARD_IMAGES[i % CARD_IMAGES.length]} labels={deliveries.cardLabels} />
          ))}
        </ul>
      </div>
    </section>
  );
}

function TiltCard({ item, img, labels }: { item: Item; img: ImageAsset; labels: Labels }) {
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();

  const onMove = (e: React.PointerEvent) => {
    if (reduced || !finePointer()) return;
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    el.style.transform = `perspective(900px) rotateX(${py * -7}deg) rotateY(${px * 9}deg) translateZ(0)`;
  };
  const reset = () => {
    if (ref.current) ref.current.style.transform = "perspective(900px) rotateX(0deg) rotateY(0deg)";
  };

  return (
    <motion.li
      initial={reduced ? false : { opacity: 0, y: 22 }}
      whileInView={reduced ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-12% 0px" }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      className="group"
    >
      <article
        ref={ref}
        onPointerMove={onMove}
        onPointerLeave={reset}
        tabIndex={0}
        data-cursor="grow"
        className="h-full border border-steel/25 bg-bone transition-[border-color,transform] duration-300 will-change-transform hover:border-graphite focus-visible:border-graphite"
        style={{ transform: "perspective(900px)" }}
      >
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-graphite">
          <img src={img.src} alt={img.alt} width={img.w} height={img.h} loading="lazy" decoding="async" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]" />
          <span className="absolute left-0 top-0 bg-graphite px-3 py-2 font-mono text-[10px] tracking-[0.12em] text-bone">{item.id}</span>
        </div>
        <div className="p-5 md:p-6">
          <h3 className="display text-[6.5vw] leading-none sm:text-[2.6vw] lg:text-[1.6vw]">{item.title}</h3>
          <dl className="mt-5 space-y-2">
            <Row label={labels.origin} value={item.origin} />
            <Row label={labels.km} value={item.km} mono />
            <Row label={labels.weeks} value={item.weeks} mono />
            <Row label={labels.vin} value={item.vin} mono />
          </dl>
        </div>
      </article>
    </motion.li>
  );
}

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-t border-steel/15 pt-2">
      <dt className="label">{label}</dt>
      <dd className={mono ? "font-mono text-[11px] tracking-[0.06em] text-graphite" : "text-[13px] text-graphite"}>{value}</dd>
    </div>
  );
}
