import React from 'react';
import { MessageSquare } from 'lucide-react';
import { motion } from 'framer-motion';

export const Cta: React.FC = () => {
  return (
    <section data-slot="cta" className="relative overflow-hidden px-6 pt-32 pb-8 md:px-16 lg:px-24">
      {/* 3D Floating Raytraced Neon Glass Gaming Assets */}
      <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_70%_60%_at_50%_60%,rgba(168,85,247,0.08),transparent_80%)] pointer-events-none" />
      <motion.img
        animate={{ y: [0, -14, 0], rotate: [-2, 3, -2] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        src="/assets/3d/neon-gamepad.png"
        alt="3D Neon Gamepad"
        className="absolute -left-12 top-1/4 size-72 sm:size-88 opacity-30 filter drop-shadow-[0_0_40px_rgba(168,85,247,0.35)] pointer-events-none select-none"
      />
      <motion.img
        animate={{ y: [0, 16, 0], rotate: [0, -4, 0] }}
        transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
        src="/assets/3d/neon-joystick.png"
        alt="3D Neon Gaming Cursor & Joystick"
        className="absolute -right-12 bottom-12 size-64 sm:size-80 opacity-30 filter drop-shadow-[0_0_40px_rgba(56,189,248,0.35)] pointer-events-none select-none"
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

      <div className="relative z-10 mx-auto max-w-6xl">
        <div className="rise flex flex-col items-center text-center">
          <span className="liquid-glass inline-block rounded-full px-3.5 py-1 text-xs font-medium text-foreground mb-4">
            Alpha Signups Open
          </span>
          <h2 className="font-serif text-4xl leading-[0.9] tracking-tight text-foreground italic max-w-3xl md:text-6xl lg:text-7xl">
            Your next voyage starts here.
          </h2>
          <p className="mt-6 max-w-lg text-sm leading-relaxed font-light text-foreground/70 md:text-base">
            Enlist your crew for closed playtest rounds, give direct feedback to the dev team, and secure your place on the high seas.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <a
              href="https://discord.gg/553fnf7UqW"
              target="_blank"
              rel="noreferrer"
              data-slot="glass-button"
              className="liquid-glass-strong inline-flex shrink-0 items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-medium text-foreground transition-all hover:bg-white/10 hover:scale-105 active:scale-95"
            >
              <MessageSquare className="size-4" />
              <span>Join Alpha Discord</span>
            </a>

            <button
              type="button"
              disabled
              className="liquid-glass inline-flex shrink-0 items-center justify-center gap-2.5 rounded-full text-sm font-medium whitespace-nowrap text-foreground/50 px-6 py-3 border border-white/10 cursor-not-allowed opacity-70 select-none"
            >
              <span>Wishlist on Steam</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-400/10 text-cyan-400 border border-cyan-400/20 font-mono font-medium">Soon</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <footer
          data-slot="footer"
          className="mt-32 flex flex-col items-center justify-between gap-6 border-t border-white/10 pt-8 text-xs text-foreground/50 sm:flex-row"
        >
          <div className="flex items-center gap-3">
            <img
              src="/assets/logo.png"
              alt="Compiled Studio"
              className="h-6 w-auto object-contain brightness-110"
            />
            <p>© 2026 Compiled Studio. All rights reserved.</p>
          </div>

          <nav className="flex flex-wrap items-center gap-6">
            <a href="https://discord.gg/553fnf7UqW" target="_blank" rel="noreferrer" className="transition-colors hover:text-foreground">
              Discord
            </a>
            <a href="https://x.com/Compiledstudios" target="_blank" rel="noreferrer" className="transition-colors hover:text-foreground">
              X (Twitter)
            </a>
            <a href="https://www.youtube.com/@Compiledstudios" target="_blank" rel="noreferrer" className="transition-colors hover:text-foreground">
              YouTube
            </a>
            <a href="https://www.instagram.com/compiledstudios/" target="_blank" rel="noreferrer" className="transition-colors hover:text-foreground">
              Instagram
            </a>
            <a href="https://store.steampowered.com" target="_blank" rel="noreferrer" className="transition-colors hover:text-foreground">
              Steam
            </a>
          </nav>
        </footer>
      </div>
    </section>
  );
};
