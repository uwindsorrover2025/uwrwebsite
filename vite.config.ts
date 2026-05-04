import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
  /** Relative URLs so multi-page builds work when the site is served from a subpath (e.g. GitHub Pages project sites). */
  base: "./",
  assetsInclude: ["**/*.glb"],
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
        teams: resolve(__dirname, "teams.html"),
        sponsor: resolve(__dirname, "sponsor.html"),
      },
      output: {
        manualChunks(id) {
          if (id.includes("node_modules/three")) return "three";
        },
      },
    },
  },
});
