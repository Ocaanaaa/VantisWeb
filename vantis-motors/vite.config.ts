import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { nitro } from "nitro/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [
    tsconfigPaths(),
    tanstackStart(),
    // Nitro con el preset de Vercel emite .vercel/output (Build Output API v3),
    // que Vercel detecta y sirve automáticamente.
    nitro({ preset: "vercel" }),
    react(),
    tailwindcss(),
  ],
});
