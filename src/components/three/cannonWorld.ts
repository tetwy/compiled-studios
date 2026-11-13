import {
  BoxGeometry,
  CylinderGeometry,
  Group,
  IcosahedronGeometry,
  InstancedMesh,
  Matrix4,
  Mesh,
  MeshBasicMaterial,
  MeshLambertMaterial,
  PointLight,
  Vector3,
} from 'three';
import { addBackdrop } from './backdrop';
import { Body, CannonSim, GRAVITY, makeBody } from './cannonSim';
import { createKit, makeBarrel, makeCannon, makeShip, DECK_Y } from './models';
import { createOcean, waveHeight } from './ocean';
import { PALETTES, type PaletteName } from './palette';
import { ParticlePool } from './particles';
import { Stage } from './stage';

export interface CannonHud {
  shots: number;
  overboard: number;
  total: number;
  angle: number;
  power: number;
  toast: string | null;
}

export interface CannonWorldOptions {
  palette: PaletteName;
  reducedMotion: boolean;
  lowDetail: boolean;
  ariaLabel: string;
  onHud: (hud: CannonHud) => void;
}

export interface CannonWorld {
  fire(): void;
  reset(): void;
  nudgeAim(dAngleDeg: number, dPower: number): void;
  dispose(): void;
}

const DEG = Math.PI / 180;
const ANGLE_MIN = 4 * DEG;
const ANGLE_MAX = 62 * DEG;
const POWER_MIN = 7;
const POWER_MAX = 17;
const DOTS = 30;
const DOCK_MIN = new Vector3(2.55, -3, -1.15);
const DOCK_MAX = new Vector3(6.05, 0.5, 1.15);
const STACK_X = 4.3;

export function createCannonWorld(host: HTMLElement, opts: CannonWorldOptions): CannonWorld {
  const p = PALETTES[opts.palette];
  const stage = new Stage(host, {
    reducedMotion: opts.reducedMotion,
    lowDetail: opts.lowDetail,
    fov: 38,
    fogColor: p.fog,
    fogNear: 16,
    fogFar: 40,
    ariaLabel: opts.ariaLabel,
  });
  const { scene, camera } = stage;
  const camBase = new Vector3(0.35, 2.75, 13.4);
  const camLook = new Vector3(0.35, 1.3, -0.6);
  camera.position.copy(camBase);
  camera.lookAt(camLook);

  const kit = createKit(p);
  addBackdrop(scene, p, new Vector3(-0.6, 6.4, -24), opts.lowDetail);

  const ocean = createOcean(p, {
    width: 54,
    depth: 40,
    segX: opts.lowDetail ? 30 : 46,
    segZ: opts.lowDetail ? 22 : 34,
    cx: 1,
    cz: -10,
    amp: 0.8,
  });
  scene.add(ocean.mesh);

  // --- Ship with the cannon on its starboard rail ---------------------------------
  const ship = makeShip(kit);
  const shipAnchor = new Group();
  shipAnchor.position.set(-5.1, 0, -0.6);
  shipAnchor.add(ship.root);
  ship.root.rotation.y = Math.PI / 2 + 0.28;
  scene.add(shipAnchor);
  const lanternLight = new PointLight(p.lantern, 6, 7, 1.6);
  lanternLight.position.set(0, 0.2, 0);
  ship.lantern.add(lanternLight);

  const cannon = makeCannon(kit);
  // Cannon sits on deck, facing world +X regardless of the hull yaw.
  cannon.root.position.set(-0.15, DECK_Y, 0.78);
  cannon.root.rotation.y = -ship.root.rotation.y;
  ship.root.add(cannon.root);
  const cannonHome = cannon.root.position.clone();
  // Line the cannon up with the barrel stack (z = 0) so aimed shots can connect.
  shipAnchor.updateMatrixWorld(true);
  shipAnchor.position.z -= cannon.root.getWorldPosition(new Vector3()).z;

  // --- Target dock with a barrel pyramid --------------------------------------------
  const dock = new Group();
  const deckBoard = new Mesh(new BoxGeometry(DOCK_MAX.x - DOCK_MIN.x, 0.18, DOCK_MAX.z - DOCK_MIN.z), kit.mats.woodLight);
  deckBoard.position.set((DOCK_MIN.x + DOCK_MAX.x) / 2, DOCK_MAX.y - 0.09, 0);
  dock.add(deckBoard);
  const beam = new BoxGeometry(DOCK_MAX.x - DOCK_MIN.x + 0.1, 0.12, 0.12);
  for (const z of [DOCK_MIN.z, DOCK_MAX.z]) {
    const b = new Mesh(beam, kit.mats.woodDark);
    b.position.set(deckBoard.position.x, DOCK_MAX.y - 0.2, z);
    dock.add(b);
  }
  const post = new CylinderGeometry(0.09, 0.11, 2.2, 6);
  for (const x of [DOCK_MIN.x + 0.15, deckBoard.position.x, DOCK_MAX.x - 0.15]) {
    for (const z of [DOCK_MIN.z + 0.05, DOCK_MAX.z - 0.05]) {
      const m = new Mesh(post, kit.mats.woodDark);
      m.position.set(x, DOCK_MAX.y - 1.0, z);
      dock.add(m);
    }
  }
  const lampPost = new Mesh(new BoxGeometry(0.07, 1.3, 0.07), kit.mats.woodDark);
  lampPost.position.set(DOCK_MAX.x - 0.2, DOCK_MAX.y + 0.65, DOCK_MIN.z + 0.15);
  dock.add(lampPost);
  const lamp = new Mesh(new BoxGeometry(0.16, 0.2, 0.16), kit.mats.accent2Glow);
  lamp.position.set(DOCK_MAX.x - 0.2, DOCK_MAX.y + 1.35, DOCK_MIN.z + 0.15);
  dock.add(lamp);
  const dockLight = new PointLight(p.accent2, 5, 6, 1.6);
  dockLight.position.copy(lamp.position).add(new Vector3(-0.3, 0, 0.4));
  dock.add(dockLight);
  scene.add(dock);

  const sim = new CannonSim();
  sim.waveAmp = 0.8;
  sim.boxes.push({ min: DOCK_MIN, max: DOCK_MAX });

  interface BarrelEntity {
    body: Body;
    mesh: Group;
    home: Vector3;
    keg: boolean;
    pop: number;
  }
  const r = kit.barrelR;
  const rows = [4, 3, 2, 1];
  const barrels: BarrelEntity[] = [];
  rows.forEach((n, row) => {
    for (let i = 0; i < n; i++) {
      const keg = row === 1 && i === 1;
      const home = new Vector3(
        STACK_X + (i - (n - 1) / 2) * 2 * r,
        DOCK_MAX.y + r + row * Math.sqrt(3) * r,
        0,
      );
      const body = makeBody(keg ? 'keg' : 'barrel', home, r);
      const mesh = makeBarrel(kit, keg);
      mesh.rotation.order = 'YXZ';
      scene.add(mesh);
      sim.bodies.push(body);
      barrels.push({ body, mesh, home, keg, pop: 1 });
    }
  });

  const ballMesh = new Mesh(kit.geo.ball, new MeshLambertMaterial({ color: 0x2a2d38, flatShading: true, emissive: p.accent, emissiveIntensity: 0.35 }));
  ballMesh.scale.setScalar(0.22);
  ballMesh.visible = false;
  scene.add(ballMesh);
  const ballTrail = new ParticlePool(kit.geo.puff, new MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.55 }), 40);
  scene.add(ballTrail.mesh);
  let ball: Body | null = null;

  // --- Effects ----------------------------------------------------------------------
  const lit = new ParticlePool(kit.geo.puff, new MeshLambertMaterial({ flatShading: true }), opts.lowDetail ? 90 : 160);
  const glow = new ParticlePool(kit.geo.puff, new MeshBasicMaterial(), opts.lowDetail ? 110 : 200);
  scene.add(lit.mesh, glow.mesh);
  const flash = new PointLight(p.lantern, 0, 9, 1.4);
  scene.add(flash);
  let flashLevel = 0;
  let shake = 0;

  // --- Trajectory preview -----------------------------------------------------------
  const dotMat = new MeshBasicMaterial({ color: p.accent2, transparent: true, opacity: 0.45, depthWrite: false });
  const dots = new InstancedMesh(new IcosahedronGeometry(0.055, 0), dotMat, DOTS);
  dots.frustumCulled = false;
  scene.add(dots);
  const dotM = new Matrix4();

  // --- State ------------------------------------------------------------------------
  let angle = 24 * DEG;
  let power = 12;
  let shots = 0;
  let overboard = 0;
  let toast: string | null = null;
  let toastTimer = 0;
  let recoil = 0;
  let recoilVel = 0;
  let shipKick = 0;
  let shipKickVel = 0;
  let lastShot = -100;
  let aiming = false;
  let waterT = 0;
  let lastHud = '';

  const muzzle = new Vector3();
  const muzzleDir = new Vector3();
  const tmp = new Vector3();

  const emitHud = () => {
    const hud: CannonHud = {
      shots,
      overboard,
      total: barrels.length,
      angle: Math.round(angle / DEG),
      power: Math.round(((power - POWER_MIN) / (POWER_MAX - POWER_MIN)) * 100),
      toast,
    };
    const key = JSON.stringify(hud);
    if (key !== lastHud) {
      lastHud = key;
      opts.onHud(hud);
    }
  };

  const computeMuzzle = () => {
    cannon.pivot.rotation.z = angle;
    ship.root.updateMatrixWorld(true);
    cannon.pivot.localToWorld(muzzle.set(cannon.muzzleLength, 0, 0));
    cannon.pivot.localToWorld(muzzleDir.set(cannon.muzzleLength + 1, 0, 0)).sub(muzzle).normalize();
  };

  /** Pick the launch speed that lands on the stack for the current angle (first-shot success). */
  const autoPower = () => {
    computeMuzzle();
    // Aim at the powder keg (row 2, middle) so the very first shot pays off.
    const target = new Vector3(STACK_X - 0.12, DOCK_MAX.y + r + Math.sqrt(3) * r, 0);
    const dx = target.x - muzzle.x;
    const dy = target.y - muzzle.y;
    const c = Math.cos(angle);
    const denom = 2 * c * c * (dx * Math.tan(angle) - dy);
    if (denom > 0) power = Math.min(Math.max(Math.sqrt((GRAVITY * dx * dx) / denom), POWER_MIN), POWER_MAX);
  };

  const updateDots = () => {
    computeMuzzle();
    const v = tmp.copy(muzzleDir).multiplyScalar(power);
    let shown = 0;
    for (let i = 0; i < DOTS; i++) {
      const t = (i + 1) * 0.055;
      const x = muzzle.x + v.x * t;
      const y = muzzle.y + v.y * t - 0.5 * GRAVITY * t * t;
      const z = muzzle.z + v.z * t;
      const inDock = x > DOCK_MIN.x && x < DOCK_MAX.x && y < DOCK_MAX.y + 0.2;
      if (y < waveHeight(x, z, waterT, 0.8) || inDock) break;
      const s = 1 - i / DOTS * 0.55;
      dotM.makeScale(s, s, s).setPosition(x, y, z);
      dots.setMatrixAt(i, dotM);
      shown++;
    }
    dots.count = shown;
    dots.instanceMatrix.needsUpdate = true;
    dotMat.opacity = aiming ? 0.95 : ball ? 0.12 : 0.45;
  };

  const fire = () => {
    if (ball && ball.alive && performance.now() - lastShot < 350) return;
    computeMuzzle();
    shots++;
    lastShot = performance.now();
    ball = makeBody('ball', muzzle, 0.2);
    ball.vel.copy(muzzleDir).multiplyScalar(power);
    sim.bodies = sim.bodies.filter((b) => b.kind !== 'ball');
    sim.bodies.push(ball);
    ballMesh.visible = true;
    recoilVel = -5.5;
    shipKickVel = 0.9;
    flashLevel = 1;
    flash.position.copy(muzzle);
    shake = opts.reducedMotion ? 0 : 0.18;
    glow.emit({ count: 18, pos: muzzle, dir: muzzleDir, spread: 0.35, speed: [3, 7], life: [0.12, 0.3], size: [0.06, 0.14], colors: [p.lantern, 0xffffff, p.accent] });
    lit.emit({ count: 9, pos: muzzle, dir: muzzleDir, spread: 0.45, speed: [1, 3], life: [0.7, 1.2], size: [0.07, 0.13], grow: 2.2, drag: 2.6, gravity: -0.5, colors: [0xd9d4e6, 0xbab4cc, 0xeeeaf6] });
    emitHud();
    stage.wake();
  };

  const reset = () => {
    sim.bodies = sim.bodies.filter((b) => b.kind !== 'ball');
    ball = null;
    ballMesh.visible = false;
    barrels.forEach((e, i) => {
      const b = e.body;
      b.pos.copy(e.home);
      b.vel.set(0, 0, 0);
      b.alive = true;
      b.sleeping = true;
      b.sleepTimer = 0;
      b.inWater = false;
      b.overboard = false;
      b.yaw = b.yawRate = b.roll = b.rollRate = 0;
      e.pop = opts.reducedMotion ? 1 : -i * 0.06;
    });
    overboard = 0;
    toast = null;
    lit.clear();
    glow.clear();
    emitHud();
    stage.wake();
  };

  const nudgeAim = (dA: number, dP: number) => {
    angle = Math.min(Math.max(angle + dA * DEG, ANGLE_MIN), ANGLE_MAX);
    power = Math.min(Math.max(power + dP, POWER_MIN), POWER_MAX);
    emitHud();
    stage.wake();
  };

  // --- Input: drag back like a slingshot, release to fire; a tap fires as aimed ------
  let down: { x: number; y: number; id: number; angle: number; power: number } | null = null;
  const onDown = (e: PointerEvent) => {
    if (e.button !== 0 || (e.target as HTMLElement).closest('button')) return;
    down = { x: e.clientX, y: e.clientY, id: e.pointerId, angle, power };
    host.setPointerCapture?.(e.pointerId);
  };
  const onMove = (e: PointerEvent) => {
    if (!down || e.pointerId !== down.id) return;
    const dx = down.x - e.clientX;
    const dy = e.clientY - down.y;
    const len = Math.hypot(dx, dy);
    if (!aiming && len < 10) return;
    aiming = true;
    // Relative slingshot: pull down = steeper, pull back (left) = harder. Starts from the current aim.
    const w = Math.max(host.clientWidth, 1);
    const h = Math.max(host.clientHeight, 1);
    angle = Math.min(Math.max(down.angle + (dy / h) * 60 * DEG, ANGLE_MIN), ANGLE_MAX);
    power = Math.min(Math.max(down.power + (dx / w) * 14, POWER_MIN), POWER_MAX);
    emitHud();
    stage.wake();
  };
  const onUp = (e: PointerEvent) => {
    if (!down || e.pointerId !== down.id) return;
    down = null;
    aiming = false;
    fire();
  };
  const onCancel = () => {
    if (down && aiming) {
      angle = down.angle;
      power = down.power;
    }
    down = null;
    aiming = false;
    stage.wake();
  };
  host.addEventListener('pointerdown', onDown);
  host.addEventListener('pointermove', onMove);
  host.addEventListener('pointerup', onUp);
  host.addEventListener('pointercancel', onCancel);

  // --- Frame ------------------------------------------------------------------------
  const shipEuler = { roll: 0, pitch: 0 };
  stage.onFrame = (dt) => {
    if (!opts.reducedMotion) waterT += dt;
    ocean.update(waterT);

    // Ship rides the swell (+ recoil momentum kick).
    const sx = shipAnchor.position.x;
    const sz = shipAnchor.position.z;
    const hC = waveHeight(sx, sz, waterT, 0.8);
    const hL = waveHeight(sx - 1.2, sz, waterT, 0.8);
    const hR = waveHeight(sx + 1.2, sz, waterT, 0.8);
    const hF = waveHeight(sx, sz - 2.5, waterT, 0.8);
    const hB = waveHeight(sx, sz + 2.5, waterT, 0.8);
    shipKickVel += (-shipKick * 18 - shipKickVel * 3.2) * dt;
    shipKick += shipKickVel * dt;
    shipEuler.roll = Math.atan2(hL - hR, 2.4) * 0.55 + shipKick * 0.08;
    shipEuler.pitch = Math.atan2(hF - hB, 5) * 0.5;
    shipAnchor.position.y = hC * 0.7 - 0.12;
    shipAnchor.rotation.set(shipEuler.pitch, 0, shipEuler.roll);

    // Recoil: the carriage rolls back, then is hauled forward again.
    recoilVel += (-recoil * 30 - recoilVel * 6) * dt;
    recoil += recoilVel * dt;
    cannon.root.position.copy(cannonHome).add(tmp.set(recoil * 0.55, 0, 0).applyAxisAngle(new Vector3(0, 1, 0), cannon.root.rotation.y));
    cannon.wheels.forEach((w) => (w.rotation.z = recoil * -1.2));

    sim.step(dt, waterT);
    for (const ev of sim.events) {
      if (ev.type === 'hit') {
        const n = Math.min(14, Math.round(ev.speed * 1.4));
        lit.emit({ count: n, pos: ev.pos, speed: [1.5, 4.5], spread: 1, dir: new Vector3(0, 1, 0), life: [0.6, 1.1], size: [0.05, 0.1], grow: 0.6, gravity: GRAVITY, colors: [p.woodLight, p.wood] });
        glow.emit({ count: 6, pos: ev.pos, speed: [2, 5], spread: 1, life: [0.1, 0.25], size: [0.03, 0.06], colors: [p.lantern, 0xffffff] });
        shake = Math.max(shake, opts.reducedMotion ? 0 : 0.06);
      } else if (ev.type === 'splash') {
        const n = Math.min(26, 8 + Math.round(ev.speed * 2));
        glow.emit({ count: n, pos: ev.pos, dir: new Vector3(0, 1, 0), spread: 0.45, speed: [1.5, 3.2 + ev.speed * 0.25], life: [0.4, 0.8], size: [0.04, 0.09], gravity: GRAVITY, colors: [0xffffff, p.accent2, p.waterCrest] });
      } else if (ev.type === 'boom') {
        flashLevel = 1.6;
        flash.position.copy(ev.pos);
        shake = opts.reducedMotion ? 0 : 0.32;
        glow.emit({ count: 40, pos: ev.pos, speed: [3, 9], life: [0.25, 0.6], size: [0.06, 0.16], gravity: 4, colors: [p.accent, p.lantern, 0xffffff, p.accent2] });
        lit.emit({ count: 14, pos: ev.pos, speed: [0.8, 2.4], life: [0.9, 1.5], size: [0.1, 0.2], grow: 2.2, drag: 2, gravity: -0.8, colors: [0xbab4cc, 0x8f88a3, 0xd9d4e6] });
        lit.emit({ count: 12, pos: ev.pos, speed: [3, 7], life: [0.8, 1.3], size: [0.06, 0.12], gravity: GRAVITY, colors: [p.woodDark, p.wood] });
        toast = 'Powder keg!';
        toastTimer = 1.6;
      } else if (ev.type === 'overboard') {
        overboard++;
      }
    }
    sim.events.length = 0;

    // Sync meshes.
    for (const e of barrels) {
      const b = e.body;
      e.mesh.visible = b.alive;
      if (e.pop < 1) e.pop = Math.min(1, e.pop + dt * 2.6);
      const k = Math.max(0, e.pop);
      const pop = k <= 0 ? 0 : 1 + 2.2 * Math.pow(k - 1, 3) + 1.2 * Math.pow(k - 1, 2);
      e.mesh.scale.setScalar(Math.max(pop, 0.001));
      e.mesh.position.copy(b.pos);
      let bobRoll = 0;
      if (b.inWater) bobRoll = Math.sin(waterT * 1.6 + b.pos.x) * 0.25;
      e.mesh.rotation.set(bobRoll * 0.4, b.yaw, b.roll + bobRoll);
    }
    if (ball) {
      ballMesh.position.copy(ball.pos);
      ballMesh.visible = ball.alive;
      if (ball.alive && !ball.inWater && ball.vel.lengthSq() > 9) {
        ballTrail.emit({ count: 1, pos: ball.pos, speed: [0, 0.2], life: [0.18, 0.3], size: [0.07, 0.11], grow: 0.1, colors: [p.accent2] });
      }
      if (!ball.alive) ball = null;
    }
    ballTrail.update(dt);
    lit.update(dt);
    glow.update(dt);
    updateDots();

    flashLevel = Math.max(0, flashLevel - dt * 4);
    flash.intensity = flashLevel * 30;

    if (toast) {
      toastTimer -= dt;
      if (toastTimer <= 0) toast = null;
    }

    // Camera shake decays quickly.
    shake = Math.max(0, shake - dt * 0.9);
    camera.position.copy(camBase);
    if (shake > 0) camera.position.add(tmp.set((Math.random() - 0.5) * shake, (Math.random() - 0.5) * shake, 0));
    camera.lookAt(camLook);

    // Auto-rebuild the pyramid a while after the last shot.
    const disturbed = barrels.some((e) => !e.body.alive || e.body.pos.distanceToSquared(e.home) > 0.05);
    if (!opts.reducedMotion && disturbed && !ball && performance.now() - lastShot > 9000) reset();

    emitHud();
    const popping = barrels.some((e) => e.pop < 1);
    return (
      sim.busy ||
      !!ball ||
      lit.busy ||
      glow.busy ||
      ballTrail.busy ||
      popping ||
      aiming ||
      Math.abs(recoil) > 1e-3 ||
      Math.abs(recoilVel) > 1e-3 ||
      flashLevel > 0 ||
      toast !== null
    );
  };

  autoPower();
  emitHud();
  stage.wake();

  if (import.meta.env.DEV) {
    // Test hook (stripped from production builds).
    Object.assign(host, {
      __cannonDebug: () => ({
        ball: ball ? { pos: ball.pos.toArray(), vel: ball.vel.toArray(), alive: ball.alive, inWater: ball.inWater } : null,
        muzzle: muzzle.toArray(),
        angle: angle / DEG,
        power,
        awake: sim.bodies.filter((b) => !b.sleeping).length,
      }),
    });
  }

  return {
    fire,
    reset,
    nudgeAim,
    dispose() {
      host.removeEventListener('pointerdown', onDown);
      host.removeEventListener('pointermove', onMove);
      host.removeEventListener('pointerup', onUp);
      host.removeEventListener('pointercancel', onCancel);
      stage.dispose();
    },
  };
}
