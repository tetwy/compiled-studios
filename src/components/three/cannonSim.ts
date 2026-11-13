import { Vector3 } from 'three';
import { waveHeight } from './ocean';

/**
 * Tiny purpose-built physics for the cannon toy (no engine dependency):
 * semi-implicit Euler, sphere-sphere impulses, sphere-vs-box (dock),
 * buoyancy against the same analytic wave field the ocean renders,
 * and per-body sleeping so the barrel pyramid stands still until hit.
 * Barrels lie on their side; their collision proxy is the barrel cross-section.
 */

export const GRAVITY = 11;
const SUBSTEP = 1 / 120;
const ITERATIONS = 3;

export type BodyKind = 'barrel' | 'keg' | 'ball';

export interface Body {
  kind: BodyKind;
  pos: Vector3;
  vel: Vector3;
  r: number;
  invMass: number;
  /** Fraction of gravity provided by buoyancy when fully submerged. */
  buoyancy: number;
  restitution: number;
  sleeping: boolean;
  sleepTimer: number;
  grounded: boolean;
  inWater: boolean;
  overboard: boolean;
  alive: boolean;
  /** Barrel orientation: yaw about world Y, roll about the barrel's own axis. */
  yaw: number;
  yawRate: number;
  roll: number;
  rollRate: number;
}

export interface Box {
  min: Vector3;
  max: Vector3;
}

export type SimEvent =
  | { type: 'hit'; pos: Vector3; speed: number }
  | { type: 'splash'; pos: Vector3; speed: number }
  | { type: 'boom'; pos: Vector3 }
  | { type: 'overboard' };

export function makeBody(kind: BodyKind, pos: Vector3, r: number): Body {
  const ball = kind === 'ball';
  return {
    kind,
    pos: pos.clone(),
    vel: new Vector3(),
    r,
    invMass: ball ? 1 / 7 : kind === 'keg' ? 1 / 1.4 : 1,
    buoyancy: ball ? 0.25 : 2.3,
    restitution: ball ? 0.25 : 0.3,
    sleeping: !ball,
    sleepTimer: 0,
    grounded: false,
    inWater: false,
    overboard: false,
    alive: true,
    yaw: 0,
    yawRate: 0,
    roll: 0,
    rollRate: 0,
  };
}

const tmpN = new Vector3();
const tmpRel = new Vector3();
const tmpC = new Vector3();

export class CannonSim {
  bodies: Body[] = [];
  boxes: Box[] = [];
  events: SimEvent[] = [];
  waveAmp = 1;
  private acc = 0;

  /** Advance the world. `t` is the ocean clock (buoyancy reads the same waves). */
  step(dt: number, t: number) {
    this.acc += dt;
    let n = 0;
    while (this.acc >= SUBSTEP && n < 8) {
      this.substep(SUBSTEP, t);
      this.acc -= SUBSTEP;
      n++;
    }
    if (n === 8) this.acc = 0;
  }

  get busy(): boolean {
    return this.bodies.some((b) => b.alive && !b.sleeping && b.vel.lengthSq() > 0.004);
  }

  wakeAll() {
    for (const b of this.bodies) {
      b.sleeping = false;
      b.sleepTimer = 0;
    }
  }

  private substep(h: number, t: number) {
    const bodies = this.bodies;
    for (const b of bodies) {
      if (!b.alive || b.sleeping) continue;
      b.vel.y -= GRAVITY * h;
      const surface = waveHeight(b.pos.x, b.pos.z, t, this.waveAmp);
      const sub = Math.min(Math.max((surface - (b.pos.y - b.r)) / (2 * b.r), 0), 1);
      if (sub > 0) {
        if (!b.inWater) {
          b.inWater = true;
          const speed = -b.vel.y;
          if (speed > 1.2) this.events.push({ type: 'splash', pos: b.pos.clone(), speed });
          if (b.kind !== 'ball' && !b.overboard) {
            b.overboard = true;
            this.events.push({ type: 'overboard' });
          }
        }
        b.vel.y += GRAVITY * b.buoyancy * sub * h;
        b.vel.multiplyScalar(Math.max(0, 1 - 2.2 * sub * h));
        // Gentle drift with the swell.
        b.vel.x += Math.cos(t * 0.7 + b.pos.z) * 0.15 * sub * h;
        b.yawRate *= 1 - 1.5 * h;
        b.rollRate *= 1 - 2.5 * h;
      } else if (b.inWater && b.pos.y - b.r > surface + 0.4) {
        b.inWater = false;
      }
      b.pos.addScaledVector(b.vel, h);
      b.grounded = false;
    }

    for (let it = 0; it < ITERATIONS; it++) {
      for (let i = 0; i < bodies.length; i++) {
        const a = bodies[i];
        if (!a.alive) continue;
        for (let j = i + 1; j < bodies.length; j++) {
          const b = bodies[j];
          if (!b.alive || (a.sleeping && b.sleeping)) continue;
          this.collidePair(a, b, it === 0);
        }
        if (!a.sleeping) for (const box of this.boxes) this.collideBox(a, box);
      }
    }

    for (const b of bodies) {
      if (!b.alive || b.sleeping) continue;
      // Barrels: roll about their axis when on a surface; spin freely in the air.
      if (b.kind !== 'ball') {
        if (b.grounded) {
          const ax = Math.sin(b.yaw);
          const az = Math.cos(b.yaw);
          const along = b.vel.x * ax + b.vel.z * az;
          // Sliding along the barrel axis is resisted; rolling across it is free.
          b.vel.x -= ax * along * Math.min(1, 6 * h);
          b.vel.z -= az * along * Math.min(1, 6 * h);
          const across = b.vel.x * az - b.vel.z * ax;
          b.rollRate += (-across / b.r - b.rollRate) * Math.min(1, 20 * h);
          b.yawRate *= 1 - 4 * h;
          b.vel.x *= 1 - 0.6 * h;
          b.vel.z *= 1 - 0.6 * h;
        }
        b.yaw += b.yawRate * h;
        b.roll += b.rollRate * h;
      }
      if (b.kind === 'ball' && (b.pos.y < -3 || Math.abs(b.pos.x) > 30)) b.alive = false;

      const slow = b.vel.lengthSq() < 0.02 && Math.abs(b.rollRate) < 0.3;
      if (b.kind !== 'ball' && b.grounded && !b.inWater && slow) {
        b.sleepTimer += h;
        if (b.sleepTimer > 0.5) {
          b.sleeping = true;
          b.vel.set(0, 0, 0);
          b.rollRate = 0;
          b.yawRate = 0;
        }
      } else {
        b.sleepTimer = 0;
      }
    }
    this.checkSupport();
  }

  /** A sleeping body whose support was knocked away wakes up and falls. */
  private checkSupport() {
    for (const b of this.bodies) {
      if (!b.alive || !b.sleeping) continue;
      let supported = false;
      for (const box of this.boxes) {
        const onTop =
          b.pos.x >= box.min.x - 0.05 &&
          b.pos.x <= box.max.x + 0.05 &&
          b.pos.z >= box.min.z - 0.05 &&
          b.pos.z <= box.max.z + 0.05 &&
          Math.abs(b.pos.y - b.r - box.max.y) < 0.06;
        if (onTop) supported = true;
      }
      if (!supported) {
        for (const o of this.bodies) {
          if (o === b || !o.alive || o.kind === 'ball') continue;
          if (o.pos.y < b.pos.y - 0.2 && o.pos.distanceTo(b.pos) < o.r + b.r + 0.06) {
            supported = true;
            break;
          }
        }
      }
      if (!supported) {
        b.sleeping = false;
        b.sleepTimer = 0;
      }
    }
  }

  private collidePair(a: Body, b: Body, report: boolean) {
    tmpN.subVectors(b.pos, a.pos);
    const dist = tmpN.length();
    const minD = a.r + b.r;
    if (dist >= minD || dist < 1e-6) return;
    tmpN.divideScalar(dist);
    tmpRel.subVectors(b.vel, a.vel);
    const vn = tmpRel.dot(tmpN);
    const relSpeed = -vn;
    // Wake sleepers only for real impacts, so resting stacks stay put.
    if (a.sleeping || b.sleeping) {
      if (relSpeed < 0.6) {
        this.separate(a, b, minD - dist, a.sleeping ? 0 : a.invMass, b.sleeping ? 0 : b.invMass);
        if (!a.sleeping && tmpN.y < -0.5) a.grounded = true;
        if (!b.sleeping && tmpN.y > 0.5) b.grounded = true;
        this.reflect(a, b, vn, a.sleeping ? 0 : a.invMass, b.sleeping ? 0 : b.invMass);
        return;
      }
      a.sleeping = false;
      b.sleeping = false;
      a.sleepTimer = b.sleepTimer = 0;
    }
    const ia = a.invMass;
    const ib = b.invMass;
    this.separate(a, b, minD - dist, ia, ib);
    this.reflect(a, b, vn, ia, ib);
    if (tmpN.y < -0.5) a.grounded = true;
    if (tmpN.y > 0.5) b.grounded = true;
    if (report && relSpeed > 2.5) {
      const ball = a.kind === 'ball' ? a : b.kind === 'ball' ? b : null;
      const pos = tmpC.copy(a.pos).addScaledVector(tmpN, a.r).clone();
      this.events.push({ type: 'hit', pos, speed: relSpeed });
      if (ball) {
        const other = ball === a ? b : a;
        other.yawRate += (Math.random() - 0.5) * 6;
        if (other.kind === 'keg') this.explode(other);
      } else if (relSpeed > 6) {
        if (a.kind === 'keg') this.explode(a);
        else if (b.kind === 'keg') this.explode(b);
      }
    }
  }

  private separate(a: Body, b: Body, depth: number, ia: number, ib: number) {
    const sum = ia + ib;
    if (sum <= 0) return;
    const k = (depth * 0.9) / sum;
    a.pos.addScaledVector(tmpN, -k * ia);
    b.pos.addScaledVector(tmpN, k * ib);
  }

  private reflect(a: Body, b: Body, vn: number, ia: number, ib: number) {
    if (vn >= 0) return;
    const sum = ia + ib;
    if (sum <= 0) return;
    const e = Math.min(a.restitution, b.restitution);
    const j = (-(1 + e) * vn) / sum;
    a.vel.addScaledVector(tmpN, -j * ia);
    b.vel.addScaledVector(tmpN, j * ib);
    // Light tangential friction.
    tmpRel.subVectors(b.vel, a.vel);
    const vt = tmpRel.addScaledVector(tmpN, -tmpRel.dot(tmpN)).multiplyScalar(0.06);
    a.vel.addScaledVector(vt, ia / sum);
    b.vel.addScaledVector(vt, -ib / sum);
  }

  private collideBox(b: Body, box: Box) {
    tmpC.set(
      Math.min(Math.max(b.pos.x, box.min.x), box.max.x),
      Math.min(Math.max(b.pos.y, box.min.y), box.max.y),
      Math.min(Math.max(b.pos.z, box.min.z), box.max.z),
    );
    tmpN.subVectors(b.pos, tmpC);
    const d = tmpN.length();
    if (d >= b.r) return;
    if (d < 1e-6) {
      tmpN.set(0, 1, 0);
      b.pos.y = box.max.y + b.r;
    } else {
      tmpN.divideScalar(d);
      b.pos.addScaledVector(tmpN, b.r - d);
    }
    const vn = b.vel.dot(tmpN);
    if (vn < 0) {
      if (-vn > 3 && b.kind === 'ball') this.events.push({ type: 'hit', pos: tmpC.clone(), speed: -vn });
      b.vel.addScaledVector(tmpN, -(1 + b.restitution) * vn);
      if (tmpN.y > 0.7 && -vn < 0.8) b.vel.y = Math.max(b.vel.y, 0);
    }
    if (tmpN.y > 0.7) {
      b.grounded = true;
      if (b.kind === 'ball') b.vel.multiplyScalar(0.985);
    }
  }

  /** Powder keg: radial impulse to everything nearby. */
  private explode(keg: Body) {
    if (!keg.alive) return;
    keg.alive = false;
    this.events.push({ type: 'boom', pos: keg.pos.clone() });
    for (const o of this.bodies) {
      if (!o.alive || o === keg) continue;
      tmpN.subVectors(o.pos, keg.pos);
      const d = Math.max(tmpN.length(), 0.3);
      if (d > 3.2) continue;
      o.sleeping = false;
      o.sleepTimer = 0;
      tmpN.divideScalar(d);
      tmpN.y += 0.6;
      const strength = (9 / (0.6 + d)) * (o.kind === 'ball' ? 0.2 : 1);
      o.vel.addScaledVector(tmpN.normalize(), strength);
      o.yawRate += (Math.random() - 0.5) * 10;
    }
  }
}
