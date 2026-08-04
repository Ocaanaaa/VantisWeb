/**
 * Traduce al español lo que sale de un anuncio en alemán o inglés.
 *
 * Es un glosario, no un traductor automático. La decisión es deliberada y va
 * en la misma línea que el analizador: el vocabulario de un anuncio de coche
 * es cerrado —mobile.de y AutoScout24 usan listas de casillas fijas— así que
 * un glosario lo cubre casi entero, no cuesta nada por uso, da siempre la
 * misma traducción para el mismo término y **no se inventa nada**. Un modelo
 * de lenguaje traduciría «Standheizung» de cinco formas distintas y algún día
 * convertiría un «Unfallfahrzeug» en algo que suena bien.
 *
 * A cambio, lo que no está en el glosario se queda tal cual y **se avisa**.
 * Preferible a devolver medio castellano y medio alemán sin decirlo: lo que
 * queda sin traducir se ve en el panel y se corrige a mano.
 */

/** Clave de búsqueda: sin mayúsculas, sin diéresis, sin puntuación. */
function normalizar(s: string): string {
  return s
    .toLowerCase()
    .replace(/ß/g, "ss")
    .replace(/ä/g, "a").replace(/ö/g, "o").replace(/ü/g, "u")
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function capitalizar(s: string): string {
  return s ? s[0].toUpperCase() + s.slice(1) : s;
}

/**
 * Términos que ya se escriben igual en español.
 *
 * Están aquí para que no salgan marcados como pendientes de traducir: son
 * traducciones correctas, no huecos.
 */
const IGUAL = [
  "abs", "esp", "asr", "isofix", "bluetooth", "usb", "wifi", "gps", "led", "matrix led",
  "apple carplay", "carplay", "android auto", "airbag", "airbags", "adblue", "start stop",
  "alcantara", "nappa", "bose", "harman kardon", "burmester", "bang olufsen", "meridian",
  "dab", "hifi", "head up display", "launch control", "cruise control", "keyless",
  "xenon", "bi xenon", "eco", "sport", "comfort", "offroad", "4x4", "awd", "tv", "dvd",
];

/**
 * Frases completas. Es el camino principal: casi todo el equipamiento de un
 * anuncio viene de una lista de casillas, así que llega literal.
 */
const GLOSARIO: Record<string, string> = {
  // --- Confort ---
  "klimaanlage": "Aire acondicionado",
  "air conditioning": "Aire acondicionado",
  "klimaautomatik": "Climatizador automático",
  "automatic climate control": "Climatizador automático",
  "2 zonen klimaautomatik": "Climatizador bizona",
  "3 zonen klimaautomatik": "Climatizador de tres zonas",
  "4 zonen klimaautomatik": "Climatizador de cuatro zonas",
  "sitzheizung": "Calefacción de asientos",
  "heated seats": "Asientos calefactables",
  "sitzbeluftung": "Ventilación de asientos",
  "ventilated seats": "Asientos ventilados",
  "massagesitze": "Asientos con masaje",
  "massage seats": "Asientos con masaje",
  "memory sitze": "Asientos con memoria",
  "sitzmemory": "Asientos con memoria",
  "elektrische sitze": "Asientos eléctricos",
  "elektrisch verstellbare sitze": "Asientos de regulación eléctrica",
  "sportsitze": "Asientos deportivos",
  "sports seats": "Asientos deportivos",
  "schalensitze": "Asientos baquet",
  "ledersitze": "Asientos de cuero",
  "leather seats": "Asientos de cuero",
  "lederlenkrad": "Volante de cuero",
  "leather steering wheel": "Volante de cuero",
  "lenkradheizung": "Volante calefactable",
  "beheizbares lenkrad": "Volante calefactable",
  "heated steering wheel": "Volante calefactable",
  "multifunktionslenkrad": "Volante multifunción",
  "multifunction steering wheel": "Volante multifunción",
  "schaltwippen": "Levas en el volante",
  "paddle shifters": "Levas en el volante",
  "armlehne": "Reposabrazos",
  "standheizung": "Calefacción independiente",
  "auxiliary heating": "Calefacción independiente",
  "beheizbare frontscheibe": "Parabrisas calefactable",
  "ambientebeleuchtung": "Iluminación ambiental",
  "ambiente beleuchtung": "Iluminación ambiental",
  "ambient lighting": "Iluminación ambiental",
  "panoramadach": "Techo panorámico",
  "panoramic roof": "Techo panorámico",
  "glasdach": "Techo de cristal",
  "schiebedach": "Techo solar",
  "sunroof": "Techo solar",
  "sonnenschutzrollo": "Cortinillas parasol",
  "elektrische fensterheber": "Elevalunas eléctricos",
  "electric windows": "Elevalunas eléctricos",
  "elektrische heckklappe": "Portón eléctrico",
  "electric tailgate": "Portón eléctrico",
  "elektrische seitenspiegel": "Retrovisores eléctricos",
  "abblendbarer innenspiegel": "Retrovisor interior antideslumbrante",
  "zentralverriegelung": "Cierre centralizado",
  "central locking": "Cierre centralizado",
  "schlussellose zentralverriegelung": "Acceso sin llave",
  "keyless entry": "Acceso sin llave",
  "keyless go": "Arranque sin llave",
  "servolenkung": "Dirección asistida",
  "power steering": "Dirección asistida",

  // --- Multimedia ---
  "navigationssystem": "Navegador",
  "navigation system": "Navegador",
  "navi": "Navegador",
  "bordcomputer": "Ordenador de a bordo",
  "on board computer": "Ordenador de a bordo",
  "freisprecheinrichtung": "Manos libres",
  "hands free": "Manos libres",
  "sprachsteuerung": "Control por voz",
  "voice control": "Control por voz",
  "soundsystem": "Equipo de sonido",
  "sound system": "Equipo de sonido",
  "musikstreaming": "Reproducción en streaming",
  "dab radio": "Radio DAB",
  "touchscreen": "Pantalla táctil",
  "volldigitales kombiinstrument": "Cuadro de instrumentos digital",
  "digitales cockpit": "Cuadro digital",
  "digital cockpit": "Cuadro digital",
  "virtual cockpit": "Virtual cockpit",
  "induktives laden": "Carga inalámbrica",
  "wireless charging": "Carga inalámbrica",

  // --- Asistentes y seguridad ---
  "einparkhilfe": "Sensores de aparcamiento",
  "parking sensors": "Sensores de aparcamiento",
  "parking assist": "Asistente de aparcamiento",
  "parklenkassistent": "Asistente de aparcamiento",
  "ruckfahrkamera": "Cámara trasera",
  "rear view camera": "Cámara trasera",
  "rundumsicht kamera": "Cámara 360°",
  "360 kamera": "Cámara 360°",
  "360 camera": "Cámara 360°",
  "tempomat": "Control de velocidad",
  "abstandstempomat": "Control de velocidad adaptativo",
  "adaptive cruise control": "Control de velocidad adaptativo",
  "spurhalteassistent": "Asistente de mantenimiento de carril",
  "lane assist": "Asistente de carril",
  "lane departure warning": "Aviso de cambio de carril",
  "totwinkelassistent": "Detector de ángulo muerto",
  "blind spot": "Detector de ángulo muerto",
  "blind spot monitor": "Detector de ángulo muerto",
  "notbremsassistent": "Frenada automática de emergencia",
  "emergency brake assist": "Frenada automática de emergencia",
  "berganfahrassistent": "Asistente de arranque en pendiente",
  "hill start assist": "Asistente de arranque en pendiente",
  "verkehrszeichenerkennung": "Reconocimiento de señales",
  "traffic sign recognition": "Reconocimiento de señales",
  "mudigkeitswarner": "Detector de fatiga",
  "nachtsichtassistent": "Visión nocturna",
  "night vision": "Visión nocturna",
  "reifendruckkontrolle": "Control de presión de neumáticos",
  "tyre pressure monitoring": "Control de presión de neumáticos",
  "regensensor": "Sensor de lluvia",
  "rain sensor": "Sensor de lluvia",
  "lichtsensor": "Sensor de luz",
  "fernlichtassistent": "Asistente de luces largas",
  "blendfreies fernlicht": "Luces largas no deslumbrantes",
  "traktionskontrolle": "Control de tracción",
  "alarmanlage": "Alarma",
  "alarm system": "Alarma",
  "wegfahrsperre": "Inmovilizador",
  "elektronische parkbremse": "Freno de estacionamiento eléctrico",
  "notrufsystem": "Sistema de llamada de emergencia",

  // --- Luces y exterior ---
  "led scheinwerfer": "Faros LED",
  "led headlights": "Faros LED",
  "matrix led scheinwerfer": "Faros Matrix LED",
  "xenonscheinwerfer": "Faros de xenón",
  "bi xenon scheinwerfer": "Faros bixenón",
  "laserlicht": "Faros láser",
  "nebelscheinwerfer": "Faros antiniebla",
  "fog lights": "Faros antiniebla",
  "kurvenlicht": "Luz de curva",
  "adaptives kurvenlicht": "Luz de curva adaptativa",
  "tagfahrlicht": "Luz diurna",
  "daytime running lights": "Luz diurna",
  "leichtmetallfelgen": "Llantas de aleación",
  "alloy wheels": "Llantas de aleación",
  "dachreling": "Barras de techo",
  "roof rails": "Barras de techo",
  "anhangerkupplung": "Enganche de remolque",
  "tow bar": "Enganche de remolque",
  "towbar": "Enganche de remolque",
  "skisack": "Portaesquís",
  "windschott": "Cortavientos",

  // --- Mecánica ---
  "allradantrieb": "Tracción total",
  "all wheel drive": "Tracción total",
  "four wheel drive": "Tracción total",
  "hinterradantrieb": "Tracción trasera",
  "rear wheel drive": "Tracción trasera",
  "frontantrieb": "Tracción delantera",
  "front wheel drive": "Tracción delantera",
  "luftfederung": "Suspensión neumática",
  "air suspension": "Suspensión neumática",
  "adaptives fahrwerk": "Suspensión adaptativa",
  "sportfahrwerk": "Suspensión deportiva",
  "sports suspension": "Suspensión deportiva",
  "gewindefahrwerk": "Suspensión roscada",
  "wankstabilisierung": "Estabilización antibalanceo",
  "sperrdifferential": "Diferencial autoblocante",
  "limited slip differential": "Diferencial autoblocante",
  "keramikbremsen": "Frenos cerámicos",
  "ceramic brakes": "Frenos cerámicos",
  "sportabgasanlage": "Escape deportivo",
  "sport exhaust": "Escape deportivo",
  "abgasanlage": "Línea de escape",
  "partikelfilter": "Filtro de partículas",
  "start stopp automatik": "Sistema start/stop",
  "allwetterreifen": "Neumáticos all-season",
  "sommerreifen": "Neumáticos de verano",
  "winterreifen": "Neumáticos de invierno",
  "winter tyres": "Neumáticos de invierno",

  // --- Paquetes y estado ---
  "sportpaket": "Paquete deportivo",
  "winterpaket": "Paquete invierno",
  "technikpaket": "Paquete tecnología",
  "assistenzpaket": "Paquete de asistentes",
  "scheckheftgepflegt": "Libro de mantenimiento al día",
  "full service history": "Historial de mantenimiento completo",
  "unfallfrei": "Sin accidentes",
  "nichtraucherfahrzeug": "Vehículo de no fumador",
  "non smoker vehicle": "Vehículo de no fumador",
  "garantie": "Garantía",
  "werksgarantie": "Garantía de fábrica",
  "warranty": "Garantía",
  "erstbesitz": "Primera mano",
  "one owner": "Un solo propietario",
  "first owner": "Primer propietario",
  "garagenwagen": "Guardado en garaje",
  "hu au neu": "ITV recién pasada",
  "tuv neu": "ITV recién pasada",
  "reifen neu": "Neumáticos nuevos",
  "inspektion neu": "Revisión recién hecha",
  "zahnriemen neu": "Correa de distribución nueva",
  "scheckheft": "Libro de mantenimiento",
  "garantieverlangerung": "Extensión de garantía",
};

/**
 * Valores de la ficha técnica: combustible, cambio, carrocería, color,
 * tapicería. Se traducen por partes, porque llegan combinados
 * («Leder, Schwarz», «Automatik, 8 Gang»).
 */
const VALORES: Record<string, string> = {
  // Combustible
  "benzin": "Gasolina", "petrol": "Gasolina", "gasoline": "Gasolina",
  "diesel": "Diésel",
  "elektro": "Eléctrico", "electric": "Eléctrico",
  "hybrid": "Híbrido", "hybrid benzin": "Híbrido de gasolina",
  "plug in hybrid": "Híbrido enchufable",
  "erdgas": "Gas natural", "autogas": "GLP", "lpg": "GLP", "cng": "Gas natural",
  "wasserstoff": "Hidrógeno",

  // Cambio
  "automatik": "Automático", "automatic": "Automático",
  "schaltgetriebe": "Manual", "manuell": "Manual", "manual": "Manual",
  "halbautomatik": "Semiautomático",
  "gang": "vel.", "speed": "vel.",
  "doppelkupplung": "Doble embrague",

  // Carrocería
  "limousine": "Berlina", "sedan": "Berlina", "saloon": "Berlina",
  "kombi": "Familiar", "estate": "Familiar", "wagon": "Familiar", "touring": "Familiar",
  "kleinwagen": "Utilitario", "hatchback": "Compacto",
  "cabrio": "Descapotable", "cabriolet": "Descapotable", "convertible": "Descapotable",
  "roadster": "Roadster",
  "coupe": "Cupé",
  "gelandewagen": "Todoterreno", "suv": "SUV", "pickup": "Pick-up",
  "van": "Monovolumen", "kleinbus": "Monovolumen", "minivan": "Monovolumen",
  "sportwagen": "Deportivo",

  // Estado
  "neu": "Nuevo", "new": "Nuevo",
  "gebraucht": "Usado", "used": "Usado",
  "jahreswagen": "Seminuevo",
  "vorfuhrfahrzeug": "Vehículo de demostración", "demo": "Vehículo de demostración",
  "oldtimer": "Clásico", "youngtimer": "Clásico moderno",

  // Colores
  "schwarz": "Negro", "black": "Negro",
  "weiss": "Blanco", "white": "Blanco",
  "grau": "Gris", "grey": "Gris", "gray": "Gris",
  "silber": "Plata", "silver": "Plata",
  "blau": "Azul", "blue": "Azul",
  "rot": "Rojo", "red": "Rojo",
  "grun": "Verde", "green": "Verde",
  "gelb": "Amarillo", "yellow": "Amarillo",
  "braun": "Marrón", "brown": "Marrón",
  "beige": "Beige", "orange": "Naranja",
  "gold": "Oro", "bronze": "Bronce", "violett": "Violeta", "purple": "Morado",
  "metallic": "metalizado", "perleffekt": "efecto perlado", "uni": "liso",
  "matt": "mate",

  // Tapicería
  "leder": "Cuero", "leather": "Cuero",
  "vollleder": "Cuero total", "teilleder": "Cuero parcial", "part leather": "Cuero parcial",
  "kunstleder": "Piel sintética",
  "stoff": "Tela", "cloth": "Tela", "fabric": "Tela",
  "velours": "Terciopelo",
  "andere": "Otros", "other": "Otros",
};

/** Sufijos que acompañan a un término y se traducen aparte. */
const MODIFICADORES: Record<string, string> = {
  "vorn": "delanteros", "vorne": "delanteros", "front": "delanteros",
  "hinten": "traseros", "rear": "traseros",
  "links": "izquierdo", "rechts": "derecho",
  "elektrisch": "eléctrico", "electric": "eléctrico",
  "beheizbar": "calefactable",
  "automatisch": "automático",
};

const ES_IGUAL = new Set(IGUAL);

/** Un término suelto: glosario, valores, o nada. */
function buscar(clave: string): string | null {
  if (ES_IGUAL.has(clave)) return null; // ya está bien escrito: se deja tal cual
  return GLOSARIO[clave] ?? VALORES[clave] ?? null;
}

/** Como `buscar`, pero los términos que ya están bien se devuelven ellos mismos. */
function buscarPalabra(clave: string): string | null {
  if (ES_IGUAL.has(clave)) return clave;
  return GLOSARIO[clave] ?? VALORES[clave] ?? null;
}

export interface Traduccion {
  texto: string;
  /** false cuando ha quedado algo sin traducir y hay que mirarlo a mano. */
  completa: boolean;
}

/**
 * Traduce una línea suelta: una casilla de equipamiento o un valor de ficha.
 *
 * El orden importa. Primero la frase entera, que es como llega el 90% del
 * equipamiento. Luego la frase sin su modificador final («Sitzheizung vorn»).
 * Luego por trozos separados por coma o barra, que es como llegan los valores
 * («Leder, Schwarz»). Si nada de eso funciona, se devuelve el original y se
 * marca como incompleta: nunca se entrega media traducción sin avisar.
 */
export function traducirLinea(bruto: string): Traduccion {
  const texto = bruto.trim();
  if (!texto) return { texto, completa: true };

  const clave = normalizar(texto);
  if (!clave) return { texto, completa: true };

  // Ya está bien tal cual (Bluetooth, ABS, Apple CarPlay…).
  if (ES_IGUAL.has(clave)) return { texto, completa: true };

  // Frase entera.
  const directa = GLOSARIO[clave] ?? VALORES[clave];
  if (directa) return { texto: directa, completa: true };

  // Frase + modificador final: «Sitzheizung vorn».
  const partes = clave.split(" ");
  if (partes.length > 1) {
    const ultimo = partes[partes.length - 1];
    const mod = MODIFICADORES[ultimo];
    const base = buscar(partes.slice(0, -1).join(" "));
    if (mod && base) return { texto: `${base} ${mod}`, completa: true };
  }

  // Trozos separados: «Leder, Schwarz» → «Cuero, Negro». Va antes que el paso
  // por palabras para no perder la coma por el camino.
  if (/[,/]/.test(texto)) {
    const trozos = texto.split(/\s*[,/]\s*/).filter(Boolean);
    const hechos = trozos.map((t) => traducirLinea(t));
    return {
      texto: hechos.map((h) => h.texto).join(", "),
      completa: hechos.every((h) => h.completa),
    };
  }

  // Todas las palabras conocidas: «Weiß metallic» → «Blanco metalizado».
  // Solo vale si se traducen todas; con una suelta sin traducir saldría una
  // frase medio en alemán, que es justo lo que no queremos.
  if (partes.length > 1 && partes.length <= 4) {
    const palabras = partes.map(buscarPalabra);
    if (palabras.every((p): p is string => p !== null)) {
      return { texto: palabras.join(" "), completa: true };
    }
  }

  // Cifras con unidad («8 Gang», «300 PS»): se traduce solo la palabra.
  const conCifra = clave.match(/^([0-9]+)\s+([a-z]+)$/);
  if (conCifra) {
    const palabra = VALORES[conCifra[2]];
    if (palabra) return { texto: `${conCifra[1]} ${palabra}`, completa: true };
  }

  // Sin traducción: se devuelve intacto y se avisa.
  return { texto, completa: false };
}

/** Traduce una lista de equipamiento y dice qué se ha quedado fuera. */
export function traducirLista(lineas: string[]): { lineas: string[]; sinTraducir: string[] } {
  const sinTraducir: string[] = [];
  const salida = lineas.map((l) => {
    const r = traducirLinea(l);
    if (!r.completa) sinTraducir.push(l);
    return capitalizar(r.texto);
  });
  return { lineas: salida, sinTraducir };
}

/** Campos de la ficha cuyo valor es vocabulario cerrado y se puede traducir. */
const TRADUCIBLES = new Set(["fuel", "transmission", "body", "color", "upholstery"]);

export function traducirFicha(spec: Record<string, string>): {
  spec: Record<string, string>;
  sinTraducir: string[];
} {
  const salida: Record<string, string> = {};
  const sinTraducir: string[] = [];
  for (const [clave, valor] of Object.entries(spec)) {
    if (!TRADUCIBLES.has(clave)) {
      salida[clave] = valor;
      continue;
    }
    const r = traducirLinea(valor);
    salida[clave] = capitalizar(r.texto);
    if (!r.completa) sinTraducir.push(valor);
  }
  return { spec: salida, sinTraducir };
}

/**
 * En qué idioma está el anuncio.
 *
 * Sirve para avisar en el panel, no para decidir nada: el glosario mira
 * alemán e inglés a la vez, así que un anuncio mezclado se traduce igual.
 */
export function detectarIdioma(texto: string): "alemán" | "inglés" | "español" | "desconocido" {
  const t = texto.toLowerCase();
  const cuenta = (palabras: string[]) =>
    palabras.reduce((n, p) => n + (t.includes(p) ? 1 : 0), 0);

  const de = cuenta(["erstzulassung", "kilometerstand", "getriebe", "kraftstoff", "fahrzeug",
    "leistung", "scheckheft", "gebraucht", "türen", "farbe", "preis", "händler"]);
  const en = cuenta(["mileage", "first registration", "gearbox", "fuel type", "vehicle",
    "power", "service history", "used", "doors", "colour", "price", "dealer"]);
  const es = cuenta(["kilometraje", "matriculación", "cambio", "combustible", "vehículo",
    "potencia", "puertas", "color exterior", "precio", "concesionario"]);

  const mejor = Math.max(de, en, es);
  if (mejor < 2) return "desconocido";
  if (mejor === de) return "alemán";
  if (mejor === en) return "inglés";
  return "español";
}
