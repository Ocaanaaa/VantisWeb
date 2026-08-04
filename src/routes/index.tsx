import { createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import Page from "../site/Page";

/**
 * El acceso a datos va por createServerFn con importacion dinamica: asi el
 * cliente de base de datos nunca entra en el paquete del navegador.
 */
const cargarUnidades = createServerFn({ method: "GET" }).handler(async () => {
  const { listarPublicadas } = await import("../lib/unidades.server");
  return listarPublicadas();
});

export const Route = createFileRoute("/")({
  loader: () => cargarUnidades(),
  component: Index,
});

function Index() {
  return <Page unidades={Route.useLoaderData()} />;
}
