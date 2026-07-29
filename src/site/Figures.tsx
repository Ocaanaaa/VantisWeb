import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ensureScrollTrigger } from "../lib/smoothScroll";
import { copy } from "../content";
import { useMotion } from "../lib/motion";

/** Cuentan hacia arriba al entrar en viewport, una sola vez. */
export default function Figures() {
  const { figures } = copy;
  return (
    <section aria-label={figures.title} className="relative z-20 border-y border-steel/20 bg-bone py-14 md:py-20">
      <div className="mx-auto w-full max-w-[1440px] px-5 md:px-10">
        <p className="label mb-10">{figures.title}</p>
        <ul className="grid-page gap-y-12">
          {figures.items.map((item, i) => (
            <li key={item.id} className="col-span-4 md:col-span-3">
              <Counter value={item.value} suffix={item.suffix} index={i} />
              <p className="mt-4 max-w-[24ch] text-[13px] leading-[1.45] text-graphite">{item.label}</p>
              <p className="mt-2 max-w-[26ch] font-mono text-[10px] leading-[1.5] text-steel">{item.note}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function Counter({ value, suffix, index }: { value: number; suffix: string; index: number }) {
  const el = useRef<HTMLParagraphElement>(null);
  const { reduced, resolved } = useMotion();
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!resolved) return;
    if (reduced) { setDisplay(value); return; }
    const ST = ensureScrollTrigger();
    const node = el.current;
    if (!node) return;
    const obj = { n: 0 };
    const st = ST.create({
      trigger: node,
      start: "top 85%",
      once: true,
      onEnter: () => {
        gsap.to(obj, { n: value, duration: 1, ease: "expo.out", delay: index * 0.06, onUpdate: () => setDisplay(Math.round(obj.n)) });
      },
    });
    return () => st.kill();
  }, [value, index, reduced, resolved]);

  return (
    <p ref={el} className="display flex items-baseline text-[15vw] leading-none md:text-[4.4vw]">
      <span className="tabular-nums">{display}</span>
      {suffix ? <span className="text-port-ink">{suffix}</span> : null}
    </p>
  );
}
