import "./style.css";
import { getRouteFromLocation } from "./route";

function showBootFailure(err: unknown): void {
  console.error("[UWR boot]", err);
  const root = document.getElementById("app");
  if (!root) return;

  root.innerHTML = `
<div style="min-height:100vh;display:flex;align-items:center;justify-content:center;padding:24px;background:#050506;color:#ebe8e3;font-family:system-ui,sans-serif;">
  <div style="max-width:440px;text-align:center;">
    <p style="margin:0 0 12px;font-weight:600;font-size:17px;">Unable to load this site</p>
    <p style="margin:0 0 20px;font-size:14px;line-height:1.65;opacity:.88;">
      Try reloading, disabling extensions that block scripts (especially privacy / ad blockers),
      or opening in another browser. Open the developer console (F12) for technical details.
    </p>
    <button type="button" id="uwr-boot-retry" style="cursor:pointer;padding:11px 22px;border-radius:10px;border:1px solid rgba(255,255,255,.18);background:rgba(255,255,255,.06);color:inherit;font:inherit;">
      Reload page
    </button>
  </div>
</div>`;

  root.querySelector("#uwr-boot-retry")?.addEventListener("click", () => {
    location.reload();
  });
}

const route = getRouteFromLocation();

void (async () => {
  try {
    if (route === "teams") {
      const { mountTeams } = await import("./apps/teams-app");
      mountTeams();
    } else if (route === "sponsor") {
      const { mountSponsor } = await import("./apps/sponsor-app");
      mountSponsor();
    } else {
      const { mountHome } = await import("./apps/home");
      mountHome();
    }
  } catch (err) {
    showBootFailure(err);
  }
})();
