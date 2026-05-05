import { defineConfig } from "vite";
import { resolve } from "path";

/** Strip `crossorigin` only from our hashed `./assets/*` tags (keeps Google Fonts preconnect intact). */
function stripCrossOriginFromBuiltAssets(html: string): string {
  return html.replace(
    /<([^>\s]+)([^>]*)\s+crossorigin(?:=(?:"anonymous"|'anonymous'))?([^>]*)>/gi,
    (full, tag: string, before: string, after: string) => {
      const attrs = `${before}${after}`;
      if (
        attrs.includes("./assets/") &&
        (tag.toLowerCase() === "script" ||
          attrs.toLowerCase().includes('rel="stylesheet"'))
      ) {
        return `<${tag}${before}${after}>`.replace(/\s{2,}/g, " ");
      }
      return full;
    },
  );
}

export default defineConfig({
  /** Relative asset URLs for subpath deploys; single HTML entry + client routes. */
  base: "./",
  appType: "spa",
  assetsInclude: ["**/*.glb"],
  plugins: [
    {
      name: "strip-asset-crossorigin",
      transformIndexHtml: {
        order: "post",
        handler(html) {
          return stripCrossOriginFromBuiltAssets(html);
        },
      },
    },
  ],
  build: {
    /** Safer than tsconfig ES2023 — avoids silent parse failures on slightly older Safari / embedded browsers. */
    target: "es2020",
    /** Avoids Vite's modulepreload polyfill fetch path (privacy modes occasionally choke on it). */
    modulePreload: false,
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
