import {
  BufferGeometry,
  Color,
  DynamicDrawUsage,
  InstancedMesh,
  Material,
  Matrix4,
  Object3D,
  Quaternion,
  Vector3,
} from 'three';

interface Particle {
  alive: boolean;
  pos: Vector3;
  vel: Vector3;
  spin: Vector3;
  rot: Vector3;
  life: number;
  maxLife: number;
  size: number;
  grow: number;
  gravity: number;
  drag: number;
  floor: number;
}

export interface EmitOptions {
  count: number;
  pos: Vector3;
  speed: [number, number];
  /** Main direction; spread is the random cone mix (0 = exact direction, 1 = any direction). */
  dir?: Vector3;
  spread?: number;
  life: [number, number];
  size: [number, number];
  /** Scale multiplier reached at end of life (smoke grows, sparks shrink). */
  grow?: number;
  gravity?: number;
  drag?: number;
  colors: number[];
  /** Particles are culled once they fall below this height. */
  floor?: number;
}

const rand = (a: number, b: number) => a + Math.random() * (b - a);

/** Pooled InstancedMesh particle system (one draw call per pool). */
export class ParticlePool {
  readonly mesh: InstancedMesh;
  private readonly items: Particle[] = [];
  private readonly m = new Matrix4();
  private readonly q = new Quaternion();
  private readonly s = new Vector3();
  private readonly e = new Object3D();
  private readonly color = new Color();
  private active = 0;

  constructor(geometry: BufferGeometry, material: Material, readonly capacity: number) {
    this.mesh = new InstancedMesh(geometry, material, capacity);
    this.mesh.instanceMatrix.setUsage(DynamicDrawUsage);
    this.mesh.frustumCulled = false;
    this.mesh.count = 0;
    for (let i = 0; i < capacity; i++) {
      this.items.push({
        alive: false,
        pos: new Vector3(),
        vel: new Vector3(),
        spin: new Vector3(),
        rot: new Vector3(),
        life: 0,
        maxLife: 1,
        size: 1,
        grow: 1,
        gravity: 0,
        drag: 0,
        floor: -10,
      });
      this.mesh.setColorAt(i, this.color.set(0xffffff));
    }
  }

  get busy() {
    return this.active > 0;
  }

  emit(o: EmitOptions) {
    const dir = o.dir ?? new Vector3(0, 1, 0);
    const spread = o.spread ?? 1;
    let emitted = 0;
    for (let i = 0; i < this.capacity && emitted < o.count; i++) {
      const p = this.items[i];
      if (p.alive) continue;
      emitted++;
      p.alive = true;
      p.pos.copy(o.pos);
      const rnd = new Vector3(rand(-1, 1), rand(-1, 1), rand(-1, 1)).normalize();
      p.vel.copy(dir).normalize().lerp(rnd, spread).normalize().multiplyScalar(rand(o.speed[0], o.speed[1]));
      p.spin.set(rand(-6, 6), rand(-6, 6), rand(-6, 6));
      p.rot.set(rand(0, 6), rand(0, 6), rand(0, 6));
      p.maxLife = rand(o.life[0], o.life[1]);
      p.life = p.maxLife;
      p.size = rand(o.size[0], o.size[1]);
      p.grow = o.grow ?? 0.2;
      p.gravity = o.gravity ?? 0;
      p.drag = o.drag ?? 0;
      p.floor = o.floor ?? -10;
      this.mesh.setColorAt(i, this.color.set(o.colors[Math.floor(Math.random() * o.colors.length)]));
    }
    if (this.mesh.instanceColor) this.mesh.instanceColor.needsUpdate = true;
  }

  update(dt: number) {
    let top = 0;
    this.active = 0;
    for (let i = 0; i < this.capacity; i++) {
      const p = this.items[i];
      if (p.alive) {
        p.life -= dt;
        if (p.life <= 0 || p.pos.y < p.floor) p.alive = false;
      }
      if (!p.alive) {
        this.m.makeScale(0, 0, 0);
        this.mesh.setMatrixAt(i, this.m);
        continue;
      }
      this.active++;
      top = i + 1;
      p.vel.y -= p.gravity * dt;
      p.vel.multiplyScalar(Math.max(0, 1 - p.drag * dt));
      p.pos.addScaledVector(p.vel, dt);
      p.rot.addScaledVector(p.spin, dt);
      const k = 1 - p.life / p.maxLife;
      // Pop in quickly, then ease towards the grow factor.
      const scale = p.size * Math.min(1, k * 8) * (1 + (p.grow - 1) * k);
      this.e.rotation.set(p.rot.x, p.rot.y, p.rot.z);
      this.q.setFromEuler(this.e.rotation);
      this.s.setScalar(Math.max(scale, 0));
      this.m.compose(p.pos, this.q, this.s);
      this.mesh.setMatrixAt(i, this.m);
    }
    this.mesh.count = top;
    this.mesh.instanceMatrix.needsUpdate = true;
  }

  clear() {
    this.items.forEach((p) => (p.alive = false));
    this.update(0);
  }
}
