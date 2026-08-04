/**
 * Coste de importación y ahorro frente al mercado español.
 *
 * La pregunta que responde no es "cuánto cuesta traerlo" sino "¿le sale a
 * cuenta al cliente?". Por eso el resultado son dos cifras: lo que le cuesta
 * al cliente puesto en España -- honorarios de Vantis incluidos -- y cuánto se
 * ahorra frente a comprar lo equivalente aquí. Si el ahorro no es positivo, la
 * unidad no merece la pena por muy barata que esté en origen.
 *
 * Todo son funciones puras sin dependencias: se pueden probar sueltas y más
 * adelante correr en el servidor, en un script o en un proceso por lotes.
 */

/** De dónde viene el vehículo. De momento solo se opera en la UE. */
export type Origen = "ue" | "extraUe";

/**
 * Régimen de IVA de la compra. Es la variable que más mueve el resultado:
 * en un coche de 47.000 € hay casi 10.000 € entre un caso y otro.
 */
export type RegimenIva =
  /** Usado en régimen de margen (particular o comerciante acogido). El IVA ya
   *  se pagó en origen y no se vuelve a pagar aquí. */
  | "margen"
  /** Factura intracomunitaria a un CIF español: inversión del sujeto pasivo.
   *  Se autorrepercute y se deduce, así que el efecto en caja es neutro. */
  | "intracomunitario"
  /** «Medio de transporte nuevo» a efectos de IVA: menos de 6 meses de
   *  antigüedad O menos de 6.000 km. Entonces el 21% se paga en España
   *  siempre, aunque el vendedor sea un particular. */
  | "nuevo";

/** Parámetros del negocio. Se pasan explícitos para no esconder cifras. */
export interface Supuestos {
  /** Transporte desde la UE, media por vehículo. */
  transporteUe: number;
  /** Transporte desde fuera de la UE. `null` mientras no se opere. */
  transporteExtraUe: number | null;
  /** Honorarios de Vantis: rango, porque varían por operación. */
  honorariosMin: number;
  honorariosMax: number;
  /** Homologación individual. Solo aplica fuera de la UE. */
  homologacionIndividual: number;
  /** Arancel sobre el valor. `null` mientras no se opere fuera de la UE. */
  arancelPct: number | null;
  /** Tipo de IVA general. */
  ivaPct: number;
  /** ITV, tasas de DGT, placas y gestoría de matriculación. */
  itv: number;
  tasasMatriculacion: number;
}

/**
 * Cifras de Vantis.
 *
 * PENDIENTE: `itv` y `tasasMatriculacion` están a cero porque no se han
 * facilitado. No son inventadas: están sin poner. Hasta que se rellenen, el
 * coste sale optimista en esa parte.
 */
export const SUPUESTOS: Supuestos = {
  transporteUe: 900,
  transporteExtraUe: null,
  honorariosMin: 3000,
  honorariosMax: 4000,
  homologacionIndividual: 2000,
  arancelPct: null,
  ivaPct: 21,
  itv: 0,
  tasasMatriculacion: 0,
};

export interface Entrada {
  /** Precio de compra en origen, en euros. */
  precioOrigen: number;
  /** Emisiones en g/km (WLTP). Determinan el tramo de IEDMT. */
  co2: number;
  origen: Origen;
  regimenIva: RegimenIva;
  /** Precio de un equivalente en el mercado español. Es la referencia
   *  contra la que se mide el ahorro. */
  precioMercadoEs: number;
  /**
   * Base imponible del IEDMT. En un usado NO es el precio pagado, sino el
   * valor de mercado según las tablas del ministerio menos la depreciación
   * por antigüedad. Si se deja sin poner se usa el precio de origen, que
   * suele sobreestimar el impuesto.
   */
  baseIedmt?: number;
}

/**
 * Tramos del impuesto de matriculación en península y Baleares (WLTP).
 * Canarias, Ceuta y Melilla tienen su propio régimen y no están contemplados.
 */
export function tipoIedmt(co2: number): number {
  if (co2 < 120) return 0;
  if (co2 < 160) return 4.75;
  if (co2 < 200) return 9.75;
  return 14.75;
}

export interface Concepto {
  clave: string;
  etiqueta: string;
  importe: number;
  /** Explica de dónde sale la cifra, para poder auditarla. */
  detalle?: string;
}

export interface Resultado {
  conceptos: Concepto[];
  /** Coste sin los honorarios: lo que cuesta poner el coche en la puerta. */
  subtotal: number;
  /** Precio final al cliente, con honorarios. Rango por el rango de honorarios. */
  precioClienteMin: number;
  precioClienteMax: number;
  /** Ahorro frente al mercado español. Negativo = no merece la pena. */
  ahorroMin: number;
  ahorroMax: number;
  ahorroPctMin: number;
  ahorroPctMax: number;
  merecePena: boolean;
  /** Cosas que el cálculo no puede resolver solo. */
  avisos: string[];
}

export function calcularImportacion(e: Entrada, s: Supuestos = SUPUESTOS): Resultado {
  const conceptos: Concepto[] = [];
  const avisos: string[] = [];

  conceptos.push({ clave: "compra", etiqueta: "Compra en origen", importe: e.precioOrigen });

  // --- Transporte ---
  const transporte = e.origen === "ue" ? s.transporteUe : s.transporteExtraUe;
  if (transporte === null) {
    avisos.push("No hay tarifa de transporte definida para origen fuera de la UE: el coste está incompleto.");
  } else {
    conceptos.push({
      clave: "transporte",
      etiqueta: "Transporte",
      importe: transporte,
      detalle: e.origen === "ue" ? "Media UE" : "Flete marítimo",
    });
  }

  // --- Arancel: solo fuera de la UE ---
  let arancel = 0;
  if (e.origen === "extraUe") {
    if (s.arancelPct === null) {
      avisos.push("No hay tipo de arancel definido: falta ese coste.");
    } else {
      arancel = e.precioOrigen * (s.arancelPct / 100);
      conceptos.push({
        clave: "arancel",
        etiqueta: "Arancel aduanero",
        importe: arancel,
        detalle: `${s.arancelPct}% sobre el valor`,
      });
    }
  }

  // --- IVA: donde se decide la operación ---
  if (e.regimenIva === "nuevo") {
    const base = e.precioOrigen + arancel;
    conceptos.push({
      clave: "iva",
      etiqueta: "IVA en España",
      importe: base * (s.ivaPct / 100),
      detalle: `${s.ivaPct}% — medio de transporte nuevo`,
    });
  } else if (e.regimenIva === "intracomunitario") {
    conceptos.push({
      clave: "iva",
      etiqueta: "IVA intracomunitario",
      importe: 0,
      detalle: "Inversión del sujeto pasivo: se autorrepercute y se deduce",
    });
    avisos.push("El IVA se ha tratado como neutro. Solo lo es si Vantis puede deducírselo íntegramente.");
  } else {
    conceptos.push({
      clave: "iva",
      etiqueta: "IVA",
      importe: 0,
      detalle: "Régimen de margen: ya soportado en origen",
    });
  }

  // --- Impuesto de matriculación ---
  const tipo = tipoIedmt(e.co2);
  const baseIedmt = e.baseIedmt ?? e.precioOrigen;
  conceptos.push({
    clave: "iedmt",
    etiqueta: "Impuesto de matriculación (IEDMT)",
    importe: baseIedmt * (tipo / 100),
    detalle: `${tipo}% — ${e.co2} g/km de CO₂`,
  });
  if (e.baseIedmt === undefined && tipo > 0) {
    avisos.push(
      "El IEDMT se ha calculado sobre el precio de compra. La base legal en un usado es el valor de las tablas del ministerio menos depreciación, normalmente menor: el impuesto real suele salir más bajo.",
    );
  }

  // --- Homologación: solo fuera de la UE ---
  if (e.origen === "extraUe") {
    conceptos.push({
      clave: "homologacion",
      etiqueta: "Homologación individual",
      importe: s.homologacionIndividual,
    });
  }

  if (s.itv > 0) conceptos.push({ clave: "itv", etiqueta: "ITV", importe: s.itv });
  if (s.tasasMatriculacion > 0)
    conceptos.push({ clave: "tasas", etiqueta: "Tasas, placas y gestoría", importe: s.tasasMatriculacion });
  if (s.itv === 0 && s.tasasMatriculacion === 0) {
    avisos.push("ITV, tasas de matriculación y gestoría están a cero: faltan por definir, así que el coste sale optimista.");
  }

  const subtotal = conceptos.reduce((n, c) => n + c.importe, 0);
  const precioClienteMin = subtotal + s.honorariosMin;
  const precioClienteMax = subtotal + s.honorariosMax;

  // Ojo al cruce: el precio MÁS ALTO produce el ahorro MÁS BAJO.
  const ahorroMin = e.precioMercadoEs - precioClienteMax;
  const ahorroMax = e.precioMercadoEs - precioClienteMin;

  return {
    conceptos,
    subtotal,
    precioClienteMin,
    precioClienteMax,
    ahorroMin,
    ahorroMax,
    ahorroPctMin: e.precioMercadoEs ? (ahorroMin / e.precioMercadoEs) * 100 : 0,
    ahorroPctMax: e.precioMercadoEs ? (ahorroMax / e.precioMercadoEs) * 100 : 0,
    // Se exige que salga a cuenta en el peor caso de honorarios, no en el mejor.
    merecePena: ahorroMin > 0,
    avisos,
  };
}

export function euros(n: number): string {
  return new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n);
}
