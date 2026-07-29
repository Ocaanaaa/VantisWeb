import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [
    tsconfigPaths(),
    // target: "vercel" emite .vercel/output, que Vercel despliega sin configurar nada.
    tanstackStart({ target: "vercel" }),
    react(),
    tailwindcss(),
  ],
});
