import { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParallax } from '@/hooks/useParallax';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import FloatingHearts from './FloatingHearts';

interface LandingSectionProps {
  scrollProgress?: number;
  isActive?: boolean;
  progress?: number;
  onContinue?: () => void;
}

export default function LandingSection({ 
  scrollProgress = 0, 
  isActive = false, 
  progress = 0,
  onContinue
}: LandingSectionProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLHeadingElement>(null);
  const parallaxRef = useRef<HTMLDivElement>(null);
  const heartRef = useRef<HTMLDivElement>(null);

  useParallax(parallaxRef, 0.2);
  useScrollReveal(textRef);

  return (
    <section 
      ref={containerRef}
      className="min-h-screen w-full flex flex-col items-center justify-center relative overflow-hidden"
    >
      {/* Romantic background overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-rose-500/30 to-purple-900/50 z-0" />

      <FloatingHearts count={15} />

      <div 
        ref={parallaxRef}
        className="relative z-10 max-w-2xl mx-auto px-4 text-center"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1 }}
          className="mb-8"
          ref={heartRef}
        >
          <div className="text-6xl">❤️</div>
        </motion.div>

        <h1 
          ref={textRef}
          className="font-['Dancing_Script'] text-5xl md:text-7xl text-white mb-6"
        >
          My Dearest Love
        </h1>

        <p className="text-white/90 text-lg md:text-xl mb-8 leading-relaxed">
          Every moment with you is a gift, every memory a treasure.
          Let me share with you how much you mean to me...
        </p>

        <button
          onClick={onContinue}
          className="px-8 py-3 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full 
                   text-white border border-white/30 transition duration-300"
        >
          Continue Our Journey ↓
        </button>
      </div>
    </section>
  );
}