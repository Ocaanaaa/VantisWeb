import { Pool } from "pg";
import { copy } from "../content";
import type { Unidad } from "./unidades";

/**
 * Origen de las unidades.
 *
 * Con POSTGRES_URL configurada, las unidades salen de la base de datos y se
 * pueden publicar desde el panel. Sin ella, se sirven las de
 * content/copy.es.ts en modo solo lectura.
 *
 * Ese respaldo no es adorno: permite que la web siga funcionando mientras la
 * base de datos no exista, y que el proyecto arranque en local sin montar nada.
 */

export type { Unidad };

const CADENA = process.env.POSTGRES_URL ?? process.env.DATABASE_URL ?? "";
export const hayBaseDeDatos = Boolean(CADENA);

let pool: Pool | null = null;
function conexion(): Pool {
  if (!pool) {
    pool = new Pool({
      connectionString: CADENA,
      // Los Postgres gestionados exigen TLS; en local no hay certificado.
      ssl: CADENA.includes("localhost") || CADENA.includes("/") ? false : { rejectUnauthorized: false },
      max: 3,
    });
  }
  return pool;
}

export async function prepararEsquema(): Promise<void> {
  if (!hayBaseDeDatos) return;
  await conexion().query(`
    create table if not exists unidades (
      id            text primary key,
      slug          text unique not null,
      modelo        text not null,
      anio          text not null default '',
      km            text not null default '',
      mercado       text not null default '',
      precio        text not null default '',
      reservada     boolean not null default false,
      publicada     boolean not null default false,
      imagen        text,
      galeria       jsonb not null default '[]'::jsonb,
      resumen       text not null default '',
      ficha         jsonb not null default '{}'::jsonb,
      equipamiento  jsonb not null default '[]'::jsonb,
      enlace_origen text,
      creada        timestamptz not null default now(),
      actualizada   timestamptz not null default now()
    );
    create index if not exists unidades_publicada_idx on unidades (publicada, creada desc);
  `);
}

function aUnidad(f: Record<string, unknown>): Unidad {
  return {
    id: String(f.id),
    slug: String(f.slug),
    model: String(f.modelo),
    year: String(f.anio ?? ""),
    km: String(f.km ?? ""),
    market: String(f.mercado ?? ""),
    price: String(f.precio ?? ""),
    reserved: Boolean(f.reservada),
    image: (f.imagen as string | null) ?? null,
    gallery: (f.galeria as string[]) ?? [],
    summary: String(f.resumen ?? ""),
    spec: (f.ficha as Record<string, string>) ?? {},
    equipment: (f.equipamiento as string[]) ?? [],
    sourceUrl: (f.enlace_origen as string | null) ?? null,
  };
}

/** Las del archivo, para cuando aún no hay base de datos. */
function deRespaldo(): Unidad[] {
  return copy.available.items.map((u) => ({
    id: u.id,
    slug: u.slug,
    model: u.model,
    year: u.year,
    km: u.km,
    market: u.market,
    price: u.price,
    reserved: u.reserved,
    image: u.image ?? null,
    gallery: u.gallery ?? [],
    summary: u.summary,
    spec: u.spec as unknown as Record<string, string>,
    equipment: u.equipment,
    sourceUrl: null,
  }));
}

/** Solo las publicadas. Es lo que ve el visitante. */
export async function listarPublicadas(): Promise<Unidad[]> {
  if (!hayBaseDeDatos) return deRespaldo();
  await prepararEsquema();
  const { rows } = await conexion().query(
    "select * from unidades where publicada = true order by creada desc",
  );
  return rows.map(aUnidad);
}

/** Todas, publicadas o no. Para el panel interno. */
export async function listarTodas(): Promise<Array<Unidad & { publicada: boolean }>> {
  if (!hayBaseDeDatos) return deRespaldo().map((u) => ({ ...u, publicada: true }));
  await prepararEsquema();
  const { rows } = await conexion().query("select * from unidades order by creada desc");
  return rows.map((f) => ({ ...aUnidad(f), publicada: Boolean(f.publicada) }));
}

export async function obtenerPorSlug(slug: string): Promise<Unidad | null> {
  if (!hayBaseDeDatos) return deRespaldo().find((u) => u.slug === slug) ?? null;
  await prepararEsquema();
  const { rows } = await conexion().query(
    "select * from unidades where slug = $1 and publicada = true limit 1",
    [slug],
  );
  return rows[0] ? aUnidad(rows[0]) : null;
}

export async function guardar(u: Unidad, publicada: boolean): Promise<void> {
  if (!hayBaseDeDatos) throw new Error("No hay base de datos configurada: define POSTGRES_URL.");
  await prepararEsquema();
  await conexion().query(
    `insert into unidades
       (id, slug, modelo, anio, km, mercado, precio, reservada, publicada,
        imagen, galeria, resumen, ficha, equipamiento, enlace_origen)
     values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11::jsonb,$12,$13::jsonb,$14::jsonb,$15)
     on conflict (id) do update set
       slug = excluded.slug, modelo = excluded.modelo, anio = excluded.anio,
       km = excluded.km, mercado = excluded.mercado, precio = excluded.precio,
       reservada = excluded.reservada, publicada = excluded.publicada,
       imagen = excluded.imagen, galeria = excluded.galeria, resumen = excluded.resumen,
       ficha = excluded.ficha, equipamiento = excluded.equipamiento,
       enlace_origen = excluded.enlace_origen, actualizada = now()`,
    [
      u.id, u.slug, u.model, u.year, u.km, u.market, u.price, u.reserved, publicada,
      u.image, JSON.stringify(u.gallery), u.summary, JSON.stringify(u.spec),
      JSON.stringify(u.equipment), u.sourceUrl ?? null,
    ],
  );
}

export async function borrar(id: string): Promise<void> {
  if (!hayBaseDeDatos) throw new Error("No hay base de datos configurada.");
  await conexion().query("delete from unidades where id = $1", [id]);
}
