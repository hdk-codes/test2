import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface Letter3DProps {
  isOpen: boolean;
  children: ReactNode;
}

export function Letter3D({ isOpen, children }: Letter3DProps) {
  return (
    <motion.div
      className="relative w-full max-w-2xl mx-auto"
      animate={{
        rotateY: isOpen ? 180 : 0,
        transition: { duration: 0.8, ease: [0.4, 0, 0.2, 1] }
      }}
      style={{ 
        transformStyle: 'preserve-3d',
        perspective: '1000px',
      }}
    >
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-pink-100 to-pink-300 rounded-2xl shadow-2xl"
        style={{ backfaceVisibility: 'hidden' }}
      />
      
      <motion.div
        className="relative bg-white rounded-2xl p-8 shadow-2xl"
        style={{
          backfaceVisibility: 'hidden',
          transform: 'rotateY(180deg)',
        }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}
