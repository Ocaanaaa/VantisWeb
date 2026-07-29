import { Suspense, lazy, useEffect, useRef } from "react";
import gsap from "gsap";
import { copy, cutouts } from "../content";
import { useMotion, finePointer } from "../lib/motion";

const DepthField = lazy(() => import("./DepthField"));

/**
 * La tipografía y el coche recortado responden al puntero: paralaje en sentidos
 * opuestos y una banda de luz que barre la carrocería. Seco, corto, sin deriva.
 */
export default function Hero() {
  const { hero } = copy;
  const root = useRef<HTMLElement>(null);
  const carWrap = useRef<HTMLDivElement>(null);
  const type = useRef<HTMLHeadingElement>(null);
  const glare = useRef<HTMLDivElement>(null);
  const { reduced, resolved } = useMotion();

  useEffect(() => {
    if (!resolved || reduced || !root.current) return;
    const ctx = gsap.context(() => {
      gsap.from("[data-hero-line]", { yPercent: 108, duration: 0.72, ease: "expo.out", stagger: 0.055, delay: 0.12 });
      gsap.from("[data-hero-meta]", { opacity: 0, y: 14, duration: 0.5, ease: "power3.out", stagger: 0.06, delay: 0.42 });
      gsap.from("[data-hero-car]", { opacity: 0, scale: 1.06, duration: 0.9, ease: "expo.out", delay: 0.1 });
    }, root);
    return () => ctx.revert();
  }, [reduced, resolved]);

  useEffect(() => {
    if (!resolved || reduced || !finePointer()) return;
    const carQx = gsap.quickTo(carWrap.current, "x", { duration: 0.5, ease: "power3.out" });
    const carQy = gsap.quickTo(carWrap.current, "y", { duration: 0.5, ease: "power3.out" });
    const typeQx = gsap.quickTo(type.current, "x", { duration: 0.6, ease: "power3.out" });
    const typeQy = gsap.quickTo(type.current, "y", { duration: 0.6, ease: "power3.out" });

    const onMove = (e: PointerEvent) => {
      const nx = (e.clientX / window.innerWidth) * 2 - 1;
      const ny = (e.clientY / window.innerHeight) * 2 - 1;
      carQx(nx * 26); carQy(ny * 14);
      typeQx(nx * -12); typeQy(ny * -7);
      if (glare.current) {
        glare.current.style.setProperty("--gx", `${((nx + 1) / 2) * 100}%`);
        glare.current.style.setProperty("--gy", `${((ny + 1) / 2) * 100}%`);
      }
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [reduced, resolved]);

  const car = cutouts.car;

  return (
    <section ref={root} id="inicio" className="relative min-h-[100svh] w-full overflow-hidden bg-bone pb-16 pt-24 md:pb-0 md:pt-28">
      <Suspense fallback={null}><DepthField /></Suspense>

      <div className="relative z-20 mx-auto w-full max-w-[1440px] px-5 md:px-10">
        <div className="grid-page items-start">
          <div className="col-span-4 md:col-span-8">
            <p data-hero-meta className="label mb-6 md:mb-10">{hero.eyebrow}</p>
            <h1 ref={type} className="display text-[13.5vw] md:text-[8vw] xl:text-[118px]">
              {hero.headline.map((line) => (
                <span key={line} className="block overflow-hidden">
                  <span data-hero-line className="block">{line}</span>
                </span>
              ))}
              <span className="block overflow-hidden">
                <span data-hero-line className="block text-port-ink">{hero.headlineAccent}</span>
              </span>
            </h1>
          </div>

          <div className="col-span-4 mt-10 md:col-span-4 md:col-start-9 md:mt-24">
            <p data-hero-meta className="max-w-[46ch] text-[15px] leading-[1.5] text-steel">{hero.body}</p>
            <div data-hero-meta className="mt-8 flex flex-wrap items-center gap-3">
              <a href="#encargo" className="group inline-flex items-center gap-3 bg-graphite px-6 py-4 font-mono text-[11px] uppercase tracking-label text-bone transition-transform duration-300 hover:-translate-y-0.5">
                {hero.ctaPrimary}
                <span className="inline-block h-px w-6 bg-port transition-all duration-300 group-hover:w-9" />
              </a>
              <a href="#proceso" className="inline-flex items-center gap-3 border border-steel/40 px-6 py-4 font-mono text-[11px] uppercase tracking-label text-graphite transition-colors duration-300 hover:border-graphite">
                {hero.ctaSecondary}
              </a>
            </div>
            <div data-hero-meta className="rule mt-10 flex items-baseline gap-4 pt-4">
              <span className="label">{hero.plateLabel}</span>
              <span className="font-mono text-[13px] tracking-[0.12em] text-graphite">{hero.plateValue}</span>
            </div>
          </div>
        </div>
      </div>

      {/* En móvil el coche ocupa su propia banda; desde md pasa a fondo abajo a la derecha. */}
      <div ref={carWrap} data-hero-car className="pointer-events-none relative z-10 mt-10 w-full will-change-transform md:absolute md:bottom-0 md:right-0 md:mt-0 md:w-[58%]">
        <div ref={glare} className="relative w-full">
          <img src={car.src} alt={car.alt} width={car.w} height={car.h} decoding="async" className="h-auto w-full select-none object-contain" />
          <span aria-hidden="true" className="glare-sheet" />
        </div>
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-6 z-20 mx-auto hidden max-w-[1440px] items-center gap-3 px-5 md:flex md:px-10">
        <span className="label">{hero.scrollHint}</span>
        <span className="h-px w-16 bg-steel/40" />
      </div>
    </section>
  );
}
