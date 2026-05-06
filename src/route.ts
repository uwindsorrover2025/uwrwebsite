/** Which full-page experience to mount (single index.html entry). */
export type AppRoute = "home" | "teams" | "sponsor";

function normalizeSegment(seg: string): string {
  return seg.replace(/\.html$/i, "").toLowerCase();
}

/**
 * Pathname first (`/teams`, `/partners` or `/partner` or `/sponsor`, `/repo/...`).
 * Hash fallback (`#/teams`, `#/partners` or `#/partner`) for static hosts without SPA rewrites.
 *
 * Note: `/partners`, `/partner`, and `/sponsor` all resolve to the sponsor route.
 */
export function getRouteFromLocation(): AppRoute {
  const path = window.location.pathname.replace(/\/+$/, "").toLowerCase();
  const rawSeg = path.split("/").pop() ?? "";
  const seg = normalizeSegment(rawSeg);
  if (seg === "teams") return "teams";
  if (seg === "sponsor" || seg === "partner" || seg === "partners") return "sponsor";

  const fromHash = window.location.hash
    .replace(/^#\/?/, "")
    .split(/[/?]/)[0]
    ?.trim();
  if (fromHash) {
    const h = normalizeSegment(fromHash);
    if (h === "teams") return "teams";
    if (h === "sponsor" || h === "partner" || h === "partners") return "sponsor";
  }

  return "home";
}
