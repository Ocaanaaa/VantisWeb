import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  calcularImportacion,
  euros,
  SUPUESTOS,
  type Entrada,
  type Origen,
  type RegimenIva,
} from "../lib/importCost";

/**
 * Herramienta interna: metes los datos de un anuncio y te dice si la unidad
 * merece la pena.
 *
 * NO ESTÁ PROTEGIDA. Es una URL sin enlazar y marcada como noindex, pero
 * cualquiera que la adivine puede abrirla. No pongas aquí nada confidencial
 * hasta que tenga autenticación de verdad.
 */
export const Route = createFileRoute("/interno/tasador")({
  head: () => ({
    meta: [
      { title: "Tasador interno — Vantis Motors" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: Tasador,
});

const CAMPOS_INICIALES = {
  precioOrigen: "46900",
  co2: "168",
  precioMercadoEs: "58000",
  baseIedmt: "",
};

function Tasador() {
  const [campos, setCampos] = useState(CAMPOS_INICIALES);
  const [origen, setOrigen] = useState<Origen>("ue");
  const [regimenIva, setRegimenIva] = useState<RegimenIva>("margen");

  const num = (v: string) => {
    const n = Number(v.replace(/[^\d.,-]/g, "").replace(",", "."));
    return Number.isFinite(n) ? n : 0;
  };

  const entrada: Entrada = {
    precioOrigen: num(campos.precioOrigen),
    co2: num(campos.co2),
    precioMercadoEs: num(campos.precioMercadoEs),
    origen,
    regimenIva,
    baseIedmt: campos.baseIedmt.trim() ? num(campos.baseIedmt) : undefined,
  };
  const r = calcularImportacion(entrada);

  return (
    <main className="min-h-dvh bg-bone py-14">
      <div className="mx-auto w-full max-w-[1100px] px-5 md:px-10">
        <p className="label">Uso interno</p>
        <h1 className="display mt-3 text-[9vw] leading-none md:text-[3.4vw]">Tasador de importación</h1>
        <p className="mt-5 max-w-[62ch] text-[15px] leading-[1.5] text-steel">
          Introduce los datos del anuncio y calcula el coste puesto en España y el ahorro frente
          a comprar el equivalente aquí. El veredicto usa el <strong>peor</strong> caso de honorarios.
        </p>

        <div className="mt-12 grid gap-10 lg:grid-cols-2 lg:gap-14">
          {/* --- Entrada --- */}
          <section className="flex flex-col gap-5">
            <Campo
              etiqueta="Precio en origen (€)"
              valor={campos.precioOrigen}
              onChange={(v) => setCampos({ ...campos, precioOrigen: v })}
            />
            <Campo
              etiqueta="Emisiones CO₂ (g/km, WLTP)"
              valor={campos.co2}
              onChange={(v) => setCampos({ ...campos, co2: v })}
              ayuda="Determina el tramo del impuesto de matriculación."
            />
            <Campo
              etiqueta="Precio de mercado en España (€)"
              valor={campos.precioMercadoEs}
              onChange={(v) => setCampos({ ...campos, precioMercadoEs: v })}
              ayuda="Lo que cuesta un equivalente aquí. Es la referencia del ahorro."
            />
            <Campo
              etiqueta="Base del IEDMT (€) — opcional"
              valor={campos.baseIedmt}
              onChange={(v) => setCampos({ ...campos, baseIedmt: v })}
              ayuda="Valor de tablas del ministerio menos depreciación. Si se deja vacío se usa el precio de compra y el impuesto sale alto."
            />

            <Grupo etiqueta="Origen">
              <Opcion activa={origen === "ue"} onClick={() => setOrigen("ue")}>Unión Europea</Opcion>
              <Opcion activa={origen === "extraUe"} onClick={() => setOrigen("extraUe")}>Fuera de la UE</Opcion>
            </Grupo>

            <Grupo etiqueta="Régimen de IVA">
              <Opcion activa={regimenIva === "margen"} onClick={() => setRegimenIva("margen")}>Margen</Opcion>
              <Opcion activa={regimenIva === "intracomunitario"} onClick={() => setRegimenIva("intracomunitario")}>Intracom.</Opcion>
              <Opcion activa={regimenIva === "nuevo"} onClick={() => setRegimenIva("nuevo")}>Transporte nuevo</Opcion>
            </Grupo>
            <p className="font-mono text-[10px] leading-[1.7] text-steel">
              «Transporte nuevo»: menos de 6 meses <em>o</em> menos de 6.000 km. Entonces el 21 % se
              paga en España sí o sí.
            </p>
          </section>

          {/* --- Resultado --- */}
          <section>
            <div className={`border p-6 ${r.merecePena ? "border-port bg-port/5" : "border-danger/50 bg-danger/5"}`}>
              <p className="label">{r.merecePena ? "Merece la pena" : "No sale a cuenta"}</p>
              <p className="display mt-2 text-[30px] leading-none">
                {euros(r.ahorroMin)} – {euros(r.ahorroMax)}
              </p>
              <p className="mt-2 font-mono text-[11px] text-steel">
                Ahorro para el cliente · {r.ahorroPctMin.toFixed(1)}% – {r.ahorroPctMax.toFixed(1)}%
              </p>
            </div>

            <dl className="mt-8 border-t border-steel/25">
              {r.conceptos.map((c) => (
                <div key={c.clave} className="flex items-baseline justify-between gap-6 border-b border-steel/25 py-3">
                  <dt className="text-[13px] text-graphite">
                    {c.etiqueta}
                    {c.detalle ? (
                      <span className="mt-0.5 block font-mono text-[10px] text-steel">{c.detalle}</span>
                    ) : null}
                  </dt>
                  <dd className="shrink-0 font-mono text-[13px] tabular-nums text-graphite">{euros(c.importe)}</dd>
                </div>
              ))}
              <div className="flex items-baseline justify-between gap-6 border-b border-steel/25 py-3">
                <dt className="font-mono text-[10px] uppercase tracking-label text-steel">Subtotal sin honorarios</dt>
                <dd className="font-mono text-[13px] tabular-nums text-graphite">{euros(r.subtotal)}</dd>
              </div>
              <div className="flex items-baseline justify-between gap-6 border-b border-steel/25 py-3">
                <dt className="text-[13px] text-graphite">
                  Honorarios Vantis
                  <span className="mt-0.5 block font-mono text-[10px] text-steel">
                    {euros(SUPUESTOS.honorariosMin)} – {euros(SUPUESTOS.honorariosMax)}
                  </span>
                </dt>
                <dd className="shrink-0 font-mono text-[13px] tabular-nums text-graphite">
                  {euros(SUPUESTOS.honorariosMin)} – {euros(SUPUESTOS.honorariosMax)}
                </dd>
              </div>
              <div className="flex items-baseline justify-between gap-6 py-4">
                <dt className="font-mono text-[11px] uppercase tracking-label text-graphite">Precio al cliente</dt>
                <dd className="display text-[20px] tabular-nums">
                  {euros(r.precioClienteMin)} – {euros(r.precioClienteMax)}
                </dd>
              </div>
            </dl>

            {r.avisos.length ? (
              <ul className="mt-6 flex flex-col gap-3">
                {r.avisos.map((a) => (
                  <li key={a} className="border-l-2 border-port pl-4 font-mono text-[11px] leading-[1.6] text-steel">
                    {a}
                  </li>
                ))}
              </ul>
            ) : null}
          </section>
        </div>
      </div>
    </main>
  );
}

function Campo({
  etiqueta, valor, onChange, ayuda,
}: { etiqueta: string; valor: string; onChange: (v: string) => void; ayuda?: string }) {
  return (
    <label className="block">
      <span className="label mb-2 block">{etiqueta}</span>
      <input
        value={valor}
        onChange={(e) => onChange(e.target.value)}
        inputMode="decimal"
        className="w-full border border-steel/30 bg-transparent px-4 py-3 font-mono text-[15px] text-graphite transition-colors focus:border-graphite focus:outline-none"
      />
      {ayuda ? <span className="mt-2 block font-mono text-[10px] leading-[1.6] text-steel">{ayuda}</span> : null}
    </label>
  );
}

function Grupo({ etiqueta, children }: { etiqueta: string; children: React.ReactNode }) {
  return (
    <div>
      <span className="label mb-2 block">{etiqueta}</span>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

function Opcion({ activa, onClick, children }: { activa: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={activa}
      className={`border px-4 py-2.5 font-mono text-[10px] uppercase tracking-label transition-colors ${
        activa ? "border-graphite bg-graphite text-bone" : "border-steel/30 text-steel hover:border-graphite hover:text-graphite"
      }`}
    >
      {children}
    </button>
  );
}
