import { createStart, createMiddleware } from "@tanstack/react-start";

/** Un fallo del servidor no debe devolver JSON crudo al navegador. */
const errorMiddleware = createMiddleware().server(async ({ next }) => {
  try {
    return await next();
  } catch (error) {
    if (error != null && typeof error === "object" && "statusCode" in error) throw error;
    console.error(error);
    return new Response(
      "<!doctype html><meta charset=utf-8><title>Error</title>" +
        '<body style="background:#141628;color:#f7f5f1;font-family:system-ui;display:grid;place-items:center;min-height:100dvh;margin:0">' +
        "<p>No se ha podido cargar la página. Inténtalo de nuevo.</p>",
      { status: 500, headers: { "content-type": "text/html; charset=utf-8" } },
    );
  }
});

export const startInstance = createStart(() => ({ requestMiddleware: [errorMiddleware] }));
