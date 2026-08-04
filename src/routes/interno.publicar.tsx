import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { parsearAnuncio, generarSlug, type FichaExtraida } from "../lib/parsearAnuncio";
import type { Unidad } from "../lib/unidades";

/**
 * Panel para publicar una unidad.
 *
 * El flujo es: pegas el enlace y el texto del anuncio que estás viendo, la
 * herramienta rellena la ficha, tú corriges lo que haga falta y publicas.
 *
 * La herramienta no entra en ningún portal: el texto lo aportas tú. Y las
 * fotos no se copian del anuncio -- son del vendedor. Se suben aparte o la
 * ficha sale con el marcador de foto pendiente.
 */
export const Route = createFileRoute("/interno/publicar")({
  head: () => ({
    meta: [
      { title: "Publicar unidad — Vantis Motors" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: Publicar,
});

const VACIA = {
  id: "", modelo: "", anio: "", km: "", mercado: "", precio: "",
  resumen: "", imagen: "", galeria: "", equipamiento: "",
};

function Publicar() {
  const [token, setToken] = useState("");
  const [url, setUrl] = useState("");
  const [texto, setTexto] = useState("");
  const [f, setF] = useState(VACIA);
  const [spec, setSpec] = useState<Record<string, string>>({});
  const [analisis, setAnalisis] = useState<FichaExtraida | null>(null);
  const [reservada, setReservada] = useState(false);
  const [estado, setEstado] = useState<{ tipo: "ok" | "error"; texto: string } | null>(null);
  const [enviando, setEnviando] = useState(false);

  const analizar = () => {
    const r = parsearAnuncio(texto, url);
    setAnalisis(r);
    setF((prev) => ({
      ...prev,
      modelo: r.modelo || prev.modelo,
      anio: r.anio || prev.anio,
      km: r.km || prev.km,
      mercado: r.mercado || prev.mercado,
      precio: r.precio || prev.precio,
      equipamiento: r.equipamiento.join("\n") || prev.equipamiento,
    }));
    setSpec(r.spec);
  };

  const slug = f.modelo && f.id ? generarSlug(f.modelo, f.id) : "";

  const enviar = async (publicada: boolean) => {
    setEnviando(true);
    setEstado(null);
    const unidad: Unidad = {
      id: f.id.trim(),
      slug,
      model: f.modelo.trim(),
      year: f.anio.trim(),
      km: f.km.trim(),
      market: f.mercado.trim(),
      price: f.precio.trim(),
      reserved: reservada,
      image: f.imagen.trim() || null,
      gallery: f.galeria.split("\n").map((s) => s.trim()).filter(Boolean),
      summary: f.resumen.trim(),
      spec,
      equipment: f.equipamiento.split("\n").map((s) => s.trim()).filter(Boolean),
      sourceUrl: url.trim() || null,
    };
    try {
      const res = await fetch("/api/unidades", {
        method: "POST",
        headers: { "content-type": "application/json", "x-vantis-token": token },
        body: JSON.stringify({ unidad, publicada }),
      });
      const datos = await res.json();
      if (!res.ok) setEstado({ tipo: "error", texto: datos.error ?? `Error ${res.status}` });
      else setEstado({ tipo: "ok", texto: publicada ? `Publicada en /unidades/${datos.slug}` : "Guardada como borrador" });
    } catch (e) {
      setEstado({ tipo: "error", texto: e instanceof Error ? e.message : "Fallo de red" });
    } finally {
      setEnviando(false);
    }
  };

  const listo = Boolean(f.id.trim() && f.modelo.trim() && token.trim());

  return (
    <main className="min-h-dvh bg-bone py-14">
      <div className="mx-auto w-full max-w-[1200px] px-5 md:px-10">
        <p className="label">Uso interno</p>
        <h1 className="display mt-3 text-[9vw] leading-none md:text-[3.2vw]">Publicar unidad</h1>
        <p className="mt-5 max-w-[70ch] text-[15px] leading-[1.55] text-steel">
          Pega el enlace y el texto del anuncio que estés viendo. Se rellena la ficha, la revisas
          y publicas. <strong className="text-graphite">Las fotos del anuncio no se copian</strong>:
          son del vendedor. Sube las tuyas o déjalo con el marcador de foto pendiente.
        </p>

        <div className="mt-10 grid gap-10 lg:grid-cols-2 lg:gap-14">
          {/* --- Entrada --- */}
          <section className="flex flex-col gap-5">
            <Campo etiqueta="Token de acceso" valor={token} onChange={setToken} tipo="password"
              ayuda="El valor de ADMIN_TOKEN configurado en Vercel." />
            <Campo etiqueta="Enlace del anuncio" valor={url} onChange={setUrl}
              ayuda="Solo se guarda como referencia interna. No se publica." />

            <label className="block">
              <span className="label mb-2 block">Texto del anuncio</span>
              <textarea
                value={texto}
                onChange={(e) => setTexto(e.target.value)}
                rows={12}
                placeholder={"Erstzulassung: 03/2023\nKilometerstand: 14.200 km\nLeistung: 221 kW (300 PS)\n…"}
                className="w-full resize-y border border-steel/30 bg-transparent px-4 py-3 font-mono text-[13px] leading-[1.5] text-graphite placeholder:text-steel/50 focus:border-graphite focus:outline-none"
              />
            </label>

            <button type="button" onClick={analizar} disabled={!texto.trim()}
              className="self-start bg-graphite px-6 py-3.5 font-mono text-[10px] uppercase tracking-label text-bone disabled:opacity-40">
              Analizar anuncio
            </button>

            {analisis ? (
              <div className="flex flex-col gap-3">
                {analisis.alertas.map((a) => (
                  <p key={a} className="border-l-2 border-danger bg-danger/5 py-2 pl-4 font-mono text-[11px] leading-[1.6] text-graphite">
                    {a}
                  </p>
                ))}
                {analisis.camposVacios.length ? (
                  <p className="border-l-2 border-port pl-4 font-mono text-[11px] leading-[1.6] text-steel">
                    No se han reconocido: {analisis.camposVacios.join(", ")}. Rellénalos a mano.
                  </p>
                ) : (
                  <p className="border-l-2 border-port pl-4 font-mono text-[11px] text-steel">
                    Todos los campos principales reconocidos.
                  </p>
                )}
              </div>
            ) : null}
          </section>

          {/* --- Ficha --- */}
          <section className="flex flex-col gap-5">
            <div className="grid grid-cols-2 gap-4">
              <Campo etiqueta="Referencia" valor={f.id} onChange={(v) => setF({ ...f, id: v })} ayuda="Ej. D-119" />
              <Campo etiqueta="Año" valor={f.anio} onChange={(v) => setF({ ...f, anio: v })} />
            </div>
            <Campo etiqueta="Modelo" valor={f.modelo} onChange={(v) => setF({ ...f, modelo: v })} />
            <div className="grid grid-cols-2 gap-4">
              <Campo etiqueta="Kilometraje" valor={f.km} onChange={(v) => setF({ ...f, km: v })} />
              <Campo etiqueta="Mercado" valor={f.mercado} onChange={(v) => setF({ ...f, mercado: v })} />
            </div>
            <Campo etiqueta="Precio puesto en España" valor={f.precio} onChange={(v) => setF({ ...f, precio: v })} />

            <label className="block">
              <span className="label mb-2 block">Descripción</span>
              <textarea value={f.resumen} onChange={(e) => setF({ ...f, resumen: e.target.value })} rows={4}
                className="w-full resize-y border border-steel/30 bg-transparent px-4 py-3 text-[14px] leading-[1.5] text-graphite focus:border-graphite focus:outline-none" />
            </label>

            <label className="block">
              <span className="label mb-2 block">Equipamiento (uno por línea)</span>
              <textarea value={f.equipamiento} onChange={(e) => setF({ ...f, equipamiento: e.target.value })} rows={5}
                className="w-full resize-y border border-steel/30 bg-transparent px-4 py-3 font-mono text-[12px] leading-[1.5] text-graphite focus:border-graphite focus:outline-none" />
            </label>

            <Campo etiqueta="Foto principal (ruta propia)" valor={f.imagen} onChange={(v) => setF({ ...f, imagen: v })}
              ayuda="Ej. /media/d119-1.webp. Vacío = marcador de foto pendiente." />
            <label className="block">
              <span className="label mb-2 block">Galería (una ruta por línea)</span>
              <textarea value={f.galeria} onChange={(e) => setF({ ...f, galeria: e.target.value })} rows={3}
                className="w-full resize-y border border-steel/30 bg-transparent px-4 py-3 font-mono text-[12px] text-graphite focus:border-graphite focus:outline-none" />
            </label>

            <label className="flex items-center gap-3 font-mono text-[11px] uppercase tracking-label text-graphite">
              <input type="checkbox" checked={reservada} onChange={(e) => setReservada(e.target.checked)} />
              Marcar como reservada
            </label>

            {Object.keys(spec).length ? (
              <div className="border border-steel/25 p-4">
                <p className="label mb-3">Ficha técnica detectada</p>
                <dl className="grid grid-cols-2 gap-x-6">
                  {Object.entries(spec).map(([k, v]) => (
                    <div key={k} className="flex justify-between gap-3 border-b border-steel/20 py-1.5">
                      <dt className="font-mono text-[10px] text-steel">{k}</dt>
                      <dd className="font-mono text-[11px] text-graphite">{v}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            ) : null}

            {slug ? <p className="font-mono text-[11px] text-steel">URL: /unidades/{slug}</p> : null}

            <div className="flex flex-wrap gap-3">
              <button type="button" onClick={() => enviar(true)} disabled={!listo || enviando}
                className="bg-graphite px-6 py-4 font-mono text-[10px] uppercase tracking-label text-bone disabled:opacity-40">
                {enviando ? "Guardando…" : "Publicar"}
              </button>
              <button type="button" onClick={() => enviar(false)} disabled={!listo || enviando}
                className="border border-graphite px-6 py-4 font-mono text-[10px] uppercase tracking-label text-graphite disabled:opacity-40">
                Guardar borrador
              </button>
            </div>

            {estado ? (
              <p className={`border-l-2 pl-4 font-mono text-[12px] leading-[1.6] ${
                estado.tipo === "ok" ? "border-port text-graphite" : "border-danger text-danger"
              }`}>
                {estado.texto}
              </p>
            ) : null}
          </section>
        </div>
      </div>
    </main>
  );
}

function Campo({
  etiqueta, valor, onChange, ayuda, tipo = "text",
}: { etiqueta: string; valor: string; onChange: (v: string) => void; ayuda?: string; tipo?: string }) {
  return (
    <label className="block">
      <span className="label mb-2 block">{etiqueta}</span>
      <input type={tipo} value={valor} onChange={(e) => onChange(e.target.value)}
        className="w-full border border-steel/30 bg-transparent px-4 py-3 font-mono text-[13px] text-graphite focus:border-graphite focus:outline-none" />
      {ayuda ? <span className="mt-2 block font-mono text-[10px] leading-[1.6] text-steel">{ayuda}</span> : null}
    </label>
  );
}
