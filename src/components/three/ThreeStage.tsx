import React, { Component, Suspense, lazy, useEffect, useRef, useState } from 'react';
import type { PaletteName } from './palette';

// Each scene is its own chunk; three.js is shared and only fetched when a stage nears the viewport.
const CannonScene = lazy(() => import('./CannonScene'));
const CrewScene = lazy(() => import('./CrewScene'));

export type ThreeSceneName = 'cannon' | 'crew';

export interface ThreeStageProps {
  scene: ThreeSceneName;
  /** Rendered when WebGL is unavailable or the scene fails to load. */
  fallback?: React.ReactNode;
  palette?: PaletteName;
  className?: string;
}

function hasWebGL(): boolean {
  try {
    const c = document.createElement('canvas');
    const gl = (c.getContext('webgl2') || c.getContext('webgl')) as WebGLRenderingContext | null;
    // Release the probe context right away (browsers cap live contexts).
    gl?.getExtension('WEBGL_lose_context')?.loseContext();
    return !!gl;
  } catch {
    return false;
  }
}

function useMedia(query: string): boolean {
  const [match, setMatch] = useState(() => typeof window !== 'undefined' && window.matchMedia(query).matches);
  useEffect(() => {
    const mq = window.matchMedia(query);
    const on = () => setMatch(mq.matches);
    on();
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, [query]);
  return match;
}

class SceneBoundary extends Component<{ fallback: React.ReactNode; children: React.ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch(error: unknown) {
    console.warn('[ThreeStage] scene disabled:', error);
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

const Loading: React.FC = () => (
  <div className="absolute inset-0 flex items-center justify-center" aria-hidden="true">
    <div className="size-8 animate-spin rounded-full border-2 border-white/10 border-t-purple-400/80" />
  </div>
);

/**
 * Drop-in slot for the services cards: mounts the 3D scene only once it is near
 * the viewport, honours prefers-reduced-motion (static frame, motion only on user
 * action), lowers detail on small/touch screens and falls back when WebGL is missing.
 * The parent must be `position: relative` with a size (e.g. aspect-[4/3]).
 */
export function ThreeStage({ scene, fallback = null, palette = 'neon', className = '' }: ThreeStageProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [near, setNear] = useState(false);
  const [webgl, setWebgl] = useState<boolean | null>(null);
  const reducedMotion = useMedia('(prefers-reduced-motion: reduce)');
  const lowDetail = useMedia('(max-width: 640px), (pointer: coarse)');

  useEffect(() => setWebgl(hasWebGL()), []);

  useEffect(() => {
    const el = ref.current;
    if (!el || near) return;
    const io = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) {
        setNear(true);
        io.disconnect();
      }
    }, { rootMargin: '300px 0px' });
    io.observe(el);
    return () => io.disconnect();
  }, [near]);

  if (webgl === false) return <>{fallback}</>;
  const Scene = scene === 'cannon' ? CannonScene : CrewScene;
  return (
    <div ref={ref} className={`absolute inset-0 ${className}`}>
      {near && webgl && (
        <SceneBoundary fallback={fallback}>
          <Suspense fallback={<Loading />}>
            <Scene palette={palette} reducedMotion={reducedMotion} lowDetail={lowDetail} />
          </Suspense>
        </SceneBoundary>
      )}
      {!near && <Loading />}
    </div>
  );
}

export default ThreeStage;
