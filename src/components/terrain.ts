// ─── Map ground plane ─────────────────────────────────────────────────────────
// 24.22 × 17.60 world units (2422×1760 px, 1 unit = 100 px), flat in XZ plane.
// MeshBasicMaterial color multiplier approximates CSS brightness(0.52) saturate(0.82).
import * as THREE from "three";
import { scene } from "./scene";
import mapUrl from "../assets/map.png?url";

export function addTerrain(): void {
  const texture = new THREE.TextureLoader().load(mapUrl);
  texture.colorSpace = THREE.SRGBColorSpace;

  const plane = new THREE.Mesh(
    new THREE.PlaneGeometry(24.22, 17.6).rotateX(-Math.PI / 2),
    new THREE.MeshBasicMaterial({
      map: texture,
      color: new THREE.Color(0.52, 0.42, 0.4),
    }),
  );
  scene.add(plane);
}
