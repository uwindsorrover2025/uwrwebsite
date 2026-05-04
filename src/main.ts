import "./style.css";
import { getRouteFromLocation } from "./route";

const route = getRouteFromLocation();

void (async () => {
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
})();
