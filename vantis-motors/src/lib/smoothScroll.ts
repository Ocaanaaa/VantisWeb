import { useEffect } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useMotion } from "./motion";

let registered = false;
/** Registro client-only: la página se renderiza en servidor. */
export function ensureScrollTrigger() {
  if (!registered && typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
    registered = true;
  }
  return ScrollTrigger;
}

/**
 * Lenis conduce el scroll y alimenta el ticker de GSAP, así ScrollTrigger y el
 * smooth scroll comparten reloj. Con prefers-reduced-motion se desactiva.
 */
export function useSmoothScroll() {
  const { reduced, resolved } = useMotion();
  useEffect(() => {
    ensureScrollTrigger();
    if (!resolved) return;
    if (reduced) {
      ScrollTrigger.refresh();
      return;
    }
    const lenis = new Lenis({ duration: 0.9, easing: (t: number) => 1 - Math.pow(1 - t, 3), smoothWheel: true });
    lenis.on("scroll", ScrollTrigger.update);
    const raf = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement)?.closest?.('a[href^="#"]');
      if (!a) return;
      const id = a.getAttribute("href");
      if (!id || id === "#") return;
      const el = document.querySelector(id);
      if (!el) return;
      e.preventDefault();
      lenis.scrollTo(el as HTMLElement, { offset: 0 });
    };
    document.addEventListener("click", onClick);
    ScrollTrigger.refresh();
    return () => {
      document.removeEventListener("click", onClick);
      gsap.ticker.remove(raf);
      lenis.destroy();
    };
  }, [reduced, resolved]);
}
export { gsap, ScrollTrigger };
