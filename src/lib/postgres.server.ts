import { Pool } from "pg";

/**
 * La conexión a Postgres, en un solo sitio.
 *
 * Vale para cualquier proveedor: Supabase, Neon o el que inyecte POSTGRES_URL
 * al vincular la base de datos al proyecto en Vercel.
 */

const CADENA = process.env.POSTGRES_URL ?? process.env.DATABASE_URL ?? "";
export const hayBaseDeDatos = Boolean(CADENA);

/**
 * Si la conexión va cifrada.
 *
 * Aquí hubo un fallo que conviene no repetir: la comprobación era
 * `cadena.includes("/")` para detectar un socket Unix, y eso es cierto para
 * **cualquier** URL, porque `postgresql://` ya lleva barras. Resultado: TLS
 * desactivado siempre, y un Postgres gestionado rechazando la conexión. Solo
 * pasaba desapercibido en local, donde el socket es justamente el caso que se
 * quería detectar.
 *
 * Ahora se mira lo que de verdad distingue: un host que sea una ruta de
 * archivo, o una máquina local. Todo lo demás va cifrado.
 */
function esLocal(cadena: string): boolean {
  if (/[?&]host=(%2F|\/)/i.test(cadena)) return true; // socket Unix
  return /@(localhost|127\.0\.0\.1|\[::1\])[:/]/i.test(cadena);
}

let pool: Pool | null = null;

export function conexion(): Pool {
  if (!pool) {
    pool = new Pool({
      connectionString: CADENA,
      // Los Postgres gestionados exigen TLS y presentan certificados que no
      // están en el almacén de la función, de ahí rejectUnauthorized: false.
      ssl: esLocal(CADENA) ? false : { rejectUnauthorized: false },
      max: 3,
    });
  }
  return pool;
}
