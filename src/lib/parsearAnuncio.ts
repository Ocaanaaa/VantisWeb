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
 */

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
}

/** Frases que descartan una unidad o exigen mirarla de cerca. */
const BANDERAS: Array<[RegExp, string]> = [
  [/unfall(fahrzeug|schaden)|accident/i, "El anuncio menciona daños por accidente"],
  [/motorschaden|engine damage/i, "Menciona avería de motor"],
  [/getriebeschaden/i, "Menciona avería de cambio"],
  [/bastlerfahrzeug|ersatzteilträger/i, "Vehículo para piezas o restauración"],
  [/export(fahrzeug)?\b/i, "Marcado como vehículo de exportación"],
  [/ohne (tüv|hu)|keine hu/i, "Sin inspección técnica vigente"],
  [/nachlackier|lackschaden/i, "Repintado o daños de pintura declarados"],
  [/tachotausch|tacho getauscht/i, "Cuadro de instrumentos sustituido: kilometraje a verificar"],
  [/reimport/i, "Reimportación: comprobar la ficha técnica de origen"],
];

/** Etiquetas de mobile.de y AutoScout24, y su equivalente en la ficha. */
const CAMPOS: Array<[string, RegExp]> = [
  ["firstReg", /(?:erstzulassung|first registration|primera matriculaci[oó]n)\s*[:\n]?\s*([0-9]{1,2}[./][0-9]{4}|[0-9]{4})/i],
  ["power", /(?:leistung|power|potencia)\s*[:\n]?\s*([0-9.]+\s*(?:kw|cv|ps|hp)[^\n,;]*)/i],
  ["fuel", /(?:kraftstoff(?:art)?|fuel|combustible)\s*[:\n]?\s*([^\n,;]{3,30})/i],
  ["transmission", /(?:getriebe(?:art)?|gearbox|transmission|cambio)\s*[:\n]?\s*([^\n,;]{3,30})/i],
  ["engine", /(?:hubraum|displacement|cilindrada)\s*[:\n]?\s*([0-9.,]+\s*(?:cm³|ccm|cc|l)[^\n,;]*)/i],
  ["doors", /(?:t[üu]ren|doors|puertas)\s*[:\n]?\s*([0-9]{1}(?:\/[0-9])?)/i],
  ["seats", /(?:sitzpl[äa]tze|seats|plazas)\s*[:\n]?\s*([0-9]{1,2})/i],
  ["color", /(?:au[ßs]enfarbe|farbe|colour|color exterior)\s*[:\n]?\s*([^\n,;]{3,40})/i],
  ["upholstery", /(?:innenausstattung|polsterung|upholstery|tapicer[ií]a)\s*[:\n]?\s*([^\n,;]{3,40})/i],
  ["owners", /(?:fahrzeughalter|previous owners|propietarios)\s*[:\n]?\s*([0-9]{1,2})/i],
  ["body", /(?:kategorie|fahrzeugtyp|body type|carrocer[ií]a)\s*[:\n]?\s*([^\n,;]{3,30})/i],
  ["co2", /(?:co2[- ]?emission(?:en)?|emisiones)\s*[:\n]?\s*([0-9]{2,3})\s*g/i],
];

const MERCADOS: Array<[RegExp, string]> = [
  [/\b(deutschland|germany|alemania|\bDE\b)\b/i, "Alemania"],
  [/\b(nederland|netherlands|pa[ií]ses bajos|\bNL\b)\b/i, "Países Bajos"],
  [/\b(belgi[eë]|belgium|b[ée]lgica|\bBE\b)\b/i, "Bélgica"],
  [/\b(italia|italy|\bIT\b)\b/i, "Italia"],
  [/\b(france|francia|\bFR\b)\b/i, "Francia"],
  [/\b(austria|[öo]sterreich|\bAT\b)\b/i, "Austria"],
];

function limpiar(s: string): string {
  return s.replace(/\s+/g, " ").trim();
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

export function parsearAnuncio(texto: string, url = ""): FichaExtraida {
  const t = texto.replace(/ /g, " ");
  const spec: Record<string, string> = {};

  for (const [clave, re] of CAMPOS) {
    const m = t.match(re);
    if (m) spec[clave] = limpiar(m[1]);
  }

  // Kilometraje: la cifra seguida de km, con separadores de miles.
  const km = t.match(/([0-9][0-9.\s]{2,12})\s*km\b/i);
  const kmTexto = km
    ? agrupar(Number(km[1].replace(/[^\d]/g, ""))) + " km"
    : "";

  // Precio: el primer importe con símbolo de euro y al menos cuatro cifras.
  const precio = t.match(/(?:€|eur)\s*([0-9][0-9.,\s]{3,12})|([0-9][0-9.,\s]{3,12})\s*(?:€|eur)/i);
  const precioTexto = precio ? normalizarPrecio(precio[1] ?? precio[2]) : "";

  // Año: el de primera matriculación si está, si no un año suelto plausible.
  let anio = "";
  if (spec.firstReg) {
    const a = spec.firstReg.match(/([0-9]{4})/);
    if (a) anio = a[1];
  }
  if (!anio) {
    const a = t.match(/\b(19[6-9][0-9]|20[0-4][0-9])\b/);
    if (a) anio = a[1];
  }

  let mercado = "";
  for (const [re, nombre] of MERCADOS) {
    if (re.test(t) || re.test(url)) { mercado = nombre; break; }
  }

  // El modelo suele ser la primera línea con contenido del anuncio pegado.
  const modelo = limpiar(
    (t.split("\n").find((l) => l.trim().length > 6 && !/^[\d\s.,€]+$/.test(l)) ?? "").slice(0, 90),
  );

  // Equipamiento: líneas cortas de una lista, sin dos puntos.
  const equipamiento = t
    .split("\n")
    .map((l) => l.replace(/^[•·\-*\s]+/, "").trim())
    .filter(
      (l) =>
        l.length > 3 && l.length < 60 && !l.includes(":") && !/\d{3,}/.test(l) &&
        // La primera linea ya se ha usado como modelo: no se repite aqui.
        l !== modelo,
    )
    .slice(0, 12);

  const alertas = BANDERAS.filter(([re]) => re.test(t)).map(([, aviso]) => aviso);

  const camposVacios = [
    ["modelo", modelo], ["año", anio], ["kilometraje", kmTexto],
    ["precio", precioTexto], ["mercado", mercado],
  ].filter(([, v]) => !v).map(([k]) => k as string);

  return { modelo, anio, km: kmTexto, precio: precioTexto, mercado, spec, equipamiento, alertas, camposVacios };
}

/** "BMW M3 Competition Touring" + "D-112" → "bmw-m3-competition-touring-d112" */
export function generarSlug(modelo: string, id: string): string {
  const base = `${modelo} ${id.replace(/[^a-zA-Z0-9]/g, "")}`
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return base || "unidad";
}
