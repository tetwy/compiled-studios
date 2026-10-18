import React from 'react';
import { motion } from 'framer-motion';

export const Stats: React.FC = () => {
  const metrics: { label: string; value: React.ReactNode }[] = [
    { label: 'Crew Squad Size', value: '2–4' },
    {
      label: 'PhysX Simulation Rate',
      value: (
        <span>
          60<span className="text-lg md:text-2xl font-normal opacity-65 ml-1 tracking-normal">Hz</span>
        </span>
      ),
    },
    {
      label: 'Unscripted Interactions',
      value: (
        <span>
          100<span className="text-lg md:text-2xl font-normal opacity-65 ml-1 tracking-normal">%</span>
        </span>
      ),
    },
    { label: 'Predictable Voyages', value: '0' },
  ];

  return (
    <section data-slot="stats" className="relative overflow-hidden px-6 py-28 md:px-16 lg:px-24">
      {/* Background radial glow */}
      <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_50%,rgba(168,85,247,0.06),transparent_80%)]" />

      {/* 3D Floating Neon Trophy in Background */}
      <motion.img
        animate={{ y: [0, 16, 0], rotate: [0, 4, 0] }}
        transition={{ duration: 7.5, repeat: Infinity, ease: 'easeInOut' }}
        src="/assets/3d/neon-trophy.png"
        alt="3D Neon Gaming Trophy"
        className="absolute -left-10 -bottom-10 size-72 sm:size-84 opacity-25 filter drop-shadow-[0_0_40px_rgba(245,158,11,0.3)] pointer-events-none select-none"
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 z-[1] h-[180px] bg-gradient-to-b from-black to-transparent"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 z-[1] h-[180px] bg-gradient-to-t from-black to-transparent"
      />

      <dl className="rise liquid-glass-strong relative z-10 mx-auto grid max-w-6xl grid-cols-2 gap-8 rounded-3xl p-10 text-center md:p-16 lg:grid-cols-4 border border-white/10">
        {metrics.map((m) => (
          <div key={m.label} className="flex flex-col gap-2">
            <dt className="order-2 text-xs md:text-sm font-light text-foreground/60">{m.label}</dt>
            <dd className="font-serif text-4xl tracking-tight text-foreground italic tabular-nums md:text-5xl lg:text-6xl">
              {m.value}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
};
