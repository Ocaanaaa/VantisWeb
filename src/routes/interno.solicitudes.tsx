import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import type { Solicitud } from "../lib/solicitudes";

/**
 * Bandeja de encargos.
 *
 * Lee de /api/solicitudes con el mismo token que el resto de /interno. Aquí
 * no se borra nada: los encargos se marcan como atendidos o descartados y se
 * quedan, porque son el registro de con quién has hablado.
 */
export const Route = createFileRoute("/interno/solicitudes")({
  head: () => ({
    meta: [
      { title: "Encargos — Vantis Motors" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: Solicitudes,
});

const ESTADOS: Array<{ valor: Solicitud["estado"]; texto: string }> = [
  { valor: "nueva", texto: "Nueva" },
  { valor: "atendida", texto: "Atendida" },
  { valor: "descartada", texto: "Descartada" },
];

function fecha(iso: string): string {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleString("es-ES", {
    day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit",
  });
}

function Solicitudes() {
  const [token, setToken] = useState("");
  const [lista, setLista] = useState<Solicitud[] | null>(null);
  const [entorno, setEntorno] = useState<{ hayBaseDeDatos: boolean; hayCorreo: boolean } | null>(null);
  const [filtro, setFiltro] = useState<Solicitud["estado"] | "todas">("nueva");
  const [estado, setEstado] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);

  const cargar = async () => {
    setCargando(true);
    setEstado(null);
    try {
      const res = await fetch("/api/solicitudes", { headers: { "x-vantis-token": token } });
      const datos = await res.json();
      if (!res.ok) {
        setEstado(datos.error ?? `Error ${res.status}`);
        setLista(null);
      } else {
        setLista(datos.solicitudes);
        setEntorno({ hayBaseDeDatos: datos.hayBaseDeDatos, hayCorreo: datos.hayCorreo });
      }
    } catch (e) {
      setEstado(e instanceof Error ? e.message : "Fallo de red");
    } finally {
      setCargando(false);
    }
  };

  const actualizar = async (id: number, cambios: { estado?: Solicitud["estado"]; notas?: string }) => {
    // Se pinta el cambio antes de que responda el servidor; si falla, se
    // recarga y vuelve a lo que hay de verdad.
    setLista((prev) => prev?.map((s) => (s.id === id ? { ...s, ...cambios } : s)) ?? prev);
    const res = await fetch("/api/solicitudes", {
      method: "PATCH",
      headers: { "content-type": "application/json", "x-vantis-token": token },
      body: JSON.stringify({ id, ...cambios }),
    });
    if (!res.ok) {
      setEstado("No se ha podido guardar el cambio");
      void cargar();
    }
  };

  const visibles = lista?.filter((s) => filtro === "todas" || s.estado === filtro) ?? [];
  const cuenta = (e: Solicitud["estado"]) => lista?.filter((s) => s.estado === e).length ?? 0;

  return (
    <main className="min-h-dvh bg-bone py-14">
      <div className="mx-auto w-full max-w-[1100px] px-5 md:px-10">
        <p className="label">Uso interno</p>
        <h1 className="display mt-3 text-[9vw] leading-none md:text-[3.2vw]">Encargos</h1>

        <div className="mt-8 flex flex-wrap items-end gap-4">
          <label className="block flex-1 min-w-[240px]">
            <span className="label mb-2 block">Token de acceso</span>
            <input type="password" value={token} onChange={(e) => setToken(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && token.trim() && void cargar()}
              className="w-full border border-steel/30 bg-transparent px-4 py-3 font-mono text-[13px] text-graphite focus:border-graphite focus:outline-none" />
          </label>
          <button type="button" onClick={cargar} disabled={!token.trim() || cargando}
            className="bg-graphite px-6 py-3.5 font-mono text-[10px] uppercase tracking-label text-bone disabled:opacity-40">
            {cargando ? "Cargando…" : "Ver encargos"}
          </button>
        </div>

        {estado ? (
          <p className="mt-5 border-l-2 border-danger pl-4 font-mono text-[12px] leading-[1.6] text-danger">{estado}</p>
        ) : null}

        {entorno && !entorno.hayCorreo ? (
          <p className="mt-5 border-l-2 border-port pl-4 font-mono text-[11px] leading-[1.7] text-steel">
            Sin aviso por correo: faltan RESEND_API_KEY y NOTIFY_EMAIL. Los encargos se guardan
            igual, pero hay que entrar aquí a mirarlos.
          </p>
        ) : null}

        {lista ? (
          <>
            <div className="mt-10 flex flex-wrap gap-2">
              {([...ESTADOS.map((e) => e.valor), "todas"] as const).map((f) => (
                <button key={f} type="button" onClick={() => setFiltro(f)}
                  className={`border px-4 py-2 font-mono text-[10px] uppercase tracking-label transition-colors ${
                    filtro === f ? "border-graphite bg-graphite text-bone" : "border-steel/30 text-steel hover:border-graphite hover:text-graphite"
                  }`}>
                  {f === "todas" ? `Todas (${lista.length})` : `${ESTADOS.find((e) => e.valor === f)!.texto} (${cuenta(f)})`}
                </button>
              ))}
            </div>

            {visibles.length === 0 ? (
              <p className="mt-10 font-mono text-[12px] text-steel">
                {lista.length === 0 ? "Todavía no ha entrado ningún encargo." : "Nada en este filtro."}
              </p>
            ) : (
              <ul className="mt-8 flex flex-col gap-5">
                {visibles.map((s) => (
                  <li key={s.id} className="border border-steel/25 p-5 md:p-6">
                    <div className="flex flex-wrap items-baseline justify-between gap-3">
                      <p className="font-mono text-[13px] tracking-[0.1em] text-graphite">{s.ref}</p>
                      <p className="font-mono text-[10px] text-steel">{fecha(s.creada)}</p>
                    </div>

                    <p className="mt-4 whitespace-pre-wrap text-[15px] leading-[1.55] text-graphite">
                      {s.descripcion}
                    </p>

                    <dl className="mt-5 grid gap-x-8 gap-y-1.5 sm:grid-cols-2">
                      <Dato etiqueta="Contacto" valor={s.contacto} destacado />
                      <Dato etiqueta="Presupuesto" valor={s.presupuesto} />
                      <Dato etiqueta="Plazo" valor={s.plazo} />
                      {s.unidad ? <Dato etiqueta="Sobre la unidad" valor={s.unidad} /> : null}
                    </dl>

                    {s.origen ? (
                      <p className="mt-3 truncate font-mono text-[10px] text-steel">Desde {s.origen}</p>
                    ) : null}

                    <div className="mt-5 flex flex-wrap items-center gap-2">
                      {ESTADOS.map((e) => (
                        <button key={e.valor} type="button"
                          onClick={() => void actualizar(s.id, { estado: e.valor })}
                          className={`border px-3.5 py-2 font-mono text-[10px] uppercase tracking-label transition-colors ${
                            s.estado === e.valor
                              ? "border-graphite bg-graphite text-bone"
                              : "border-steel/30 text-steel hover:border-graphite hover:text-graphite"
                          }`}>
                          {e.texto}
                        </button>
                      ))}
                    </div>

                    <label className="mt-4 block">
                      <span className="label mb-2 block">Notas internas</span>
                      <textarea defaultValue={s.notas} rows={2}
                        onBlur={(e) => e.target.value !== s.notas && void actualizar(s.id, { notas: e.target.value })}
                        placeholder="Se guardan al salir del campo."
                        className="w-full resize-y border border-steel/30 bg-transparent px-3 py-2 text-[13px] leading-[1.5] text-graphite placeholder:text-steel/50 focus:border-graphite focus:outline-none" />
                    </label>
                  </li>
                ))}
              </ul>
            )}
          </>
        ) : null}
      </div>
    </main>
  );
}

function Dato({ etiqueta, valor, destacado }: { etiqueta: string; valor: string; destacado?: boolean }) {
  return (
    <div className="flex justify-between gap-4 border-b border-steel/20 py-1.5">
      <dt className="font-mono text-[10px] uppercase tracking-label text-steel">{etiqueta}</dt>
      <dd className={`text-right text-[13px] ${destacado ? "font-mono text-graphite" : "text-steel"}`}>
        {valor || "—"}
      </dd>
    </div>
  );
}
