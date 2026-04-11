// ─── Rover GLB model + camera shot definitions ────────────────────────────────
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { scene, setCameraTransform } from "./scene";
import roverGlbUrl from "../assets/Meshy_AI_blue_mars_rover_0409051747_texture.glb?url";

interface Shot {
  pos: [number, number, number];
  target: [number, number, number];
}

// Camera orbits around the rover across the 5 shots as scroll goes 0→1
const SHOTS: Shot[] = [
  { pos: [0, 1.2, 5.5], target: [0, 1.5, 0] },       // Front
  { pos: [-5.5, 1.2, 1.5], target: [0, 1.5, 0] },     // Left side
  { pos: [-2.0, 5.5, -4.5], target: [0, 1.5, 0] },    // Elevated back-left
  { pos: [5.5, 1.2, 1.5], target: [0, 1.5, 0] },      // Right side
  { pos: [0.5, 7.5, 0.5], target: [0, 1.0, 0] },      // Top-down
];

let roverGroup: THREE.Group | null = null;

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export function loadRover(onReady?: () => void): void {
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
      m.scale.setScalar(3.8 / Math.max(size.x, size.y, size.z));

      const box2 = new THREE.Box3().setFromObject(m);
      m.position.y -= box2.min.y;

      const group = new THREE.Group();
      group.add(m);
      group.rotation.y = Math.PI / 4;
      group.position.y = 0.5; // raise rover so it sits centered in frame
      scene.add(group);
      roverGroup = group;
      onReady?.();
    },
    undefined,
    (err) => {
      console.error("Rover GLB load error:", err);
    },
  );
}

// scrollProgress: 0→1 across the full scroll-space
// Camera smoothly orbits through SHOTS, rover rotation fixed
export function updateRover(scrollProgress: number): void {
  const shotFloat = scrollProgress * (SHOTS.length - 1);
  const idx = Math.min(Math.floor(shotFloat), SHOTS.length - 2);
  const t = shotFloat - idx;

  const a = SHOTS[idx];
  const b = SHOTS[idx + 1];

  setCameraTransform(
    [lerp(a.pos[0], b.pos[0], t), lerp(a.pos[1], b.pos[1], t), lerp(a.pos[2], b.pos[2], t)],
    [lerp(a.target[0], b.target[0], t), lerp(a.target[1], b.target[1], t), lerp(a.target[2], b.target[2], t)],
  );
}
