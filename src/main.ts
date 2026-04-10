import "./style.css";
import { buildDOM, initHud, updateHud, updateSceneVisibility } from "./components/ui";
import { injectCards, updateCards } from "./components/cards";
import { setupScene, startRenderLoop, handleResize } from "./components/scene";
import { loadRover, updateRover } from "./components/rover";

buildDOM();
injectCards();
initHud();
setupScene(document.getElementById("main-canvas") as HTMLCanvasElement);
loadRover(() => updateScroll());
startRenderLoop();

function getRoverProgress(): number {
  const scrollSpaceEl = document.querySelector(".scroll-space") as HTMLElement;
  const roverH = scrollSpaceEl.offsetHeight - window.innerHeight;
  return roverH > 0 ? Math.min(1, Math.max(0, window.scrollY / roverH)) : 0;
}

function getScrollSpaceH(): number {
  return (document.querySelector(".scroll-space") as HTMLElement).offsetHeight;
}

function updateScroll(): void {
  const prog = getRoverProgress();
  updateRover(prog);
  const activeIdx = updateCards(prog);
  updateHud(prog, activeIdx);
  updateSceneVisibility(window.scrollY, getScrollSpaceH());
}

window.addEventListener("scroll", updateScroll, { passive: true });
window.addEventListener("resize", handleResize);
updateScroll();
