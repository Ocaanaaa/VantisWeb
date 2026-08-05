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

/**
 * Quita `sslmode` de la cadena para que no pise la configuración de TLS.
 *
 * `pg` mezcla lo que trae la cadena de conexión **encima** de las opciones que
 * se le pasan, así que un `?sslmode=require` -- que es como viene la de
 * Supabase -- deja `ssl` en `{}` y anula el `rejectUnauthorized: false` de
 * abajo. El resultado es que exige un certificado verificable y la conexión
 * muere con «self-signed certificate in certificate chain».
 *
 * Comprobado con el propio ConnectionParameters de pg:
 *   sin sslmode        → { rejectUnauthorized: false }
 *   sslmode=require    → {}                              ← lo pisa
 *   sslmode=no-verify  → { rejectUnauthorized: false }
 *
 * Se quita el parámetro y se decide aquí, en un solo sitio.
 */
function sinSslmode(cadena: string): string {
  try {
    const u = new URL(cadena);
    u.searchParams.delete("sslmode");
    u.searchParams.delete("ssl");
    return u.toString();
  } catch {
    return cadena;
  }
}

let pool: Pool | null = null;

export function conexion(): Pool {
  if (!pool) {
    pool = new Pool({
      connectionString: sinSslmode(CADENA),
      // La conexión va cifrada, pero **no se verifica el certificado del
      // servidor**: los Postgres gestionados presentan cadenas firmadas por su
      // propia CA, que no está en el almacén de la función. Es lo que hace
      // cualquier despliegue de Vercel contra Supabase o Neon. Para verificar
      // de verdad habría que traerse el certificado raíz del proveedor y
      // pasarlo aquí como `ca`.
      ssl: esLocal(CADENA) ? false : { rejectUnauthorized: false },
      max: 3,
    });
  }
  return pool;
}
