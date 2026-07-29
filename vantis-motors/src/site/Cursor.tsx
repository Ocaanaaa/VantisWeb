import { useEffect, useRef } from "react";
import { useMotion, finePointer } from "../lib/motion";

/** Anillo fino que se encoge y toma el acento sobre elementos interactivos. */
export default function Cursor() {
  const dot = useRef<HTMLSpanElement>(null);
  const ring = useRef<HTMLSpanElement>(null);
  const { reduced, resolved } = useMotion();

  useEffect(() => {
    if (!resolved || reduced || !finePointer()) return;
    document.documentElement.classList.add("has-custom-cursor");
    const pos = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const ringPos = { ...pos };
    let raf = 0;

    const onMove = (e: PointerEvent) => {
      pos.x = e.clientX;
      pos.y = e.clientY;
      const interactive = (e.target as HTMLElement)?.closest?.(
        'a, button, input, textarea, select, [role="button"], [data-cursor="grow"]',
      );
      ring.current?.classList.toggle("is-active", Boolean(interactive));
    };
    const tick = () => {
      ringPos.x += (pos.x - ringPos.x) * 0.35;
      ringPos.y += (pos.y - ringPos.y) * 0.35;
      if (dot.current) dot.current.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0)`;
      if (ring.current) ring.current.style.transform = `translate3d(${ringPos.x}px, ${ringPos.y}px, 0)`;
      raf = requestAnimationFrame(tick);
    };
    const onLeave = () => ring.current?.classList.add("is-hidden");
    const onEnter = () => ring.current?.classList.remove("is-hidden");

    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerleave", onLeave);
    document.addEventListener("pointerenter", onEnter);
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", onLeave);
      document.removeEventListener("pointerenter", onEnter);
      document.documentElement.classList.remove("has-custom-cursor");
    };
  }, [reduced, resolved]);

  if (reduced) return null;
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-[100] hidden md:block">
      <span ref={dot} className="absolute -left-[2px] -top-[2px] block h-1 w-1 rounded-full bg-port will-change-transform" />
      <span ref={ring} className="cursor-ring absolute -left-4 -top-4 block h-8 w-8 rounded-full border border-graphite/40 will-change-transform" />
    </div>
  );
}
