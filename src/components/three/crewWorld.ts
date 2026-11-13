import {
  BoxGeometry,
  Color,
  Group,
  Mesh,
  MeshBasicMaterial,
  MeshLambertMaterial,
  Object3D,
  PointLight,
  Raycaster,
  RingGeometry,
  CircleGeometry,
  CylinderGeometry,
  SphereGeometry,
  Vector2,
  Vector3,
} from 'three';
import { addBackdrop } from './backdrop';
import { createKit, deckGeometry, makeBarrel, makeCannon, makeCrewmate, makePump, makeShip, DECK_Y, type Crewmate } from './models';
import { createOcean, waveHeight } from './ocean';
import { PALETTES, type PaletteName } from './palette';
import { ParticlePool } from './particles';
import { Stage } from './stage';

export interface CrewHud {
  hull: number;
  leaks: number;
  patched: number;
  down: number;
  toast: string | null;
}

export interface CrewWorldOptions {
  palette: PaletteName;
  reducedMotion: boolean;
  lowDetail: boolean;
  ariaLabel: string;
  onHud: (hud: CrewHud) => void;
}

export interface CrewWorld {
  patchNext(): void;
  rogueWave(): void;
  dispose(): void;
}

type MateState = 'station' | 'run' | 'fix' | 'revive' | 'down' | 'return';
type Job = 'helm' | 'pump' | 'cannon' | 'lookout';

interface Leak {
  pos: Vector2;
  age: number;
  group: Group;
  ring: Mesh;
  hit: Mesh;
  assigned: Mate | null;
  spurt: number;
}

interface Mate {
  rig: Crewmate;
  job: Job;
  home: Vector2;
  homeFacing: number;
  pos: Vector2;
  facing: number;
  state: MateState;
  target: Vector2;
  leak: Leak | null;
  patient: Mate | null;
  timer: number;
  phase: number;
  slide: number;
  slideVel: number;
  hop: number;
  lie: number;
  hit: Mesh;
  ringMat: MeshBasicMaterial;
  color: number;
}

const LEAK_SPOTS: [number, number][] = [
  [1.9, 0.72],
  [0.95, 0.15],
  [-0.45, 0.85],
  [-1.7, -0.7],
  [2.55, -0.25],
  [-0.9, -0.15],
  [0.1, 0.55],
  [1.6, -0.55],
];

const SPEED = 2.4;
const LEAK_FLOW = 0.022;
const PUMP_RATE = 0.028;
const AUTO_DELAY = 4.5;

export function createCrewWorld(host: HTMLElement, opts: CrewWorldOptions): CrewWorld {
  const p = PALETTES[opts.palette];
  const stage = new Stage(host, {
    reducedMotion: opts.reducedMotion,
    lowDetail: opts.lowDetail,
    fov: 38,
    fogColor: p.fog,
    fogNear: 16,
    fogFar: 42,
    ariaLabel: opts.ariaLabel,
  });
  const { scene, camera } = stage;
  const kit = createKit(p);
  const backdrop = addBackdrop(scene, p, new Vector3(-9, 9, -24), opts.lowDetail);

  const ocean = createOcean(p, {
    width: 64,
    depth: 64,
    segX: opts.lowDetail ? 30 : 46,
    segZ: opts.lowDetail ? 30 : 46,
    amp: 0.9,
  });
  scene.add(ocean.mesh);

  // --- Ship -------------------------------------------------------------------------
  const anchor = new Group();
  scene.add(anchor);
  const ship = makeShip(kit);
  anchor.add(ship.root);
  const lanternLight = new PointLight(p.lantern, 7, 7, 1.5);
  ship.lantern.add(lanternLight);
  const deckLight = new PointLight(p.accent2, 2.2, 6, 1.5);
  deckLight.position.set(2.2, DECK_Y + 1.2, 1.4);
  ship.root.add(deckLight);

  const pump = makePump(kit);
  pump.root.position.set(-1.1, DECK_Y, 0.75);
  ship.root.add(pump.root);
  const deckCannon = makeCannon(kit);
  deckCannon.root.position.set(1.0, DECK_Y, -0.82);
  deckCannon.root.rotation.y = Math.PI / 2;
  deckCannon.root.scale.setScalar(0.85);
  ship.root.add(deckCannon.root);
  deckCannon.pivot.rotation.z = 0.12;

  // Loose cargo that slides when the hull lists.
  const cargo: { obj: Object3D; home: Vector3; slide: number; slideVel: number }[] = [];
  const addCargo = (obj: Object3D, x: number, y: number, z: number) => {
    obj.position.set(x, y, z);
    ship.root.add(obj);
    cargo.push({ obj, home: obj.position.clone(), slide: 0, slideVel: 0 });
  };
  const crateGeo = new BoxGeometry(0.42, 0.42, 0.42);
  addCargo(new Mesh(crateGeo, kit.mats.wood), -1.95, DECK_Y + 0.21, 0.72);
  addCargo(new Mesh(crateGeo, kit.mats.woodDark), -1.95, DECK_Y + 0.63, 0.7);
  const keg = makeBarrel(kit, true);
  keg.scale.setScalar(0.62);
  keg.rotation.x = Math.PI / 2;
  addCargo(keg, 2.2, DECK_Y + 0.28, 0.45);
  const barrel = makeBarrel(kit);
  barrel.scale.setScalar(0.62);
  barrel.rotation.x = Math.PI / 2;
  addCargo(barrel, -0.35, DECK_Y + 0.28, -0.85);

  // Flood water sloshing on deck.
  const floodMat = new MeshLambertMaterial({ color: p.waterCrest, transparent: true, opacity: 0, flatShading: true, emissive: new Color(p.accent2).multiplyScalar(0.15) });
  const floodMesh = new Mesh(deckGeometry(0.93), floodMat);
  floodMesh.visible = false;
  ship.root.add(floodMesh);

  // --- Crew -------------------------------------------------------------------------
  const hitMat = new MeshBasicMaterial({ visible: false });
  const stations: { job: Job; home: [number, number]; facing: number }[] = [
    { job: 'lookout', home: [2.75, 0.05], facing: Math.PI / 2 },
    { job: 'cannon', home: [1.0, -0.3], facing: Math.PI },
    { job: 'helm', home: [-2.72, 0], facing: Math.PI / 2 },
    { job: 'pump', home: [-1.1, 0.38], facing: 0 },
  ];
  const mates: Mate[] = stations.map((s, i) => {
    const rig = makeCrewmate(kit, p.crew[i]);
    ship.root.add(rig.root);
    const hit = new Mesh(new SphereGeometry(0.42, 6, 4), hitMat);
    hit.position.y = 0.45;
    rig.root.add(hit);
    const home = new Vector2(...s.home);
    return {
      rig,
      job: s.job,
      home,
      homeFacing: s.facing,
      pos: home.clone(),
      facing: s.facing,
      state: 'station',
      target: home.clone(),
      leak: null,
      patient: null,
      timer: 0,
      phase: i * 1.7,
      slide: 0,
      slideVel: 0,
      hop: 0,
      lie: 0,
      hit,
      ringMat: rig.ring.material as MeshBasicMaterial,
      color: p.crew[i],
    };
  });

  // --- Leaks ------------------------------------------------------------------------
  const holeGeo = new CircleGeometry(0.2, 9);
  holeGeo.rotateX(-Math.PI / 2);
  const holeMat = new MeshBasicMaterial({ color: 0x02060c });
  const leakRingGeo = new RingGeometry(0.3, 0.42, 20);
  leakRingGeo.rotateX(-Math.PI / 2);
  const plankGeo = new BoxGeometry(0.5, 0.04, 0.2);
  const leakRingMat = new MeshBasicMaterial({ color: p.accent2, transparent: true, opacity: 0.9, depthWrite: false });
  const jetGeo = new CylinderGeometry(0.05, 0.13, 0.64, 6, 1, true);
  const jetMat = new MeshBasicMaterial({ color: p.accent2, transparent: true, opacity: 0.4, depthWrite: false });
  const leakHitGeo = new SphereGeometry(0.5, 6, 4);
  const leaks: Leak[] = [];
  const planks: { mesh: Mesh; life: number }[] = [];

  const spawnLeak = (): Leak | null => {
    const free = LEAK_SPOTS.filter(([x, z]) => !leaks.some((l) => l.pos.distanceTo(new Vector2(x, z)) < 0.5));
    if (!free.length) return null;
    const [x, z] = free[Math.floor(Math.random() * free.length)];
    const group = new Group();
    group.position.set(x, DECK_Y + 0.012, z);
    group.add(new Mesh(holeGeo, holeMat));
    const ring = new Mesh(leakRingGeo, leakRingMat);
    group.add(ring);
    const jet = new Mesh(jetGeo, jetMat);
    jet.position.y = 0.32;
    group.add(jet);
    const hit = new Mesh(leakHitGeo, hitMat);
    hit.position.y = 0.2;
    group.add(hit);
    ship.root.add(group);
    const leak: Leak = { pos: new Vector2(x, z), age: 0, group, ring, hit, assigned: null, spurt: 0 };
    leaks.push(leak);
    return leak;
  };

  const removeLeak = (leak: Leak) => {
    const i = leaks.indexOf(leak);
    if (i >= 0) leaks.splice(i, 1);
    ship.root.remove(leak.group);
  };

  // --- Effects ----------------------------------------------------------------------
  const glow = new ParticlePool(kit.geo.puff, new MeshBasicMaterial(), opts.lowDetail ? 120 : 220);
  const lit = new ParticlePool(kit.geo.puff, new MeshLambertMaterial({ flatShading: true }), opts.lowDetail ? 50 : 90);
  scene.add(glow.mesh, lit.mesh);

  // --- State ------------------------------------------------------------------------
  let flood = 0;
  let patched = 0;
  let toast: string | null = null;
  let toastTimer = 0;
  let spawnTimer = 1.2;
  let waveTimer = 24;
  let lastInput = -1e9;
  let waterT = 0;
  let scroll = 0;
  let listSide = 0;
  let rollKick = 0;
  let rollKickVel = 0;
  let lastHud = '';
  let warnedFlood = false;

  const say = (msg: string, secs = 1.6) => {
    toast = msg;
    toastTimer = secs;
  };

  const emitHud = () => {
    const hud: CrewHud = {
      hull: Math.round((1 - flood) * 100),
      leaks: leaks.length,
      patched,
      down: mates.filter((m) => m.state === 'down').length,
      toast,
    };
    const key = JSON.stringify(hud);
    if (key !== lastHud) {
      lastHud = key;
      opts.onHud(hud);
    }
  };

  const toWorld = (x: number, y: number, z: number) => ship.root.localToWorld(new Vector3(x, y, z));

  const freeMates = () => mates.filter((m) => m.state === 'station' || m.state === 'return');
  const pickMate = (to: Vector2, exclude?: Mate) => {
    // Keep the pump manned if anyone else can go.
    const pool = freeMates().filter((m) => m !== exclude);
    if (!pool.length) return null;
    pool.sort((a, b) => a.pos.distanceTo(to) + (a.job === 'pump' ? 2.5 : 0) - (b.pos.distanceTo(to) + (b.job === 'pump' ? 2.5 : 0)));
    return pool[0];
  };

  const dispatchToLeak = (leak: Leak, byUser: boolean) => {
    if (leak.assigned) return true;
    const m = pickMate(leak.pos);
    if (!m) {
      if (byUser) say('All hands busy!');
      return false;
    }
    m.state = 'run';
    m.leak = leak;
    m.patient = null;
    m.target.copy(leak.pos).add(new Vector2(-0.32, 0));
    leak.assigned = m;
    return true;
  };

  const dispatchRevive = (down: Mate, byUser: boolean) => {
    if (mates.some((m) => m.patient === down)) return true;
    const m = pickMate(down.pos, down);
    if (!m) {
      if (byUser) say('All hands busy!');
      return false;
    }
    m.state = 'run';
    m.patient = down;
    m.leak = null;
    m.target.copy(down.pos).add(new Vector2(0.45, 0));
    return true;
  };

  const knockDown = () => {
    const candidates = mates.filter((m) => m.state !== 'down' && !mates.some((o) => o.patient === m));
    if (!candidates.length) return;
    const m = candidates[Math.floor(Math.random() * candidates.length)];
    if (m.leak) m.leak.assigned = null;
    if (m.patient) m.patient = null;
    m.leak = null;
    m.state = 'down';
    m.timer = 0;
    say('Crewmate down!', 1.8);
  };

  const patchNext = () => {
    lastInput = performance.now();
    const down = mates.find((m) => m.state === 'down' && !mates.some((o) => o.patient === m));
    if (down) {
      dispatchRevive(down, true);
    } else {
      const open = leaks.filter((l) => !l.assigned).sort((a, b) => b.age - a.age)[0];
      if (open) dispatchToLeak(open, true);
      else if (!leaks.length) say('Hull secure');
      else say('Already on it!');
    }
    emitHud();
    stage.wake();
  };

  const rogueWave = () => {
    lastInput = performance.now();
    rollKickVel = 1.6 * (Math.random() < 0.5 ? -1 : 1);
    for (let i = 0; i < 2; i++) spawnLeak();
    knockDown();
    const side = Math.sign(rollKickVel);
    for (const m of mates) if (m.state !== 'down') m.slideVel += side * (1.5 + Math.random());
    for (const c of cargo) c.slideVel += side * 2.2;
    const at = toWorld(0.6, 0.6, -side * 1.4);
    glow.emit({ count: 50, pos: at, dir: new Vector3(0, 1, side * 0.6), spread: 0.4, speed: [3, 7], life: [0.5, 1], size: [0.05, 0.12], gravity: 9, colors: [0xffffff, p.accent2, p.waterCrest] });
    waveTimer = 26;
    emitHud();
    stage.wake();
  };

  // --- Camera orbit + picking -------------------------------------------------------
  const target = new Vector3(0.1, 1.05, 0);
  let yaw = 0.95;
  let pitch = 0.5;
  let yawVel = 0;
  const dist = 10.4;
  const placeCamera = () => {
    camera.position.set(
      target.x + Math.sin(yaw) * Math.cos(pitch) * dist,
      target.y + Math.sin(pitch) * dist,
      target.z + Math.cos(yaw) * Math.cos(pitch) * dist,
    );
    camera.lookAt(target);
    backdrop.moon.quaternion.copy(camera.quaternion);
    backdrop.halo.quaternion.copy(camera.quaternion);
    // Keep the moon behind the ship from any angle.
    const back = new Vector3().subVectors(target, camera.position).setY(0).normalize();
    backdrop.moon.position.set(back.x * 26 - back.z * 7, 9, back.z * 26 + back.x * 7);
    backdrop.halo.position.copy(backdrop.moon.position).addScaledVector(back, 0.2);
  };

  const raycaster = new Raycaster();
  const ndc = new Vector2();
  const pick = (clientX: number, clientY: number): { leak?: Leak; mate?: Mate } | null => {
    const rect = host.getBoundingClientRect();
    ndc.set(((clientX - rect.left) / rect.width) * 2 - 1, -((clientY - rect.top) / rect.height) * 2 + 1);
    raycaster.setFromCamera(ndc, camera);
    const targets: Object3D[] = [...leaks.map((l) => l.hit), ...mates.filter((m) => m.state === 'down').map((m) => m.hit)];
    const hit = raycaster.intersectObjects(targets, false)[0];
    if (!hit) return null;
    const leak = leaks.find((l) => l.hit === hit.object);
    if (leak) return { leak };
    const mate = mates.find((m) => m.hit === hit.object);
    return mate ? { mate } : null;
  };

  let drag: { x: number; y: number; lx: number; id: number; moved: boolean } | null = null;
  const onDown = (e: PointerEvent) => {
    if (e.button !== 0 || (e.target as HTMLElement).closest('button')) return;
    drag = { x: e.clientX, y: e.clientY, lx: e.clientX, id: e.pointerId, moved: false };
    host.setPointerCapture?.(e.pointerId);
    lastInput = performance.now();
  };
  const onMove = (e: PointerEvent) => {
    if (drag && e.pointerId === drag.id) {
      const dx = e.clientX - drag.lx;
      drag.lx = e.clientX;
      if (Math.hypot(e.clientX - drag.x, e.clientY - drag.y) > 6) drag.moved = true;
      if (drag.moved) {
        yaw -= dx * 0.009;
        yawVel = -dx * 0.009 * 60;
        if (e.pointerType === 'mouse') pitch = Math.min(Math.max(pitch + e.movementY * 0.004, 0.16), 0.95);
        host.style.cursor = 'grabbing';
        stage.wake();
      }
      return;
    }
    if (e.pointerType === 'mouse') host.style.cursor = pick(e.clientX, e.clientY) ? 'pointer' : 'grab';
  };
  const onUp = (e: PointerEvent) => {
    if (!drag || e.pointerId !== drag.id) return;
    const wasClick = !drag.moved;
    drag = null;
    host.style.cursor = 'grab';
    if (!wasClick) return;
    const hit = pick(e.clientX, e.clientY);
    if (hit?.leak) dispatchToLeak(hit.leak, true);
    else if (hit?.mate) dispatchRevive(hit.mate, true);
    emitHud();
    stage.wake();
  };
  const onCancel = () => {
    drag = null;
  };
  host.style.cursor = 'grab';
  host.addEventListener('pointerdown', onDown);
  host.addEventListener('pointermove', onMove);
  host.addEventListener('pointerup', onUp);
  host.addEventListener('pointercancel', onCancel);

  // --- Frame ------------------------------------------------------------------------
  const tmp = new Vector3();
  const sampleShip = () => {
    const amp = 0.9;
    const h = (x: number, z: number) => waveHeight(x + scroll, z, waterT, amp);
    const hBow = h(3, 0);
    const hStern = h(-3, 0);
    const hPort = h(0, -1.3);
    const hStar = h(0, 1.3);
    const hMid = (hBow + hStern + hPort + hStar) / 4;
    return { hMid, pitch: Math.atan2(hBow - hStern, 6) * 0.6, roll: Math.atan2(hPort - hStar, 2.6) * 0.6 };
  };

  stage.onFrame = (dt) => {
    const animate = !opts.reducedMotion;
    if (animate) {
      waterT += dt;
      scroll += dt * 1.1;
    }
    ocean.update(waterT, scroll);

    // Inertia on the orbit.
    if (!drag && Math.abs(yawVel) > 0.001 && animate) {
      yaw += yawVel * dt;
      yawVel *= Math.max(0, 1 - 4 * dt);
    }
    placeCamera();

    // Leaks: spawn, age, auto-dispatch, spurt.
    const now = performance.now();
    if (animate) {
      spawnTimer -= dt;
      if (spawnTimer <= 0) {
        if (leaks.length < 3) spawnLeak();
        spawnTimer = 4 + Math.random() * 3.5;
      }
      if (now - lastInput > 12000) {
        waveTimer -= dt;
        if (waveTimer <= 0) rogueWave();
      }
    }
    for (const l of leaks) {
      l.age += dt;
      if (!l.assigned && l.age > AUTO_DELAY && animate) dispatchToLeak(l, false);
      const pulse = 1 + Math.sin(waterT * 6 + l.pos.x) * 0.12;
      l.ring.scale.setScalar(pulse);
      l.group.children[2].scale.set(pulse, 0.8 + Math.abs(Math.sin(waterT * 9 + l.pos.y)) * 0.4, pulse);
      if (animate) {
        l.spurt += dt * 26;
        while (l.spurt >= 1) {
          l.spurt -= 1;
          glow.emit({ count: 1, pos: toWorld(l.pos.x, DECK_Y + 0.05, l.pos.y), dir: new Vector3(0, 1, 0), spread: 0.18, speed: [1.6, 2.8], life: [0.35, 0.6], size: [0.035, 0.07], gravity: 9, colors: [0xffffff, p.accent2, p.waterCrest] });
        }
      }
    }
    // Downed crew get revived automatically after a moment if nobody was sent.
    for (const m of mates) {
      if (m.state === 'down' && animate) {
        m.timer += dt;
        if (m.timer > 2.5) dispatchRevive(m, false);
      }
    }

    // Flood + pump.
    const pumping = mates.some((m) => m.job === 'pump' && m.state === 'station');
    flood = Math.min(1, Math.max(0, flood + (leaks.length * LEAK_FLOW - (pumping ? PUMP_RATE : 0)) * dt));
    if (flood > 0.85 && !warnedFlood) {
      warnedFlood = true;
      say('Bail faster!');
    }
    if (flood < 0.6) warnedFlood = false;
    const leakSide = leaks.length ? leaks.reduce((s, l) => s + l.pos.y, 0) / leaks.length : 0;
    listSide += (leakSide - listSide) * Math.min(1, dt * 0.8);

    // Ship motion.
    rollKickVel += (-rollKick * 7 - rollKickVel * 1.1) * dt;
    rollKick += rollKickVel * dt;
    const s = sampleShip();
    anchor.position.y = s.hMid * 0.8 - 0.1 - flood * 0.38;
    anchor.rotation.set(s.roll + rollKick * 0.35 + flood * listSide * 0.22, 0, s.pitch, 'XYZ');
    const heel = anchor.rotation.x;

    // Sail, flag, helm, pump.
    if (animate) {
      const fpos = ship.flag.geometry.attributes.position;
      for (let i = 0; i < fpos.count; i++) {
        const x = fpos.getX(i);
        fpos.setZ(i, Math.sin(x * 7 - waterT * 9) * 0.06 * x);
      }
      fpos.needsUpdate = true;
      ship.sail.scale.x = 1 + Math.sin(waterT * 1.3) * 0.08;
    }
    const helmMate = mates.find((m) => m.job === 'helm');
    if (helmMate?.state === 'station' && animate) ship.wheel.rotation.x = Math.sin(waterT * 0.8) * 0.6;
    if (pumping && animate) pump.lever.rotation.z = Math.sin(waterT * 5) * 0.45;

    floodMesh.visible = flood > 0.03;
    floodMesh.position.y = DECK_Y + 0.015 + flood * 0.1;
    floodMat.opacity = Math.min(0.7, flood * 1.1);

    // Crew.
    for (const m of mates) {
      const { rig } = m;
      m.phase += dt;
      // Sliding from list / rogue waves (spring back to footing).
      m.slideVel += (heel * 4 - m.slide * 6 - m.slideVel * 3.5) * dt;
      m.slide += m.slideVel * dt;
      let bob = 0;
      let lean = 0;
      rig.hammer.visible = false;
      rig.armL.rotation.x = 0;
      rig.armR.rotation.x = 0;

      if (m.state === 'run' || m.state === 'return') {
        const d = tmp.set(m.target.x - m.pos.x, 0, m.target.y - m.pos.y);
        const len = d.length();
        if (len < 0.05) {
          if (m.state === 'return') {
            m.state = 'station';
            m.facing = m.homeFacing;
          } else if (m.leak) {
            m.state = 'fix';
            m.timer = 1.3;
            m.facing = Math.atan2(m.leak.pos.x - m.pos.x, m.leak.pos.y - m.pos.y);
          } else if (m.patient) {
            m.state = 'revive';
            m.timer = 1.4;
            m.facing = Math.atan2(m.patient.pos.x - m.pos.x, m.patient.pos.y - m.pos.y);
          } else {
            m.state = 'return';
            m.target.copy(m.home);
          }
        } else {
          const step = Math.min(len, SPEED * dt);
          m.pos.x += (d.x / len) * step;
          m.pos.y += (d.z / len) * step;
          m.facing = Math.atan2(d.x, d.z);
          bob = Math.abs(Math.sin(m.phase * 14)) * 0.09;
          lean = 0.18;
          rig.armL.rotation.x = Math.sin(m.phase * 14) * 0.9;
          rig.armR.rotation.x = -Math.sin(m.phase * 14) * 0.9;
        }
      } else if (m.state === 'fix') {
        m.timer -= dt;
        rig.hammer.visible = true;
        rig.armR.rotation.x = -1.2 - Math.abs(Math.sin(m.phase * 13)) * 1.1;
        lean = 0.35;
        bob = -0.06;
        if (Math.sin(m.phase * 13) > 0.97 && m.leak) {
          glow.emit({ count: 2, pos: toWorld(m.leak.pos.x, DECK_Y + 0.1, m.leak.pos.y), speed: [1, 2.5], life: [0.12, 0.25], size: [0.025, 0.05], colors: [p.lantern, 0xffffff] });
        }
        if (m.timer <= 0 && m.leak) {
          const leak = m.leak;
          const plank = new Mesh(plankGeo, kit.mats.woodLight);
          plank.position.set(leak.pos.x, DECK_Y + 0.025, leak.pos.y);
          plank.rotation.y = Math.random() * 0.8 - 0.4;
          ship.root.add(plank);
          planks.push({ mesh: plank, life: 7 });
          glow.emit({ count: 16, pos: toWorld(leak.pos.x, DECK_Y + 0.2, leak.pos.y), speed: [1.5, 3.5], life: [0.3, 0.6], size: [0.04, 0.08], gravity: 6, colors: [m.color, 0xffffff, p.accent] });
          removeLeak(leak);
          m.leak = null;
          patched++;
          m.hop = 1;
          m.state = 'return';
          m.target.copy(m.home);
          if (!leaks.length) say('Hull secure', 1.2);
        }
      } else if (m.state === 'revive') {
        m.timer -= dt;
        lean = 0.5;
        bob = -0.12;
        rig.armL.rotation.x = -1.4;
        rig.armR.rotation.x = -1.4 + Math.sin(m.phase * 10) * 0.3;
        if (m.patient && Math.random() < 0.3) {
          glow.emit({ count: 1, pos: toWorld(m.patient.pos.x, DECK_Y + 0.35, m.patient.pos.y), dir: new Vector3(0, 1, 0), spread: 0.6, speed: [0.6, 1.4], life: [0.4, 0.7], size: [0.03, 0.06], colors: [m.color, p.accent2] });
        }
        if (m.timer <= 0) {
          const pt = m.patient;
          if (pt) {
            pt.state = 'return';
            pt.target.copy(pt.home);
            pt.hop = 1;
            say('Revived!', 1.1);
          }
          m.patient = null;
          m.hop = 1;
          m.state = 'return';
          m.target.copy(m.home);
        }
      } else if (m.state === 'station' && animate) {
        if (m.job === 'pump') {
          bob = Math.sin(waterT * 5) * 0.04;
          lean = 0.15 + Math.sin(waterT * 5) * 0.12;
          rig.armL.rotation.x = rig.armR.rotation.x = -1.1 + Math.sin(waterT * 5) * 0.45;
        } else if (m.job === 'lookout') {
          m.facing = m.homeFacing + Math.sin(m.phase * 0.7) * 0.6;
          rig.armR.rotation.x = -2.4;
        } else if (m.job === 'helm') {
          rig.armL.rotation.x = rig.armR.rotation.x = -1.2;
          lean = 0.05;
        } else {
          bob = Math.abs(Math.sin(m.phase * 2)) * 0.02;
        }
      }

      // Down: lie on the deck with a pulsing red ring.
      const lieTarget = m.state === 'down' ? 1 : 0;
      m.lie += (lieTarget - m.lie) * Math.min(1, dt * 8);
      m.ringMat.color.set(m.state === 'down' ? p.danger : m.color);
      m.ringMat.opacity = m.state === 'down' ? 0.55 + Math.sin(waterT * 8) * 0.35 : 0.85;
      rig.ring.scale.setScalar(m.state === 'down' ? 1.6 : 1);

      m.hop = Math.max(0, m.hop - dt * 2.2);
      const hop = Math.sin((1 - m.hop) * Math.PI) * (m.hop > 0 ? 0.35 : 0);
      const halfW = 0.95;
      const z = Math.min(Math.max(m.pos.y + m.slide * 0.35, -halfW), halfW);
      rig.root.position.set(m.pos.x, DECK_Y + bob + hop, z);
      rig.root.rotation.y = m.facing;
      rig.body.rotation.x = lean * (1 - m.lie) - m.lie * 1.45;
      rig.body.position.y = m.lie * 0.2;
      rig.body.rotation.z = Math.sin(m.slideVel) * 0.15;
    }

    // Cargo slides with the heel and is caught by the bulwark.
    for (const c of cargo) {
      c.slideVel += (heel * 6 - c.slide * 2.2 - c.slideVel * 2.2) * dt;
      c.slide += c.slideVel * dt;
      const z = Math.min(Math.max(c.home.z + c.slide * 0.5, -0.95), 0.95);
      c.obj.position.set(c.home.x, c.home.y, z);
    }

    for (let i = planks.length - 1; i >= 0; i--) {
      const pl = planks[i];
      if (animate) pl.life -= dt;
      if (pl.life < 1) pl.mesh.scale.setScalar(Math.max(pl.life, 0.001));
      if (pl.life <= 0) {
        ship.root.remove(pl.mesh);
        planks.splice(i, 1);
      }
    }

    // Bow spray and wake foam.
    if (animate && Math.random() < 0.6) {
      const side = Math.random() < 0.5 ? -1 : 1;
      glow.emit({ count: 1, pos: toWorld(3.3, -0.2, side * 0.25), dir: new Vector3(0.2, 1, side * 0.9), spread: 0.25, speed: [1.2, 2.2], life: [0.4, 0.7], size: [0.04, 0.08], gravity: 8, colors: [0xffffff, p.waterCrest] });
      lit.emit({ count: 1, pos: toWorld(-3.1 + Math.random() * 0.2, -0.15, side * Math.random() * 0.6), dir: new Vector3(-1, 0.1, 0), spread: 0.2, speed: [0.6, 1.2], life: [1.2, 1.8], size: [0.07, 0.12], grow: 1.6, drag: 0.8, colors: [0xdfe9f5, 0xb8d8ea] });
    }
    glow.update(dt);
    lit.update(dt);

    if (toast) {
      toastTimer -= dt;
      if (toastTimer <= 0) toast = null;
    }
    emitHud();

    const crewBusy = mates.some((m) => m.state !== 'station' && m.state !== 'down') || mates.some((m) => m.hop > 0);
    return crewBusy || glow.busy || lit.busy || toast !== null || Math.abs(rollKickVel) > 0.01 || Math.abs(yawVel) > 0.01;
  };

  spawnLeak();
  emitHud();
  stage.wake();

  if (import.meta.env.DEV) {
    // Test hook (stripped from production builds): screen positions of open leaks.
    Object.assign(host, {
      __leakScreen: () =>
        leaks.map((l) => {
          const v = toWorld(l.pos.x, DECK_Y, l.pos.y).project(camera);
          const r = host.getBoundingClientRect();
          return { x: r.left + ((v.x + 1) / 2) * r.width, y: r.top + ((1 - v.y) / 2) * r.height };
        }),
    });
  }

  return {
    patchNext,
    rogueWave,
    dispose() {
      host.removeEventListener('pointerdown', onDown);
      host.removeEventListener('pointermove', onMove);
      host.removeEventListener('pointerup', onUp);
      host.removeEventListener('pointercancel', onCancel);
      stage.dispose();
    },
  };
}
