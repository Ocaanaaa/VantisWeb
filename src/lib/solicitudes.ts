/**
 * Tipos de los encargos, sin nada de servidor.
 *
 * Vive aparte de `solicitudes.server.ts` porque el framework bloquea importar
 * un módulo `.server` desde un componente, y con razón: arrastraría el cliente
 * de base de datos al navegador. Los tipos sí pueden viajar.
 */

export interface Solicitud {
  id: number;
  ref: string;
  descripcion: string;
  presupuesto: string;
  plazo: string;
  contacto: string;
  unidad: string | null;
  origen: string | null;
  estado: "nueva" | "atendida" | "descartada";
  notas: string;
  creada: string;
}

/** Lo que acepta el endpoint público. */
export interface SolicitudEntrante {
  descripcion: string;
  presupuesto: string;
  plazo: string;
  contacto: string;
  unidad?: string | null;
  origen?: string | null;
}
