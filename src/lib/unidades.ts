/**
 * Tipo compartido de una unidad.
 *
 * Vive fuera de unidades.server.ts a proposito: los componentes de cliente
 * necesitan el tipo, pero no pueden importar nada del modulo servidor -- el
 * framework lo bloquea, y con razon, porque arrastraria el cliente de base de
 * datos al navegador.
 */
export interface Unidad {
  id: string;
  slug: string;
  model: string;
  year: string;
  km: string;
  market: string;
  price: string;
  reserved: boolean;
  image: string | null;
  gallery: string[];
  summary: string;
  spec: Record<string, string>;
  equipment: string[];
  /** URL del anuncio de origen. Solo uso interno, nunca se publica. */
  sourceUrl?: string | null;
}
