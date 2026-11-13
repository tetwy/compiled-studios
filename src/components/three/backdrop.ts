import {
  AmbientLight,
  CircleGeometry,
  DirectionalLight,
  HemisphereLight,
  IcosahedronGeometry,
  InstancedMesh,
  Matrix4,
  Mesh,
  MeshBasicMaterial,
  Scene,
  Vector3,
} from 'three';
import type { Palette } from './palette';

/** Night lighting + moon + a sparse star field, shared by both scenes. */
export function addBackdrop(scene: Scene, p: Palette, moonPos: Vector3, lowDetail: boolean) {
  scene.add(new HemisphereLight(p.skyLight, p.groundLight, 1.6));
  scene.add(new AmbientLight(p.skyLight, 0.25));
  const key = new DirectionalLight(p.key, 1.7);
  key.position.set(-5, 9, 7);
  scene.add(key);
  const rim = new DirectionalLight(p.rim, 2.4);
  rim.position.set(7, 4, -9);
  scene.add(rim);

  const moonMat = new MeshBasicMaterial({ color: p.moon, fog: false });
  const moon = new Mesh(new CircleGeometry(1.35, 20), moonMat);
  moon.position.copy(moonPos);
  scene.add(moon);
  const halo = new Mesh(
    new CircleGeometry(2.7, 24),
    new MeshBasicMaterial({ color: p.accent, transparent: true, opacity: 0.12, fog: false, depthWrite: false }),
  );
  halo.position.copy(moonPos).add(new Vector3(0, 0, -0.1));
  scene.add(halo);

  const count = lowDetail ? 40 : 80;
  const stars = new InstancedMesh(
    new IcosahedronGeometry(1, 0),
    new MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.7, fog: false }),
    count,
  );
  const m = new Matrix4();
  let seed = 7;
  const rnd = () => {
    seed = (seed * 16807) % 2147483647;
    return seed / 2147483647;
  };
  for (let i = 0; i < count; i++) {
    const s = 0.03 + rnd() * 0.06;
    m.makeScale(s, s, s);
    m.setPosition(-30 + rnd() * 60, 4 + rnd() * 14, moonPos.z - 2 - rnd() * 6);
    stars.setMatrixAt(i, m);
  }
  scene.add(stars);
  return { moon, halo };
}
