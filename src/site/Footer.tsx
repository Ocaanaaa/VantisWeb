import { copy } from "../content";
import Logo from "./Logo";

export default function Footer() {
  const { footer } = copy;
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-bone/15 bg-graphite pb-10 pt-16 text-bone">
      <div className="mx-auto w-full max-w-[1440px] px-5 md:px-10">
        <div className="grid-page gap-y-10">
          <div className="col-span-4 md:col-span-5">
            <Logo className="block text-[9vw] md:text-[3vw]" />
            <p className="mt-4 max-w-[34ch] text-[13px] leading-[1.5] text-bone/55">{footer.tagline}</p>
            <p className="mt-6 max-w-[40ch] font-mono text-[10px] leading-[1.7] text-steel">{footer.note}</p>
          </div>
          <div className="col-span-2 md:col-span-3 md:col-start-8">
            <p className="label mb-4">Contacto</p>
            <a href={`mailto:${footer.email}`} className="block font-mono text-[11px] text-bone/80 hover:text-port">{footer.email}</a>
            <p className="mt-3 font-mono text-[11px] text-bone/55">{footer.address}</p>
          </div>
          <div className="col-span-2 md:col-span-2 md:col-start-11">
            <p className="label mb-4">Legal</p>
            <ul className="space-y-2">
              {footer.links.map((l) => (
                <li key={l.label}>
                  <a href={l.href} className="font-mono text-[11px] text-bone/55 transition-colors hover:text-bone">{l.label}</a>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="mt-16 flex flex-wrap items-center justify-between gap-4 border-t border-bone/15 pt-6">
          <p className="font-mono text-[10px] text-steel">© {year} {footer.legalName} · {footer.vat}</p>
          <p className="font-mono text-[10px] text-steel">{footer.rights}</p>
        </div>
      </div>
    </footer>
  );
}
