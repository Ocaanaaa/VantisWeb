import { useState } from "react";
import { copy } from "../content";

/**
 * Bloque sobrio a propósito: sin reveals, sin paralaje, sin tilt. El selector
 * atenúa al instante las filas que no aplican. Es el bloque que genera confianza.
 */
export default function Costs() {
  const { costs } = copy;
  const [eu, setEu] = useState(false);

  return (
    <section id="coste" className="bg-bone py-20 md:py-28">
      <div className="mx-auto w-full max-w-[1440px] px-5 md:px-10">
        <header className="grid-page mb-12 items-end">
          <div className="col-span-4 md:col-span-6">
            <p className="label mb-5">{costs.eyebrow}</p>
            <h2 className="display text-[13vw] md:text-[5.4vw]">{costs.title}</h2>
          </div>
          <p className="col-span-4 mt-6 max-w-[44ch] text-[14px] leading-[1.55] text-steel md:col-span-5 md:col-start-8 md:mt-0">{costs.body}</p>
        </header>

        <div className="mb-8 flex flex-wrap items-center gap-4">
          <span className="label">{costs.toggle.label}</span>
          <div role="radiogroup" aria-label={costs.toggle.label} className="inline-flex border border-steel/40">
            <Toggle active={eu} onClick={() => setEu(true)}>{costs.toggle.eu}</Toggle>
            <Toggle active={!eu} onClick={() => setEu(false)}>{costs.toggle.nonEu}</Toggle>
          </div>
        </div>

        <table className="w-full border-collapse text-left">
          <caption className="sr-only">{costs.title}</caption>
          <thead>
            <tr className="border-y border-graphite/25">
              <th scope="col" className="label py-3 font-normal">{costs.columns.concept}</th>
              <th scope="col" className="label py-3 text-right font-normal md:text-left">{costs.columns.rate}</th>
            </tr>
          </thead>
          <tbody>
            {costs.rows.map((row) => {
              const applies = eu ? row.appliesEu : true;
              return (
                <tr key={row.id} className={`border-b border-steel/20 align-baseline ${applies ? "opacity-100" : "opacity-30"}`}>
                  <th scope="row" className="py-5 pr-6 text-[14px] font-normal leading-[1.4] text-graphite md:w-[46%] md:text-[15px]">{row.concept}</th>
                  <td className="py-5 text-right font-mono text-[12px] leading-[1.5] text-graphite md:text-left md:text-[13px]">
                    {applies ? row.rate : <span className="text-steel">{costs.notApplicable}</span>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <p className="mt-8 max-w-[70ch] font-mono text-[10px] leading-[1.7] text-steel">{costs.legal}</p>
      </div>
    </section>
  );
}

function Toggle({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" role="radio" aria-checked={active} onClick={onClick}
      className={`px-5 py-3 font-mono text-[10px] uppercase tracking-label transition-colors duration-150 ${active ? "bg-graphite text-bone" : "bg-transparent text-steel hover:text-graphite"}`}>
      {children}
    </button>
  );
}
