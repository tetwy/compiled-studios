import React, { useRef } from 'react';
import { motion, useScroll, useTransform, MotionValue } from 'framer-motion';

// Reusable FadeIn component per prompt specification
interface FadeInProps {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  x?: number;
  y?: number;
  className?: string;
  style?: React.CSSProperties;
  as?: keyof typeof motion;
}

export const FadeIn: React.FC<FadeInProps> = ({
  children,
  delay = 0,
  duration = 0.7,
  x = 0,
  y = 30,
  className = '',
  style = {},
  as = 'div',
}) => {
  const Component = (motion as unknown as Record<string, typeof motion.div>)[as] || motion.div;

  return (
    <Component
      initial={{ opacity: 0, x, y }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, margin: '50px', amount: 0 }}
      transition={{
        duration,
        delay,
        ease: [0.25, 0.1, 0.25, 1],
      }}
      className={className}
      style={style}
    >
      {children}
    </Component>
  );
};

// Single Character reveal sub-component driven by scroll
interface CharProps {
  char: string;
  index: number;
  totalChars: number;
  progress: MotionValue<number>;
}

const AnimatedChar: React.FC<CharProps> = ({ char, index, totalChars, progress }) => {
  const charProgress = index / totalChars;
  const start = Math.max(0, charProgress - 0.1);
  const end = Math.min(1, charProgress + 0.05);

  const opacity = useTransform(progress, [start, end], [0.2, 1]);

  if (char === ' ') {
    return <span className="inline-block">&nbsp;</span>;
  }

  return (
    <span className="relative inline-block">
      <span className="invisible select-none">{char}</span>
      <motion.span
        style={{ opacity }}
        className="absolute inset-0 text-[#D7E2EA] transition-colors"
      >
        {char}
      </motion.span>
    </span>
  );
};

export const AboutStudio: React.FC = () => {
  const sectionRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start 0.8', 'end 0.2'],
  });

  const statementText =
    "Compiled Studio is an independent game studio crafting unforgettable stories when played together with friends. Developing How to Pirate: a 2-4 player physics-driven co-op adventure where crewmates share the load, tackle catastrophes, and survive unexpected hilarity.";

  const characters = statementText.split('');

  return (
    <section
      ref={sectionRef}
      id="about"
      className="relative min-h-screen w-full flex flex-col justify-center items-center px-5 sm:px-8 md:px-10 py-24 sm:py-32 overflow-hidden bg-[#0C0C0C]"
      style={{ backgroundColor: '#0C0C0C' }}
    >
      {/* Ambient background glow */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_80%_60%_at_50%_50%,rgba(118,33,176,0.08),transparent)]" />

      {/* 4 Decorative corner 3D floating images (absolute positioned, z-0) */}

      {/* 1. Top-left -- 3D Neon Skull */}
      <FadeIn
        delay={0.1}
        duration={0.9}
        x={-80}
        y={0}
        className="absolute top-[4%] left-[1%] sm:left-[2%] md:left-[4%] z-0 pointer-events-none select-none"
      >
        <motion.img
          animate={{
            y: [0, -14, 0],
            rotate: [0, 3, 0],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          src="/assets/3d/neon-skull.png"
          alt="3D Neon Pirate Skull"
          className="w-[120px] sm:w-[160px] md:w-[220px] h-auto select-none filter contrast-125 brightness-110 drop-shadow-[0_0_35px_rgba(168,85,247,0.45)]"
        />
      </FadeIn>

      {/* 2. Bottom-left -- 3D Neon Compass */}
      <FadeIn
        delay={0.25}
        duration={0.9}
        x={-80}
        y={0}
        className="absolute bottom-[8%] left-[3%] sm:left-[6%] md:left-[10%] z-0 pointer-events-none select-none"
      >
        <motion.img
          animate={{
            y: [0, 16, 0],
            rotate: [0, -4, 0],
          }}
          transition={{
            duration: 7,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          src="/assets/3d/neon-compass.png"
          alt="3D Neon Compass"
          className="w-[100px] sm:w-[140px] md:w-[190px] h-auto select-none filter contrast-125 brightness-110 drop-shadow-[0_0_35px_rgba(56,189,248,0.4)]"
        />
      </FadeIn>

      {/* 3. Top-right -- 3D Neon Ship Helm */}
      <FadeIn
        delay={0.15}
        duration={0.9}
        x={80}
        y={0}
        className="absolute top-[4%] right-[1%] sm:right-[2%] md:right-[4%] z-0 pointer-events-none select-none"
      >
        <motion.img
          animate={{
            y: [0, -18, 0],
            rotate: [0, -5, 0],
          }}
          transition={{
            duration: 6.5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          src="/assets/3d/neon-helm.png"
          alt="3D Neon Ship Helm"
          className="w-[120px] sm:w-[160px] md:w-[220px] h-auto select-none filter contrast-125 brightness-110 drop-shadow-[0_0_35px_rgba(217,70,239,0.45)]"
        />
      </FadeIn>

      {/* 4. Bottom-right -- 3D Neon Anchor */}
      <FadeIn
        delay={0.3}
        duration={0.9}
        x={80}
        y={0}
        className="absolute bottom-[8%] right-[3%] sm:right-[6%] md:right-[10%] z-0 pointer-events-none select-none"
      >
        <motion.img
          animate={{
            y: [0, 14, 0],
            rotate: [0, 4, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          src="/assets/3d/neon-anchor.png"
          alt="3D Neon Anchor"
          className="w-[130px] sm:w-[170px] md:w-[230px] h-auto select-none filter contrast-125 brightness-110 drop-shadow-[0_0_35px_rgba(168,85,247,0.45)]"
        />
      </FadeIn>

      {/* Center content (relative z-10, max-w-4xl, centered) */}
      <div className="relative z-10 flex flex-col items-center max-w-4xl text-center gap-16 sm:gap-20 md:gap-24">
        {/* Group 1 -- Heading + Animated Text */}
        <div className="flex flex-col items-center gap-8 sm:gap-12 md:gap-14">
          {/* Heading */}
          <FadeIn delay={0} y={40}>
            <h2
              className="hero-heading font-kanit font-black uppercase leading-none tracking-tight text-center select-none"
              style={{ fontSize: 'clamp(2.75rem, 10vw, 130px)' }}
            >
              ABOUT US
            </h2>
          </FadeIn>

          {/* Animated paragraph (scroll-driven progressive reveal) */}
          <div className="max-w-[620px] font-kanit font-medium text-center leading-relaxed text-[#D7E2EA] px-4"
               style={{ fontSize: 'clamp(1rem, 2vw, 1.35rem)' }}>
            {characters.map((char, index) => (
              <AnimatedChar
                key={index}
                char={char}
                index={index}
                totalChars={characters.length}
                progress={scrollYProgress}
              />
            ))}
          </div>
        </div>

        {/* Group 2 -- Contact Button */}
        <FadeIn delay={0.3} y={20}>
          <a
            href="https://discord.gg"
            target="_blank"
            rel="noreferrer"
            className="inline-block rounded-full font-kanit font-medium uppercase tracking-widest text-white text-xs sm:text-sm md:text-base px-8 py-3.5 sm:px-10 sm:py-4 md:px-12 md:py-4.5 transition-all duration-200 hover:opacity-90 active:opacity-75 hover:scale-105 active:scale-95 cursor-pointer"
            style={{
              background: 'linear-gradient(123deg, #18011F 7%, #B600A8 37%, #7621B0 72%, #BE4C00 100%)',
              boxShadow: '0px 4px 4px rgba(181, 1, 167, 0.25), 4px 4px 12px #7721B1 inset',
              outline: '2px solid #E3E3E3',
              outlineOffset: '-3px',
            }}
          >
            JOIN OUR CREW
          </a>
        </FadeIn>
      </div>
    </section>
  );
};
