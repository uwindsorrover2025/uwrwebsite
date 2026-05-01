import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
  assetsInclude: ["**/*.glb"],
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
        teams: resolve(__dirname, "teams.html"),
      },
      output: {
        manualChunks(id) {
          if (id.includes("node_modules/three")) return "three";
        },
      },
    },
  },
});
