import React from 'react';
import { Users, Waves, Skull, MessageSquareQuote } from 'lucide-react';
import { motion } from 'framer-motion';

export const Benefits: React.FC = () => {
  const pillars = [
    {
      icon: Users,
      title: '2–4 Player Synergy',
      desc: 'No single player can steer, shoot, pump, and repair alone. Success demands seamless collaboration and constant voice communication.',
      delay: '0ms',
    },
    {
      icon: Waves,
      title: 'True Physical Comedy',
      desc: 'Ragdoll mechanics, heavy recoil, and unscripted physics interactions turn every ordinary voyage into hilarious emergent stories.',
      delay: '100ms',
    },
    {
      icon: Skull,
      title: 'Atmospheric Horror',
      desc: 'Dense night fogs, ghost galleons, stormy sea trenches, and eldritch marine creatures create genuine suspense on the open waters.',
      delay: '200ms',
    },
    {
      icon: MessageSquareQuote,
      title: 'Community-Led Alpha',
      desc: 'Built alongside players. Our closed alpha Discord actively tests mechanics, reports bugs, and directly shapes the roadmap.',
      delay: '300ms',
    },
  ];

  return (
    <section id="pillars" data-slot="benefits" className="relative px-6 py-28 md:px-16 lg:px-24 overflow-hidden">
      {/* 3D Floating Neon D20 Gaming Dice in Background */}
      <motion.img
        animate={{ y: [0, -18, 0], rotate: [-4, 6, -4] }}
        transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
        src="/assets/3d/neon-dice.webp"
        alt="3D Neon Gaming Dice"
        className="absolute -right-16 top-6 size-80 sm:size-96 opacity-25 filter drop-shadow-[0_0_45px_rgba(168,85,247,0.35)] pointer-events-none select-none"
      />
      <div className="mx-auto max-w-6xl relative z-10">
        <div className="rise flex flex-col items-center text-center">
          <span className="liquid-glass inline-block rounded-full px-3.5 py-1 text-xs font-medium text-foreground mb-4">
            Studio Pillars
          </span>
          <h2 className="font-serif text-4xl leading-[0.9] tracking-tight text-foreground italic md:text-5xl lg:text-6xl">
            Crafted for connection and comedy.
          </h2>
          <p className="mt-4 max-w-xl text-sm leading-relaxed text-foreground/60">
            Compiled Studio focuses on interactive worlds where players experiment together and solve problems through physical cooperation.
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {pillars.map((p) => {
            const Icon = p.icon;
            return (
              <article
                key={p.title}
                className="rise liquid-glass rounded-2xl p-6 transition-transform hover:-translate-y-1 hover:bg-white/[0.04]"
                style={{ animationDelay: p.delay }}
              >
                <span className="liquid-glass-strong flex size-10 items-center justify-center rounded-full text-foreground mb-6">
                  <Icon className="size-4" />
                </span>
                <h3 className="font-serif text-xl text-foreground italic">{p.title}</h3>
                <p className="mt-3 text-sm leading-relaxed font-light text-foreground/60">
                  {p.desc}
                </p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
};
