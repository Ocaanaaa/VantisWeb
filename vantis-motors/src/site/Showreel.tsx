import { useEffect, useRef, useState } from "react";
import { copy } from "../content";
import { film } from "../content/assets";

/**
 * Vitrina. El clip va de fondo, en bucle y silenciado, con el mensaje encima.
 *
 * Sustituye al antiguo bloque de scroll-scrub, que fijaba la seccion y
 * conmutaba tarjetas leyendo los timestamps del video. Aquel montaje dependia
 * de que el metraje tuviera exactamente cuatro cortes -- y tenia tres --, asi
 * que la ultima tarjeta caia siempre a mitad de plano. Aqui no hay nada que
 * sincronizar: el video solo es fondo, y la seccion se comporta como
 * cualquier otra al hacer scroll.
 */
export default function Showreel() {
  const { showreel } = copy;
  // null = aun sin resolver; no arrancamos el video hasta saberlo.
  const [reduced, setReduced] = useState<boolean | null>(null);
  const video = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduced(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  /* No basta con `autoPlay`: segun la politica de reproduccion del navegador
   * el clip puede quedarse en pausa aunque este silenciado. Lo arrancamos a
   * mano cuando la seccion entra en pantalla, y lo paramos al salir para no
   * decodificar video que nadie ve. */
  useEffect(() => {
    const el = video.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) void el.play().catch(() => {});
        else el.pause();
      },
      { threshold: 0.15 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [reduced]);

  return (
    <section id="film" aria-label={showreel.eyebrow} className="relative isolate overflow-hidden bg-graphite text-bone">
      <div className="absolute inset-0 -z-10">
        {reduced === false ? (
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
            preload="metadata"
            aria-hidden="true"
            className="h-full w-full object-cover"
          />
        ) : (
          <img src={film.poster} alt="" aria-hidden="true" className="h-full w-full object-cover" />
        )}
        {/* Dos capas: una plana para asegurar contraste del texto y otra
            degradada para que el video respire por el centro. */}
        <div className="absolute inset-0 bg-graphite/70" />
        <div className="absolute inset-0 bg-gradient-to-t from-graphite via-transparent to-graphite/80" />
      </div>

      <div className="mx-auto flex min-h-[66svh] w-full max-w-[1440px] flex-col justify-end px-5 py-24 md:px-10 md:py-32">
        <p className="label text-bone/60">{showreel.eyebrow}</p>
        <h2 className="display mt-5 max-w-[18ch] text-[11vw] md:text-[5vw]">{showreel.title}</h2>
        <p className="mt-6 max-w-[52ch] text-[15px] leading-[1.5] text-bone/70">{showreel.body}</p>
        <div className="mt-9 flex flex-wrap items-center gap-3">
          <a href="#encargo" className="group inline-flex items-center gap-3 bg-bone px-6 py-4 font-mono text-[11px] uppercase tracking-label text-graphite transition-transform duration-300 hover:-translate-y-0.5">
            {showreel.cta}
            <span className="inline-block h-px w-6 bg-port-ink transition-all duration-300 group-hover:w-9" />
          </a>
          <a href="#disponibles" className="inline-flex items-center gap-3 border border-bone/30 px-6 py-4 font-mono text-[11px] uppercase tracking-label text-bone transition-colors duration-300 hover:border-port hover:text-port">
            {showreel.ctaSecondary}
          </a>
        </div>
      </div>
    </section>
  );
}
