import React, { useEffect, useId, useRef, useState } from 'react';
import { createCannonWorld, type CannonHud, type CannonWorld } from './cannonWorld';
import { HudButton, HudChip, IconFire, IconReset } from './hud';
import type { SceneProps } from './types';

/**
 * Interactive "Every cannon obeys momentum" toy:
 * drag back from anywhere to aim (slingshot), release to fire; tap fires as aimed.
 */
export default function CannonScene({ palette, reducedMotion, lowDetail }: SceneProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const worldRef = useRef<CannonWorld | null>(null);
  const [hud, setHud] = useState<CannonHud | null>(null);
  const hintId = useId();

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const world = createCannonWorld(host, {
      palette,
      reducedMotion,
      lowDetail,
      ariaLabel:
        'Interactive 3D scene: a pirate ship cannon aimed at a pyramid of barrels on a dock. Use the Fire button, or drag on the scene to aim and release to fire.',
      onHud: setHud,
    });
    worldRef.current = world;
    return () => {
      world.dispose();
      worldRef.current = null;
    };
  }, [palette, reducedMotion, lowDetail]);

  const onFireKey = (e: React.KeyboardEvent) => {
    const w = worldRef.current;
    if (!w) return;
    const step = e.shiftKey ? 5 : 2;
    if (e.key === 'ArrowUp') w.nudgeAim(step, 0);
    else if (e.key === 'ArrowDown') w.nudgeAim(-step, 0);
    else if (e.key === 'ArrowRight') w.nudgeAim(0, 0.5);
    else if (e.key === 'ArrowLeft') w.nudgeAim(0, -0.5);
    else return;
    e.preventDefault();
  };

  return (
    <div className="absolute inset-0 select-none" style={{ touchAction: 'pan-y' }}>
      <div ref={hostRef} className="absolute inset-0 cursor-crosshair" style={{ touchAction: 'pan-y' }}>
        {/* Touch aim pad over the cannon side: blocks scrolling only where you aim. */}
        <div aria-hidden="true" className="absolute inset-y-0 left-0 w-[55%]" style={{ touchAction: 'none' }} />
      </div>

      <div className="pointer-events-none absolute left-3 right-3 top-3 z-30 flex items-start justify-between gap-2">
        <div className="flex flex-col gap-1.5">
          <HudChip>
            <span className="text-cyan-300">Shots {hud?.shots ?? 0}</span>
            <span className="mx-1.5 text-white/30">/</span>
            Overboard {hud?.overboard ?? 0}/{hud?.total ?? 10}
          </HudChip>
          <HudChip className="hidden sm:block">
            Angle {hud?.angle ?? 0}° · Power {hud?.power ?? 0}%
          </HudChip>
        </div>
        <div className="flex gap-1.5">
          <HudButton tone="primary" onClick={() => worldRef.current?.fire()} onKeyDown={onFireKey} aria-describedby={hintId}>
            <IconFire /> Fire
          </HudButton>
          <HudButton onClick={() => worldRef.current?.reset()} aria-label="Reset barrels">
            <IconReset />
            <span className="hidden sm:inline">Reset</span>
          </HudButton>
        </div>
      </div>

      {hud?.toast && (
        <div className="pointer-events-none absolute inset-x-0 top-[38%] z-30 flex justify-center">
          <span className="animate-in zoom-in-50 fade-in font-cyber text-lg font-black uppercase italic tracking-wider text-white drop-shadow-[0_0_14px_rgba(168,85,247,0.9)] sm:text-2xl">
            {hud.toast}
          </span>
        </div>
      )}

      <p
        id={hintId}
        className="pointer-events-none absolute inset-x-0 bottom-14 z-30 hidden text-center font-mono text-[11px] uppercase tracking-widest text-white/45 sm:block"
      >
        Drag back to aim · release to fire
        <span className="sr-only">. With the Fire button focused, arrow keys adjust angle and power.</span>
      </p>
    </div>
  );
}
