import React from 'react';

/** Small HUD primitives styled like the site's glass chips (Tailwind classes only). */
export const HudChip: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div
    className={`pointer-events-none rounded-md border border-white/10 bg-black/55 px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider text-white/80 backdrop-blur-md sm:text-[11px] ${className}`}
  >
    {children}
  </div>
);

export const HudButton = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & { tone?: 'primary' | 'ghost' }
>(({ tone = 'ghost', className = '', children, ...rest }, ref) => (
  <button
    ref={ref}
    type="button"
    className={`pointer-events-auto inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 font-mono text-[10px] font-semibold uppercase tracking-wider backdrop-blur-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 disabled:cursor-not-allowed disabled:opacity-40 sm:text-[11px] ${
      tone === 'primary'
        ? 'border-purple-400/50 bg-purple-500/25 text-white shadow-[0_0_18px_rgba(168,85,247,0.35)] hover:bg-purple-500/40'
        : 'border-white/15 bg-black/55 text-white/80 hover:bg-white/10'
    } ${className}`}
    {...rest}
  >
    {children}
  </button>
));
HudButton.displayName = 'HudButton';

export const IconFire = () => (
  <svg viewBox="0 0 24 24" className="size-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="12" cy="12" r="3" />
    <path d="M12 2v4M12 18v4M2 12h4M18 12h4" />
  </svg>
);

export const IconReset = () => (
  <svg viewBox="0 0 24 24" className="size-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M3 12a9 9 0 1 0 3-6.7L3 8" />
    <path d="M3 3v5h5" />
  </svg>
);

export const IconWrench = () => (
  <svg viewBox="0 0 24 24" className="size-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 0 0 5.4-5.4l-2.5 2.5-2.4-.6-.6-2.4z" />
  </svg>
);

export const IconWave = () => (
  <svg viewBox="0 0 24 24" className="size-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M2 12c2-3 4-3 6 0s4 3 6 0 4-3 6 0" />
    <path d="M2 18c2-3 4-3 6 0s4 3 6 0 4-3 6 0" />
  </svg>
);
