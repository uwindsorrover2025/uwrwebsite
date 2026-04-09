// ─── Waypoint data + path interpolation ──────────────────────────────────────
// Map = 24.22 × 17.60 world units (2422×1760 px, 1 unit = 100 px)
// To edit visually, open waypoint-editor.html, click roads on the map,
// then paste the generated code below.

export interface Waypoint {
  progress: number;
  x: number; // world X (east +)
  z: number; // world Z (south +)
}

export interface RoverState {
  x: number;
  z: number;
  headingRad: number; // yaw in XZ plane: atan2(dx, dz) from +Z axis
}

export const WAYPOINTS: Waypoint[] = [
  { progress: 0.00, x:  6.07, z: -6.80 },
  { progress: 0.13, x:  1.00, z: -4.53 },
  { progress: 0.25, x:  4.67, z: -1.68 },
  { progress: 0.38, x:  2.92, z: -0.53 },
  { progress: 0.50, x:  5.30, z:  0.97 },
  { progress: 0.63, x:  2.45, z:  2.47 },
  { progress: 0.75, x: -1.48, z:  0.97 },
  { progress: 0.88, x: -4.13, z:  2.95 },
  { progress: 1.00, x:  1.27, z:  6.57 },
];

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export function getWorldPosAt(prog: number): RoverState {
  prog = Math.max(0, Math.min(1, prog));
  let lo = WAYPOINTS[0];
  let hi = WAYPOINTS[WAYPOINTS.length - 1];
  for (let i = 0; i < WAYPOINTS.length - 1; i++) {
    if (prog <= WAYPOINTS[i + 1].progress) {
      lo = WAYPOINTS[i];
      hi = WAYPOINTS[i + 1];
      break;
    }
  }
  const t =
    hi.progress === lo.progress
      ? 0
      : (prog - lo.progress) / (hi.progress - lo.progress);
  return {
    x: lerp(lo.x, hi.x, t),
    z: lerp(lo.z, hi.z, t),
    headingRad: Math.atan2(hi.x - lo.x, hi.z - lo.z),
  };
}
