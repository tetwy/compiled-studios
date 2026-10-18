import React from 'react';

export const Testimonials: React.FC = () => {
  const reviews = [
    {
      quote:
        'We spent twenty agonizing minutes trying to repair a lower-deck hull puncture, only for our helmsman to drop an explosive gunpowder keg down the ladder. 10/10 would sink again.',
      author: 'CaptainVex',
      role: 'Alpha Playtester #042',
      delay: '0ms',
    },
    {
      quote:
        'The physics engine turns ordinary tasks like carrying cannonballs in a storm into heart-racing tension. You genuinely feel the ship rocking under your feet.',
      author: 'SeaDog_Liam',
      role: 'Community Lead',
      delay: '100ms',
    },
    {
      quote:
        'Finally a pirate co-op game that prioritizes physical comedy, genuine cooperation, and chaotic unpredictability over endless grind.',
      author: 'NordicSailor',
      role: 'Indie Game Curator',
      delay: '200ms',
    },
  ];

  return (
    <section id="crew-logs" data-slot="testimonials" className="px-6 py-28 md:px-16 lg:px-24">
      <div className="mx-auto max-w-6xl">
        <div className="rise flex flex-col items-center text-center">
          <span className="liquid-glass inline-block rounded-full px-3.5 py-1 text-xs font-medium text-foreground mb-4">
            Early Impressions
          </span>
          <h2 className="font-serif text-4xl leading-[0.9] tracking-tight text-foreground italic md:text-5xl lg:text-6xl">
            Dispatches from the maiden voyages.
          </h2>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-6 md:grid-cols-3">
          {reviews.map((r) => (
            <figure
              key={r.author}
              className="rise liquid-glass flex flex-col rounded-2xl p-8 hover:bg-white/[0.04] transition-all"
              style={{ animationDelay: r.delay }}
            >
              <blockquote className="flex-1 text-sm leading-relaxed font-light text-foreground/80 italic">
                “{r.quote}”
              </blockquote>
              <figcaption className="mt-8 border-t border-white/5 pt-4">
                <p className="text-sm font-medium text-foreground">{r.author}</p>
                <p className="mt-0.5 text-xs font-light text-foreground/50">{r.role}</p>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
};
