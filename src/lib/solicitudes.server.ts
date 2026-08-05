import { conexion, hayBaseDeDatos } from "./postgres.server";
import type { Solicitud, SolicitudEntrante } from "./solicitudes";

/**
 * Los encargos que llegan por el formulario.
 *
 * Hasta ahora el formulario no enviaba a ningún sitio: enseñaba la
 * confirmación y el encargo se perdía. Esto es lo que faltaba.
 *
 * La base de datos es la fuente de verdad y el correo es un aviso. Si el
 * correo falla, el encargo ya está guardado y se ve en /interno/solicitudes;
 * si es la base de datos la que falla, el endpoint lo dice y el formulario
 * manda al cliente a WhatsApp. Lo que no vuelve a pasar es dar por bueno un
 * envío que no ha ocurrido.
 */

export type { Solicitud, SolicitudEntrante };

export { hayBaseDeDatos };

export async function prepararEsquema(): Promise<void> {
  if (!hayBaseDeDatos) return;
  await conexion().query(`
    create table if not exists solicitudes (
      id           bigserial primary key,
      ref          text unique,
      descripcion  text not null,
      presupuesto  text not null default '',
      plazo        text not null default '',
      contacto     text not null,
      unidad       text,
      origen       text,
      estado       text not null default 'nueva',
      notas        text not null default '',
      ip           text,
      agente       text,
      creada       timestamptz not null default now()
    );
    create index if not exists solicitudes_estado_idx on solicitudes (estado, creada desc);
    create index if not exists solicitudes_ip_idx on solicitudes (ip, creada desc);
  `);
}

/** Tope por campo. Un formulario público sin límites es una invitación. */
export const LIMITES: Record<keyof SolicitudEntrante, number> = {
  descripcion: 4000, presupuesto: 200, plazo: 200, contacto: 300,
  unidad: 120, origen: 500,
};

/**
 * Cuántos encargos ha mandado esta IP en la última hora.
 *
 * El límite se cuenta en la base de datos y no en memoria: cada petición
 * puede caer en una instancia distinta de la función, así que un contador en
 * memoria no contaría nada.
 */
export async function enviosRecientes(ip: string): Promise<number> {
  if (!hayBaseDeDatos || !ip) return 0;
  const { rows } = await conexion().query(
    "select count(*)::int as n from solicitudes where ip = $1 and creada > now() - interval '1 hour'",
    [ip],
  );
  return rows[0]?.n ?? 0;
}

/** Guarda y devuelve la referencia que se le enseña al cliente. */
export async function guardarSolicitud(
  s: SolicitudEntrante,
  meta: { ip?: string; agente?: string } = {},
): Promise<string> {
  if (!hayBaseDeDatos) throw new Error("No hay base de datos configurada: falta POSTGRES_URL.");
  await prepararEsquema();

  // La referencia lleva el id, así que hay que insertar primero y componerla
  // después, en dos sentencias.
  //
  // No vale meterlo todo en un CTE que inserte y actualice a la vez: en
  // Postgres las dos partes ven el mismo snapshot, así que el UPDATE no
  // encuentra la fila recién insertada, actualiza cero filas y deja la
  // referencia a NULL. Pasó, y por eso está escrito aquí.
  const cliente = conexion();
  const { rows } = await cliente.query(
    `insert into solicitudes (descripcion, presupuesto, plazo, contacto, unidad, origen, ip, agente)
     values ($1,$2,$3,$4,$5,$6,$7,$8)
     returning id, to_char(creada, 'YY') as anio`,
    [
      s.descripcion, s.presupuesto, s.plazo, s.contacto,
      s.unidad ?? null, s.origen ?? null, meta.ip ?? null, meta.agente ?? null,
    ],
  );
  const { id, anio } = rows[0];
  const ref = `VNT-${anio}-${String(id).padStart(4, "0")}`;
  await cliente.query("update solicitudes set ref = $2 where id = $1", [id, ref]);
  return ref;
}

export async function listarSolicitudes(): Promise<Solicitud[]> {
  if (!hayBaseDeDatos) return [];
  await prepararEsquema();
  const { rows } = await conexion().query(
    // El coalesce es un cinturón: si el segundo paso de guardarSolicitud no
    // llegó a ejecutarse, la fila sigue teniendo referencia que enseñar.
    `select id,
            coalesce(ref, 'VNT-' || lpad(id::text, 4, '0')) as ref,
            descripcion, presupuesto, plazo, contacto, unidad, origen, estado, notas, creada
       from solicitudes
      order by creada desc
      limit 200`,
  );
  return rows as Solicitud[];
}

export async function actualizarSolicitud(
  id: number,
  cambios: { estado?: Solicitud["estado"]; notas?: string },
): Promise<void> {
  if (!hayBaseDeDatos) throw new Error("No hay base de datos configurada.");
  await conexion().query(
    "update solicitudes set estado = coalesce($2, estado), notas = coalesce($3, notas) where id = $1",
    [id, cambios.estado ?? null, cambios.notas ?? null],
  );
}
