import React from 'react';
import { MessageSquare } from 'lucide-react';
import { useReducedMotion } from 'framer-motion';

export const Hero: React.FC = () => {
  const reduceMotion = useReducedMotion();
  return (
    <section id="home" data-slot="hero" className="relative flex min-h-svh flex-col overflow-hidden">
      {/* Background Video (Muted, Direct Play, Watermark Cropped) */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        {reduceMotion ? (
          <img
            className="h-full w-full object-cover scale-[1.12] origin-center"
            src="/media/hero-poster.webp"
            alt=""
            aria-hidden="true"
          />
        ) : (
          <video
            className="h-full w-full object-cover scale-[1.12] origin-center"
            poster="/media/hero-poster.webp"
            preload="metadata"
            autoPlay
            loop
            muted
            playsInline
            aria-hidden="true"
            tabIndex={-1}
          >
            <source src="/media/hero-kling.webm" type="video/webm" />
            <source src="/media/hero-kling.mp4" type="video/mp4" />
          </video>
        )}
      </div>

      {/* Dark gradient vignette & masks */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 z-[1] h-[220px] bg-gradient-to-t from-black via-black/80 to-transparent"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 z-[1] h-[160px] bg-gradient-to-b from-black/80 to-transparent"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 z-0 bg-black/40 backdrop-brightness-90"
      />

      {/* Hero Content */}
      <div className="relative z-10 flex flex-1 flex-col items-center px-6 pt-36 text-center md:pt-44">
        {/* Game Title Headline */}
        <h1 className="mt-6 max-w-5xl font-game text-[1.55rem] leading-[1.15] tracking-[0.04em] min-[420px]:text-3xl sm:text-4xl sm:tracking-[0.08em] uppercase font-black text-foreground drop-shadow-[0_4px_28px_rgba(0,0,0,0.95)] md:text-6xl lg:text-[4.75rem]">
          <span dir="auto" className="inline-flex flex-wrap justify-center gap-x-[0.3em]">
            <span className="word-rise" style={{ animationDelay: '0ms' }}>Unforgettable</span>
            <span className="word-rise" style={{ animationDelay: '100ms' }}>Stories</span>
            <span className="word-rise text-foreground/80" style={{ animationDelay: '200ms' }}>Forged</span>
            <span className="word-rise text-foreground/80" style={{ animationDelay: '300ms' }}>In</span>
            <span className="word-rise bg-gradient-to-r from-purple-400 via-fuchsia-400 to-violet-400 bg-clip-text text-transparent drop-shadow-[0_0_35px_rgba(168,85,247,0.65)]" style={{ animationDelay: '400ms' }}>Chaos</span>
          </span>
        </h1>

        {/* Subtitle */}
        <p className="rise-still mt-6 max-w-2xl text-sm leading-relaxed font-normal text-foreground/80 md:text-base [animation-delay:0.8s]">
          Compiled Studio is an independent studio crafting interactive worlds where you and your crewmates solve crises together, experiment with real-time physics, and laugh through unexpected catastrophes.
        </p>

        {/* Action Button */}
        <div className="rise mt-8 flex flex-wrap items-center justify-center gap-4 [animation-delay:1.1s]">
          <a
            href="https://discord.gg/553fnf7UqW"
            target="_blank"
            rel="noreferrer"
            data-slot="glass-button"
            className="liquid-glass-strong inline-flex shrink-0 items-center justify-center gap-2.5 rounded-full px-7 py-3 text-sm font-semibold tracking-wider uppercase text-foreground transition-all hover:bg-white/10 hover:scale-105 active:scale-95"
          >
            <MessageSquare className="size-4" />
            <span>Join Alpha Discord</span>
          </a>
          <button
            type="button"
            disabled
            className="liquid-glass inline-flex shrink-0 items-center justify-center gap-2.5 rounded-full px-7 py-3 text-sm font-semibold tracking-wider uppercase text-foreground/60 cursor-not-allowed border border-white/10 opacity-70 select-none"
          >
            <span>Wishlist on Steam</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-400/10 text-cyan-400 border border-cyan-400/20 font-mono font-medium">Soon</span>
          </button>
        </div>

        {/* Tech & Platform bar */}
        <div data-slot="partners" className="rise mt-auto flex w-full flex-col items-center gap-4 pt-16 pb-8">
          <ul className="flex w-full flex-nowrap items-center gap-x-8 overflow-x-auto px-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:flex-wrap sm:justify-center sm:gap-x-10 sm:gap-y-3 sm:overflow-visible">
            <li className="shrink-0 whitespace-nowrap font-serif text-lg tracking-tight text-foreground/90 italic sm:text-2xl md:text-3xl">Unity 6</li>
            <li className="shrink-0 whitespace-nowrap font-serif text-lg tracking-tight text-foreground/90 italic sm:text-2xl md:text-3xl">PhysX 50Hz</li>
            <li className="shrink-0 whitespace-nowrap font-serif text-lg tracking-tight text-foreground/90 italic sm:text-2xl md:text-3xl">Steamworks</li>
            <li className="shrink-0 whitespace-nowrap font-serif text-lg tracking-tight text-foreground/90 italic sm:text-2xl md:text-3xl">Spatial Acoustics</li>
            <li className="shrink-0 whitespace-nowrap font-serif text-lg tracking-tight text-foreground/90 italic sm:text-2xl md:text-3xl">Netcode for GameObjects</li>
          </ul>
        </div>
      </div>
    </section>
  );
};
