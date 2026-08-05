import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { parsearAnuncio, generarSlug, type FichaExtraida } from "../lib/parsearAnuncio";
import { comprimirImagen, type FotoLista } from "../lib/comprimirImagen";
import { leerRespuesta } from "../lib/leerRespuesta";
import { copy } from "../content";
import type { Unidad } from "../lib/unidades";

/** Las mismas etiquetas que ve el visitante en la ficha, no las claves internas. */
const ETIQUETAS = copy.available.detail.specLabels as Record<string, string>;

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
  resumen: "", equipamiento: "",
};

const kb = (n: number) => (n < 1048576 ? `${Math.round(n / 1024)} KB` : `${(n / 1048576).toFixed(1)} MB`);

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

  // Fotos ya alojadas, en orden. La primera es la principal de la ficha.
  const [fotos, setFotos] = useState<string[]>([]);
  // Seleccionadas y comprimidas, pendientes de subir.
  const [pendientes, setPendientes] = useState<FotoLista[]>([]);
  const [subiendo, setSubiendo] = useState(false);
  const [avisoFoto, setAvisoFoto] = useState<string | null>(null);

  const elegirFotos = async (lista: FileList | null) => {
    if (!lista?.length) return;
    setAvisoFoto(null);
    try {
      const listas = await Promise.all(Array.from(lista).map(comprimirImagen));
      setPendientes((prev) => [...prev, ...listas]);
    } catch (e) {
      setAvisoFoto(e instanceof Error ? e.message : "No se han podido leer las imágenes");
    }
  };

  const subirFotos = async () => {
    if (!pendientes.length) return;
    setSubiendo(true);
    setAvisoFoto(null);
    const cuerpo = new FormData();
    cuerpo.set("referencia", f.id.trim() || f.modelo.trim() || "unidad");
    for (const p of pendientes) cuerpo.append("foto", p.archivo);
    try {
      const res = await fetch("/api/subir", {
        method: "POST",
        headers: { "x-vantis-token": token },
        body: cuerpo,
      });
      const datos = await leerRespuesta(res);
      if (!res.ok) {
        setAvisoFoto(datos.error ?? `Error ${res.status}`);
      } else {
        setFotos((prev) => [...prev, ...datos.urls]);
        for (const p of pendientes) URL.revokeObjectURL(p.vistaPrevia);
        setPendientes([]);
      }
    } catch (e) {
      setAvisoFoto(e instanceof Error ? e.message : "Fallo de red al subir");
    } finally {
      setSubiendo(false);
    }
  };

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
      image: fotos[0] ?? null,
      gallery: fotos,
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
      const datos = await leerRespuesta(res);
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

                <p className="border-l-2 border-steel/40 pl-4 font-mono text-[11px] leading-[1.6] text-steel">
                  Anuncio en {analisis.idioma}.{" "}
                  {analisis.idioma === "español"
                    ? "No hace falta traducir nada."
                    : "La ficha y el equipamiento ya están traducidos."}
                </p>

                {analisis.sinTraducir.length ? (
                  <div className="border-l-2 border-port pl-4">
                    <p className="font-mono text-[11px] leading-[1.6] text-graphite">
                      Sin traducir, se han dejado tal cual —revísalos antes de publicar:
                    </p>
                    <ul className="mt-1.5 flex flex-col gap-1">
                      {analisis.sinTraducir.map((s) => (
                        <li key={s} className="font-mono text-[11px] text-steel">· {s}</li>
                      ))}
                    </ul>
                  </div>
                ) : null}
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

            {/* --- Fotos --- */}
            <div className="border border-steel/25 p-4">
              <p className="label">Fotos de la unidad</p>
              <p className="mt-2 font-mono text-[10px] leading-[1.7] text-steel">
                Solo fotos propias o cedidas por el vendedor. Se convierten a WebP y se
                reducen a 2048 px en tu navegador antes de subirse. La primera es la
                principal; sin ninguna, la ficha sale con el marcador de foto pendiente.
              </p>

              <input
                type="file" accept="image/*" multiple
                onChange={(e) => { void elegirFotos(e.target.files); e.target.value = ""; }}
                className="mt-4 block w-full font-mono text-[11px] text-steel file:mr-4 file:border-0 file:bg-graphite file:px-4 file:py-2.5 file:font-mono file:text-[10px] file:uppercase file:tracking-label file:text-bone"
              />

              {pendientes.length ? (
                <div className="mt-4">
                  <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                    {pendientes.map((p, i) => (
                      <figure key={p.vistaPrevia} className="relative">
                        <img src={p.vistaPrevia} alt="" className="aspect-[4/3] w-full object-cover" />
                        <figcaption className="mt-1 font-mono text-[9px] leading-tight text-steel">
                          {kb(p.original)} → {kb(p.archivo.size)}
                        </figcaption>
                        <button
                          type="button"
                          onClick={() => {
                            URL.revokeObjectURL(p.vistaPrevia);
                            setPendientes((prev) => prev.filter((_, j) => j !== i));
                          }}
                          className="absolute right-0 top-0 bg-graphite px-2 py-1 font-mono text-[10px] text-bone"
                          aria-label="Quitar"
                        >
                          ×
                        </button>
                      </figure>
                    ))}
                  </div>
                  <button type="button" onClick={subirFotos} disabled={subiendo || !token.trim()}
                    className="mt-3 bg-port px-5 py-3 font-mono text-[10px] uppercase tracking-label text-graphite disabled:opacity-40">
                    {subiendo ? "Subiendo…" : `Subir ${pendientes.length} foto${pendientes.length > 1 ? "s" : ""}`}
                  </button>
                  {!token.trim() ? (
                    <p className="mt-2 font-mono text-[10px] text-steel">Hace falta el token para subir.</p>
                  ) : null}
                </div>
              ) : null}

              {fotos.length ? (
                <ul className="mt-4 flex flex-col gap-2">
                  {fotos.map((u, i) => (
                    <li key={u} className="flex items-center gap-3 border-b border-steel/20 pb-2">
                      <img src={u} alt="" className="h-12 w-16 shrink-0 object-cover" />
                      <span className="min-w-0 flex-1 truncate font-mono text-[10px] text-steel">{u}</span>
                      {i === 0 ? (
                        <span className="shrink-0 font-mono text-[9px] uppercase tracking-label text-port-ink">Principal</span>
                      ) : (
                        <button type="button" onClick={() => setFotos((p) => [u, ...p.filter((x) => x !== u)])}
                          className="shrink-0 font-mono text-[9px] uppercase tracking-label text-steel underline">
                          Principal
                        </button>
                      )}
                      <button type="button" onClick={() => setFotos((p) => p.filter((x) => x !== u))}
                        className="shrink-0 font-mono text-[10px] text-danger">×</button>
                    </li>
                  ))}
                </ul>
              ) : null}

              {avisoFoto ? (
                <p className="mt-3 border-l-2 border-danger pl-3 font-mono text-[11px] leading-[1.6] text-danger">
                  {avisoFoto}
                </p>
              ) : null}
            </div>

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
                      <dt className="font-mono text-[10px] text-steel">{ETIQUETAS[k] ?? k}</dt>
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
