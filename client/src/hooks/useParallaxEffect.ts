import { useState, useEffect, useRef } from 'react';

export function useParallaxEffect(elementRef: React.RefObject<HTMLElement>, sensitivity = 1) {
  const [offset, setOffset] = useState({ x: 0, y: 0, rotation: 0 });
  const [isGyroscope, setIsGyroscope] = useState(false);
  const gyroscope = useRef<Gyroscope | null>(null);

  useEffect(() => {
    if (!window.Gyroscope) return;

    try {
      gyroscope.current = new window.Gyroscope({ frequency: 60 });
      
      if (gyroscope.current) {
        gyroscope.current.start();
        gyroscope.current.addEventListener('reading', () => {
          if (gyroscope.current) {
            setOffset({
              x: gyroscope.current.x * sensitivity,
              y: gyroscope.current.y * sensitivity,
              rotation: gyroscope.current.z * sensitivity
            });
          }
        });
        setIsGyroscope(true);
      }

      return () => {
        if (gyroscope.current) {
          gyroscope.current.stop();
        }
      };
    } catch (error) {
      console.error('Gyroscope not available:', error);
    }

    // Mouse/touch fallback
    const handleMouseMove = (e: MouseEvent | TouchEvent) => {
      if (!isGyroscope) {
        const { clientX, clientY } = 'touches' in e ? e.touches[0] : e;
        const x = (clientX / window.innerWidth - 0.5) * sensitivity * 100;
        const y = (clientY / window.innerHeight - 0.5) * sensitivity * 100;
        setOffset({
          x,
          y,
          rotation: Math.atan2(y, x) * (180 / Math.PI)
        });
      }
    };

    if (!isGyroscope) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('touchmove', handleMouseMove);
    }

    return () => {
      if (!isGyroscope) {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('touchmove', handleMouseMove);
      }
    };
  }, [sensitivity, isGyroscope]);

  return offset;
}
