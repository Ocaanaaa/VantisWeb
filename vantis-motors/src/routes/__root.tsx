import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { type ReactNode } from "react";

import appCss from "../styles.css?url";
import appMetaJson from "../app-meta.json";
import { copy } from "../content";

const DEFAULT_TITLE = "Vantis Motors";
const DEFAULT_DESCRIPTION = "Importación a la carta de vehículos de lujo.";

type AppMeta = {
  og_title?: string | null;
  og_description?: string | null;
  og_image_url?: string | null;
  favicon_url?: string | null;
};

const appMeta = appMetaJson as AppMeta;

function buildHead(meta: AppMeta) {
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
      ...(ogImage
        ? [
            { property: "og:image", content: ogImage },
            { name: "twitter:image", content: ogImage },
          ]
        : []),
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: meta.favicon_url ?? "/favicon.svg", type: "image/svg+xml" },
    ],
  };
}

/** Pantallas de error con la tipografia y la paleta de la marca. */
function Shell({ title, body, action }: { title: string; body: string; action: ReactNode }) {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-graphite px-6 text-bone">
      <div className="max-w-md text-center">
        <h1 className="display text-[13vw] leading-none md:text-[4vw]">{title}</h1>
        <p className="mt-5 text-[15px] leading-[1.5] text-bone/70">{body}</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">{action}</div>
      </div>
    </div>
  );
}

const btn =
  "inline-flex items-center gap-3 border border-bone/30 px-6 py-4 font-mono text-[11px] uppercase tracking-label transition-colors duration-300 hover:border-port hover:text-port";

function NotFoundComponent() {
  return (
    <Shell title="404" body="Esta página no existe o se ha movido."
      action={<Link to="/" className={btn}>Volver al inicio</Link>} />
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  return (
    <Shell title="Error" body="No se ha podido cargar la página. Puedes reintentarlo o volver al inicio."
      action={
        <>
          <button onClick={() => { router.invalidate(); reset(); }} className={btn}>Reintentar</button>
          <a href="/" className={btn}>Volver al inicio</a>
        </>
      } />
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => buildHead(appMeta),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="es">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      {/* Requerido: las rutas hijas se renderizan aqui. */}
      <Outlet />
    </QueryClientProvider>
  );
}
