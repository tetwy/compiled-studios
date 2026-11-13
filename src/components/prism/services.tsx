import React from 'react';
import { ArrowUpRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { ThreeStage } from '@/components/three';

export const Services: React.FC = () => {
  return (
    <section id="gameplay" data-slot="features" className="px-6 py-28 md:px-16 lg:px-24">
      <div className="mx-auto max-w-6xl">
        <div className="rise flex flex-col items-center text-center">
          <span className="liquid-glass inline-block rounded-full px-3.5 py-1 text-xs font-medium text-foreground mb-4">
            Gameplay Mechanics
          </span>
          <h2 className="font-serif text-4xl leading-[0.9] tracking-tight text-foreground italic md:text-5xl lg:text-6xl">
            Real physical chaos. Zero pre-baked scripts.
          </h2>
        </div>

        <div className="mt-16 flex flex-col gap-16 md:mt-24 md:gap-28">
          {/* Showcase Item 1 - 3D Physics */}
          <article className="rise flex flex-col items-center gap-10 lg:flex-row lg:gap-16">
            <div className="flex-1">
              <span className="text-xs uppercase tracking-widest text-foreground/40 font-mono">Dynamic Ship Simulation</span>
              <h3 className="mt-2 font-serif text-3xl leading-[0.95] tracking-tight text-foreground italic md:text-4xl">
                Every cannon, rope, and barrel obeys momentum.
              </h3>
              <p className="mt-5 max-w-md text-sm leading-relaxed font-light text-foreground/70">
                No fake static animations. When your galleon lists against a surging rogue wave, loose cargo slides across the deck, cannons roll backward from recoil, and your clumsy crewmate might just trip overboard into the dark waters.
              </p>
            </div>

            {/* Gameplay Capture Placeholder 1 */}
            <div className="liquid-glass relative aspect-[4/3] w-full flex-1 overflow-hidden rounded-2xl border border-white/10 shadow-2xl flex flex-col items-center justify-center bg-gradient-to-br from-[#0c1420]/80 via-[#060a10] to-black group">
              {/* Subtle grid pattern background */}
              <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(56,189,248,0.06),transparent_70%)] pointer-events-none" />

              {/* Viewfinder crosshairs */}
              <div className="absolute top-4 left-4 size-4 border-t-2 border-l-2 border-white/20 z-20 pointer-events-none" />
              <div className="absolute top-4 right-4 size-4 border-t-2 border-r-2 border-white/20 z-20 pointer-events-none" />
              <div className="absolute bottom-14 left-4 size-4 border-b-2 border-l-2 border-white/20 z-20 pointer-events-none" />
              <div className="absolute bottom-14 right-4 size-4 border-b-2 border-r-2 border-white/20 z-20 pointer-events-none" />

              <ThreeStage
                scene="cannon"
                fallback={
              <div className="relative z-10 flex flex-col items-center gap-3 p-6 text-center">
                <div className="size-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-foreground/40 group-hover:text-foreground/70 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="size-6">
                    <rect width="18" height="18" x="3" y="3" rx="2" />
                    <path d="m9 8 6 4-6 4Z" />
                  </svg>
                </div>
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cyan-400/10 text-cyan-400 border border-cyan-400/20 text-[11px] font-mono uppercase tracking-wider mb-2">
                    <span className="size-1.5 rounded-full bg-cyan-400 animate-pulse" />
                    Coming Soon
                  </div>
                  <p className="text-xs font-mono uppercase tracking-widest text-foreground/50">In-Game Footage Placeholder</p>
                  <p className="text-xs text-foreground/30 mt-1">Physics & Ship Buoyancy Capture</p>
                </div>
              </div>
                }
              />

              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
              <div className="absolute bottom-4 left-4 right-4 hidden sm:flex items-center justify-between text-xs text-foreground/80 font-mono z-20 pointer-events-none">
                <span className="bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-md border border-white/10">Simulated 50 Hz PhysX</span>
                <span className="text-foreground/50">Rigid Body & Buoyancy</span>
              </div>
            </div>
          </article>

          {/* Showcase Item 2 - Co-op Synergy */}
          <article className="rise flex flex-col items-center gap-10 lg:gap-16 lg:flex-row-reverse">
            <div className="flex-1">
              <span className="text-xs uppercase tracking-widest text-foreground/40 font-mono">Co-op Synergy</span>
              <h3 className="mt-2 font-serif text-3xl leading-[0.95] tracking-tight text-foreground italic md:text-4xl">
                Laughter born directly from shared catastrophe.
              </h3>
              <p className="mt-5 max-w-md text-sm leading-relaxed font-light text-foreground/70">
                You cannot solo this ship. Repair punctured hulls with wooden planks, operate manual bilge pumps to keep from sinking, pass heavy powder kegs down the hatch, and revive fallen friends while everything around you descends into glorious chaos.
              </p>
              <button
                type="button"
                disabled
                className="liquid-glass inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium text-foreground/60 cursor-not-allowed border border-white/10 opacity-70 mt-8 select-none"
              >
                <span>Wishlist on Steam</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-400/10 text-cyan-400 border border-cyan-400/20 font-mono font-medium">Soon</span>
              </button>
            </div>

            {/* Gameplay Capture Placeholder 2 */}
            <div className="liquid-glass relative aspect-[4/3] w-full flex-1 overflow-hidden rounded-2xl border border-white/10 shadow-2xl flex flex-col items-center justify-center bg-gradient-to-br from-[#0c1420]/80 via-[#060a10] to-black group">
              {/* Subtle grid pattern background */}
              <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(168,85,247,0.06),transparent_70%)] pointer-events-none" />

              {/* Viewfinder crosshairs */}
              <div className="absolute top-4 left-4 size-4 border-t-2 border-l-2 border-white/20 z-20 pointer-events-none" />
              <div className="absolute top-4 right-4 size-4 border-t-2 border-r-2 border-white/20 z-20 pointer-events-none" />
              <div className="absolute bottom-14 left-4 size-4 border-b-2 border-l-2 border-white/20 z-20 pointer-events-none" />
              <div className="absolute bottom-14 right-4 size-4 border-b-2 border-r-2 border-white/20 z-20 pointer-events-none" />

              <ThreeStage
                scene="crew"
                fallback={
              <div className="relative z-10 flex flex-col items-center gap-3 p-6 text-center">
                <div className="size-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-foreground/40 group-hover:text-foreground/70 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="size-6">
                    <rect width="18" height="18" x="3" y="3" rx="2" />
                    <path d="m9 8 6 4-6 4Z" />
                  </svg>
                </div>
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cyan-400/10 text-cyan-400 border border-cyan-400/20 text-[11px] font-mono uppercase tracking-wider mb-2">
                    <span className="size-1.5 rounded-full bg-cyan-400 animate-pulse" />
                    Coming Soon
                  </div>
                  <p className="text-xs font-mono uppercase tracking-widest text-foreground/50">In-Game Footage Placeholder</p>
                  <p className="text-xs text-foreground/30 mt-1">Multi-Crew Cooperative Gameplay</p>
                </div>
              </div>
                }
              />

              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
              <div className="absolute bottom-4 left-4 right-4 hidden sm:flex items-center justify-between text-xs text-foreground/80 font-mono z-20 pointer-events-none">
                <span className="bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-md border border-white/10">2–4 Player Multi-Station</span>
                <span className="text-foreground/50">Emergent Physics Comedy</span>
              </div>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
};
