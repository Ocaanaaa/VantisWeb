import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { leerRespuesta } from "../lib/leerRespuesta";

/**
 * Diagnóstico, en pantalla.
 *
 * `/api/estado` pide el token por cabecera, y desde la barra del navegador no
 * hay forma de mandarla: abrirlo a pelo solo devuelve «No autorizado». Esta
 * página hace la llamada bien y enseña el resultado.
 */
export const Route = createFileRoute("/interno/estado")({
  head: () => ({
    meta: [
      { title: "Estado — Vantis Motors" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: Estado,
});

interface Paso { paso: string; ok: boolean; detalle?: string; codigo?: string }
interface Informe {
  variables: Record<string, boolean>;
  postgres: { configurada: boolean; servidor: string; cifrada: boolean };
  pasos: Paso[];
  error?: string;
}

function Estado() {
  const [token, setToken] = useState("");
  const [informe, setInforme] = useState<Informe | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);

  const mirar = async () => {
    setCargando(true);
    setError(null);
    setInforme(null);
    try {
      const res = await fetch("/api/estado", { headers: { "x-vantis-token": token } });
      const datos = await leerRespuesta<Informe>(res);
      if (!res.ok) setError(datos.error ?? `Error ${res.status}`);
      else setInforme(datos);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Fallo de red");
    } finally {
      setCargando(false);
    }
  };

  return (
    <main className="min-h-dvh bg-bone py-14">
      <div className="mx-auto w-full max-w-[900px] px-5 md:px-10">
        <p className="label">Uso interno</p>
        <h1 className="display mt-3 text-[9vw] leading-none md:text-[3.2vw]">Estado</h1>
        <p className="mt-5 max-w-[70ch] text-[15px] leading-[1.55] text-steel">
          Qué está configurado y qué responde la base de datos. No enseña ningún valor
          secreto: de las variables solo si existen, y de la conexión solo servidor y puerto.
        </p>

        <div className="mt-8 flex flex-wrap items-end gap-4">
          <label className="block min-w-[240px] flex-1">
            <span className="label mb-2 block">Token de acceso</span>
            <input type="password" value={token} onChange={(e) => setToken(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && token.trim() && void mirar()}
              className="w-full border border-steel/30 bg-transparent px-4 py-3 font-mono text-[13px] text-graphite focus:border-graphite focus:outline-none" />
          </label>
          <button type="button" onClick={mirar} disabled={!token.trim() || cargando}
            className="bg-graphite px-6 py-3.5 font-mono text-[10px] uppercase tracking-label text-bone disabled:opacity-40">
            {cargando ? "Comprobando…" : "Comprobar"}
          </button>
        </div>

        {error ? (
          <p className="mt-5 border-l-2 border-danger pl-4 font-mono text-[12px] leading-[1.6] text-danger">{error}</p>
        ) : null}

        {informe ? (
          <div className="mt-10 flex flex-col gap-8">
            <section>
              <p className="label mb-3">Base de datos</p>
              <dl className="border border-steel/25">
                <Fila etiqueta="Servidor" valor={informe.postgres.servidor || "(sin configurar)"} />
                <Fila etiqueta="Conexión cifrada" valor={informe.postgres.cifrada ? "sí" : "no"} />
              </dl>
            </section>

            <section>
              <p className="label mb-3">Comprobaciones</p>
              <ul className="flex flex-col">
                {informe.pasos.map((p) => (
                  <li key={p.paso}
                    className={`border-l-2 py-2.5 pl-4 ${p.ok ? "border-port" : "border-danger"}`}>
                    <p className="font-mono text-[11px] uppercase tracking-label text-graphite">
                      {p.ok ? "✓" : "✗"} {p.paso}
                    </p>
                    <p className={`mt-1 break-words font-mono text-[11px] leading-[1.6] ${p.ok ? "text-steel" : "text-danger"}`}>
                      {p.detalle}{p.codigo ? ` · ${p.codigo}` : ""}
                    </p>
                  </li>
                ))}
                {informe.pasos.length === 0 ? (
                  <li className="font-mono text-[12px] text-steel">
                    No hay POSTGRES_URL, así que no hay nada que comprobar.
                  </li>
                ) : null}
              </ul>
            </section>

            <section>
              <p className="label mb-3">Variables de entorno</p>
              <dl className="border border-steel/25">
                {Object.entries(informe.variables).map(([k, v]) => (
                  <Fila key={k} etiqueta={k} valor={v ? "puesta" : "falta"} mal={!v} />
                ))}
              </dl>
            </section>
          </div>
        ) : null}
      </div>
    </main>
  );
}

function Fila({ etiqueta, valor, mal }: { etiqueta: string; valor: string; mal?: boolean }) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-3 border-b border-steel/20 px-4 py-2.5 last:border-b-0">
      <dt className="font-mono text-[10px] uppercase tracking-label text-steel">{etiqueta}</dt>
      <dd className={`break-all text-right font-mono text-[12px] ${mal ? "text-danger" : "text-graphite"}`}>
        {valor}
      </dd>
    </div>
  );
}
