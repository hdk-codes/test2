import { useState, useEffect } from 'react';

export function useInkAnimation(isActive: boolean) {
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    if (isActive) {
      setProgress(100);
      let start = 0;
      const animate = (timestamp: number) => {
        if (!start) start = timestamp;
        const elapsed = timestamp - start;
        const newProgress = Math.max(0, 100 - (elapsed / 20));
        
        setProgress(newProgress);
        
        if (newProgress > 0) {
          requestAnimationFrame(animate);
        }
      };
      
      requestAnimationFrame(animate);
    } else {
      setProgress(100);
    }
  }, [isActive]);

  return [progress];
}
