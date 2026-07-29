import { c as createMiddleware } from "../server.js";
import "node:async_hooks";
import "node:stream";
import "react";
import "@tanstack/react-router";
import "react/jsx-runtime";
import "@tanstack/react-router/ssr/server";
function dedupeSerializationAdapters(deduped, serializationAdapters) {
  for (let i = 0, len = serializationAdapters.length; i < len; i++) {
    const current = serializationAdapters[i];
    if (!deduped.has(current)) {
      deduped.add(current);
      if (current.extends) dedupeSerializationAdapters(deduped, current.extends);
    }
  }
}
var createStart = (getOptions) => {
  return {
    getOptions: async () => {
      const options = await getOptions();
      if (options.serializationAdapters) {
        const deduped = /* @__PURE__ */ new Set();
        dedupeSerializationAdapters(deduped, options.serializationAdapters);
        options.serializationAdapters = Array.from(deduped);
      }
      return options;
    },
    createMiddleware
  };
};
const errorMiddleware = createMiddleware().server(async ({ next }) => {
  try {
    return await next();
  } catch (error) {
    if (error != null && typeof error === "object" && "statusCode" in error) throw error;
    console.error(error);
    return new Response(
      '<!doctype html><meta charset=utf-8><title>Error</title><body style="background:#141628;color:#f7f5f1;font-family:system-ui;display:grid;place-items:center;min-height:100dvh;margin:0"><p>No se ha podido cargar la página. Inténtalo de nuevo.</p>',
      { status: 500, headers: { "content-type": "text/html; charset=utf-8" } }
    );
  }
});
const startInstance = createStart(() => ({ requestMiddleware: [errorMiddleware] }));
export {
  startInstance
};
