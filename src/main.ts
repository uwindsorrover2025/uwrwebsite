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

const N_SECTIONS = 5;

function getSectionAndProgress(): { idx: number; prog: number } {
  const sectionH = window.innerHeight;
  const rawIdx = window.scrollY / sectionH;
  const idx = Math.min(Math.floor(rawIdx), N_SECTIONS - 1);
  const prog = rawIdx - Math.floor(rawIdx);
  return { idx, prog };
}

function getScrollSpaceH(): number {
  return (document.querySelector(".scroll-space") as HTMLElement).offsetHeight;
}

function updateScroll(): void {
  const { idx, prog } = getSectionAndProgress();
  updateRover(idx, prog);
  const overallProg = (idx + prog) / N_SECTIONS;
  const activeIdx = updateCards(overallProg);
  updateHud(overallProg, activeIdx);
  updateSceneVisibility(window.scrollY, getScrollSpaceH());
}

// Directional snap: fires after 30ms of no scrolling.
// Snaps forward after just 20% scroll into a section (same threshold backwards).
let snapTimer: ReturnType<typeof setTimeout> | null = null;
let lastScrollY = window.scrollY;
let scrollDir = 0;

function snapToSection(): void {
  const sectionH = window.innerHeight;
  if (window.scrollY > N_SECTIONS * sectionH) return; // free-scroll in about/contact
  const rawIdx = window.scrollY / sectionH;
  const floorIdx = Math.floor(rawIdx);
  const prog = rawIdx - floorIdx;
  const THRESHOLD = 0.2;
  const targetIdx =
    scrollDir >= 0
      ? prog > THRESHOLD ? floorIdx + 1 : floorIdx          // scrolling down: snap fwd at 20%
      : prog > 1 - THRESHOLD ? floorIdx + 1 : floorIdx;    // scrolling up:   snap back at 80%
  window.scrollTo({ top: Math.min(targetIdx, N_SECTIONS) * sectionH, behavior: "smooth" });
}

window.addEventListener(
  "scroll",
  () => {
    scrollDir = window.scrollY >= lastScrollY ? 1 : -1;
    lastScrollY = window.scrollY;
    updateScroll();
    if (snapTimer) clearTimeout(snapTimer);
    snapTimer = setTimeout(snapToSection, 30);
  },
  { passive: true },
);

window.addEventListener("resize", handleResize);
updateScroll();
