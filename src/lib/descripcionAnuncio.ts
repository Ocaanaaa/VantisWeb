import type { Unidad } from "./unidades";

/**
 * Redacta el anuncio de una unidad a partir de su ficha.
 *
 * El mismo texto sirve para la web y para pegarlo en coches.net, Wallapop o
 * donde haga falta, así que sale en texto plano con secciones en mayúsculas:
 * es lo único que respetan todos los portales, que suelen comerse el formato.
 *
 * Es una plantilla, no un modelo de lenguaje. Misma razón que el resto del
 * analizador: no cuesta por uso, da el mismo resultado con los mismos datos y
 * **no se inventa nada del coche**. Un texto comercial escrito por un modelo
 * acabaría diciendo «impecable» de una unidad que no ha visto nadie, y eso en
 * un anuncio de venta no es una florituras: es una afirmación sobre el estado.
 *
 * La prosa fija -- qué incluye el precio, financiación, quiénes somos -- vive
 * en `copy.es.ts`, para poder cambiarla sin tocar código.
 */

export interface TextosAnuncio {
  intro: string;
  incluyeTitulo: string;
  incluye: string;
  financiacionTitulo: string;
  financiacion: string;
  nosotrosTitulo: string;
  nosotros: string;
  contactoTitulo: string;
  contacto: string;
  /** Aviso sobre el precio. Va al final, y en un anuncio de venta hace falta. */
  aviso: string;
  fichaTitulo: string;
  equipamientoTitulo: string;
}

/**
 * Lo que de verdad vende, por orden.
 *
 * Un anuncio con cincuenta y cinco líneas de equipamiento no lo lee nadie, y
 * enterrar el techo solar entre el ABS y el cierre centralizado es tirar el
 * mejor argumento. Esto sube lo que la gente busca y deja fuera lo que lleva
 * cualquier coche desde hace veinte años.
 */
const PRIORIDAD: RegExp[] = [
  /techo (solar|panor|corred)/i,
  /cuero|piel|nappa|alcantara/i,
  /head.?up/i,
  /l[áa]ser|matrix|led.*faro|faros.*(l[áa]ser|led|matrix)/i,
  /asientos.*(calefac|ventila|masaje|memoria|deportivos|el[ée]ctric)/i,
  /navegaci[óo]n|navegador/i,
  /c[áa]mara|360/i,
  /sonido|harman|bose|burmester|bang|hifi/i,
  /adaptativ|crucero|distancia/i,
  /suspensi[óo]n|amortigua|neum[áa]tica/i,
  /levas|autoblocante|diferencial|escape/i,
  /carplay|android auto|inal[áa]mbric|inducci[óo]n/i,
  /llantas|ruedas|felgen/i,
  /paquete|equipamiento deportivo|m sport|sportpaket/i,
  /panel.*digital|instrumentos digital|pantalla/i,
];

/** Cosas que no aportan nada en un anuncio: las lleva todo el mundo. */
const IRRELEVANTE = /^(abs|esp|asr|isofix|airbag|inmovilizador|direcci[óo]n asistida|cierre centralizado|elevalunas|control de tracci[óo]n|filtro de part[íi]culas|kit de emergencia|reposabrazos|puerto usb|bluetooth)/i;

export function destacarEquipamiento(lista: string[], cuantos = 12): string[] {
  const útiles = lista.filter((e) => !IRRELEVANTE.test(e.trim()));
  const puntuar = (e: string) => {
    const i = PRIORIDAD.findIndex((re) => re.test(e));
    return i === -1 ? PRIORIDAD.length : i;
  };
  return [...útiles]
    .map((e, orden) => ({ e, orden, p: puntuar(e) }))
    // A igual prioridad se respeta el orden del anuncio, para no barajar.
    .sort((a, b) => a.p - b.p || a.orden - b.orden)
    .slice(0, cuantos)
    .map((x) => x.e);
}

/**
 * Sustituye {modelo}, {mercado}, {referencia}… en la prosa fija.
 *
 * Si un dato falta, **se cae la frase entera**, no solo el hueco. Con la
 * sustitución a secas salía «La traemos de , se inspecciona antes de
 * comprarla», que en un anuncio publicado queda como que nadie lo ha leído.
 *
 * Por eso la prosa de `copy.es.ts` pone cada hueco en su propia frase: así lo
 * que se pierde al caer es solo ese dato, no medio párrafo.
 */
function rellenar(plantilla: string, datos: Record<string, string>): string {
  return plantilla
    // Corta tras el punto, conservando el punto en la frase.
    .split(/(?<=\.)\s+/)
    .filter((frase) => {
      const huecos = frase.match(/\{(\w+)\}/g) ?? [];
      return huecos.every((h) => (datos[h.slice(1, -1)] ?? "").trim() !== "");
    })
    .join(" ")
    .replace(/\{(\w+)\}/g, (_, clave: string) => datos[clave] ?? "")
    .replace(/\s+/g, " ")
    .trim();
}

export function generarDescripcion(
  u: Pick<Unidad, "model" | "year" | "km" | "market" | "price" | "spec" | "equipment" | "id">,
  textos: TextosAnuncio,
  etiquetas: Record<string, string>,
): string {
  const datos = {
    modelo: u.model || "",
    anio: u.year || "",
    km: u.km || "",
    mercado: u.market || "",
    precio: u.price || "",
    referencia: u.id || "",
  };

  const partes: string[] = [];

  // Titular: lo que se lee en dos segundos.
  const titular = [u.model, u.year, u.km, u.spec?.power].filter(Boolean).join(" · ");
  if (titular) partes.push(titular.toUpperCase());

  const intro = rellenar(textos.intro, datos).trim();
  if (intro) partes.push(intro);

  // Ficha, en el orden en que se lee un anuncio, no en el que llegó.
  const ORDEN = ["firstReg", "km", "power", "engine", "fuel", "transmission", "drive",
    "propulsion", "body", "doors", "seats", "color", "upholstery", "owners", "condition",
    "emission", "co2", "climate", "inspection"];
  const filas: string[] = [];
  if (u.km) filas.push(`· ${etiquetas.km ?? "Kilometraje"}: ${u.km}`);
  for (const clave of ORDEN) {
    if (clave === "km") continue;
    const valor = u.spec?.[clave];
    if (valor) filas.push(`· ${etiquetas[clave] ?? clave}: ${valor}`);
  }
  if (u.market) filas.push(`· ${etiquetas.market ?? "Mercado de origen"}: ${u.market}`);
  if (filas.length) partes.push([textos.fichaTitulo, ...filas].join("\n"));

  const destacado = destacarEquipamiento(u.equipment ?? []);
  if (destacado.length) {
    partes.push([textos.equipamientoTitulo, ...destacado.map((e) => `· ${e}`)].join("\n"));
  }

  for (const [titulo, cuerpo] of [
    [textos.incluyeTitulo, textos.incluye],
    [textos.financiacionTitulo, textos.financiacion],
    [textos.nosotrosTitulo, textos.nosotros],
    [textos.contactoTitulo, textos.contacto],
  ]) {
    const texto = rellenar(cuerpo, datos).trim();
    if (texto) partes.push(`${titulo}\n${texto}`);
  }

  const aviso = rellenar(textos.aviso, datos).trim();
  if (aviso) partes.push(aviso);

  return partes.join("\n\n");
}
