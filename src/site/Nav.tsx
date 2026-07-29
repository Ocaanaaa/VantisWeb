import { useEffect, useState } from "react";
import { copy } from "../content";
import Logo from "./Logo";

export default function Nav() {
  const { nav } = copy;
  const [solid, setSolid] = useState(false);
  useEffect(() => {
    const onScroll = () => setSolid(window.scrollY > window.innerHeight * 0.6);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${solid ? "border-b border-steel/20 bg-bone/85 backdrop-blur-md" : "border-b border-transparent bg-transparent"}`}>
      <a href="#proceso" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:bg-graphite focus:px-4 focus:py-2 focus:font-mono focus:text-[11px] focus:text-bone">
        Saltar al contenido
      </a>
      <nav aria-label="Principal" className="mx-auto flex w-full max-w-[1440px] items-center justify-between px-5 py-4 md:px-10 md:py-5">
        <a href="#inicio" className="flex items-baseline">
          <Logo className="text-[15px] md:text-[17px]" />
        </a>
        <ul className="hidden items-center gap-7 md:flex">
          {nav.links.map((l) => (
            <li key={l.id}>
              <a href={`#${l.id}`} className="font-mono text-[10px] uppercase tracking-label text-steel transition-colors hover:text-graphite">{l.label}</a>
            </li>
          ))}
        </ul>
        <a href="#encargo" className="inline-flex items-center gap-2 bg-graphite px-4 py-2.5 font-mono text-[10px] uppercase tracking-label text-bone transition-transform duration-300 hover:-translate-y-0.5 md:px-5">
          {nav.cta}
          <span className="inline-block h-px w-4 bg-port" />
        </a>
      </nav>
    </header>
  );
}
