import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ensureScrollTrigger } from "../lib/smoothScroll";
import { copy, images } from "../content";
import { useMotion } from "../lib/motion";

const STEP_IMAGES = [images.master, images.rearThreeQuarter, images.wheelArch, images.cabin, images.wheelDash];

/** Imagen fijada a la izquierda; los pasos pasan por la derecha con corte seco. */
export default function HowItWorks() {
  const { how } = copy;
  const root = useRef<HTMLElement>(null);
  const layers = useRef<(HTMLImageElement | null)[]>([]);
  const { reduced, resolved } = useMotion();

  useEffect(() => {
    if (!resolved || reduced || !root.current) return;
    const ST = ensureScrollTrigger();
    const ctx = gsap.context(() => {
      const setActive = (i: number) => {
        layers.current.forEach((layer, j) => {
          if (layer) gsap.to(layer, { opacity: j === i ? 1 : 0, duration: 0.18, ease: "none" });
        });
        gsap.to("[data-step-progress]", { scaleY: (i + 1) / STEP_IMAGES.length, duration: 0.35, ease: "power3.out" });
      };

      ST.create({ trigger: "[data-pin-wrap]", start: "top top", end: "bottom bottom", pin: "[data-pin-target]", pinSpacing: false });

      gsap.utils.toArray<HTMLElement>("[data-step]").forEach((step, i) => {
        ST.create({ trigger: step, start: "top 60%", end: "bottom 60%", onToggle: (self) => { if (self.isActive) setActive(i); } });
        gsap.from(step, { opacity: 0, y: 26, duration: 0.55, ease: "power3.out", scrollTrigger: { trigger: step, start: "top 88%", once: true } });
      });
    }, root);
    return () => ctx.revert();
  }, [reduced, resolved]);

  return (
    <section ref={root} id="proceso" className="relative bg-bone py-20 md:py-28">
      <div className="mx-auto w-full max-w-[1440px] px-5 md:px-10">
        <header className="mb-14 md:mb-20">
          <p className="label mb-5">{how.eyebrow}</p>
          <h2 className="display max-w-[14ch] text-[9vw] md:text-[5.4vw]">{how.title}</h2>
        </header>

        <div data-pin-wrap className="grid-page relative items-start">
          <div className="col-span-4 md:col-span-6">
            <div data-pin-target className="relative hidden aspect-[4/5] w-full overflow-hidden bg-graphite md:block">
              {STEP_IMAGES.map((img, i) => (
                <img
                  key={img.id}
                  ref={(n) => { layers.current[i] = n; }}
                  src={img.src}
                  alt={img.alt}
                  width={img.w}
                  height={img.h}
                  loading="lazy"
                  decoding="async"
                  className="absolute inset-0 h-full w-full object-cover"
                  style={{ opacity: i === 0 ? 1 : 0 }}
                />
              ))}
              <div className="pointer-events-none absolute inset-0 border border-bone/10" />
              <div className="absolute bottom-0 left-0 h-full w-px bg-bone/15">
                <span data-step-progress className="block h-full w-full origin-top bg-port" style={{ transform: "scaleY(0.2)" }} />
              </div>
            </div>
          </div>

          <ol className="col-span-4 md:col-span-5 md:col-start-8">
            {how.steps.map((step, i) => (
              <li key={step.n} data-step className="border-t border-steel/25 py-8 first:border-t-0 md:py-14">
                <div className="mb-6 aspect-[16/10] w-full overflow-hidden bg-graphite md:hidden">
                  <img src={STEP_IMAGES[i].src} alt={STEP_IMAGES[i].alt} width={STEP_IMAGES[i].w} height={STEP_IMAGES[i].h} loading="lazy" decoding="async" className="h-full w-full object-cover" />
                </div>
                <div className="flex items-baseline gap-4">
                  <span className="font-mono text-[11px] text-port-ink">{step.n}</span>
                  <h3 className="display text-[8vw] md:text-[2.4vw]">{step.title}</h3>
                </div>
                <p className="mt-4 max-w-[44ch] text-[15px] leading-[1.55] text-steel">{step.body}</p>
                <p className="mt-4 font-mono text-[10px] uppercase tracking-label text-graphite">{step.data}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
