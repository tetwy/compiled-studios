import React, { useEffect, useRef, useState } from 'react';
import { createCrewWorld, type CrewHud, type CrewWorld } from './crewWorld';
import { HudButton, HudChip, IconWave, IconWrench } from './hud';
import type { SceneProps } from './types';

/**
 * Interactive "shared catastrophe" toy: leaks spring in the deck, click one to send
 * the nearest crewmate (each player colour) to patch it; a rogue wave knocks someone
 * down and a friend runs over to revive them. Drag to orbit the ship.
 */
export default function CrewScene({ palette, reducedMotion, lowDetail }: SceneProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const worldRef = useRef<CrewWorld | null>(null);
  const [hud, setHud] = useState<CrewHud | null>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const world = createCrewWorld(host, {
      palette,
      reducedMotion,
      lowDetail,
      ariaLabel:
        'Interactive 3D scene: a low-poly pirate ship with four colour-coded crewmates patching leaks in the deck. Use the Patch button to send the nearest crewmate, or click a glowing leak. Drag to rotate the view.',
      onHud: setHud,
    });
    worldRef.current = world;
    return () => {
      world.dispose();
      worldRef.current = null;
    };
  }, [palette, reducedMotion, lowDetail]);

  const hull = hud?.hull ?? 100;
  const hullTone = hull < 40 ? 'text-rose-400' : hull < 70 ? 'text-amber-300' : 'text-cyan-300';
  const patchLabel = hud?.down ? 'Revive' : 'Patch';

  return (
    <div className="absolute inset-0 select-none">
      <div ref={hostRef} className="absolute inset-0" style={{ touchAction: 'pan-y' }} />

      <div className="pointer-events-none absolute left-3 right-3 top-3 z-30 flex items-start justify-between gap-2">
        <div className="flex flex-col gap-1.5" aria-live="polite">
          <HudChip>
            <span className={hullTone}>Hull {hull}%</span>
            <span className="mx-1.5 text-white/30">/</span>
            Leaks {hud?.leaks ?? 0}
          </HudChip>
          <HudChip className="hidden sm:block">Patched {hud?.patched ?? 0}</HudChip>
        </div>
        <div className="flex gap-1.5">
          <HudButton tone="primary" onClick={() => worldRef.current?.patchNext()}>
            <IconWrench /> {patchLabel}
          </HudButton>
          <HudButton onClick={() => worldRef.current?.rogueWave()} aria-label="Send a rogue wave">
            <IconWave />
            <span className="hidden sm:inline">Rogue wave</span>
          </HudButton>
        </div>
      </div>

      {hud?.toast && (
        <div className="pointer-events-none absolute inset-x-0 top-[24%] z-30 flex justify-center px-4">
          <span className="animate-in zoom-in-50 fade-in text-center font-cyber text-base font-black uppercase italic tracking-wider text-white drop-shadow-[0_0_14px_rgba(34,211,238,0.85)] sm:text-xl">
            {hud.toast}
          </span>
        </div>
      )}

      <p className="pointer-events-none absolute inset-x-0 bottom-14 z-30 hidden text-center font-mono text-[11px] uppercase tracking-widest text-white/45 sm:block">
        Click a leak to send a crewmate · drag to look around
      </p>
    </div>
  );
}
