import { useEffect, useState } from "react";
import { copy } from "../content";
import Logo from "./Logo";

/**
 * Barra fija con dos estados: sobre la portada (fondo oscuro, texto en hueso)
 * y ya desplazada (fondo papel, texto en tinta). El cambio ocurre al pasar el
 * 60% de la primera pantalla, que es donde acaba el video.
 *
 * En movil los enlaces no caben en la barra, asi que van en un panel a
 * pantalla completa.
 */
export default function Nav() {
  const { nav } = copy;
  const [solid, setSolid] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setSolid(window.scrollY > window.innerHeight * 0.6);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
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

  // Sobre la portada el texto va claro; con la barra solida, oscuro.
  const onDark = !solid;
  const linkCls = onDark
    ? "font-mono text-[10px] uppercase tracking-label text-bone/70 transition-colors hover:text-port"
    : "font-mono text-[10px] uppercase tracking-label text-steel transition-colors hover:text-graphite";
  // En movil comparte fila con el boton de menu: etiqueta corta y menos cuerpo.
  const ctaBase =
    "inline-flex items-center gap-2 px-3 py-2 font-mono text-[9px] uppercase tracking-label transition-transform duration-300 hover:-translate-y-0.5 md:gap-2 md:px-5 md:py-2.5 md:text-[10px]";
  const ctaCls = `${ctaBase} ${onDark ? "bg-bone text-graphite" : "bg-graphite text-bone"}`;

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${
        solid ? "border-b border-steel/20 bg-bone/85 backdrop-blur-md" : "border-b border-transparent bg-transparent"
      }`}
    >
      <a href="#proceso" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:bg-graphite focus:px-4 focus:py-2 focus:font-mono focus:text-[11px] focus:text-bone">
        Saltar al contenido
      </a>

      <nav aria-label="Principal" className="mx-auto flex w-full max-w-[1440px] items-center justify-between px-5 py-4 md:px-10 md:py-5">
        <a href="#inicio" className={`flex items-baseline ${onDark ? "text-bone" : "text-graphite"}`}>
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
            className={`inline-flex h-10 w-10 items-center justify-center border transition-colors md:hidden ${
              onDark ? "border-bone/30 text-bone" : "border-steel/40 text-graphite"
            }`}
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
