/**
 * Convierte el texto de un anuncio en una ficha estructurada.
 *
 * El texto lo pega la persona que está viendo el anuncio: la herramienta no
 * entra en ningún portal ni descarga nada. De la URL solo se guarda la
 * referencia interna, y las fotos no se copian -- son del vendedor.
 *
 * El análisis es determinista, a base de etiquetas conocidas, sin modelo de
 * lenguaje: no cuesta nada por uso, no inventa datos y falla de forma
 * predecible. Lo que no reconoce lo deja vacío para que se rellene a mano.
 *
 * **Cómo llega el texto.** La primera versión asumía `Etiqueta: valor` en la
 * misma línea, y con un anuncio real de mobile.de no acertaba casi nada:
 * el portal pone la etiqueta y el valor en **líneas separadas**, repite la
 * ficha dos veces, y al final pega la descripción del vendedor, que puede ser
 * un muro de doscientas líneas en otro idioma. Ahora se lee así:
 *
 *   1. El texto se parte en secciones por sus cabeceras conocidas.
 *   2. La ficha se saca solo de lo que va antes de la descripción del
 *      vendedor, mirando cada línea que sea una etiqueta y cogiendo la
 *      siguiente como valor (o lo que venga tras los dos puntos).
 *   3. El equipamiento sale de la sección de características, no de
 *      «cualquier línea corta», que es lo que antes se tragaba las etiquetas
 *      de la propia ficha.
 */

import { traducirFicha, traducirLista, detectarIdioma } from "./traducir";

export interface FichaExtraida {
  modelo: string;
  anio: string;
  km: string;
  precio: string;
  mercado: string;
  spec: Record<string, string>;
  equipamiento: string[];
  alertas: string[];
  camposVacios: string[];
  /** Idioma detectado del anuncio. Solo para avisar en el panel. */
  idioma: string;
  /** Términos que el glosario no conoce y siguen en su idioma original. */
  sinTraducir: string[];
}

/**
 * Frases que descartan una unidad o exigen mirarla de cerca.
 *
 * Ojo con buscar `accident` a secas: «Sin accidentes» lo contiene, y un
 * anuncio que presume de no haber tenido ninguno acababa marcado como
 * siniestrado. Pasó con el primer anuncio real que se probó. Por eso los
 * patrones son de frases completas y además hay una lista de lo contrario.
 */
const BANDERAS: Array<[RegExp, string]> = [
  [/unfall(fahrzeug|schaden|wagen)|accident damage|vehículo accidentado|accidentado\b/i,
    "El anuncio menciona daños por accidente"],
  [/motorschaden|engine damage|avería de motor/i, "Menciona avería de motor"],
  [/getriebeschaden|avería de cambio/i, "Menciona avería de cambio"],
  [/bastlerfahrzeug|ersatzteilträger|para piezas/i, "Vehículo para piezas o restauración"],
  [/exportfahrzeug|export vehicle/i, "Marcado como vehículo de exportación"],
  [/ohne (tüv|hu)\b|keine hu\b|sin itv/i, "Sin inspección técnica vigente"],
  [/nachlackier|lackschaden|repintado/i, "Repintado o daños de pintura declarados"],
  [/tachotausch|tacho getauscht/i, "Cuadro de instrumentos sustituido: kilometraje a verificar"],
  [/reimport/i, "Reimportación: comprobar la ficha técnica de origen"],
];

/** Lo contrario: si el anuncio dice esto, la bandera de accidente no aplica. */
const SIN_ACCIDENTES = /unfallfrei|sin accidentes|accident[- ]free|no accident/i;

/**
 * Etiquetas de la ficha, en los tres idiomas en que llegan los anuncios.
 *
 * El orden importa: se comprueban de más larga a más corta, para que
 * «Número de puertas» no lo capture «puertas» y «Clase de emisión» no lo
 * capture «emisión».
 */
const ETIQUETAS: Array<[string, string[]]> = [
  ["firstReg", ["primer registro", "primera matriculación", "primera matriculacion",
    "erstzulassung", "first registration"]],
  ["km", ["kilometraje", "kilometerstand", "mileage"]],
  ["power", ["potencia", "leistung", "power"]],
  ["fuel", ["tipo de combustible", "combustible", "kraftstoffart", "kraftstoff", "fuel type", "fuel"]],
  ["transmission", ["tipo de transmisión", "transmisión", "transmision", "cambio",
    "getriebeart", "getriebe", "gearbox", "transmission"]],
  ["engine", ["capacidad cúbica", "capacidad cubica", "cilindrada", "hubraum", "displacement"]],
  ["doors", ["número de puertas", "numero de puertas", "puertas", "türen", "tueren", "doors"]],
  ["seats", ["número de asientos", "numero de asientos", "plazas", "asientos",
    "sitzplätze", "sitzplaetze", "seats"]],
  ["color", ["color exterior", "außenfarbe", "aussenfarbe", "exterior colour", "colour", "farbe", "color"]],
  ["upholstery", ["diseño interior", "diseno interior", "tapicería", "tapiceria",
    "innenausstattung", "polsterung", "upholstery", "interior design"]],
  ["owners", ["número de propietarios", "numero de propietarios", "propietarios",
    "fahrzeughalter", "previous owners", "owners"]],
  ["body", ["categoría", "categoria", "carrocería", "carroceria", "fahrzeugtyp",
    "kategorie", "body type"]],
  ["co2", ["emisiones de co2", "co2-emissionen", "co2 emissionen", "co2 emissions", "emisiones"]],
  ["condition", ["estado del vehículo", "estado del vehiculo", "fahrzeugzustand", "vehicle condition"]],
  ["emission", ["clase de emisión", "clase de emision", "schadstoffklasse", "emission class"]],
  // Ojo: en mobile.de «Tipo de tracción» / «Antriebsart» no es delantera o
  // trasera, es si el coche es de combustión, eléctrico o híbrido. Etiquetarlo
  // como tracción en un anuncio de venta es decirle al cliente otra cosa.
  ["propulsion", ["tipo de tracción", "tipo de traccion", "antriebsart", "drive type"]],
  ["drive", ["tracción", "traccion", "antrieb", "drivetrain"]],
  ["climate", ["climatización", "climatizacion", "klimatisierung"]],
  ["inspection", ["próxima itv", "proxima itv", "hu", "tüv", "inspección técnica"]],
];

/** Cabeceras que marcan dónde empieza cada parte del anuncio. */
const CABECERA_EQUIPO = /^(características|caracteristicas|equipamiento|extras|ausstattung|sonderausstattung|serienausstattung|features|equipment)$/i;
const CABECERA_DESCRIPCION = /^(descripción del vehículo.*|descripcion del vehiculo.*|fahrzeugbeschreibung|vehicle description.*|descripción del vendedor.*)$/i;
const CABECERA_FICHA = /^(datos técnicos|datos tecnicos|technische daten|technical data|ficha técnica|ficha tecnica)$/i;

/** Marcas, para reconocer el título sin inventárselo. */
const MARCAS = /^(abarth|alfa romeo|alpina|aston martin|audi|bentley|bmw|bugatti|cadillac|chevrolet|chrysler|citroën|citroen|cupra|dacia|dodge|ds|ferrari|fiat|ford|genesis|gmc|honda|hyundai|infiniti|jaguar|jeep|kia|lamborghini|lancia|land rover|lexus|lotus|maserati|mazda|mclaren|mercedes(-| )?benz|mercedes|mg|mini|mitsubishi|nissan|opel|peugeot|polestar|porsche|ram|renault|rolls(-| )?royce|seat|škoda|skoda|smart|subaru|suzuki|tesla|toyota|volkswagen|vw|volvo)\b/i;

const MERCADOS: Array<[RegExp, string]> = [
  [/\b(deutschland|germany|alemania)\b/i, "Alemania"],
  [/\b(nederland|netherlands|pa[ií]ses bajos)\b/i, "Países Bajos"],
  [/\b(belgi[eë]|belgium|b[ée]lgica)\b/i, "Bélgica"],
  [/\b(italia|italy)\b/i, "Italia"],
  [/\b(france|francia)\b/i, "Francia"],
  [/\b(austria|[öo]sterreich)\b/i, "Austria"],
];

function limpiar(s: string): string {
  return s.replace(/\s+/g, " ").replace(/^[:\-–—•·*\s]+/, "").trim();
}

/** Para comparar etiquetas: sin mayúsculas, sin tildes, sin puntuación final. */
function normalizar(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[:.]+$/, "")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Miles siempre separados.
 *
 * `useGrouping: "always"` es de ES2023 y hace falta porque el modo por defecto
 * de es-ES deja las cifras de cuatro dígitos sin punto: 9500 en vez de 9.500.
 * La librería de tipos de TypeScript todavía lo declara `boolean`, así que el
 * cast es para el compilador, no para el navegador.
 */
const AGRUPADO = { useGrouping: "always" } as unknown as Intl.NumberFormatOptions;

function agrupar(n: number): string {
  return new Intl.NumberFormat("es-ES", AGRUPADO).format(n);
}

/** 46.900 € / EUR 46900 / 46 900,- → "46.900 €" */
function normalizarPrecio(bruto: string): string {
  const n = Number(bruto.replace(/[^\d]/g, ""));
  if (!Number.isFinite(n) || n <= 0) return "";
  return agrupar(n) + " €";
}

/** Etiquetas normalizadas, de más larga a más corta. */
const ETIQUETAS_ORDENADAS = ETIQUETAS.flatMap(([campo, alias]) =>
  alias.map((a) => ({ campo, alias: normalizar(a) })),
).sort((a, b) => b.alias.length - a.alias.length);

/** Si la línea es exactamente una etiqueta, devuelve su campo. */
function campoDeEtiqueta(linea: string): string | null {
  const n = normalizar(linea);
  return ETIQUETAS_ORDENADAS.find((e) => e.alias === n)?.campo ?? null;
}

/** Si la línea es «Etiqueta: valor», devuelve ambos. */
function campoConValor(linea: string): { campo: string; valor: string } | null {
  const corte = linea.indexOf(":");
  if (corte < 1) return null;
  const campo = campoDeEtiqueta(linea.slice(0, corte));
  const valor = limpiar(linea.slice(corte + 1));
  return campo && valor ? { campo, valor } : null;
}

export function parsearAnuncio(texto: string, url = ""): FichaExtraida {
  const t = texto.replace(/ /g, " ");
  const lineas = t.split("\n").map((l) => l.replace(/^[•·\-*\s]+/, "").trim());

  // --- Dónde empieza cada parte ---
  const iEquipo = lineas.findIndex((l) => CABECERA_EQUIPO.test(normalizar(l)));
  const iDescripcion = lineas.findIndex((l) => CABECERA_DESCRIPCION.test(normalizar(l)));

  // La ficha se lee solo de la parte estructurada. La descripción libre del
  // vendedor queda fuera a propósito: es donde estaba «Komfort,
  // Innenausstattung», que se colaba como si fuera la tapicería.
  const finFicha = Math.min(
    ...[iEquipo, iDescripcion].filter((i) => i >= 0).concat(lineas.length),
  );
  const deFicha = lineas.slice(0, finFicha);

  // --- Ficha técnica ---
  const spec: Record<string, string> = {};
  for (let i = 0; i < deFicha.length; i++) {
    const linea = deFicha[i];
    if (!linea) continue;

    const inline = campoConValor(linea);
    if (inline && !spec[inline.campo]) {
      spec[inline.campo] = inline.valor;
      continue;
    }

    // Etiqueta sola en su línea: el valor es la siguiente que tenga contenido
    // y no sea a su vez otra etiqueta.
    const campo = campoDeEtiqueta(linea);
    if (!campo || spec[campo]) continue;
    const siguiente = deFicha.slice(i + 1).find((l) => l.length > 0);
    if (siguiente && !campoDeEtiqueta(siguiente) && !CABECERA_FICHA.test(normalizar(siguiente))) {
      spec[campo] = limpiar(siguiente);
    }
  }

  // Kilometraje y potencia se normalizan; el resto va tal cual.
  const kmBruto = spec.km ?? "";
  delete spec.km;
  const km = kmBruto.match(/([0-9][0-9.\s]{2,12})/);
  const kmTexto = km ? agrupar(Number(km[1].replace(/[^\d]/g, ""))) + " km" : "";

  // --- Precio ---
  const precio = t.match(/(?:€|eur)\s*([0-9][0-9.,\s]{3,12})|([0-9][0-9.,\s]{3,12})\s*(?:€|eur)/i);
  const precioTexto = precio ? normalizarPrecio(precio[1] ?? precio[2]) : "";

  // --- Año, de la primera matriculación ---
  let anio = "";
  const deFirstReg = (spec.firstReg ?? "").match(/([0-9]{4})/);
  if (deFirstReg) anio = deFirstReg[1];

  // --- Mercado ---
  let mercado = "";
  for (const [re, nombre] of MERCADOS) {
    if (re.test(t) || re.test(url)) { mercado = nombre; break; }
  }
  // mobile.de y AutoScout24 alemán: si no se ha dicho otra cosa, es Alemania.
  if (!mercado && /mobile\.de|autoscout24\.de/i.test(url)) mercado = "Alemania";

  // --- Modelo ---
  // Solo si una línea empieza por una marca conocida. Antes se cogía la
  // primera línea con más de seis letras, y en un anuncio real eso daba
  // «Kilometraje». Mejor vacío y que se escriba a mano que inventado.
  const modelo = limpiar(
    (lineas.find((l) => l.length > 3 && l.length < 90 && MARCAS.test(l)) ?? "").slice(0, 90),
  );

  // --- Equipamiento ---
  // De la sección de características hasta la siguiente cabecera. Antes se
  // cogía «cualquier línea corta sin dos puntos», y eso se tragaba las
  // etiquetas de la propia ficha.
  let equipamientoBruto: string[] = [];
  if (iEquipo >= 0) {
    const fin = iDescripcion > iEquipo ? iDescripcion : lineas.length;
    equipamientoBruto = lineas
      .slice(iEquipo + 1, fin)
      .filter((l) => l.length > 2 && l.length < 70 && !CABECERA_FICHA.test(normalizar(l)))
      .slice(0, 60);
  }

  const idioma = detectarIdioma(texto);
  // Si el anuncio ya viene en español no hay nada que traducir, así que
  // tampoco hay nada que avisar: marcarlo sería ruido, no información.
  const avisar = idioma !== "español";
  const equipoEs = traducirLista(equipamientoBruto);
  const fichaEs = traducirFicha(spec);

  const alertas = BANDERAS.filter(([re, aviso]) => {
    if (!re.test(t)) return false;
    if (aviso.includes("accidente") && SIN_ACCIDENTES.test(t)) return false;
    return true;
  }).map(([, aviso]) => aviso);

  const camposVacios = [
    ["modelo", modelo], ["año", anio], ["kilometraje", kmTexto],
    ["precio", precioTexto], ["mercado", mercado],
  ].filter(([, v]) => !v).map(([k]) => k as string);

  return {
    modelo, anio, km: kmTexto, precio: precioTexto, mercado,
    spec: fichaEs.spec,
    equipamiento: equipoEs.lineas,
    alertas, camposVacios, idioma,
    sinTraducir: avisar
      ? [...new Set([...fichaEs.sinTraducir, ...equipoEs.sinTraducir])]
      : [],
  };
}

/** "BMW M3 Competition Touring" + "D-112" → "bmw-m3-competition-touring-d112" */
export function generarSlug(modelo: string, id: string): string {
  const base = `${modelo} ${id.replace(/[^a-zA-Z0-9]/g, "")}`
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return base || "unidad";
}
