import { useRef, useCallback } from 'react';
import { animate } from 'framer-motion';

export function usePaperFold() {
  const foldRef = useRef<HTMLDivElement>(null);

  const unfold = useCallback(() => {
    if (!foldRef.current) return;

    const element = foldRef.current;
    element.style.transformStyle = 'preserve-3d';

    animate([
      [element, { transform: 'rotateX(-90deg) scale(0.5)' }, { duration: 0 }],
      [element, { transform: 'rotateX(0deg) scale(1)' }, { duration: 0.8, ease: 'easeOut' }]
    ]);
  }, []);

  return { foldRef, unfold };
}
