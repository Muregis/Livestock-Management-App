import path from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

const conditionalPlugins: [string, Record<string, any>][] = [];

if (process.env.TEMPO === "true") {
  conditionalPlugins.push(["tempo-devtools/swc", {}]);
}

const plugins = [react({ plugins: conditionalPlugins })];

if (process.env.TEMPO === "true") {
  try {
    const { tempo } = require("tempo-devtools/dist/vite");
    plugins.push(tempo());
  } catch (e) {
    // tempo not installed
  }
}

export default defineConfig({
  base: process.env.VITE_BASE_PATH || "/",
  optimizeDeps: {
    entries: ["src/main.tsx", "src/tempobook/**/*"],
  },
  plugins,
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
