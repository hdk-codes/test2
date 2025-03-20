
import { motion } from 'framer-motion';

interface FloatingHeartsProps {
  count?: number;
}

export default function FloatingHearts({ count = 10 }: FloatingHeartsProps) {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute text-2xl"
          initial={{ 
            x: Math.random() * window.innerWidth,
            y: window.innerHeight + 100
          }}
          animate={{
            y: -100,
            x: `calc(${Math.random() * 100}vw)`,
          }}
          transition={{
            duration: 10 + Math.random() * 10,
            repeat: Infinity,
            ease: "linear",
            delay: Math.random() * 5
          }}
        >
          {['❤️', '💝', '💖', '💕'][Math.floor(Math.random() * 4)]}
        </motion.div>
      ))}
    </div>
  );
}
