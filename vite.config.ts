import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
  /** Relative asset URLs for subpath deploys; single HTML entry + client routes. */
  base: "./",
  appType: "spa",
  assetsInclude: ["**/*.glb"],
  build: {
    rollupOptions: {
      input: resolve(__dirname, "index.html"),
      output: {
        manualChunks(id) {
          if (id.includes("node_modules/three")) return "three";
        },
      },
    },
  },
});
