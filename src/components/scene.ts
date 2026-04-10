// ─── Three.js renderer, camera, lights, and render loop ──────────────────────
import * as THREE from "three";

let _renderer: THREE.WebGLRenderer;
let _camera: THREE.PerspectiveCamera;

export const scene = new THREE.Scene();

export function setupScene(canvas: HTMLCanvasElement): void {
  _renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  _renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  _renderer.setSize(window.innerWidth, window.innerHeight);
  _renderer.setClearColor(0x07080e, 1);
  _renderer.outputColorSpace = THREE.SRGBColorSpace;
  _renderer.toneMapping = THREE.ACESFilmicToneMapping;
  _renderer.toneMappingExposure = 1.1;

  _camera = new THREE.PerspectiveCamera(
    42,
    window.innerWidth / window.innerHeight,
    0.1,
    100,
  );
  _camera.position.set(0, 1.8, 5.2);
  _camera.lookAt(0, 0.7, 0);

  // Warm key light — top right
  const key = new THREE.DirectionalLight(0xffe8c0, 2.2);
  key.position.set(4, 6, 3);
  scene.add(key);

  // Blue rim light — left back (brand colour #3b7ff5)
  const rim = new THREE.DirectionalLight(0x3b7ff5, 1.4);
  rim.position.set(-5, 3, -4);
  scene.add(rim);

  // Soft ambient fill
  scene.add(new THREE.AmbientLight(0xd0d8ff, 0.35));

  // Under-glow disc — circular canvas gradient as texture
  const gc = document.createElement("canvas");
  gc.width = gc.height = 256;
  const gctx = gc.getContext("2d")!;
  const grad = gctx.createRadialGradient(128, 128, 0, 128, 128, 128);
  grad.addColorStop(0, "rgba(59,127,245,0.28)");
  grad.addColorStop(0.55, "rgba(59,127,245,0.08)");
  grad.addColorStop(1, "rgba(59,127,245,0)");
  gctx.fillStyle = grad;
  gctx.fillRect(0, 0, 256, 256);

  const glowTex = new THREE.CanvasTexture(gc);
  const disc = new THREE.Mesh(
    new THREE.CircleGeometry(2.4, 64),
    new THREE.MeshBasicMaterial({
      map: glowTex,
      transparent: true,
      depthWrite: false,
    }),
  );
  disc.rotation.x = -Math.PI / 2;
  disc.position.y = 0.005;
  scene.add(disc);
}

export function startRenderLoop(): void {
  function loop(): void {
    requestAnimationFrame(loop);
    _renderer.render(scene, _camera);
  }
  loop();
}

export function handleResize(): void {
  const W = window.innerWidth,
    H = window.innerHeight;
  _renderer.setSize(W, H);
  _camera.aspect = W / H;
  _camera.updateProjectionMatrix();
}
