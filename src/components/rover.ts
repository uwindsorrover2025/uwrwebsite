// ─── Scroll-driven rover disassembly animation ────────────────────────────────
// Loads a single-mesh GLB, auto-splits it into connected components,
// classifies parts by spatial position, and animates the explosion on scroll.
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { scene, setCameraTransform } from "./scene";
import roverUrl from "../assets/GazeboV2.glb?url";

// ── Per-role slide animation ──────────────────────────────────────────────────
// Directions are in group-local space. The group is rotated 45° around Y, so
// [-d, 0, -d] → screen-left and [d, 0, d] → screen-right.

const S = 3.0; // slide magnitude (units in normalised model space)

const ROLE_ANIMS: Record<
  string,
  { dir: [number, number, number]; start: number; end: number }
> = {
  wheel_fl: { dir: [-S, 0, -S], start: 0.18, end: 0.36 },
  wheel_fr: { dir: [S, 0, S], start: 0.20, end: 0.38 },
  wheel_ml: { dir: [-S, 0, -S], start: 0.27, end: 0.45 },
  wheel_mr: { dir: [S, 0, S], start: 0.29, end: 0.47 },
  wheel_rl: { dir: [-S, 0, -S], start: 0.36, end: 0.54 },
  wheel_rr: { dir: [S, 0, S], start: 0.38, end: 0.56 },
  bogie_left: { dir: [-S, 0, -S], start: 0.52, end: 0.68 },
  bogie_right: { dir: [S, 0, S], start: 0.54, end: 0.70 },
  rocker_left: { dir: [-S, 0, -S], start: 0.66, end: 0.82 },
  rocker_right: { dir: [S, 0, S], start: 0.68, end: 0.84 },
};

// ── Camera ────────────────────────────────────────────────────────────────────
// Zooms in during the first 15% of scroll, then stays fixed.

const CAM_FAR: [number, number, number] = [3, 2.5, 8];
const CAM_CLOSE: [number, number, number] = [0, 1.5, 5];
const CAM_TARGET: [number, number, number] = [0, 1.5, 0];
const CAM_ZOOM_END = 0.15;

// ── Tracked parts state ───────────────────────────────────────────────────────

interface Tracked {
  obj: THREE.Object3D;
  origin: THREE.Vector3;
  dir: [number, number, number];
  start: number;
  end: number;
}

let tracked: Tracked[] = [];

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}
function easeOutCubic(x: number): number {
  return 1 - (1 - x) ** 3;
}

// ── Union-Find (for connected-component analysis) ─────────────────────────────

function findComponents(
  pos: THREE.BufferAttribute,
  idx: THREE.BufferAttribute | null,
): number[][] {
  const numTri = idx ? idx.count / 3 : pos.count / 3;

  const par = new Int32Array(numTri);
  const rnk = new Uint8Array(numTri);
  for (let i = 0; i < numTri; i++) par[i] = i;

  function find(x: number): number {
    while (par[x] !== x) {
      par[x] = par[par[x]];
      x = par[x];
    }
    return x;
  }
  function union(a: number, b: number): void {
    a = find(a);
    b = find(b);
    if (a === b) return;
    if (rnk[a] < rnk[b]) {
      const tmp = a;
      a = b;
      b = tmp;
    }
    par[b] = a;
    if (rnk[a] === rnk[b]) rnk[a]++;
  }

  const PREC = 1e4;
  const vmap = new Map<string, number>();

  for (let tri = 0; tri < numTri; tri++) {
    for (let v = 0; v < 3; v++) {
      const vi = idx ? idx.getX(tri * 3 + v) : tri * 3 + v;
      const key = `${Math.round(pos.getX(vi) * PREC)},${Math.round(pos.getY(vi) * PREC)},${Math.round(pos.getZ(vi) * PREC)}`;
      const prev = vmap.get(key);
      if (prev !== undefined) union(tri, prev);
      else vmap.set(key, tri);
    }
  }

  const groups = new Map<number, number[]>();
  for (let i = 0; i < numTri; i++) {
    const root = find(i);
    let g = groups.get(root);
    if (!g) {
      g = [];
      groups.set(root, g);
    }
    g.push(i);
  }

  return [...groups.values()]
    .filter((g) => g.length >= 50)
    .sort((a, b) => b.length - a.length);
}

// ── Split single geometry into per-component meshes ───────────────────────────

interface CompInfo {
  mesh: THREE.Mesh;
  centroid: THREE.Vector3;
  triCount: number;
}

function buildComponentMeshes(
  normPos: Float32Array,
  norm: THREE.BufferAttribute | null,
  idx: THREE.BufferAttribute | null,
  components: number[][],
  mat: THREE.Material,
  parent: THREE.Group,
): CompInfo[] {
  return components.map((tris) => {
    const vset = new Set<number>();
    for (const t of tris)
      for (let v = 0; v < 3; v++)
        vset.add(idx ? idx.getX(t * 3 + v) : t * 3 + v);

    const uniq = [...vset];
    const remap = new Map<number, number>();
    uniq.forEach((old, i) => remap.set(old, i));

    const p = new Float32Array(uniq.length * 3);
    const n = norm ? new Float32Array(uniq.length * 3) : null;
    let cx = 0,
      cy = 0,
      cz = 0;

    for (let i = 0; i < uniq.length; i++) {
      const oi = uniq[i];
      const x = normPos[oi * 3],
        y = normPos[oi * 3 + 1],
        z = normPos[oi * 3 + 2];
      p[i * 3] = x;
      p[i * 3 + 1] = y;
      p[i * 3 + 2] = z;
      cx += x;
      cy += y;
      cz += z;
      if (norm && n) {
        n[i * 3] = norm.getX(oi);
        n[i * 3 + 1] = norm.getY(oi);
        n[i * 3 + 2] = norm.getZ(oi);
      }
    }
    cx /= uniq.length;
    cy /= uniq.length;
    cz /= uniq.length;

    for (let i = 0; i < uniq.length; i++) {
      p[i * 3] -= cx;
      p[i * 3 + 1] -= cy;
      p[i * 3 + 2] -= cz;
    }

    const idxArr = new (uniq.length <= 65535 ? Uint16Array : Uint32Array)(
      tris.length * 3,
    );
    for (let t = 0; t < tris.length; t++)
      for (let v = 0; v < 3; v++)
        idxArr[t * 3 + v] = remap.get(
          idx ? idx.getX(tris[t] * 3 + v) : tris[t] * 3 + v,
        )!;

    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(p, 3));
    if (n) geo.setAttribute("normal", new THREE.BufferAttribute(n, 3));
    geo.setIndex(new THREE.BufferAttribute(idxArr, 1));
    geo.computeBoundingSphere();

    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(cx, cy, cz);
    parent.add(mesh);

    return { mesh, centroid: new THREE.Vector3(cx, cy, cz), triCount: tris.length };
  });
}

// ── Auto-classify components by position ──────────────────────────────────────

function classifyParts(infos: CompInfo[]): void {
  tracked = [];
  if (infos.length < 2) {
    console.warn("Not enough components to classify");
    return;
  }

  // Only use the largest 11 structural components (ignore screws/brackets)
  const sorted = [...infos].sort((a, b) => b.triCount - a.triCount);
  const top = sorted.slice(0, Math.min(11, sorted.length));

  // Largest = chassis — stays in place, not animated
  console.log(
    `  chassis (stays): centroid (${top[0].centroid.x.toFixed(2)}, ${top[0].centroid.y.toFixed(2)}, ${top[0].centroid.z.toFixed(2)}), ${top[0].triCount} tris`,
  );

  const rest = top.slice(1);
  const centerX =
    rest.reduce((s, c) => s + c.centroid.x, 0) / rest.length;

  const left = rest.filter((c) => c.centroid.x < centerX);
  const right = rest.filter((c) => c.centroid.x >= centerX);

  console.log(
    `  Split (top 10 only): ${left.length} left, ${right.length} right (at X=${centerX.toFixed(2)})`,
  );

  classifySide(left, "left", "l");
  classifySide(right, "right", "r");
}

function classifySide(
  side: CompInfo[],
  sideLabel: string,
  sideChar: string,
): void {
  // Sort by Y descending — highest centroid = rocker, then bogie, then wheels
  side.sort((a, b) => b.centroid.y - a.centroid.y);

  if (side.length >= 5) {
    assignRole(side[0], `rocker_${sideLabel}`);
    assignRole(side[1], `bogie_${sideLabel}`);

    const wheels = side.slice(2, 5);
    wheels.sort((a, b) => b.centroid.z - a.centroid.z);
    assignRole(wheels[0], `wheel_f${sideChar}`);
    assignRole(wheels[1], `wheel_m${sideChar}`);
    assignRole(wheels[2], `wheel_r${sideChar}`);
  } else if (side.length >= 3) {
    // Fewer parts — treat them all as wheels
    side.sort((a, b) => b.centroid.z - a.centroid.z);
    const roles = [`wheel_f${sideChar}`, `wheel_m${sideChar}`, `wheel_r${sideChar}`];
    side.forEach((c, i) => {
      if (i < roles.length) assignRole(c, roles[i]);
    });
  } else {
    side.forEach((c, i) => {
      const fallbackRole = `${sideLabel}_part_${i}`;
      const anim = ROLE_ANIMS[`wheel_m${sideChar}`];
      if (anim) {
        tracked.push({
          obj: c.mesh,
          origin: c.mesh.position.clone(),
          dir: anim.dir,
          start: anim.start + i * 0.04,
          end: anim.end + i * 0.04,
        });
        console.log(`  ${fallbackRole} (fallback): centroid (${c.centroid.x.toFixed(2)}, ${c.centroid.y.toFixed(2)}, ${c.centroid.z.toFixed(2)})`);
      }
    });
  }
}

function assignRole(info: CompInfo, role: string): void {
  const anim = ROLE_ANIMS[role];
  if (!anim) {
    console.warn(`Unknown role: ${role}`);
    return;
  }
  tracked.push({
    obj: info.mesh,
    origin: info.mesh.position.clone(),
    dir: anim.dir,
    start: anim.start,
    end: anim.end,
  });
  console.log(
    `  ${role}: centroid (${info.centroid.x.toFixed(2)}, ${info.centroid.y.toFixed(2)}, ${info.centroid.z.toFixed(2)}), ${info.triCount} tris`,
  );
}

// ── Public API (unchanged signature) ──────────────────────────────────────────

export function loadRover(onReady?: () => void): void {
  new GLTFLoader().load(
    roverUrl,
    (gltf) => {
      let srcMesh: THREE.Mesh | null = null;
      gltf.scene.traverse((c) => {
        if ((c as THREE.Mesh).isMesh && !srcMesh) srcMesh = c as THREE.Mesh;
      });
      if (!srcMesh) {
        console.error("No mesh found in GLB");
        return;
      }

      const geo = srcMesh.geometry;
      const pos = geo.getAttribute("position") as THREE.BufferAttribute;
      const norm = geo.getAttribute("normal") as THREE.BufferAttribute | null;
      const idx = geo.getIndex();

      // Bounding box
      const min = new THREE.Vector3(Infinity, Infinity, Infinity);
      const max = new THREE.Vector3(-Infinity, -Infinity, -Infinity);
      for (let i = 0; i < pos.count; i++) {
        const x = pos.getX(i),
          y = pos.getY(i),
          z = pos.getZ(i);
        if (x < min.x) min.x = x;
        if (y < min.y) min.y = y;
        if (z < min.z) min.z = z;
        if (x > max.x) max.x = x;
        if (y > max.y) max.y = y;
        if (z > max.z) max.z = z;
      }

      const cx = (min.x + max.x) / 2,
        cy = (min.y + max.y) / 2,
        cz = (min.z + max.z) / 2;
      const extent = Math.max(max.x - min.x, max.y - min.y, max.z - min.z);
      const scale = 3.8 / extent;

      // Normalise all positions into a ~3.8-unit space, grounded at Y=0
      const normPos = new Float32Array(pos.count * 3);
      let minNY = Infinity;
      for (let i = 0; i < pos.count; i++) {
        const nx = (pos.getX(i) - cx) * scale;
        const ny = (pos.getY(i) - cy) * scale;
        const nz = (pos.getZ(i) - cz) * scale;
        normPos[i * 3] = nx;
        normPos[i * 3 + 1] = ny;
        normPos[i * 3 + 2] = nz;
        if (ny < minNY) minNY = ny;
      }
      for (let i = 0; i < pos.count; i++) normPos[i * 3 + 1] -= minNY;

      const triCount = idx ? idx.count / 3 : pos.count / 3;
      console.log(`Mesh: ${pos.count} verts, ${triCount} tris`);

      // Connected-component analysis
      const t0 = performance.now();
      const components = findComponents(pos, idx);
      console.log(
        `Components: ${components.length} (${(performance.now() - t0).toFixed(0)} ms)  sizes: [${components.map((c) => c.length).join(", ")}]`,
      );

      // Material
      const mat = new THREE.MeshStandardMaterial({
        color: 0x8899aa,
        metalness: 0.55,
        roughness: 0.35,
      });

      // Container group (rotation + vertical lift)
      const group = new THREE.Group();
      group.rotation.y = Math.PI / 4;
      group.position.y = 0.5;
      scene.add(group);

      // Build individual meshes and classify
      const infos = buildComponentMeshes(
        normPos,
        norm,
        idx,
        components,
        mat,
        group,
      );
      classifyParts(infos);

      console.log(`Rover ready: ${tracked.length} animated parts`);
      onReady?.();
    },
    undefined,
    (err) => console.error("Rover load error:", err),
  );
}

export function updateRover(prog: number): void {
  // Parts slide left/right
  for (const { obj, origin, dir, start, end } of tracked) {
    let t = 0;
    if (prog > start) t = Math.min(1, (prog - start) / (end - start));
    t = easeOutCubic(t);
    obj.position.set(
      origin.x + dir[0] * t,
      origin.y + dir[1] * t,
      origin.z + dir[2] * t,
    );
  }

  // Camera: zoom in during 0→CAM_ZOOM_END, then hold position
  const camT = easeOutCubic(Math.min(1, prog / CAM_ZOOM_END));
  setCameraTransform(
    [
      lerp(CAM_FAR[0], CAM_CLOSE[0], camT),
      lerp(CAM_FAR[1], CAM_CLOSE[1], camT),
      lerp(CAM_FAR[2], CAM_CLOSE[2], camT),
    ],
    CAM_TARGET,
  );
}
