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
  } catch (e) {}
}

export default defineConfig({
  base: process.env.VITE_BASE_PATH || "/",
  build: {
    outDir: "dist",
    assetsDir: "assets",
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom"],
          ui: [
            "@radix-ui/react-checkbox",
            "@radix-ui/react-dropdown-menu",
            "@radix-ui/react-dialog",
            "@radix-ui/react-tooltip",
            "@radix-ui/reactpopover",
            "@radix-ui/react-menu",
            "@radix-ui/react-tabs"
          ],
          charts: ["recharts"],
          utils: ["lucide-react", "clsx", "date-fns"]
        }
      }
    }
  },
  server: {
    port: 5173,
    strictPort: true
  },
  preview: {
    port: 4173,
    strictPort: true
  },
  plugins,
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});