import { buildDOM, initHud, updateHud, updateSceneVisibility } from "../components/ui";
import { injectCards, updateCards } from "../components/cards";
import { setupScene, startRenderLoop, handleResize } from "../components/scene";
import { loadRover, updateRover } from "../components/rover";
import { preloadHref } from "../preload-assets";
import homeRoverGlbUrl from "../assets/GazeboV2.glb?url";

export function mountHome(): void {
  preloadHref(homeRoverGlbUrl, "fetch");

  buildDOM();
  syncScrollToHash();
  injectCards();
  initHud();
  setupScene(document.getElementById("main-canvas") as HTMLCanvasElement);
  loadRover(() => updateScroll());
  startRenderLoop();

  function getRoverProgress(): number {
    const scrollSpaceEl = document.querySelector(".scroll-space") as HTMLElement;
    const h = scrollSpaceEl.offsetHeight - window.innerHeight;
    return h > 0 ? Math.min(1, Math.max(0, window.scrollY / h)) : 0;
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
}

function syncScrollToHash(): void {
  const hash = window.location.hash;
  if (!hash) return;
  const target = document.querySelector(hash) as HTMLElement | null;
  if (!target) return;

  // DOM is injected at runtime; delay anchor jump until layout is stable.
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      target.scrollIntoView({ behavior: "auto", block: "start" });
    });
  });
}
