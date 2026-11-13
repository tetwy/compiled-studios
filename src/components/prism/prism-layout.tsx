import React from 'react';
import { MotionConfig } from 'framer-motion';
import { Navbar } from './navbar';
import { Hero } from './hero';
import { Process } from './process';
import { Services } from './services';
import { Benefits } from './benefits';
import { Stats } from './stats';
import { Testimonials } from './testimonials';
import { Cta } from './cta';

export const PrismLayout: React.FC = () => {
  return (
    <MotionConfig reducedMotion="user">
    <div className="prism relative min-h-svh bg-black text-foreground antialiased overflow-x-hidden selection:bg-white/25 selection:text-white">
      <Navbar />
      <main>
        <Hero />
        <Process />
        <Services />
        <Benefits />
        <Stats />
        {/* <Testimonials /> */}
        <Cta />
      </main>
    </div>
    </MotionConfig>
  );
};

export default PrismLayout;
