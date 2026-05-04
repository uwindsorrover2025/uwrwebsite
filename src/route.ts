/** Which full-page experience to mount (single index.html entry). */
export type AppRoute = "home" | "teams" | "sponsor";

function normalizeSegment(seg: string): string {
  return seg.replace(/\.html$/i, "").toLowerCase();
}

/**
 * Pathname first (`/teams`, `/repo/sponsor`, legacy `*.html`).
 * Hash fallback (`#/teams`) for hosts that cannot rewrite to index.html (e.g. GitHub Pages project sites).
 */
export function getRouteFromLocation(): AppRoute {
  const path = window.location.pathname.replace(/\/+$/, "").toLowerCase();
  const rawSeg = path.split("/").pop() ?? "";
  const seg = normalizeSegment(rawSeg);
  if (seg === "teams") return "teams";
  if (seg === "sponsor") return "sponsor";

  const fromHash = window.location.hash
    .replace(/^#\/?/, "")
    .split(/[/?]/)[0]
    ?.trim();
  if (fromHash) {
    const h = normalizeSegment(fromHash);
    if (h === "teams") return "teams";
    if (h === "sponsor") return "sponsor";
  }

  return "home";
}
