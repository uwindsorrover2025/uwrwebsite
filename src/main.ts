import "./style.css";
import { buildDOM, initHud, updateHud } from "./components/ui";
import { injectCards, updateCards } from "./components/cards";
import { setupScene, startRenderLoop, clampCamTarget, handleResize } from "./components/scene";
import { addTerrain } from "./components/terrain";
import { loadRover, updateRover } from "./components/rover";
import { getWorldPosAt } from "./components/waypoints";

buildDOM();
injectCards();
initHud();
setupScene(document.getElementById("main-canvas") as HTMLCanvasElement);
addTerrain();
loadRover(() => updateScroll());
startRenderLoop();

function getScrollProgress(): number {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  return max > 0 ? Math.min(1, window.scrollY / max) : 0;
}

function updateScroll(): void {
  const prog = getScrollProgress();
  const state = getWorldPosAt(prog);
  updateRover(state, prog);
  clampCamTarget(state.x, state.z);
  const activeIdx = updateCards(prog);
  updateHud(prog, activeIdx);
}

window.addEventListener("scroll", updateScroll, { passive: true });
window.addEventListener("resize", handleResize);
updateScroll();
