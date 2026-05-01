/** Queue early fetches so heavy URLs hit HTTP cache before Three loaders request them. */
export function preloadHref(href: string, as: "image" | "fetch"): void {
  const link = document.createElement("link");
  link.rel = "preload";
  link.href = href;
  link.as = as;
  if (as === "fetch") link.crossOrigin = "";
  document.head.appendChild(link);
}
