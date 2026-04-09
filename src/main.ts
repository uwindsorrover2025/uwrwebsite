import "./style.css";
import heroImg from "./assets/hero.png";

// ─── Types ──────────────────────────────────────────────────────────────────
interface Waypoint {
  progress: number;
  x: number; // % of viewport width  (for CSS left)
  y: number; // % of viewport height (for CSS top)
  rotateY: number; // degrees – 2.5D tilt
  scale: number;
}

interface CardDef {
  id: number;
  title: string;
  subtitle: string;
  body: string;
  icon: string;
  startProgress: number;
  endProgress: number;
  side: "left" | "right";
  top: number; // viewport height %
}

// ─── Path waypoints ─────────────────────────────────────────────────────────
// Rover travels from top-right → diagonal path downward
const WAYPOINTS: Waypoint[] = [
  { progress: 0.0, x: 72, y: 8, rotateY: 0, scale: 1.0 },
  { progress: 0.15, x: 60, y: 22, rotateY: -8, scale: 0.98 },
  { progress: 0.3, x: 45, y: 36, rotateY: -12, scale: 0.95 },
  { progress: 0.45, x: 28, y: 50, rotateY: -14, scale: 0.92 },
  { progress: 0.6, x: 38, y: 63, rotateY: 6, scale: 0.9 },
  { progress: 0.75, x: 20, y: 75, rotateY: -11, scale: 0.88 },
  { progress: 1.0, x: 54, y: 88, rotateY: 7, scale: 0.86 },
];

// ─── Info cards ─────────────────────────────────────────────────────────────
const CARDS: CardDef[] = [
  {
    id: 1,
    title: "UWR Rover",
    subtitle: "University of Windsor Robotics",
    body: "The UWindsor Rover is a next-generation Mars analog robot engineered by a multidisciplinary team of students competing at international university robotics challenges.",
    icon: "🚀",
    startProgress: 0.04,
    endProgress: 0.22,
    side: "left",
    top: 18,
  },
  {
    id: 2,
    title: "6-Wheel Drive",
    subtitle: "Mobility System",
    body: "Independent rocker-bogie suspension across all six wheels delivers superior traversal performance over rocky Martian terrain. Each wheel is powered by a high-torque brushless motor.",
    icon: "⚙️",
    startProgress: 0.2,
    endProgress: 0.38,
    side: "left",
    top: 38,
  },
  {
    id: 3,
    title: "Autonomous Navigation",
    subtitle: "AI-Powered Systems",
    body: "SLAM algorithms and real-time computer vision enable the rover to map and navigate unknown terrain without continuous human intervention. Obstacle avoidance runs at 30 Hz.",
    icon: "🤖",
    startProgress: 0.37,
    endProgress: 0.55,
    side: "right",
    top: 20,
  },
  {
    id: 4,
    title: "Science Payload",
    subtitle: "Research Instruments",
    body: "Onboard spectrometer, soil sampler, and multi-spectral cameras allow the rover to perform geological analysis and detect potential biosignatures in simulated Martian environments.",
    icon: "🔬",
    startProgress: 0.54,
    endProgress: 0.7,
    side: "right",
    top: 42,
  },
  {
    id: 5,
    title: "Competition Ready",
    subtitle: "IRC & URC",
    body: "Competing at the University Rover Challenge in Utah and the International Rover Challenge, the UWR team pushes limits alongside top engineering student teams from around the world.",
    icon: "🏆",
    startProgress: 0.69,
    endProgress: 0.85,
    side: "right",
    top: 62,
  },
  {
    id: 6,
    title: "Join the Team",
    subtitle: "Open Recruitment",
    body: "Open to all University of Windsor students. Gain real hands-on experience in robotics, software engineering, mechanical design, embedded systems, and systems integration.",
    icon: "👥",
    startProgress: 0.84,
    endProgress: 1.0,
    side: "left",
    top: 60,
  },
];

// ─── Build DOM ───────────────────────────────────────────────────────────────
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
  <!-- Path trail drawn as viewport-percentage SVG -->
  <svg class="path-svg" viewBox="0 0 100 100" preserveAspectRatio="none">
    <path id="path-track" fill="none"
          stroke="rgba(59,127,245,0.12)"
          stroke-width="0.35"
          stroke-dasharray="0.8 1.2"/>
    <path id="path-done" fill="none"
          stroke="rgba(59,127,245,0.45)"
          stroke-width="0.4"/>
  </svg>

  <!-- Rover -->
  <div class="rover-wrapper" id="rover-wrapper">
    <img class="rover-img" src="${heroImg}" alt="UWR Rover" />
    <div class="rover-glow"></div>
  </div>

  <!-- Info cards injected below -->
  <div id="cards-container"></div>

  <!-- HUD strip at bottom -->
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

<!-- This tall div creates the scroll space; the scene is position:fixed -->
<div class="scroll-space"></div>
`;

// ─── Inject cards ─────────────────────────────────────────────────────────────
const container = document.getElementById("cards-container")!;
for (const card of CARDS) {
  const el = document.createElement("div");
  el.className = `info-card info-card-${card.side}`;
  el.id = `card-${card.id}`;
  el.style.top = `${card.top}%`;
  el.innerHTML = `
    <div class="card-icon">${card.icon}</div>
    <div class="card-text-wrap">
      <div class="card-subtitle">${card.subtitle}</div>
      <h3 class="card-title">${card.title}</h3>
      <p class="card-body">${card.body}</p>
    </div>
  `;
  container.appendChild(el);
}

// ─── Path SVG data ────────────────────────────────────────────────────────────
function buildPathD(): string {
  return WAYPOINTS.map((w, i) => `${i === 0 ? "M" : "L"}${w.x},${w.y}`).join(
    " ",
  );
}

const pathD = buildPathD();
const trackEl = document.getElementById("path-track") as SVGPathElement;
const doneEl = document.getElementById("path-done") as SVGPathElement;
trackEl.setAttribute("d", pathD);
doneEl.setAttribute("d", pathD);

// Pre-measure path length for stroke-dashoffset trick
let pathLength = 0;
requestAnimationFrame(() => {
  pathLength = doneEl.getTotalLength();
  doneEl.style.strokeDasharray = `${pathLength}`;
  doneEl.style.strokeDashoffset = `${pathLength}`; // starts hidden
});

// ─── Interpolation ────────────────────────────────────────────────────────────
function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

interface RoverState {
  x: number;
  y: number;
  rotateY: number;
  scale: number;
}

function getStateAt(prog: number): RoverState {
  prog = Math.max(0, Math.min(1, prog));
  let lo = WAYPOINTS[0];
  let hi = WAYPOINTS[WAYPOINTS.length - 1];
  for (let i = 0; i < WAYPOINTS.length - 1; i++) {
    if (prog <= WAYPOINTS[i + 1].progress) {
      lo = WAYPOINTS[i];
      hi = WAYPOINTS[i + 1];
      break;
    }
  }
  const t =
    hi.progress === lo.progress
      ? 0
      : (prog - lo.progress) / (hi.progress - lo.progress);
  return {
    x: lerp(lo.x, hi.x, t),
    y: lerp(lo.y, hi.y, t),
    rotateY: lerp(lo.rotateY, hi.rotateY, t),
    scale: lerp(lo.scale, hi.scale, t),
  };
}

// ─── Card opacity ─────────────────────────────────────────────────────────────
function cardOpacity(card: CardDef, prog: number): number {
  const FADE = 0.04;
  if (prog < card.startProgress || prog > card.endProgress) return 0;
  if (prog < card.startProgress + FADE)
    return (prog - card.startProgress) / FADE;
  if (prog > card.endProgress - FADE) return (card.endProgress - prog) / FADE;
  return 1;
}

// ─── DOM refs ─────────────────────────────────────────────────────────────────
const roverWrapper = document.getElementById("rover-wrapper")!;
const progressFill = document.getElementById("progress-fill")!;
const sectionCounter = document.getElementById("section-counter")!;
const scrollHint = document.getElementById("scroll-hint")!;
const cardEls = CARDS.map((c) => document.getElementById(`card-${c.id}`)!);

// ─── Main update ──────────────────────────────────────────────────────────────
function getScrollProgress(): number {
  const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
  return maxScroll > 0 ? Math.min(1, window.scrollY / maxScroll) : 0;
}

function update(): void {
  const prog = getScrollProgress();
  const state = getStateAt(prog);

  // — Rover position + 2.5D transform
  roverWrapper.style.left = `${state.x}%`;
  roverWrapper.style.top = `${state.y}%`;
  roverWrapper.style.transform = `translate(-50%, -50%) rotateY(${state.rotateY}deg) scale(${state.scale})`;

  // — Path "done so far" line
  if (pathLength > 0) {
    doneEl.style.strokeDashoffset = `${pathLength * (1 - prog)}`;
  }

  // — Cards
  let activeIdx = -1;
  let bestOpacity = 0;
  CARDS.forEach((card, i) => {
    const op = cardOpacity(card, prog);
    if (op > bestOpacity) {
      bestOpacity = op;
      activeIdx = i;
    }
    const el = cardEls[i];
    el.style.opacity = `${op}`;
    const slide = card.side === "left" ? "-24px" : "24px";
    el.style.transform =
      op > 0.01 ? "translateX(0) scale(1)" : `translateX(${slide}) scale(0.97)`;
  });

  // — Progress bar
  progressFill.style.width = `${prog * 100}%`;

  // — Section counter
  sectionCounter.textContent =
    activeIdx >= 0 ? `0${activeIdx + 1} / 0${CARDS.length}` : "· · ·";

  // — Scroll hint fades after first 5% scroll
  scrollHint.style.opacity = prog < 0.05 ? `${1 - prog * 20}` : "0";
}

window.addEventListener("scroll", update, { passive: true });
update(); // initial draw
