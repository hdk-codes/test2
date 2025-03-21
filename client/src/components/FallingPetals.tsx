import { useEffect, useRef } from 'react';

export default function FallingPetals() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const createPetal = () => {
      const petal = document.createElement('div');
      petal.className = 'petal';
      petal.style.left = `${Math.random() * 100}%`;
      petal.style.animationDuration = `${2 + Math.random() * 3}s`;
      petal.style.transform = `rotate(${Math.random() * 360}deg)`;
      container.appendChild(petal);

      petal.addEventListener('animationend', () => petal.remove());
    };

    const interval = setInterval(createPetal, 200);
    return () => clearInterval(interval);
  }, []);

  return <div ref={containerRef} className="fixed inset-0 pointer-events-none z-50" />;
}