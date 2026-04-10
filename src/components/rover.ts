// ─── Rover GLB model + camera shot definitions ────────────────────────────────
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { scene, setCameraTransform } from "./scene";
import roverGlbUrl from "../assets/Meshy_AI_blue_mars_rover_0409051747_texture.glb?url";

interface Shot {
  pos: [number, number, number];
  target: [number, number, number];
}

// Each snap section smoothly orbits the camera to the NEXT shot
const SHOTS: Shot[] = [
  { pos: [0, 2.2, 5.5], target: [0, 1.9, 0] },       // Front
  { pos: [-5.5, 2.6, 1.5], target: [0, 1.9, 0] },     // Left side
  { pos: [-2.0, 5.5, -4.5], target: [0, 2.1, 0] },    // Elevated back-left
  { pos: [5.5, 2.6, 1.5], target: [0, 1.9, 0] },      // Right side
  { pos: [0.5, 7.5, 0.5], target: [0, 1.2, 0] },      // Top-down
];

let roverGroup: THREE.Group | null = null;

function smoothstep(t: number): number {
  return t * t * (3 - 2 * t);
}

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
      group.rotation.y = Math.PI / 4; // fixed heading
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

// sectionIdx: which snap section (0…N-1), sectionProg: 0…1 within that section
export function updateRover(sectionIdx: number, sectionProg: number): void {
  const t = smoothstep(sectionProg);
  const a = SHOTS[sectionIdx];
  const b = SHOTS[Math.min(sectionIdx + 1, SHOTS.length - 1)];

  setCameraTransform(
    [lerp(a.pos[0], b.pos[0], t), lerp(a.pos[1], b.pos[1], t), lerp(a.pos[2], b.pos[2], t)],
    [lerp(a.target[0], b.target[0], t), lerp(a.target[1], b.target[1], t), lerp(a.target[2], b.target[2], t)],
  );
}
