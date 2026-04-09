import "./style.css";
import mapImg from "./assets/map.png";
import roverGlbUrl from "./assets/Meshy_AI_blue_mars_rover_0409051747_texture.glb?url";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

// ─── Types ───────────────────────────────────────────────────────────────────
interface Waypoint {
  progress: number;
  x: number;    // % of viewport width
  y: number;    // % of viewport height
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

// ─── Path waypoints (traced from map.png roads) ───────────────────────────────
// Upper-left road entry → crossroads → base → S-curve south
const WAYPOINTS: Waypoint[] = [
  { progress: 0.00, x: 15, y: 10, scale: 1.00 },
  { progress: 0.15, x: 30, y: 24, scale: 0.98 },
  { progress: 0.28, x: 45, y: 37, scale: 0.96 },
  { progress: 0.38, x: 50, y: 44, scale: 0.94 },
  { progress: 0.47, x: 50, y: 49, scale: 0.92 },
  { progress: 0.57, x: 44, y: 60, scale: 0.90 },
  { progress: 0.68, x: 36, y: 70, scale: 0.88 },
  { progress: 0.82, x: 46, y: 83, scale: 0.86 },
  { progress: 1.00, x: 53, y: 92, scale: 0.84 },
];

// ─── Info cards ───────────────────────────────────────────────────────────────
const CARDS: CardDef[] = [
  {
    id: 1,
    title: "UWR Rover",
    subtitle: "University of Windsor Robotics",
    body: "The UWindsor Rover is a next-generation Mars analog robot engineered by a multidisciplinary team of students competing at international university robotics challenges.",
    icon: "🚀",
    startProgress: 0.04, endProgress: 0.20,
    side: "right", top: 18,
  },
  {
    id: 2,
    title: "6-Wheel Drive",
    subtitle: "Mobility System",
    body: "Independent rocker-bogie suspension across all six wheels delivers superior traversal over rocky terrain. Each wheel is powered by a high-torque brushless motor.",
    icon: "⚙️",
    startProgress: 0.19, endProgress: 0.36,
    side: "right", top: 40,
  },
  {
    id: 3,
    title: "Autonomous Navigation",
    subtitle: "AI-Powered Systems",
    body: "SLAM algorithms and real-time computer vision enable the rover to map unknown terrain without continuous human intervention. Obstacle avoidance runs at 30 Hz.",
    icon: "🤖",
    startProgress: 0.35, endProgress: 0.52,
    side: "left", top: 22,
  },
  {
    id: 4,
    title: "Science Payload",
    subtitle: "Research Instruments",
    body: "Onboard spectrometer, soil sampler, and multi-spectral cameras allow geological analysis and detection of potential biosignatures in simulated Martian environments.",
    icon: "🔬",
    startProgress: 0.51, endProgress: 0.67,
    side: "right", top: 56,
  },
  {
    id: 5,
    title: "Competition Ready",
    subtitle: "IRC & URC",
    body: "Competing at the University Rover Challenge in Utah and the International Rover Challenge, pushing limits alongside top engineering student teams worldwide.",
    icon: "🏆",
    startProgress: 0.66, endProgress: 0.82,
    side: "left", top: 62,
  },
  {
    id: 6,
    title: "Join the Team",
    subtitle: "Open Recruitment",
    body: "Open to all UWindsor students. Gain real hands-on experience in robotics, software engineering, mechanical design, embedded systems, and systems integration.",
    icon: "👥",
    startProgress: 0.81, endProgress: 1.00,
    side: "right", top: 74,
  },
];

// ─── Build DOM ────────────────────────────────────────────────────────────────
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
  <div class="map-bg" id="map-bg"></div>

  <svg class="path-svg" viewBox="0 0 100 100" preserveAspectRatio="none">
    <path id="path-track" fill="none"
          stroke="rgba(59,127,245,0.20)"
          stroke-width="0.45"
          stroke-dasharray="0.9 1.4"/>
    <path id="path-done" fill="none"
          stroke="rgba(100,168,255,0.65)"
          stroke-width="0.5"/>
  </svg>

  <div class="rover-wrapper" id="rover-wrapper">
    <canvas id="rover-canvas"></canvas>
  </div>

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

// ─── Map background ───────────────────────────────────────────────────────────
const mapBg = document.getElementById("map-bg")!;
mapBg.style.backgroundImage = `url('${mapImg}')`;

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

// ─── Path SVG ─────────────────────────────────────────────────────────────────
function buildPathD(): string {
  return WAYPOINTS.map((w, i) => `${i === 0 ? "M" : "L"}${w.x},${w.y}`).join(" ");
}

const pathD = buildPathD();
const trackEl = document.querySelector<SVGPathElement>("#path-track")!;
const doneEl  = document.querySelector<SVGPathElement>("#path-done")!;
trackEl.setAttribute("d", pathD);
doneEl.setAttribute("d", pathD);

let pathLength = 0;
requestAnimationFrame(() => {
  pathLength = doneEl.getTotalLength();
  doneEl.style.strokeDasharray  = `${pathLength}`;
  doneEl.style.strokeDashoffset = `${pathLength}`;
});

// ─── Interpolation ────────────────────────────────────────────────────────────
function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

interface RoverState {
  x: number;
  y: number;
  scale: number;
  headingRad: number; // screen-space heading in radians (0=right, CW)
}

function getStateAt(prog: number): RoverState {
  prog = Math.max(0, Math.min(1, prog));
  let lo = WAYPOINTS[0];
  let hi = WAYPOINTS[WAYPOINTS.length - 1];
  for (let i = 0; i < WAYPOINTS.length - 1; i++) {
    if (prog <= WAYPOINTS[i + 1].progress) {
      lo = WAYPOINTS[i]; hi = WAYPOINTS[i + 1]; break;
    }
  }
  const t = hi.progress === lo.progress
    ? 0 : (prog - lo.progress) / (hi.progress - lo.progress);
  const dx = hi.x - lo.x;
  const dy = hi.y - lo.y;
  return {
    x:          lerp(lo.x,     hi.x,     t),
    y:          lerp(lo.y,     hi.y,     t),
    scale:      lerp(lo.scale, hi.scale, t),
    headingRad: Math.atan2(dy, dx),
  };
}

// ─── Card opacity ─────────────────────────────────────────────────────────────
function cardOpacity(card: CardDef, prog: number): number {
  const FADE = 0.04;
  if (prog < card.startProgress || prog > card.endProgress) return 0;
  if (prog < card.startProgress + FADE) return (prog - card.startProgress) / FADE;
  if (prog > card.endProgress   - FADE) return (card.endProgress   - prog) / FADE;
  return 1;
}

// ─── DOM refs ─────────────────────────────────────────────────────────────────
const roverWrapper   = document.getElementById("rover-wrapper")!;
const progressFill   = document.getElementById("progress-fill")!;
const sectionCounter = document.getElementById("section-counter")!;
const scrollHint     = document.getElementById("scroll-hint")!;
const cardEls        = CARDS.map((c) => document.getElementById(`card-${c.id}`)!);

// ─── Three.js setup ───────────────────────────────────────────────────────────
const CANVAS_W = 340;
const CANVAS_H = 200;

const canvas = document.getElementById("rover-canvas") as HTMLCanvasElement;
const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(CANVAS_W, CANVAS_H);
renderer.outputColorSpace = THREE.SRGBColorSpace;

const scene = new THREE.Scene();

// Orthographic camera – isometric-style (matches the map's oblique top-down view)
const aspect  = CANVAS_W / CANVAS_H;
const frustum = 4.2; // world-unit height visible
const camera  = new THREE.OrthographicCamera(
  -frustum * aspect / 2,
   frustum * aspect / 2,
   frustum / 2,
  -frustum / 2,
  -50, 50,
);
// Position from NE at ~50° elevation to roughly match map's aerial perspective
camera.position.set(6, 8, 6);
camera.lookAt(0, 0, 0);

// Lighting: warm sun NE (matching map's light direction) + cool fill from SW
const ambient = new THREE.AmbientLight(0xfff4e0, 0.72);
scene.add(ambient);
const sun = new THREE.DirectionalLight(0xffe8c0, 1.6);
sun.position.set(4, 8, 2);
scene.add(sun);
const fill = new THREE.DirectionalLight(0x6090d0, 0.4);
fill.position.set(-3, 2, -4);
scene.add(fill);

// ─── GLB loader ───────────────────────────────────────────────────────────────
let roverModel: THREE.Group | null = null;
let wheelMeshes: THREE.Object3D[] = [];

const loader = new GLTFLoader();
loader.load(
  roverGlbUrl,
  (gltf) => {
    const model = gltf.scene;

    // Center on bounding box centroid
    const box = new THREE.Box3().setFromObject(model);
    const center = new THREE.Vector3();
    box.getCenter(center);
    model.position.sub(center);

    // Scale to fill ~80% of the frustum height
    const size = new THREE.Vector3();
    box.getSize(size);
    const maxDim = Math.max(size.x, size.y, size.z);
    model.scale.setScalar((frustum * 0.78) / maxDim);

    // Sit on ground plane (y = 0)
    const box2 = new THREE.Box3().setFromObject(model);
    model.position.y -= box2.min.y;

    // Collect wheel objects for spin animation
    model.traverse((child) => {
      const name = child.name.toLowerCase();
      if (name.includes("wheel") || name.includes("tire") || name.includes("tyre")) {
        wheelMeshes.push(child);
      }
    });

    scene.add(model);
    roverModel = model;

    // Render the first frame once loaded
    update();
  },
  undefined,
  (err) => {
    console.error("GLB load error:", err);
  },
);

// ─── Scroll progress ──────────────────────────────────────────────────────────
function getScrollProgress(): number {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  return max > 0 ? Math.min(1, window.scrollY / max) : 0;
}

// ─── Main update ──────────────────────────────────────────────────────────────
function update(): void {
  const prog  = getScrollProgress();
  const state = getStateAt(prog);

  // — Map: pan top→bottom, gentle zoom
  mapBg.style.backgroundPosition = `center ${prog * 100}%`;
  mapBg.style.transform          = `scale(${1 + prog * 0.14})`;

  // — Rover CSS position (wrapper centres canvas on the path point)
  roverWrapper.style.left      = `${state.x}%`;
  roverWrapper.style.top       = `${state.y}%`;
  roverWrapper.style.transform = `translate(-50%, -50%) scale(${state.scale})`;

  // — Three.js rover render
  if (roverModel) {
    // Map screen-space heading → world Y rotation.
    // Camera is at NE (45° azimuth), so subtract 45° to align "right on screen" with rover forward.
    roverModel.rotation.y = -state.headingRad - Math.PI / 4;

    // Wheel spin proportional to cumulative distance (simplified: use scroll progress)
    const spinRad = prog * Math.PI * 20; // 10 full rotations across the journey
    for (const w of wheelMeshes) {
      w.rotation.x = spinRad;
    }

    renderer.render(scene, camera);
  }

  // — Path trail
  if (pathLength > 0) {
    doneEl.style.strokeDashoffset = `${pathLength * (1 - prog)}`;
  }

  // — Cards
  let activeIdx = -1, bestOpacity = 0;
  CARDS.forEach((card, i) => {
    const op = cardOpacity(card, prog);
    if (op > bestOpacity) { bestOpacity = op; activeIdx = i; }
    const el = cardEls[i];
    el.style.opacity   = `${op}`;
    const slide = card.side === "left" ? "-24px" : "24px";
    el.style.transform = op > 0.01
      ? "translateX(0) scale(1)"
      : `translateX(${slide}) scale(0.97)`;
  });

  // — HUD
  progressFill.style.width   = `${prog * 100}%`;
  sectionCounter.textContent = activeIdx >= 0
    ? `0${activeIdx + 1} / 0${CARDS.length}` : "· · ·";
  scrollHint.style.opacity   = prog < 0.05 ? `${1 - prog * 20}` : "0";
}

window.addEventListener("scroll", update, { passive: true });
update();
