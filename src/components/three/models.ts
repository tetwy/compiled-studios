import {
  BoxGeometry,
  BufferAttribute,
  BufferGeometry,
  Color,
  CylinderGeometry,
  DoubleSide,
  Float32BufferAttribute,
  Group,
  IcosahedronGeometry,
  LatheGeometry,
  Mesh,
  MeshBasicMaterial,
  MeshLambertMaterial,
  Object3D,
  PlaneGeometry,
  RingGeometry,
  Shape,
  ShapeGeometry,
  TorusGeometry,
  Vector2,
} from 'three';
import type { Palette } from './palette';

/** All geometry below is procedural (no external model files, no licensing questions). */

const lambert = (color: number, extra: Partial<ConstructorParameters<typeof MeshLambertMaterial>[0]> = {}) =>
  new MeshLambertMaterial({ color, flatShading: true, ...extra });

export function createKit(p: Palette) {
  const mats = {
    wood: lambert(p.wood),
    woodDark: lambert(p.woodDark),
    woodLight: lambert(p.woodLight),
    hull: lambert(p.wood, { side: DoubleSide }),
    iron: lambert(p.iron),
    sail: lambert(0xffffff, { vertexColors: true, side: DoubleSide }),
    skin: lambert(p.skin),
    accentGlow: new MeshBasicMaterial({ color: p.accent }),
    accent2Glow: new MeshBasicMaterial({ color: p.accent2 }),
    lanternGlow: new MeshBasicMaterial({ color: p.lantern }),
    flag: new MeshBasicMaterial({ color: p.accent, side: DoubleSide }),
    shadow: new MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.35, depthWrite: false }),
  };

  // Barrel: bulged cylinder lying along local Z.
  const barrelR = 0.36;
  const barrelLen = 0.9;
  const barrelBody = new CylinderGeometry(barrelR * 0.9, barrelR * 0.9, barrelLen, 10, 2);
  const bp = barrelBody.attributes.position as BufferAttribute;
  for (let i = 0; i < bp.count; i++) {
    if (Math.abs(bp.getY(i)) < 1e-3) {
      bp.setX(i, bp.getX(i) * 1.13);
      bp.setZ(i, bp.getZ(i) * 1.13);
    }
  }
  barrelBody.rotateX(Math.PI / 2);
  const hoop = new CylinderGeometry(barrelR * 0.97, barrelR * 0.97, 0.06, 10, 1, true);
  hoop.rotateX(Math.PI / 2);
  const kegBand = new CylinderGeometry(barrelR * 1.035, barrelR * 1.035, 0.16, 10, 1, true);
  kegBand.rotateX(Math.PI / 2);

  const geo = {
    barrelBody,
    hoop,
    kegBand,
    ball: new IcosahedronGeometry(1, 1),
    shard: new BoxGeometry(1, 0.35, 0.6),
    puff: new IcosahedronGeometry(1, 0),
    disc: new RingGeometry(0, 1, 14),
    kegCap: new RingGeometry(barrelR * 0.3, barrelR * 0.62, 10),
  };
  geo.disc.rotateX(-Math.PI / 2);

  return { p, mats, geo, barrelR, barrelLen };
}
export type Kit = ReturnType<typeof createKit>;

export function makeBarrel(kit: Kit, keg = false): Group {
  const g = new Group();
  g.add(new Mesh(kit.geo.barrelBody, keg ? kit.mats.woodDark : kit.mats.wood));
  for (const z of [-0.3, 0.3]) {
    const h = new Mesh(kit.geo.hoop, kit.mats.iron);
    h.position.z = z;
    g.add(h);
  }
  if (keg) {
    const band = new Mesh(kit.geo.kegBand, kit.mats.accentGlow);
    g.add(band);
    // Glowing end caps so the keg reads from the front too.
    for (const z of [-1, 1]) {
      const cap = new Mesh(kit.geo.kegCap, kit.mats.accentGlow);
      cap.position.z = z * (kit.barrelLen / 2 + 0.005);
      if (z < 0) cap.rotation.y = Math.PI;
      g.add(cap);
    }
  }
  return g;
}

/** Cannon on a wheeled carriage. `pivot` is the trunnion; rotate it about Z for elevation. Barrel points +X. */
export function makeCannon(kit: Kit) {
  const root = new Group();
  const carriage = new Group();
  root.add(carriage);
  const cheek = new BoxGeometry(0.85, 0.32, 0.07);
  for (const z of [-0.2, 0.2]) {
    const m = new Mesh(cheek, kit.mats.woodDark);
    m.position.set(-0.05, 0.3, z);
    carriage.add(m);
  }
  const bed = new Mesh(new BoxGeometry(0.85, 0.08, 0.42), kit.mats.wood);
  bed.position.set(-0.05, 0.16, 0);
  carriage.add(bed);
  const wheel = new CylinderGeometry(0.16, 0.16, 0.07, 8);
  wheel.rotateX(Math.PI / 2);
  const wheels: Mesh[] = [];
  for (const x of [-0.32, 0.24]) {
    for (const z of [-0.27, 0.27]) {
      const w = new Mesh(wheel, kit.mats.woodLight);
      w.position.set(x, 0.16, z);
      carriage.add(w);
      wheels.push(w);
    }
  }
  const pivot = new Group();
  pivot.position.set(0, 0.5, 0);
  root.add(pivot);
  const profile = [
    [0.0, -0.36],
    [0.1, -0.36],
    [0.15, -0.3],
    [0.16, -0.12],
    [0.14, 0.2],
    [0.115, 0.58],
    [0.135, 0.62],
    [0.14, 0.7],
    [0.09, 0.71],
    [0.07, 0.6],
  ].map(([r, y]) => new Vector2(r, y));
  const barrelGeo = new LatheGeometry(profile, 10);
  barrelGeo.rotateZ(-Math.PI / 2);
  const barrel = new Mesh(barrelGeo, kit.mats.iron);
  pivot.add(barrel);
  const knob = new Mesh(new IcosahedronGeometry(0.06, 0), kit.mats.iron);
  knob.position.x = -0.42;
  pivot.add(knob);
  const band = new Mesh(new CylinderGeometry(0.147, 0.147, 0.04, 10, 1, true), kit.mats.accentGlow);
  band.rotation.z = Math.PI / 2;
  band.position.x = 0.18;
  pivot.add(band);
  return { root, pivot, wheels, muzzleLength: 0.71 };
}

/** Station table for the hull loft: x, half-beam, sheer (top), keel depth. */
const STATIONS: [number, number, number, number][] = [
  [-3.0, 0.95, 1.2, -0.45],
  [-2.3, 1.15, 1.0, -0.75],
  [-1.2, 1.27, 0.88, -0.88],
  [0.0, 1.3, 0.85, -0.9],
  [1.2, 1.2, 0.88, -0.86],
  [2.2, 0.95, 0.98, -0.72],
  [3.0, 0.52, 1.12, -0.42],
  [3.65, 0.0, 1.3, 0.25],
];

export const DECK_Y = 0.55;

/** Half-beam of the deck at a given x (for keeping crew and cargo on board). */
export function deckHalfWidth(x: number): number {
  for (let i = 0; i < STATIONS.length - 1; i++) {
    const [x0, w0] = STATIONS[i];
    const [x1, w1] = STATIONS[i + 1];
    if (x >= x0 && x <= x1) {
      const t = (x - x0) / (x1 - x0);
      return (w0 + (w1 - w0) * t) * 0.9;
    }
  }
  return 0;
}

function hullGeometry(): BufferGeometry {
  const prof = (w: number, top: number, bot: number): [number, number][] => [
    [-w, top],
    [-w * 0.99, 0.25],
    [-w * 0.78, bot * 0.62],
    [0, bot],
    [w * 0.78, bot * 0.62],
    [w * 0.99, 0.25],
    [w, top],
  ];
  const rings = STATIONS.map(([x, w, top, bot]) => prof(w, top, bot).map(([z, y]) => [x, y, z] as const));
  const pos: number[] = [];
  const tri = (a: readonly number[], b: readonly number[], c: readonly number[]) => pos.push(...a, ...b, ...c);
  for (let s = 0; s < rings.length - 1; s++) {
    const A = rings[s];
    const B = rings[s + 1];
    for (let k = 0; k < A.length - 1; k++) {
      tri(A[k], B[k], A[k + 1]);
      tri(A[k + 1], B[k], B[k + 1]);
    }
  }
  // Transom (flat stern) as a fan.
  const T = rings[0];
  const c = [T[0][0], 0.2, 0];
  for (let k = 0; k < T.length - 1; k++) tri(c, T[k], T[k + 1]);
  const g = new BufferGeometry();
  g.setAttribute('position', new Float32BufferAttribute(pos, 3));
  g.computeVertexNormals();
  return g;
}

export function deckGeometry(inset = 0.97): ShapeGeometry {
  const s = new Shape();
  const pts = STATIONS.map(([x, w]) => [x, w * inset] as const);
  s.moveTo(pts[0][0], -pts[0][1]);
  pts.forEach(([x, w]) => s.lineTo(x, -w));
  [...pts].reverse().forEach(([x, w]) => s.lineTo(x, w));
  const g = new ShapeGeometry(s);
  g.rotateX(-Math.PI / 2);
  return g;
}

function sailGeometry(p: Palette, w: number, h: number) {
  const g = new PlaneGeometry(w, h, 4, 5).toNonIndexed();
  const pos = g.attributes.position as BufferAttribute;
  const col = new Float32Array(pos.count * 3);
  const base = new Color(p.sail);
  const stripe = new Color(p.sailStripe);
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    // Billow towards +Z (becomes +X after rotation).
    const u = x / (w / 2);
    const v = y / (h / 2);
    pos.setZ(i, (1 - u * u) * (0.75 - 0.25 * v) * 0.55);
  }
  // One flat colour per triangle: a crisp neon band across the middle row.
  for (let t = 0; t < pos.count; t += 3) {
    const cy = (pos.getY(t) + pos.getY(t + 1) + pos.getY(t + 2)) / 3;
    const k = (cy + h / 2) / h;
    const c = k > 0.4 && k < 0.6 ? stripe : base;
    for (let j = 0; j < 3; j++) col.set([c.r, c.g, c.b], (t + j) * 3);
  }
  g.setAttribute('color', new BufferAttribute(col, 3));
  g.rotateY(Math.PI / 2);
  return g;
}

export function makeShip(kit: Kit) {
  const { mats } = kit;
  const root = new Group();
  const hull = new Mesh(hullGeometry(), mats.hull);
  root.add(hull);
  const deck = new Mesh(deckGeometry(), mats.woodLight);
  deck.position.y = DECK_Y;
  root.add(deck);
  // Plank seams.
  const seam = new BoxGeometry(5.6, 0.01, 0.02);
  for (const z of [-0.75, -0.25, 0.25, 0.75]) {
    const m = new Mesh(seam, mats.woodDark);
    m.position.set(0.1, DECK_Y + 0.006, z);
    root.add(m);
  }
  // Neon trim along both sides (site accent).
  const trimGeo = new BoxGeometry(1, 0.035, 0.035);
  for (let i = 0; i < STATIONS.length - 2; i++) {
    const [x0, w0] = STATIONS[i];
    const [x1, w1] = STATIONS[i + 1];
    for (const side of [-1, 1]) {
      const a = new Vector2(x0, w0 * side * 1.0);
      const b = new Vector2(x1, w1 * side * 1.0);
      const m = new Mesh(trimGeo, mats.accentGlow);
      const len = a.distanceTo(b);
      m.scale.x = len + 0.02;
      m.position.set((a.x + b.x) / 2, 0.42, (a.y + b.y) / 2);
      m.rotation.y = -Math.atan2(b.y - a.y, b.x - a.x);
      root.add(m);
    }
  }
  // Mast, yard, sail, flag.
  const mast = new Mesh(new CylinderGeometry(0.07, 0.1, 3.8, 6), mats.woodDark);
  mast.position.set(0.35, DECK_Y + 1.9, 0);
  root.add(mast);
  const yard = new Mesh(new CylinderGeometry(0.045, 0.045, 2.8, 5), mats.woodDark);
  yard.rotation.x = Math.PI / 2;
  yard.position.set(0.42, DECK_Y + 3.3, 0);
  root.add(yard);
  const sail = new Mesh(sailGeometry(kit.p, 2.6, 2.1), mats.sail);
  sail.position.set(0.45, DECK_Y + 2.2, 0);
  root.add(sail);
  const flagGeo = new PlaneGeometry(0.6, 0.32, 5, 1);
  flagGeo.translate(0.3, 0, 0);
  const flag = new Mesh(flagGeo, mats.flag);
  flag.position.set(0.35, DECK_Y + 3.65, 0);
  flag.rotation.y = Math.PI;
  root.add(flag);
  // Bowsprit.
  const sprit = new Mesh(new CylinderGeometry(0.04, 0.06, 1.1, 5), mats.woodDark);
  sprit.rotation.z = -Math.PI / 2 + 0.4;
  sprit.position.set(3.9, 1.45, 0);
  root.add(sprit);
  // Helm wheel at the stern.
  const helm = new Group();
  helm.position.set(-2.35, DECK_Y + 0.62, 0);
  const post = new Mesh(new BoxGeometry(0.1, 0.62, 0.1), mats.woodDark);
  post.position.set(0.05, -0.31, 0);
  helm.add(post);
  const wheel = new Group();
  wheel.add(new Mesh(new TorusGeometry(0.27, 0.03, 4, 10), mats.wood));
  const spoke = new BoxGeometry(0.03, 0.7, 0.03);
  for (let i = 0; i < 4; i++) {
    const s = new Mesh(spoke, mats.wood);
    s.rotation.z = (i * Math.PI) / 4;
    wheel.add(s);
  }
  wheel.rotation.y = Math.PI / 2;
  helm.add(wheel);
  root.add(helm);
  // Lantern with glow.
  const lantern = new Group();
  lantern.position.set(-2.9, DECK_Y + 1.15, -0.62);
  const lpost = new Mesh(new BoxGeometry(0.06, 0.6, 0.06), mats.woodDark);
  lpost.position.y = -0.3;
  lantern.add(lpost);
  const lglow = new Mesh(new BoxGeometry(0.14, 0.18, 0.14), mats.lanternGlow);
  lglow.position.y = 0.08;
  lantern.add(lglow);
  root.add(lantern);
  return { root, flag, wheel, sail, lantern };
}

/** Bilge pump (box + lever) for the co-op scene. */
export function makePump(kit: Kit) {
  const g = new Group();
  const box = new Mesh(new BoxGeometry(0.3, 0.42, 0.3), kit.mats.wood);
  box.position.y = 0.21;
  g.add(box);
  const lever = new Group();
  lever.position.set(0, 0.45, 0);
  const arm = new Mesh(new BoxGeometry(0.6, 0.05, 0.05), kit.mats.iron);
  arm.position.x = 0.18;
  lever.add(arm);
  g.add(lever);
  return { root: g, lever };
}

export interface Crewmate {
  root: Group;
  body: Group;
  armL: Object3D;
  armR: Object3D;
  hammer: Object3D;
  ring: Mesh;
}

/** Chunky low-poly crewmate; colour = player colour (bandana, shirt, ground ring). */
export function makeCrewmate(kit: Kit, color: number): Crewmate {
  const root = new Group();
  const body = new Group();
  root.add(body);
  const shirt = lambert(color);
  const dark = lambert(new Color(color).multiplyScalar(0.45).getHex());
  const legs = new Mesh(new BoxGeometry(0.24, 0.22, 0.15), kit.mats.woodDark);
  legs.position.y = 0.11;
  body.add(legs);
  const torso = new Mesh(new CylinderGeometry(0.15, 0.2, 0.38, 6), shirt);
  torso.position.y = 0.41;
  body.add(torso);
  const belt = new Mesh(new CylinderGeometry(0.205, 0.205, 0.05, 6), dark);
  belt.position.y = 0.25;
  body.add(belt);
  const head = new Mesh(new IcosahedronGeometry(0.16, 0), kit.mats.skin);
  head.position.y = 0.76;
  body.add(head);
  const bandana = new Mesh(new CylinderGeometry(0.15, 0.165, 0.08, 6), shirt);
  bandana.position.y = 0.84;
  body.add(bandana);
  const knot = new Mesh(new BoxGeometry(0.06, 0.06, 0.14), shirt);
  knot.position.set(0, 0.83, -0.17);
  knot.rotation.x = 0.5;
  body.add(knot);
  const eye = new BoxGeometry(0.035, 0.05, 0.02);
  for (const x of [-0.055, 0.055]) {
    const e = new Mesh(eye, kit.mats.iron);
    e.position.set(x, 0.78, 0.145);
    body.add(e);
  }
  const armGeo = new BoxGeometry(0.08, 0.3, 0.08);
  armGeo.translate(0, -0.13, 0);
  const mkArm = (x: number) => {
    const pivot = new Group();
    pivot.position.set(x, 0.56, 0);
    pivot.add(new Mesh(armGeo, shirt));
    body.add(pivot);
    return pivot;
  };
  const armL = mkArm(-0.22);
  const armR = mkArm(0.22);
  const hammer = new Group();
  const handle = new Mesh(new BoxGeometry(0.035, 0.035, 0.26), kit.mats.wood);
  handle.position.z = 0.1;
  hammer.add(handle);
  const headM = new Mesh(new BoxGeometry(0.12, 0.07, 0.07), kit.mats.iron);
  headM.position.z = 0.23;
  hammer.add(headM);
  hammer.position.y = -0.27;
  hammer.visible = false;
  armR.add(hammer);
  const ring = new Mesh(
    new RingGeometry(0.24, 0.31, 18),
    new MeshBasicMaterial({ color, transparent: true, opacity: 0.85, depthWrite: false }),
  );
  ring.rotation.x = -Math.PI / 2;
  ring.position.y = 0.015;
  root.add(ring);
  return { root, body, armL, armR, hammer, ring };
}
