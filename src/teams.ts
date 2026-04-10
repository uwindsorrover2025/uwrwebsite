// ─── Teams page: scroll-driven rover on map ───────────────────────────────────
import "./style.css";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { injectCards, updateCards } from "./components/cards";
import { getWorldPosAt } from "./components/waypoints";
import roverGlbUrl from "./assets/Meshy_AI_blue_mars_rover_0409051747_texture.glb?url";
import mapUrl from "./assets/map.png?url";

// ── DOM ───────────────────────────────────────────────────────────────────────
document.querySelector<HTMLDivElement>("#app")!.innerHTML = `
<nav class="nav">
  <div class="nav-brand"><a href="/" style="color:inherit;text-decoration:none">UWR</a></div>
  <ul class="nav-links">
    <li><a href="/">Home</a></li>
    <li><a href="/teams.html" style="color:var(--text)">Teams</a></li>
    <li><a href="/#about">About</a></li>
    <li><a href="/#contact">Join Us</a></li>
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

<div style="height:480vh;pointer-events:none"></div>
`;

injectCards();

const N = 6;
const progressFill = document.getElementById("progress-fill")!;
const sectionCounter = document.getElementById("section-counter")!;
const scrollHint = document.getElementById("scroll-hint")!;

// ── Three.js: orthographic map scene ─────────────────────────────────────────
const FRUSTUM = 6;
const CAM_OFFSET = new THREE.Vector3(0, 12, 8);
const ELEV_FACTOR = 0.832;
const MAP_HALF_W = 12.11;
const MAP_HALF_D = 8.8;

const scene = new THREE.Scene();
scene.fog = new THREE.Fog(0x06060a, 18, 38);

const canvas = document.getElementById("main-canvas") as HTMLCanvasElement;
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x06060a, 1);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 0.9;

let camAspect = window.innerWidth / window.innerHeight;
const camera = new THREE.OrthographicCamera(
  (-FRUSTUM * camAspect) / 2,
  (FRUSTUM * camAspect) / 2,
  FRUSTUM / 2,
  -FRUSTUM / 2,
  -100,
  200,
);
camera.position.copy(CAM_OFFSET);
camera.lookAt(0, 0, 0);

scene.add(new THREE.AmbientLight(0xfff4e0, 0.72));
const sun = new THREE.DirectionalLight(0xffe8c0, 1.6);
sun.position.set(4, 8, 2);
scene.add(sun);
const fill = new THREE.DirectionalLight(0x6090d0, 0.4);
fill.position.set(-3, 2, -4);
scene.add(fill);

// ── Terrain ───────────────────────────────────────────────────────────────────
const tex = new THREE.TextureLoader().load(mapUrl);
tex.colorSpace = THREE.SRGBColorSpace;
scene.add(
  new THREE.Mesh(
    new THREE.PlaneGeometry(24.22, 17.6).rotateX(-Math.PI / 2),
    new THREE.MeshBasicMaterial({
      map: tex,
      color: new THREE.Color(0.52, 0.42, 0.4),
    }),
  ),
);

// ── Rover ─────────────────────────────────────────────────────────────────────
const HEADING_OFFSET = Math.PI / 2;
let roverGroup: THREE.Group | null = null;
const wheels: THREE.Object3D[] = [];

new GLTFLoader().load(
  roverGlbUrl,
  (gltf) => {
    const m = gltf.scene;
    const box1 = new THREE.Box3().setFromObject(m);
    const center = new THREE.Vector3();
    box1.getCenter(center);
    m.position.sub(center);

    const size = new THREE.Vector3();
    box1.getSize(size);
    m.scale.setScalar(1.4 / Math.max(size.x, size.y, size.z));

    const box2 = new THREE.Box3().setFromObject(m);
    m.position.y -= box2.min.y;

    m.traverse((child) => {
      const n = child.name.toLowerCase();
      if (n.includes("wheel") || n.includes("tire") || n.includes("tyre"))
        wheels.push(child);
    });

    const group = new THREE.Group();
    group.add(m);
    scene.add(group);
    roverGroup = group;
    updateScroll();
  },
  undefined,
  (err) => console.error("Rover load error:", err),
);

// ── Camera follow ─────────────────────────────────────────────────────────────
const camTarget = new THREE.Vector3();
const camCurrent = new THREE.Vector3();

function clampCamTarget(x: number, z: number): void {
  const halfFW = (FRUSTUM * camAspect) / 2;
  const halfFZ = FRUSTUM / (2 * ELEV_FACTOR);
  camTarget.set(
    Math.max(-MAP_HALF_W + halfFW, Math.min(MAP_HALF_W - halfFW, x)),
    0,
    Math.max(-MAP_HALF_D + halfFZ, Math.min(MAP_HALF_D - halfFZ, z)),
  );
}

// ── Render loop ───────────────────────────────────────────────────────────────
(function loop() {
  requestAnimationFrame(loop);
  camCurrent.lerp(camTarget, 0.055);
  camera.position.copy(camCurrent).add(CAM_OFFSET);
  camera.lookAt(camCurrent);
  renderer.render(scene, camera);
})();

// ── Scroll ────────────────────────────────────────────────────────────────────
function getProgress(): number {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  return max > 0 ? Math.min(1, window.scrollY / max) : 0;
}

function updateScroll(): void {
  const prog = getProgress();

  if (roverGroup) {
    const state = getWorldPosAt(prog);
    roverGroup.position.x = state.x;
    roverGroup.position.z = state.z;
    roverGroup.rotation.y = state.headingRad + HEADING_OFFSET;
    const spin = prog * Math.PI * 20;
    for (const w of wheels) w.rotation.x = spin;
    clampCamTarget(state.x, state.z);
  }

  const activeIdx = updateCards(prog);
  progressFill.style.width = `${prog * 100}%`;
  sectionCounter.textContent =
    activeIdx >= 0 ? `0${activeIdx + 1} / 0${N}` : "· · ·";
  scrollHint.style.opacity = prog < 0.05 ? `${1 - prog * 20}` : "0";
}

window.addEventListener("scroll", updateScroll, { passive: true });

window.addEventListener("resize", () => {
  const W = window.innerWidth,
    H = window.innerHeight;
  renderer.setSize(W, H);
  camAspect = W / H;
  camera.left = (-FRUSTUM * camAspect) / 2;
  camera.right = (FRUSTUM * camAspect) / 2;
  camera.updateProjectionMatrix();
});

updateScroll();
