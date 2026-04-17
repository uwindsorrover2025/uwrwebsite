// ─── Scroll-driven rover disassembly animation ────────────────────────────────
// Loads a single-mesh GLB, auto-splits it into connected components,
// classifies parts by spatial position, and animates the explosion on scroll.
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { scene, setCameraTransform } from "./scene";
import roverUrl from "../assets/GazeboV2.glb?url";

// ── Slide animation config ────────────────────────────────────────────────────
// Directions are in group-local space. The group is rotated 45° around Y, so
// [-d, 0, -d] → screen-left and [d, 0, d] → screen-right.

const S = 3.5; // slide magnitude

// 3 disassembly phases, ordered outside-in from chassis
const PHASE_WHEELS = { start: 0.16, end: 0.40 };
const PHASE_DRIVE = { start: 0.38, end: 0.62 };
const PHASE_BODY = { start: 0.60, end: 0.84 };

// ── Camera ────────────────────────────────────────────────────────────────────
// Zooms in during the first 15% of scroll, then stays fixed.

const CAM_FAR: [number, number, number] = [3, 2.5, 8];
const CAM_CLOSE: [number, number, number] = [0, 1.5, 5];
const CAM_TARGET: [number, number, number] = [0, 1.5, 0];
const CAM_ZOOM_END = 0.15;

// ── Materials (no UVs in the STL-sourced mesh, so colour + PBR only) ──────────

const MAT_CHASSIS = new THREE.MeshStandardMaterial({
  color: 0x3b7ff5, // brand blue
  metalness: 0.55,
  roughness: 0.35,
});
const MAT_WHEEL = new THREE.MeshStandardMaterial({
  color: 0x0a0a0a, // deep black
  metalness: 0.1,
  roughness: 0.9,
});
const MAT_STRUCTURE = new THREE.MeshStandardMaterial({
  color: 0xc8ccd2, // brushed silver (drivetrain)
  metalness: 0.85,
  roughness: 0.28,
});
const MAT_DEFAULT = new THREE.MeshStandardMaterial({
  color: 0xd9dde3, // polished silver (screws / body hardware)
  metalness: 0.9,
  roughness: 0.22,
});

// ── Tracked parts state ───────────────────────────────────────────────────────

interface Tracked {
  obj: THREE.Object3D;
  origin: THREE.Vector3;
  centroid: THREE.Vector3;
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
    geo.setIndex(new THREE.BufferAttribute(idxArr, 1));
    geo.computeVertexNormals();
    geo.computeBoundingSphere();

    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(cx, cy, cz);
    parent.add(mesh);

    return { mesh, centroid: new THREE.Vector3(cx, cy, cz), triCount: tris.length };
  });
}

// ── Distance-based 3-phase classification ─────────────────────────────────────
// Groups every component by distance from chassis center:
//   Phase 1 (furthest)  → wheels + their hardware
//   Phase 2 (middle)    → drivetrain / suspension
//   Phase 3 (closest)   → chassis-mounted parts
// Each part slides screen-left or screen-right based on which side it's on.

function classifyParts(infos: CompInfo[]): void {
  tracked = [];
  if (infos.length < 2) return;

  const sorted = [...infos].sort((a, b) => b.triCount - a.triCount);

  // Largest component = chassis — stays in place
  const chassis = sorted[0];
  chassis.mesh.material = MAT_CHASSIS;
  tracked.push({
    obj: chassis.mesh,
    origin: chassis.mesh.position.clone(),
    centroid: chassis.centroid.clone(),
    dir: [0, 0, 0],
    start: 0,
    end: 1,
  });
  const chC = chassis.centroid;
  console.log(
    `  chassis (stays): (${chC.x.toFixed(2)}, ${chC.y.toFixed(2)}, ${chC.z.toFixed(2)}), ${chassis.triCount} tris`,
  );

  // Sort remaining by distance from chassis, furthest first
  const rest = sorted.slice(1).map((c) => ({
    info: c,
    dist: c.centroid.distanceTo(chC),
  }));
  rest.sort((a, b) => b.dist - a.dist);

  const n = rest.length;
  const cut1 = Math.ceil(n / 3);
  const cut2 = Math.ceil((2 * n) / 3);

  const grpWheels = rest.slice(0, cut1);
  const grpDrive = rest.slice(cut1, cut2);
  const grpBody = rest.slice(cut2);

  function addPhase(
    group: typeof rest,
    phase: { start: number; end: number },
    mat: THREE.Material,
    label: string,
  ): void {
    const stagger = (phase.end - phase.start) * 0.25;
    for (let i = 0; i < group.length; i++) {
      const { info } = group[i];
      const goLeft = info.centroid.x < chC.x;
      const dir: [number, number, number] = goLeft
        ? [-S, 0, -S]
        : [S, 0, S];
      info.mesh.material = mat;
      const offset = (i / Math.max(1, group.length - 1)) * stagger;
      tracked.push({
        obj: info.mesh,
        origin: info.mesh.position.clone(),
        centroid: info.centroid.clone(),
        dir,
        start: phase.start + offset,
        end: phase.end + offset,
      });
    }
    console.log(`  ${label}: ${group.length} parts`);
  }

  addPhase(grpWheels, PHASE_WHEELS, MAT_WHEEL, "Phase 1 — wheels");
  addPhase(grpDrive, PHASE_DRIVE, MAT_STRUCTURE, "Phase 2 — drivetrain");
  addPhase(grpBody, PHASE_BODY, MAT_DEFAULT, "Phase 3 — body parts");
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

      // Container group (rotation + vertical lift)
      const group = new THREE.Group();
      group.rotation.y = Math.PI / 4;
      group.position.y = 0.5;
      scene.add(group);

      // Build individual meshes and classify
      const infos = buildComponentMeshes(
        normPos,
        idx,
        components,
        MAT_DEFAULT,
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
