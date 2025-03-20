
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface FloatingHeartsProps {
  count?: number;
}

export default function FloatingHearts({ count = 15 }: FloatingHeartsProps) {
  const [hearts, setHearts] = useState<Array<{ id: number; x: number; delay: number }>>([]);

  useEffect(() => {
    const newHearts = Array.from({ length: count }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      delay: Math.random() * 5
    }));
    setHearts(newHearts);
  }, [count]);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {hearts.map((heart) => (
        <motion.div
          key={heart.id}
          initial={{ 
            y: "110vh",
            x: `${heart.x}vw`,
            opacity: 0,
            scale: 0.5
          }}
          animate={{ 
            y: "-10vh",
            opacity: [0, 1, 1, 0],
            scale: [0.5, 1, 1, 0.5]
          }}
          transition={{ 
            duration: 10,
            delay: heart.delay,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute text-2xl"
        >
          ❤️
        </motion.div>
      ))}
    </div>
  );
}
