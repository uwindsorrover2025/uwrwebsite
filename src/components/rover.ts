// ─── Rover GLB model ──────────────────────────────────────────────────────────
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { scene } from "./scene";
import type { RoverState } from "./waypoints";
import roverGlbUrl from "../assets/Meshy_AI_blue_mars_rover_0409051747_texture.glb?url";

// ── Tune if rover faces the wrong direction ────────────────────────────────────
// 0            = model's +Z is forward (three.js default)
// Math.PI      = model's -Z is forward (flip 180°)
// Math.PI / 2  = model's -X is forward
// -Math.PI / 2 = model's +X is forward
const HEADING_OFFSET = Math.PI / 2;

// roverGroup is placed in the scene; the loaded mesh sits inside it centered at origin.
// Rotating roverGroup.rotation.y always pivots around the model's visual center.
let roverGroup: THREE.Group | null = null;
let wheels: THREE.Object3D[] = [];

export function loadRover(onReady?: () => void): void {
  new GLTFLoader().load(
    roverGlbUrl,
    (gltf) => {
      const m = gltf.scene;

      // Center model at its own origin so rotation pivots correctly
      const box1 = new THREE.Box3().setFromObject(m);
      const center = new THREE.Vector3();
      box1.getCenter(center);
      m.position.sub(center);

      // Scale to ~1.4 world units tall
      const size = new THREE.Vector3();
      box1.getSize(size);
      m.scale.setScalar(1.4 / Math.max(size.x, size.y, size.z));

      // Sit on y = 0 (ground plane)
      const box2 = new THREE.Box3().setFromObject(m);
      m.position.y -= box2.min.y;

      // Collect wheel objects for spinning
      m.traverse((child) => {
        const n = child.name.toLowerCase();
        if (n.includes("wheel") || n.includes("tire") || n.includes("tyre")) {
          wheels.push(child);
        }
      });

      // Wrap in a group so heading rotation always pivots around model center
      const group = new THREE.Group();
      group.add(m);
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

export function updateRover(state: RoverState, scrollProgress: number): void {
  if (!roverGroup) return;
  roverGroup.position.x = state.x;
  roverGroup.position.z = state.z;
  roverGroup.rotation.y = state.headingRad + HEADING_OFFSET;

  const spinRad = scrollProgress * Math.PI * 20;
  for (const w of wheels) w.rotation.x = spinRad;
}
