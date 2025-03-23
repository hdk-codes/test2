import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Canvas } from '@react-three/fiber';
import { Particles } from './Particles';

interface SpecialEffectsProps {
  effects: string[];
}

export default function SpecialEffects({ effects }: SpecialEffectsProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!effects.includes('hearts')) return;
    
    const interval = setInterval(() => {
      if (containerRef.current) {
        createFloatingHeart(containerRef.current);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [effects]);

  return (
    <div ref={containerRef} className="absolute inset-0 pointer-events-none">
      {effects.includes('sparkles') && (
        <Canvas
          camera={{ position: [0, 0, 5], fov: 75 }}
          style={{ position: 'absolute', inset: 0 }}
        >
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} />
          <Particles count={100} />
        </Canvas>
      )}
      
      {effects.includes('glow') && (
        <div className="absolute inset-0 bg-gradient-radial from-pink-500/20 to-transparent" />
      )}
    </div>
  );
}

function createFloatingHeart(container: HTMLElement) {
  const heart = document.createElement('div');
  heart.innerHTML = '❤️';
  heart.className = 'absolute text-2xl animate-float-up';
  heart.style.left = `${Math.random() * 100}%`;
  heart.style.bottom = '0';
  container.appendChild(heart);

  setTimeout(() => heart.remove(), 3000);
}
