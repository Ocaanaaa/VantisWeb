import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { createRootRouteWithContext, useRouter, Link, Outlet, HeadContent, Scripts, createFileRoute, lazyRouteComponent, createRouter } from "@tanstack/react-router";
import { jsx, jsxs, Fragment } from "react/jsx-runtime";
const appCss = "/assets/styles-0IahRAk6.css";
const og_title = "VANTIS MOTORS — Importación a la carta de vehículos de lujo";
const og_description = "No hay stock. No hay catálogo. Describes el coche exacto que quieres y lo localizamos en cinco mercados, lo importamos, lo homologamos, lo matriculamos y te lo entregamos en tu puerta.";
const favicon_url = "/favicon.svg";
const og_image_url = "/media/master.webp";
const appMetaJson = {
  og_title,
  og_description,
  favicon_url,
  og_image_url
};
const copy = {
  meta: { brand: "VANTIS MOTORS" },
  nav: {
    links: [
      { id: "proceso", label: "Proceso" },
      { id: "disponibles", label: "Disponibles" },
      { id: "entregas", label: "Entregas" },
      { id: "coste", label: "Coste" },
      { id: "equipo", label: "Equipo" }
    ],
    cta: "Hacer un encargo"
  },
  hero: {
    eyebrow: "Importación a la carta",
    headline: ["AQUÍ", "NO HAY", "STOCK."],
    headlineAccent: "HAY ENCARGOS.",
    body: "No hay stock. No hay catálogo. Describes el coche exacto que quieres: motor, acabado, color, kilometraje máximo. Lo localizamos en la Unión Europea y Estados Unidos, lo compramos, lo importamos, lo homologamos, lo matriculamos y te lo entregamos en tu puerta.",
    ctaPrimary: "Hacer un encargo",
    ctaSecondary: "Ver el proceso",
    scrollHint: "Desplaza",
    plateLabel: "Matrícula asignada",
    plateValue: "0000 VNT"
  },
  figures: {
    title: "Estado de operación",
    items: [
      { id: "mercados", value: 2, suffix: "", label: "Mercados de origen operativos", note: "Unión Europea y Estados Unidos." },
      { id: "plazo", value: 6, suffix: " sem", label: "Media desde encargo hasta entrega", note: "Medido sobre operaciones cerradas, no estimado." },
      { id: "operaciones", value: 84, suffix: "", label: "Operaciones cerradas", note: "Vehículos entregados y matriculados en España." },
      { id: "ahorro", value: 18, suffix: "%", label: "Ahorro medio frente a precio de concesionario nacional", note: "Comparado a configuración equivalente, impuestos incluidos." }
    ]
  },
  how: {
    eyebrow: "Cómo funciona",
    title: "Cinco pasos. Sin intermediarios ocultos.",
    steps: [
      { n: "01", title: "Encargo", body: "Nos das la configuración exacta: motor, transmisión, acabado, color, kilometraje máximo y año mínimo. Fijamos un techo de presupuesto por escrito.", data: "Plazo: 48 h para la primera búsqueda" },
      { n: "02", title: "Localización", body: "Rastreamos concesionarios oficiales, casas de subastas y stock privado en la UE y Estados Unidos. Te enviamos las unidades que cumplen, con VIN y ficha completa.", data: "UE y EE. UU. · VIN verificado" },
      { n: "03", title: "Inspección", body: "Inspección física independiente antes de transferir un euro. Informe de 120 puntos, peritaje de chapa y lectura de centralita.", data: "120 puntos de inspección" },
      { n: "04", title: "Importación", body: "Compra, transporte, despacho de aduanas y liquidación de impuestos. Recibes el desglose completo antes de firmar nada.", data: "Arancel 6,5% · IVA 21%" },
      { n: "05", title: "Entrega", body: "Homologación individual, ITV, impuesto de matriculación y placas. El coche llega a tu puerta listo para circular.", data: "Matriculado y entregado" }
    ]
  },
  showreel: {
    eyebrow: "Vitrina",
    title: "NO LO BUSCAS TÚ. LO BUSCAMOS NOSOTROS.",
    body: "Dos mercados rastreados a diario: concesionarios oficiales, casas de subastas y stock privado. Tú pones la configuración; nosotros ponemos las horas.",
    cta: "Hacer un encargo",
    ctaSecondary: "Ver unidades disponibles"
  },
  available: {
    eyebrow: "Disponible ahora",
    title: "Unidades localizadas.",
    body: "Unidades que hemos encontrado en nuestros mercados y siguen a la venta. El listado cambia a diario: confirma disponibilidad antes de tomar ninguna decisión.",
    labels: { year: "Año", km: "Kilometraje", market: "Mercado", price: "Puesto en España" },
    status: { available: "Disponible", reserved: "Reservado" },
    items: [
      { id: "D-118", model: "Volkswagen Golf GTI Clubsport", year: "2023", km: "14.200 km", market: "Alemania", price: "46.900 €", reserved: false },
      { id: "D-115", model: "Porsche 911 GT3 RS (992)", year: "2023", km: "6.800 km", market: "Alemania", price: "312.000 €", reserved: false },
      { id: "D-112", model: "BMW M3 Competition Touring", year: "2024", km: "9.400 km", market: "Alemania", price: "108.500 €", reserved: true },
      { id: "D-109", model: "BMW M3 E30 Evo II", year: "1988", km: "121.000 km", market: "Bélgica", price: "184.000 €", reserved: false },
      { id: "D-104", model: "Porsche 911 Carrera 3.2 Coupé", year: "1987", km: "96.500 km", market: "Estados Unidos", price: "89.400 €", reserved: false },
      { id: "D-101", model: "Audi RS6 Avant performance", year: "2023", km: "21.700 km", market: "Países Bajos", price: "126.900 €", reserved: false }
    ],
    cta: "Preguntar por una unidad",
    note: "Precios orientativos con impuestos y gestión incluidos, calculados a fecha de publicación. No son una oferta en firme: cada unidad se cierra con presupuesto por escrito tras verificar disponibilidad y estado."
  },
  team: {
    eyebrow: "Equipo",
    title: "Dos personas. Ningún intermediario.",
    body: "No hay centralita ni comerciales rotando. Hablas siempre con quien busca tu coche y con quien lo trae.",
    members: [
      { initials: "··", name: "Nombre Apellido", role: "Localización y compra", bio: "Pendiente de completar: dos o tres frases sobre trayectoria, mercados que cubre y por qué se le da bien encontrar unidades difíciles.", email: "nombre@vantismotors.com" },
      { initials: "··", name: "Nombre Apellido", role: "Importación y homologación", bio: "Pendiente de completar: dos o tres frases sobre trayectoria, aduanas, homologación individual y trato con la administración.", email: "nombre@vantismotors.com" }
    ]
  },
  deliveries: {
    eyebrow: "Entregas",
    title: "Operaciones cerradas",
    body: "Cada unidad se publica solo con permiso del cliente. Datos reales, sin retoque.",
    items: [
      { id: "VNT-0071", title: "Gran turismo V8", origin: "Stuttgart, Alemania", km: "18.400 km", weeks: "5 semanas", vin: "WXX·····ZZ71042" },
      { id: "VNT-0068", title: "Coupé biturbo", origin: "Milán, Italia", km: "9.120 km", weeks: "3 semanas", vin: "ZXX·····IT68115" },
      { id: "VNT-0064", title: "Roadster atmosférico", origin: "Miami, EE. UU.", km: "24.750 km", weeks: "8 semanas", vin: "1XX·····US64903" },
      { id: "VNT-0059", title: "Berlina deportiva", origin: "Róterdam, Países Bajos", km: "12.310 km", weeks: "3 semanas", vin: "XLX·····NL59277" },
      { id: "VNT-0055", title: "Coupé seis cilindros", origin: "Los Ángeles, EE. UU.", km: "31.980 km", weeks: "8 semanas", vin: "1XX·····US55461" },
      { id: "VNT-0052", title: "Gran turismo híbrido", origin: "Múnich, Alemania", km: "6.640 km", weeks: "5 semanas", vin: "WXX·····DE52338" }
    ],
    cardLabels: { origin: "Origen", km: "Kilometraje", weeks: "Plazo", vin: "VIN" }
  },
  markets: {
    eyebrow: "Mercados y rutas",
    title: "Dos orígenes. Un destino.",
    body: "Operamos donde el mercado premium de ocasión tiene volumen y trazabilidad. Cada origen tiene su plazo, su papeleo y su fiscalidad, y eso cambia el precio final.",
    destination: "España",
    diagramCaption: "Rutas operativas hacia España",
    labels: { transit: "Tránsito", duty: "Arancel", approval: "Homologación", sourcing: "Origen habitual" },
    routes: [
      {
        code: "UE",
        name: "Unión Europea",
        transit: "2–3 semanas",
        eu: true,
        note: "Operación intracomunitaria: el vehículo ya circula bajo normativa europea, así que entra sin arancel y sin homologación individual.",
        duty: "No aplica",
        approval: "No aplica",
        sourcing: "Alemania, Italia, Países Bajos y Bélgica"
      },
      {
        code: "US",
        name: "Estados Unidos",
        transit: "6–8 semanas",
        eu: false,
        note: "Flete marítimo y despacho de aduanas. El vehículo se homologa a título individual antes de poder matricularse en España.",
        duty: "Aplicable a la importación",
        approval: "Individual + ITV",
        sourcing: "Costa este, Florida y California"
      }
    ]
  },
  costs: {
    eyebrow: "Coste real",
    title: "Sin sorpresas.",
    body: "Esto es lo que compone el precio final. Lo recibes desglosado por escrito antes de que firmes nada.",
    toggle: { label: "Origen del vehículo", eu: "Origen UE", nonEu: "Origen EE. UU." },
    columns: { concept: "Concepto", rate: "Tipo" },
    rows: [
      { id: "arancel", concept: "Arancel aduanero", rate: "6,5% sobre el valor del vehículo", appliesEu: false },
      { id: "iva", concept: "IVA a la importación", rate: "21% sobre valor + arancel", appliesEu: true },
      { id: "iedmt", concept: "Impuesto de matriculación (IEDMT)", rate: "hasta 14,75% según emisiones", appliesEu: true },
      { id: "homologacion", concept: "Homologación individual e ITV", rate: "variable según origen", appliesEu: false },
      { id: "honorarios", concept: "Honorarios Vantis", rate: "acordados por escrito antes de empezar", appliesEu: true }
    ],
    notApplicable: "No aplica",
    legal: "Importes orientativos. Cada operación se cierra con presupuesto en firme por escrito, desglosado concepto a concepto, antes de iniciar la compra."
  },
  form: {
    eyebrow: "Encargo",
    title: "Describe el coche.",
    body: "Cuatro campos. Respondemos en 48 horas con la primera búsqueda.",
    fields: {
      spec: { label: "Modelo y configuración deseada", placeholder: "Motor, transmisión, acabado, color, kilometraje máximo, año mínimo." },
      budget: { label: "Presupuesto orientativo", placeholder: "Techo aproximado, impuestos incluidos." },
      timing: { label: "Plazo", placeholder: "¿Para cuándo lo necesitas?" },
      contact: { label: "Cómo contactarte", placeholder: "Teléfono, email o WhatsApp." }
    },
    submit: "Enviar encargo",
    sending: "Enviando…",
    sent: "Encargo enviado",
    sentBody: "Recibido. Te escribimos en 48 horas con la primera búsqueda.",
    error: "No se ha podido enviar. Escríbenos por WhatsApp.",
    required: "Rellena este campo.",
    whatsapp: { label: "WhatsApp Business", action: "Abrir conversación", number: "+34 600 000 000", prefill: "Hola Vantis, quiero encargar un coche." },
    discretion: "Discreción por defecto. Los encargos no se publican sin permiso escrito del cliente."
  },
  footer: {
    tagline: "Importación a la carta de vehículos de lujo.",
    legalName: "Vantis Motors S.L.",
    vat: "B00000000",
    address: "Madrid, España",
    email: "encargos@vantismotors.com",
    rights: "Todos los derechos reservados.",
    links: [
      { label: "Aviso legal", href: "#" },
      { label: "Privacidad", href: "#" },
      { label: "Cookies", href: "#" }
    ],
    note: "Vantis Motors no es concesionario. No mantiene stock ni catálogo."
  }
};
const DEFAULT_TITLE = "Vantis Motors";
const DEFAULT_DESCRIPTION = "Importación a la carta de vehículos de lujo.";
const appMeta = appMetaJson;
function buildHead(meta) {
  const title = meta.og_title ?? DEFAULT_TITLE;
  const description = meta.og_description ?? DEFAULT_DESCRIPTION;
  const ogImage = meta.og_image_url ?? null;
  return {
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title },
      { name: "description", content: description },
      { name: "author", content: copy.meta.brand },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { property: "og:locale", content: "es_ES" },
      { name: "twitter:card", content: ogImage ? "summary_large_image" : "summary" },
      ...ogImage ? [
        { property: "og:image", content: ogImage },
        { name: "twitter:image", content: ogImage }
      ] : []
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: meta.favicon_url ?? "/favicon.svg", type: "image/svg+xml" }
    ]
  };
}
function Shell({ title, body, action }) {
  return /* @__PURE__ */ jsx("div", { className: "flex min-h-dvh items-center justify-center bg-graphite px-6 text-bone", children: /* @__PURE__ */ jsxs("div", { className: "max-w-md text-center", children: [
    /* @__PURE__ */ jsx("h1", { className: "display text-[13vw] leading-none md:text-[4vw]", children: title }),
    /* @__PURE__ */ jsx("p", { className: "mt-5 text-[15px] leading-[1.5] text-bone/70", children: body }),
    /* @__PURE__ */ jsx("div", { className: "mt-8 flex flex-wrap justify-center gap-3", children: action })
  ] }) });
}
const btn = "inline-flex items-center gap-3 border border-bone/30 px-6 py-4 font-mono text-[11px] uppercase tracking-label transition-colors duration-300 hover:border-port hover:text-port";
function NotFoundComponent() {
  return /* @__PURE__ */ jsx(
    Shell,
    {
      title: "404",
      body: "Esta página no existe o se ha movido.",
      action: /* @__PURE__ */ jsx(Link, { to: "/", className: btn, children: "Volver al inicio" })
    }
  );
}
function ErrorComponent({ error, reset }) {
  console.error(error);
  const router2 = useRouter();
  return /* @__PURE__ */ jsx(
    Shell,
    {
      title: "Error",
      body: "No se ha podido cargar la página. Puedes reintentarlo o volver al inicio.",
      action: /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsx("button", { onClick: () => {
          router2.invalidate();
          reset();
        }, className: btn, children: "Reintentar" }),
        /* @__PURE__ */ jsx("a", { href: "/", className: btn, children: "Volver al inicio" })
      ] })
    }
  );
}
const Route$3 = createRootRouteWithContext()({
  head: () => buildHead(appMeta),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent
});
function RootShell({ children }) {
  return /* @__PURE__ */ jsxs("html", { lang: "es", children: [
    /* @__PURE__ */ jsx("head", { children: /* @__PURE__ */ jsx(HeadContent, {}) }),
    /* @__PURE__ */ jsxs("body", { children: [
      children,
      /* @__PURE__ */ jsx(Scripts, {})
    ] })
  ] });
}
function RootComponent() {
  const { queryClient } = Route$3.useRouteContext();
  return /* @__PURE__ */ jsx(QueryClientProvider, { client: queryClient, children: /* @__PURE__ */ jsx(Outlet, {}) });
}
const $$splitComponentImporter = () => import("./index-almtMRab.js").then((n) => n.i);
const Route$2 = createFileRoute("/")({
  component: lazyRouteComponent($$splitComponentImporter, "component")
});
const Route$1 = createFileRoute("/robots.txt")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const origin = new URL(request.url).origin;
        const body = [
          "User-agent: *",
          "Allow: /",
          "",
          `Sitemap: ${origin}/sitemap.xml`
        ].join("\n");
        return new Response(body, {
          headers: {
            "Content-Type": "text/plain; charset=utf-8",
            "Cache-Control": "public, max-age=86400"
          }
        });
      }
    }
  }
});
const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const origin = new URL(request.url).origin;
        const today = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
        const xml = [
          '<?xml version="1.0" encoding="UTF-8"?>',
          '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
          "  <url>",
          `    <loc>${origin}/</loc>`,
          `    <lastmod>${today}</lastmod>`,
          "    <changefreq>weekly</changefreq>",
          "    <priority>1.0</priority>",
          "  </url>",
          "</urlset>"
        ].join("\n");
        return new Response(xml, {
          headers: {
            "Content-Type": "application/xml; charset=utf-8",
            "Cache-Control": "public, max-age=3600"
          }
        });
      }
    }
  }
});
const IndexRoute = Route$2.update({
  id: "/",
  path: "/",
  getParentRoute: () => Route$3
});
const RobotsDottxtRoute = Route$1.update({
  id: "/robots.txt",
  path: "/robots.txt",
  getParentRoute: () => Route$3
});
const SitemapDotxmlRoute = Route.update({
  id: "/sitemap.xml",
  path: "/sitemap.xml",
  getParentRoute: () => Route$3
});
const rootRouteChildren = {
  IndexRoute,
  RobotsDottxtRoute,
  SitemapDotxmlRoute
};
const routeTree = Route$3._addFileChildren(rootRouteChildren)._addFileTypes();
const getRouter = () => {
  const queryClient = new QueryClient();
  const router2 = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    defaultPreloadStaleTime: 0
  });
  return router2;
};
const router = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  getRouter
}, Symbol.toStringTag, { value: "Module" }));
export {
  copy as c,
  router as r
};
