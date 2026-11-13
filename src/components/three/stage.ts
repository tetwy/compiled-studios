import {
  BufferGeometry,
  Fog,
  Material,
  Mesh,
  PerspectiveCamera,
  Scene,
  WebGLRenderer,
} from 'three';

export interface StageOptions {
  reducedMotion: boolean;
  lowDetail: boolean;
  fov?: number;
  fogColor: number;
  fogNear: number;
  fogFar: number;
  ariaLabel: string;
}

/**
 * Small render-loop owner shared by both scenes.
 * - Renders only while the host is on screen and the tab is visible.
 * - With reduced motion it renders single frames and only keeps looping while
 *   the scene reports user-triggered activity (`onFrame` returns true).
 * - Caps the device pixel ratio (1.5 desktop, 1.25 low detail).
 */
export class Stage {
  readonly renderer: WebGLRenderer;
  readonly scene = new Scene();
  readonly camera: PerspectiveCamera;
  readonly canvas: HTMLCanvasElement;
  /** Simulation time in seconds; frozen while the loop is paused. */
  time = 0;
  onFrame: (dt: number, time: number) => boolean = () => false;
  onResize: (width: number, height: number) => void = () => {};

  private raf = 0;
  private last = 0;
  private onScreen = false;
  private pageVisible = typeof document === 'undefined' ? true : !document.hidden;
  private readonly io: IntersectionObserver;
  private readonly ro: ResizeObserver;
  private disposed = false;

  constructor(
    private readonly host: HTMLElement,
    private readonly opts: StageOptions,
  ) {
    this.renderer = new WebGLRenderer({
      antialias: !opts.lowDetail,
      alpha: true,
      powerPreference: 'default',
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, opts.lowDetail ? 1.25 : 1.5));
    this.renderer.setClearColor(0x000000, 0);
    this.canvas = this.renderer.domElement;
    this.canvas.setAttribute('role', 'img');
    this.canvas.setAttribute('aria-label', opts.ariaLabel);
    this.canvas.style.display = 'block';
    this.canvas.style.width = '100%';
    this.canvas.style.height = '100%';
    host.appendChild(this.canvas);

    this.scene.fog = new Fog(opts.fogColor, opts.fogNear, opts.fogFar);
    this.camera = new PerspectiveCamera(opts.fov ?? 40, 4 / 3, 0.1, 120);

    this.ro = new ResizeObserver(() => this.resize());
    this.ro.observe(host);
    this.io = new IntersectionObserver(
      (entries) => {
        this.onScreen = entries.some((e) => e.isIntersecting);
        if (this.onScreen) this.wake();
      },
      { threshold: 0.01 },
    );
    this.io.observe(host);
    document.addEventListener('visibilitychange', this.onVisibility);
    this.resize();
  }

  get reducedMotion() {
    return this.opts.reducedMotion;
  }

  /** Request at least one more frame (and keep looping if motion is allowed). */
  wake() {
    if (this.disposed || this.raf || !this.onScreen || !this.pageVisible) return;
    this.last = performance.now();
    this.raf = requestAnimationFrame(this.tick);
  }

  private tick = (now: number) => {
    this.raf = 0;
    if (this.disposed) return;
    const dt = Math.min(Math.max((now - this.last) / 1000, 0), 1 / 20);
    this.last = now;
    this.time += dt;
    const busy = this.onFrame(dt, this.time);
    this.renderer.render(this.scene, this.camera);
    if (this.onScreen && this.pageVisible && (!this.opts.reducedMotion || busy)) {
      this.raf = requestAnimationFrame(this.tick);
    }
  };

  private onVisibility = () => {
    this.pageVisible = !document.hidden;
    if (this.pageVisible) this.wake();
  };

  private resize() {
    const w = Math.max(1, this.host.clientWidth);
    const h = Math.max(1, this.host.clientHeight);
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.onResize(w, h);
    // Render a fresh frame immediately so a paused stage is never stretched.
    if (!this.raf && !this.disposed) {
      this.onFrame(0, this.time);
      this.renderer.render(this.scene, this.camera);
    }
  }

  dispose() {
    this.disposed = true;
    cancelAnimationFrame(this.raf);
    this.io.disconnect();
    this.ro.disconnect();
    document.removeEventListener('visibilitychange', this.onVisibility);
    const geometries = new Set<BufferGeometry>();
    const materials = new Set<Material>();
    this.scene.traverse((obj) => {
      const mesh = obj as Mesh;
      if (mesh.geometry) geometries.add(mesh.geometry);
      const mat = mesh.material as Material | Material[] | undefined;
      if (Array.isArray(mat)) mat.forEach((m) => materials.add(m));
      else if (mat) materials.add(mat);
    });
    geometries.forEach((g) => g.dispose());
    materials.forEach((m) => m.dispose());
    this.renderer.dispose();
    this.renderer.forceContextLoss();
    this.canvas.remove();
  }
}
