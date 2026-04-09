// ─── DOM shell injection and HUD updates ─────────────────────────────────────
import { CARDS } from "./cards";

export function buildDOM(): void {
  document.querySelector<HTMLDivElement>("#app")!.innerHTML = `
<nav class="nav">
  <div class="nav-brand">UWR</div>
  <ul class="nav-links">
    <li><a href="#">About</a></li>
    <li><a href="#">Team</a></li>
    <li><a href="#">Projects</a></li>
    <li><a href="#">Contact</a></li>
  </ul>
</nav>

<div class="scene">
  <canvas id="main-canvas"></canvas>
  <div id="cards-container"></div>
  <div class="hud">
    <div class="scroll-hint" id="scroll-hint">
      <div class="bounce-arrow">↓</div>
      <span>Scroll to explore</span>
    </div>
    <div class="progress-track">
      <div class="progress-fill" id="progress-fill"></div>
    </div>
    <div class="section-counter" id="section-counter">· · ·</div>
  </div>
</div>

<div class="scroll-space"></div>
`;
}

const N = CARDS.length;
let progressFill: HTMLElement;
let sectionCounter: HTMLElement;
let scrollHint: HTMLElement;

// Called after buildDOM() so elements exist
export function initHud(): void {
  progressFill = document.getElementById("progress-fill")!;
  sectionCounter = document.getElementById("section-counter")!;
  scrollHint = document.getElementById("scroll-hint")!;
}

export function updateHud(prog: number, activeCardIdx: number): void {
  progressFill.style.width = `${prog * 100}%`;
  sectionCounter.textContent =
    activeCardIdx >= 0 ? `0${activeCardIdx + 1} / 0${N}` : "· · ·";
  scrollHint.style.opacity = prog < 0.05 ? `${1 - prog * 20}` : "0";
}
