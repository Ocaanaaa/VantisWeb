import { createFileRoute } from "@tanstack/react-router";
import Page from "../site/Page";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  return <Page />;
}
