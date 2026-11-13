import { BufferAttribute, BufferGeometry, Color, Mesh, MeshLambertMaterial } from 'three';
import type { Palette } from './palette';

/** Analytic wave field shared by the ocean mesh and the physics (buoyancy, ship bob). */
export function waveHeight(x: number, z: number, t: number, amp = 1): number {
  return (
    amp *
    (0.17 * Math.sin(x * 0.55 + t * 1.05) +
      0.11 * Math.sin(z * 0.72 - t * 0.85 + x * 0.21) +
      0.06 * Math.sin((x + z) * 1.35 + t * 1.65))
  );
}

export interface Ocean {
  mesh: Mesh;
  update(t: number, scrollX?: number): void;
}

/**
 * Faceted low-poly ocean: a grid displaced on the CPU each frame, written to a
 * non-indexed geometry so every triangle gets one flat colour (deep -> crest).
 */
export function createOcean(
  p: Palette,
  opts: { width: number; depth: number; segX: number; segZ: number; cx?: number; cz?: number; amp?: number },
): Ocean {
  const { width, depth, segX, segZ } = opts;
  const cx = opts.cx ?? 0;
  const cz = opts.cz ?? 0;
  const amp = opts.amp ?? 1;
  const gx = segX + 1;
  const gz = segZ + 1;
  const baseX = new Float32Array(gx * gz);
  const baseZ = new Float32Array(gx * gz);
  for (let j = 0; j < gz; j++) {
    for (let i = 0; i < gx; i++) {
      const k = j * gx + i;
      // Tiny deterministic jitter breaks the grid look.
      const jx = Math.sin(i * 12.9898 + j * 78.233) * 0.18;
      const jz = Math.sin(i * 39.346 + j * 11.135) * 0.18;
      const edge = i === 0 || j === 0 || i === segX || j === segZ ? 0 : 1;
      baseX[k] = cx - width / 2 + (i / segX) * width + jx * edge * (width / segX);
      baseZ[k] = cz - depth / 2 + (j / segZ) * depth + jz * edge * (depth / segZ);
    }
  }
  const tris = segX * segZ * 2;
  const index = new Uint32Array(tris * 3);
  let n = 0;
  for (let j = 0; j < segZ; j++) {
    for (let i = 0; i < segX; i++) {
      const a = j * gx + i;
      const b = a + 1;
      const c = a + gx;
      const d = c + 1;
      const flip = (i + j) % 2 === 0;
      if (flip) {
        index.set([a, c, b, b, c, d], n);
      } else {
        index.set([a, c, d, a, d, b], n);
      }
      n += 6;
    }
  }
  const positions = new Float32Array(tris * 9);
  const colors = new Float32Array(tris * 9);
  const geometry = new BufferGeometry();
  const posAttr = new BufferAttribute(positions, 3);
  const colAttr = new BufferAttribute(colors, 3);
  geometry.setAttribute('position', posAttr);
  geometry.setAttribute('color', colAttr);

  const heights = new Float32Array(gx * gz);
  const deep = new Color(p.waterDeep);
  const mid = new Color(p.waterMid);
  const crest = new Color(p.waterCrest);
  const tmp = new Color();

  const material = new MeshLambertMaterial({
    vertexColors: true,
    flatShading: true,
    emissive: new Color(p.waterDeep).multiplyScalar(0.35),
  });
  const mesh = new Mesh(geometry, material);
  mesh.frustumCulled = false;

  /** `scrollX` slides the wave field under a static mesh, so a ship can appear to sail. */
  const update = (t: number, scrollX = 0) => {
    for (let k = 0; k < heights.length; k++) heights[k] = waveHeight(baseX[k] + scrollX, baseZ[k], t, amp);
    for (let f = 0; f < tris; f++) {
      let avg = 0;
      for (let v = 0; v < 3; v++) {
        const k = index[f * 3 + v];
        const o = (f * 3 + v) * 3;
        positions[o] = baseX[k];
        positions[o + 1] = heights[k];
        positions[o + 2] = baseZ[k];
        avg += heights[k];
      }
      avg /= 3;
      const s = Math.min(Math.max((avg / amp + 0.3) / 0.62, 0), 1);
      if (s < 0.55) tmp.copy(deep).lerp(mid, s / 0.55);
      else tmp.copy(mid).lerp(crest, (s - 0.55) / 0.45);
      for (let v = 0; v < 3; v++) {
        const o = (f * 3 + v) * 3;
        colors[o] = tmp.r;
        colors[o + 1] = tmp.g;
        colors[o + 2] = tmp.b;
      }
    }
    posAttr.needsUpdate = true;
    colAttr.needsUpdate = true;
  };
  update(0);
  geometry.computeBoundingSphere();
  return { mesh, update };
}
