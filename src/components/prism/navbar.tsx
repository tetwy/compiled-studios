import React, { useState } from 'react';
import { ArrowUpRight, Menu, X } from 'lucide-react';

export const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header data-slot="navbar" className="fixed inset-x-0 top-4 z-50 px-6 lg:px-16">
      <nav className="flex items-center justify-between gap-4 md:grid md:grid-cols-[1fr_auto_1fr]">
        <a href="#home" aria-label="Compiled Studio home" className="justify-self-start flex items-center gap-3">
          <img
            src="/assets/logo.png"
            alt="Compiled Studio"
            className="h-8 w-auto object-contain brightness-110 drop-shadow-[0_0_12px_rgba(255,255,255,0.25)]"
          />
          <span className="text-lg font-medium tracking-tight text-foreground hidden sm:inline-block">
            Compiled Studio
          </span>
        </a>

        {/* Floating pill navigation with liquid-glass */}
        <div className="liquid-glass flex items-center gap-1 rounded-full p-1.5 md:ps-2">
          <div className="hidden items-center md:flex">
            <a href="#home" className="px-3.5 py-1.5 text-sm font-medium text-foreground/80 transition-colors hover:text-foreground">
              Home
            </a>
            <a href="#voyage" className="px-3.5 py-1.5 text-sm font-medium text-foreground/80 transition-colors hover:text-foreground">
              The Voyage
            </a>
            <a href="#gameplay" className="px-3.5 py-1.5 text-sm font-medium text-foreground/80 transition-colors hover:text-foreground">
              How to Pirate
            </a>
            <a href="#pillars" className="px-3.5 py-1.5 text-sm font-medium text-foreground/80 transition-colors hover:text-foreground">
              Pillars
            </a>
          </div>

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="inline-flex shrink-0 items-center justify-center rounded-full text-foreground/80 hover:text-foreground hover:bg-white/10 size-8 md:hidden"
            type="button"
            aria-label="Toggle menu"
          >
            {isOpen ? <X className="size-4" /> : <Menu className="size-4" />}
          </button>

          <a
            href="https://discord.gg/553fnf7UqW"
            target="_blank"
            rel="noreferrer"
            className="inline-flex shrink-0 items-center justify-center text-xs sm:text-sm font-medium whitespace-nowrap bg-white text-black hover:bg-white/90 h-8 gap-1.5 rounded-full px-3.5 transition-all shadow-[0_0_20px_rgba(255,255,255,0.2)]"
          >
            <span>Enlist Alpha</span>
            <ArrowUpRight className="size-3.5" />
          </a>
        </div>

        <div className="hidden md:flex justify-self-end items-center" />
      </nav>

      {/* Mobile drawer */}
      {isOpen && (
        <div className="liquid-glass-strong mt-3 rounded-2xl p-4 md:hidden flex flex-col gap-2 border border-white/10">
          <a
            href="#home"
            onClick={() => setIsOpen(false)}
            className="px-3 py-2 text-sm font-medium text-foreground/90 hover:text-white"
          >
            Home
          </a>
          <a
            href="#voyage"
            onClick={() => setIsOpen(false)}
            className="px-3 py-2 text-sm font-medium text-foreground/90 hover:text-white"
          >
            The Voyage
          </a>
          <a
            href="#gameplay"
            onClick={() => setIsOpen(false)}
            className="px-3 py-2 text-sm font-medium text-foreground/90 hover:text-white"
          >
            How to Pirate
          </a>
          <a
            href="#pillars"
            onClick={() => setIsOpen(false)}
            className="px-3 py-2 text-sm font-medium text-foreground/90 hover:text-white"
          >
            Pillars
          </a>
        </div>
      )}
    </header>
  );
};
