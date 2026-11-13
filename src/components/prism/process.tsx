import React from 'react';
import { ArrowUpRight, Anchor, Navigation, ShieldAlert, Award } from 'lucide-react';
import { motion } from 'framer-motion';

export const Process: React.FC = () => {
  const steps = [
    {
      num: '01',
      icon: Anchor,
      title: 'Haul Cargo at Port',
      desc: 'Pick up fragile goods, explosive gunpowder, and mysterious crates. Stack and secure them before setting sail.',
    },
    {
      num: '02',
      icon: Navigation,
      title: 'Command as a Crew',
      desc: 'One helms the wheel, others adjust sails and watch for submerged reefs, stormy squalls, and spectral ships.',
    },
    {
      num: '03',
      icon: ShieldAlert,
      title: 'Survive the Hazard',
      desc: 'Hull breaches flood decks, rogue waves knock crates overboard, and cannon recoil pushes your mates into the sea.',
    },
    {
      num: '04',
      icon: Award,
      title: 'Deliver & Re-equip',
      desc: 'Reach the mysterious island docks, claim bounties, upgrade ship gear, and prep for deeper, deadlier expeditions.',
    },
  ];

  return (
    <section id="voyage" data-slot="process" className="relative flex min-h-[750px] items-center overflow-hidden px-6 py-32 md:px-16 lg:px-24">
      {/* 3D Transparent Floating Neon Assets in Background */}
      <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_40%,rgba(168,85,247,0.08),transparent_80%)] pointer-events-none" />
      <motion.img
        animate={{ rotate: 360, y: [0, -14, 0] }}
        transition={{
          rotate: { duration: 70, repeat: Infinity, ease: 'linear' },
          y: { duration: 7, repeat: Infinity, ease: 'easeInOut' },
        }}
        src="/assets/3d/neon-helm.webp"
        alt="3D Neon Helm"
        className="absolute -right-20 top-1/4 size-80 sm:size-96 opacity-30 filter drop-shadow-[0_0_40px_rgba(217,70,239,0.35)] pointer-events-none select-none"
      />
      <motion.img
        animate={{ y: [0, 16, 0], rotate: [0, 5, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        src="/assets/3d/neon-joystick.webp"
        alt="3D Neon Gaming Cursor & Joystick"
        className="absolute -left-16 bottom-16 size-72 sm:size-84 opacity-30 filter drop-shadow-[0_0_40px_rgba(56,189,248,0.35)] pointer-events-none select-none"
      />

      {/* Gradients */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 z-[1] h-[220px] bg-gradient-to-b from-black to-transparent"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 z-[1] h-[220px] bg-gradient-to-t from-black to-transparent"
      />

      {/* Central Content */}
      <div className="rise relative z-10 mx-auto flex w-full max-w-4xl flex-col items-center justify-center text-center">
        <span className="liquid-glass inline-block rounded-full px-3.5 py-1 text-xs font-medium text-foreground mb-4">
          Core Game Loop
        </span>

        <h2 className="font-serif text-4xl leading-[0.9] tracking-tight text-foreground italic md:text-5xl lg:text-6xl">
          Pick up cargo. Manage the ship. Survive the voyage.
        </h2>

        <p className="mt-6 max-w-2xl text-sm leading-relaxed font-light text-foreground/70 md:text-base">
          From bustling harbors to cursed uncharted waters—haul crates, aim cannons, bail out rising floodwaters, and rescue crewmates before the abyss claims your vessel.
        </p>

        {/* 4 Interactive loop cards */}
        <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 w-full text-left">
          {steps.map((s) => {
            const Icon = s.icon;
            return (
              <div key={s.num} className="liquid-glass rounded-2xl p-5 hover:bg-white/[0.04] transition-all">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-mono font-medium text-foreground/40">{s.num}</span>
                  <Icon className="size-4 text-foreground/70" />
                </div>
                <h3 className="font-serif text-lg text-foreground italic">{s.title}</h3>
                <p className="mt-2 text-xs leading-relaxed text-foreground/60">{s.desc}</p>
              </div>
            );
          })}
        </div>

        <a
          href="https://discord.gg/553fnf7UqW"
          target="_blank"
          rel="noreferrer"
          data-slot="glass-button"
          className="liquid-glass-strong inline-flex shrink-0 items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-medium text-foreground transition-all hover:bg-white/10 mt-10 hover:scale-105 active:scale-95"
        >
          <span>Join the Closed Alpha</span>
          <ArrowUpRight className="size-4" />
        </a>
      </div>
    </section>
  );
};
