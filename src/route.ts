/** Which full-page experience to mount (single index.html entry). */
export type AppRoute = "home" | "teams" | "sponsor";

function normalizeSegment(seg: string): string {
  return seg.replace(/\.html$/i, "").toLowerCase();
}

/**
 * Pathname first (`/teams`, `/partner` or `/sponsor`, `/repo/...`).
 * Hash fallback (`#/teams`, `#/partner`) for static hosts without SPA rewrites.
 *
 * Note: use `/partner` in links when possible — some privacy blocklists match `/sponsor*`.
 */
export function getRouteFromLocation(): AppRoute {
  const path = window.location.pathname.replace(/\/+$/, "").toLowerCase();
  const rawSeg = path.split("/").pop() ?? "";
  const seg = normalizeSegment(rawSeg);
  if (seg === "teams") return "teams";
  if (seg === "sponsor" || seg === "partner") return "sponsor";

  const fromHash = window.location.hash
    .replace(/^#\/?/, "")
    .split(/[/?]/)[0]
    ?.trim();
  if (fromHash) {
    const h = normalizeSegment(fromHash);
    if (h === "teams") return "teams";
    if (h === "sponsor" || h === "partner") return "sponsor";
  }

  return "home";
}
