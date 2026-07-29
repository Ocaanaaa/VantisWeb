import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  // El bundle del servidor acaba dentro de una funcion de Vercel que se
  // despliega sola, sin node_modules al lado. Por defecto Vite deja las
  // dependencias como imports externos (react, @tanstack/*, h3-v2, seroval...)
  // y ahi reventarian al arrancar. Se empaquetan todas dentro.
  // Los builtins de node: siguen siendo externos: los aporta el runtime.
  ssr: { noExternal: true },
  plugins: [tsconfigPaths(), tanstackStart(), react(), tailwindcss()],
});
