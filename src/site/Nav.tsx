import { useEffect, useRef, useState } from "react";
import { copy } from "../content";
import Logo from "./Logo";

/**
 * Barra fija con dos estados: en lo alto de la portada va transparente sobre el
 * video, y en cuanto empieza el scroll pasa a fondo papel con texto en tinta.
 *
 * En movil los enlaces no caben en la barra, asi que van en un panel a
 * pantalla completa.
 */
/** Recorrido en px sobre el que la barra pasa de transparente a opaca. Corto a
 *  proposito: el cambio acompana al primer gesto de scroll, no a media portada. */
const RAMP = 140;
export default function Nav() {
  const { nav } = copy;
  const header = useRef<HTMLElement>(null);
  const [open, setOpen] = useState(false);
  // El relleno del boton se invierte (claro sobre oscuro -> oscuro sobre claro).
  // Eso si conmuta, porque interpolarlo pasaria por un gris donde el texto
  // desapareceria. El resto de la barra si va progresivo.
  const [solid, setSolid] = useState(false);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const p = Math.min(1, window.scrollY / RAMP);
      // Se escribe en el nodo, no en el estado: un render por fotograma de
      // scroll seria tirar trabajo a la basura.
      header.current?.style.setProperty("--nav-p", String(p));
      setSolid(p >= 0.5);
    };
    const onScroll = () => { if (!frame) frame = requestAnimationFrame(update); };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  // Con el panel abierto, el fondo no debe poder desplazarse.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const onDark = !solid;
  const linkCls = "nav-link font-mono text-[10px] uppercase tracking-label";
  // En movil comparte fila con el boton de menu: etiqueta corta y menos cuerpo.
  const ctaBase =
    "inline-flex items-center gap-2 px-3 py-2 font-mono text-[9px] uppercase tracking-label transition-transform duration-300 hover:-translate-y-0.5 md:gap-2 md:px-5 md:py-2.5 md:text-[10px]";
  const ctaCls = `${ctaBase} transition-colors ${onDark ? "bg-bone text-graphite" : "bg-graphite text-bone"}`;

  return (
    <header ref={header} className="nav-shell fixed inset-x-0 top-0 z-50">
      <a href="#proceso" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:bg-graphite focus:px-4 focus:py-2 focus:font-mono focus:text-[11px] focus:text-bone">
        Saltar al contenido
      </a>

      <nav aria-label="Principal" className="mx-auto flex w-full max-w-[1440px] items-center justify-between px-5 py-4 md:px-10 md:py-5">
        <a href="#inicio" className="nav-ink flex items-baseline">
          <Logo className="text-[15px] md:text-[17px]" />
        </a>

        <ul className="hidden items-center gap-7 md:flex">
          {nav.links.map((l) => (
            <li key={l.id}>
              <a href={`#${l.id}`} className={linkCls}>{l.label}</a>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-3">
          <a href="#encargo" className={ctaCls}>
            <span className="md:hidden">{nav.ctaShort}</span>
            <span className="hidden md:inline">{nav.cta}</span>
            {/* La rayita solo desde md: en movil roba ancho sin aportar. */}
            <span className="hidden h-px w-4 bg-port md:inline-block" />
          </a>

          {/* Solo en movil: los enlaces no caben en la barra. */}
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label={nav.menuOpen}
            aria-expanded={open}
            aria-controls="menu-movil"
            className="nav-edge nav-ink inline-flex h-10 w-10 items-center justify-center border md:hidden"
          >
            <span aria-hidden="true" className="flex w-4 flex-col gap-[3px]">
              <span className="block h-px w-full bg-current" />
              <span className="block h-px w-full bg-current" />
              <span className="block h-px w-full bg-current" />
            </span>
          </button>
        </div>
      </nav>

      {/* Panel a pantalla completa. Se desmonta al cerrar: nada que tabular detras. */}
      {open ? (
        <div id="menu-movil" className="fixed inset-0 z-50 flex flex-col bg-graphite text-bone md:hidden">
          <div className="flex items-center justify-between border-b border-bone/15 px-5 py-4">
            <Logo className="text-[15px]" />
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label={nav.menuClose}
              autoFocus
              className="inline-flex h-10 w-10 items-center justify-center border border-bone/30 text-bone"
            >
              <span aria-hidden="true" className="relative block h-4 w-4">
                <span className="absolute left-0 top-1/2 block h-px w-full rotate-45 bg-current" />
                <span className="absolute left-0 top-1/2 block h-px w-full -rotate-45 bg-current" />
              </span>
            </button>
          </div>

          <nav aria-label="Secciones" className="flex-1 overflow-y-auto px-5 py-8">
            <ul className="flex flex-col">
              {nav.links.map((l, i) => (
                <li key={l.id} className="border-b border-bone/15">
                  <a
                    href={`#${l.id}`}
                    onClick={() => setOpen(false)}
                    className="flex items-baseline gap-4 py-5 transition-colors hover:text-port"
                  >
                    <span className="font-mono text-[11px] text-port">{String(i + 1).padStart(2, "0")}</span>
                    <span className="display text-[9vw] leading-none">{l.label}</span>
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="border-t border-bone/15 px-5 py-6">
            <a
              href="#encargo"
              onClick={() => setOpen(false)}
              className="group flex w-full items-center justify-between gap-3 bg-bone px-6 py-4 font-mono text-[11px] uppercase tracking-label text-graphite"
            >
              {nav.cta}
              <span className="inline-block h-px w-6 bg-port-ink transition-all duration-300 group-hover:w-9" />
            </a>
          </div>
        </div>
      ) : null}
    </header>
  );
}
