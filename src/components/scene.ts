// ─── Three.js renderer, camera, lights, and render loop ──────────────────────
import * as THREE from "three";

// ── Tunable constants ──────────────────────────────────────────────────────────
// World units visible vertically — increase to zoom out, decrease to zoom in
export const FRUSTUM = 6;
// Camera offset from follow-target: pure-Z keeps map X-axis horizontal on screen
export const CAM_OFFSET = new THREE.Vector3(0, 12, 8);
// Elevation projection factor: sin(atan2(12, 8)) — maps world-Z to screen-Y
const ELEV_FACTOR = 0.832;
// Map plane half-extents (world units)
export const MAP_HALF_W = 12.11; // 24.22 / 2
export const MAP_HALF_D = 8.8; // 17.60 / 2

// ── Module state (set by setupScene) ──────────────────────────────────────────
let _renderer: THREE.WebGLRenderer;
let _camera: THREE.OrthographicCamera;

export let camAspect = window.innerWidth / window.innerHeight;

export const scene = new THREE.Scene();
export const camTarget = new THREE.Vector3();
export const camCurrent = new THREE.Vector3();

scene.fog = new THREE.Fog(0x06060a, 18, 38);

// ── Setup ──────────────────────────────────────────────────────────────────────
export function setupScene(canvas: HTMLCanvasElement): void {
  _renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  _renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  _renderer.setSize(window.innerWidth, window.innerHeight);
  _renderer.setClearColor(0x06060a, 1);
  _renderer.outputColorSpace = THREE.SRGBColorSpace;
  _renderer.toneMapping = THREE.ACESFilmicToneMapping;
  _renderer.toneMappingExposure = 0.9;

  _camera = new THREE.OrthographicCamera(
    (-FRUSTUM * camAspect) / 2,
    (FRUSTUM * camAspect) / 2,
    FRUSTUM / 2,
    -FRUSTUM / 2,
    -100,
    200,
  );
  _camera.position.copy(CAM_OFFSET);
  _camera.lookAt(0, 0, 0);

  // Warm ambient + NE sun + cool SW fill — matches map baked lighting
  scene.add(new THREE.AmbientLight(0xfff4e0, 0.72));

  const sun = new THREE.DirectionalLight(0xffe8c0, 1.6);
  sun.position.set(4, 8, 2);
  scene.add(sun);

  const fill = new THREE.DirectionalLight(0x6090d0, 0.4);
  fill.position.set(-3, 2, -4);
  scene.add(fill);
}

// ── Render loop ────────────────────────────────────────────────────────────────
// Continuous rAF loop: lerps camera toward target for cinematic smoothness
export function startRenderLoop(): void {
  function loop(): void {
    requestAnimationFrame(loop);
    camCurrent.lerp(camTarget, 0.055);
    _camera.position.copy(camCurrent).add(CAM_OFFSET);
    _camera.lookAt(camCurrent);
    _renderer.render(scene, _camera);
  }
  loop();
}

// ── Camera target clamping ─────────────────────────────────────────────────────
// Prevents the frustum from showing dark areas beyond the map plane edges
export function clampCamTarget(x: number, z: number): void {
  const halfFW = (FRUSTUM * camAspect) / 2;
  const halfFZ = FRUSTUM / (2 * ELEV_FACTOR);
  camTarget.set(
    Math.max(-MAP_HALF_W + halfFW, Math.min(MAP_HALF_W - halfFW, x)),
    0,
    Math.max(-MAP_HALF_D + halfFZ, Math.min(MAP_HALF_D - halfFZ, z)),
  );
}

// ── Resize ────────────────────────────────────────────────────────────────────
export function handleResize(): void {
  const W = window.innerWidth,
    H = window.innerHeight;
  _renderer.setSize(W, H);
  camAspect = W / H;
  _camera.left = (-FRUSTUM * camAspect) / 2;
  _camera.right = (FRUSTUM * camAspect) / 2;
  _camera.updateProjectionMatrix();
}
