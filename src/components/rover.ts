// ─── Rover GLB model ──────────────────────────────────────────────────────────
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { scene } from "./scene";
import roverGlbUrl from "../assets/Meshy_AI_blue_mars_rover_0409051747_texture.glb?url";

let roverGroup: THREE.Group | null = null;

export function loadRover(onReady?: () => void): void {
  new GLTFLoader().load(
    roverGlbUrl,
    (gltf) => {
      const m = gltf.scene;

      // Center + scale to ~2 world units tall for showcase
      const box1 = new THREE.Box3().setFromObject(m);
      const center = new THREE.Vector3();
      box1.getCenter(center);
      m.position.sub(center);

      const size = new THREE.Vector3();
      box1.getSize(size);
      m.scale.setScalar(2.0 / Math.max(size.x, size.y, size.z));

      // Sit on y = 0
      const box2 = new THREE.Box3().setFromObject(m);
      m.position.y -= box2.min.y;

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

// Spin the rover on Y axis as user scrolls (2 full rotations over 0→1 progress)
export function updateRover(scrollProgress: number): void {
  if (!roverGroup) return;
  roverGroup.rotation.y = scrollProgress * Math.PI * 4;
}
