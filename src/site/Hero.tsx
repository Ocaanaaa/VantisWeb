import { useEffect, useRef } from "react";
import gsap from "gsap";
import { copy, film } from "../content";
import { useMotion, finePointer } from "../lib/motion";
import { useBackgroundVideo } from "../lib/backgroundVideo";

/**
 * Portada con el clip de fondo, en bucle y silenciado, y la tipografia encima.
 *
 * Sustituye al coche recortado sobre fondo claro. Al pasar a fondo oscuro toda
 * la seccion cambia de piel: el texto va en hueso y el acento en oro 500
 * (5,9:1 sobre azul noche) en vez del oro oscuro, que es justo al reves --
 * ese solo se usa sobre fondo claro.
 *
 * El arranque del clip lo lleva useBackgroundVideo: en movil `autoPlay` a secas
 * no basta y hace falta reintentar. Ahi esta explicado el porque.
 */
export default function Hero() {
  const { hero } = copy;
  const root = useRef<HTMLElement>(null);
  const type = useRef<HTMLHeadingElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const { reduced, resolved } = useMotion();

  useEffect(() => {
    if (!resolved || reduced || !root.current) return;
    const ctx = gsap.context(() => {
      gsap.from("[data-hero-line]", { yPercent: 108, duration: 0.72, ease: "expo.out", stagger: 0.055, delay: 0.12 });
      gsap.from("[data-hero-meta]", { opacity: 0, y: 14, duration: 0.5, ease: "power3.out", stagger: 0.06, delay: 0.42 });
    }, root);
    return () => ctx.revert();
  }, [reduced, resolved]);

  /* Paralaje corto de la tipografia con el puntero. Sin puntero fino no se
     activa: en tactil no hay hover y solo gastaria bateria. */
  useEffect(() => {
    if (!resolved || reduced || !finePointer()) return;
    const qx = gsap.quickTo(type.current, "x", { duration: 0.6, ease: "power3.out" });
    const qy = gsap.quickTo(type.current, "y", { duration: 0.6, ease: "power3.out" });
    const onMove = (e: PointerEvent) => {
      qx(((e.clientX / window.innerWidth) * 2 - 1) * -12);
      qy(((e.clientY / window.innerHeight) * 2 - 1) * -7);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [reduced, resolved]);

  useBackgroundVideo(video, resolved && !reduced);

  return (
    <section
      ref={root}
      id="inicio"
      className="relative isolate flex min-h-[100svh] w-full flex-col justify-center overflow-hidden bg-graphite pb-20 pt-28 text-bone md:pb-24"
    >
      <div className="absolute inset-0 -z-10">
        {resolved && !reduced ? (
          <video
            ref={video}
            src={film.src}
            poster={film.poster}
            width={film.w}
            height={film.h}
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            aria-hidden="true"
            className="h-full w-full object-cover"
          />
        ) : (
          <img src={film.poster} alt="" aria-hidden="true" className="h-full w-full object-cover" />
        )}
        {/* Capa plana para asegurar el contraste del texto, y una degradada
            para que el clip respire por el centro. */}
        <div className="absolute inset-0 bg-graphite/72" />
        <div className="absolute inset-0 bg-gradient-to-t from-graphite via-transparent to-graphite/85" />
      </div>

      <div className="relative z-20 mx-auto w-full max-w-[1440px] px-5 md:px-10">
        <div className="grid-page items-end">
          <div className="col-span-4 md:col-span-8">
            <p data-hero-meta className="label mb-6 text-bone/60 md:mb-10">{hero.eyebrow}</p>
            <h1 ref={type} className="display text-[13.5vw] md:text-[8vw] xl:text-[118px]">
              {/* El enmascarado que hace posible la entrada de cada linea recorta
                  por arriba, y ahi viven las tildes de las mayusculas (AQUÍ). El
                  padding da ese aire y el margen negativo lo descuenta, asi que
                  la reticula no se mueve. */}
              {hero.headline.map((line) => (
                <span key={line} className="-mt-[0.16em] block overflow-hidden pt-[0.16em]">
                  <span data-hero-line className="block">{line}</span>
                </span>
              ))}
              <span className="-mt-[0.16em] block overflow-hidden pt-[0.16em]">
                <span data-hero-line className="block text-port">{hero.headlineAccent}</span>
              </span>
            </h1>
          </div>

          <div className="col-span-4 mt-10 md:col-span-4 md:col-start-9 md:mt-0">
            <p data-hero-meta className="max-w-[46ch] text-[15px] leading-[1.5] text-bone/70">{hero.body}</p>
            <div data-hero-meta className="mt-8 flex flex-wrap items-center gap-3">
              <a href="#encargo" className="group inline-flex items-center gap-3 bg-bone px-6 py-4 font-mono text-[11px] uppercase tracking-label text-graphite transition-transform duration-300 hover:-translate-y-0.5">
                {hero.ctaPrimary}
                <span className="inline-block h-px w-6 bg-port-ink transition-all duration-300 group-hover:w-9" />
              </a>
              <a href="#proceso" className="inline-flex items-center gap-3 border border-bone/35 px-6 py-4 font-mono text-[11px] uppercase tracking-label text-bone transition-colors duration-300 hover:border-port hover:text-port">
                {hero.ctaSecondary}
              </a>
            </div>
            <div data-hero-meta className="mt-10 flex items-baseline gap-4 border-t border-bone/20 pt-4">
              <span className="label text-bone/50">{hero.plateLabel}</span>
              <span className="font-mono text-[13px] tracking-[0.12em] text-bone">{hero.plateValue}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-6 z-20 mx-auto hidden max-w-[1440px] items-center gap-3 px-5 md:flex md:px-10">
        <span className="label text-bone/50">{hero.scrollHint}</span>
        <span className="h-px w-16 bg-bone/30" />
      </div>
    </section>
  );
}
