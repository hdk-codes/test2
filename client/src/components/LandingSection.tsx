
import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import FloatingHearts from "./FloatingHearts";

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
  const [isHovered, setIsHovered] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLHeadingElement>(null);
  const heartRef = useRef<HTMLDivElement>(null);

  return (
    <section 
      ref={containerRef}
      className="min-h-screen w-full flex flex-col items-center justify-center relative overflow-hidden bg-gradient-to-b from-rose-900 to-purple-900"
    >
      {/* Animated background */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.3 }}
        transition={{ duration: 2 }}
        className="absolute inset-0 bg-[url('/attached_assets/bg-layer1.jpg')] bg-cover bg-center"
      />

      <FloatingHearts count={20} />

      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 1, delay: 0.5 }}
        className="relative z-10 max-w-2xl mx-auto px-4 text-center"
      >
        <motion.div
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          animate={{
            rotate: isHovered ? [0, 10, -10, 0] : 0,
            scale: isHovered ? 1.1 : 1,
          }}
          transition={{ duration: 0.5 }}
          className="mb-8 cursor-pointer"
          onHoverStart={() => setIsHovered(true)}
          onHoverEnd={() => setIsHovered(false)}
          ref={heartRef}
        >
          <div className="text-8xl">❤️</div>
        </motion.div>

        <motion.h1 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 1, delay: 0.8 }}
          className="font-['Dancing_Script'] text-6xl md:text-8xl text-white mb-8 text-shadow-lg"
        >
          My Dearest Love
        </motion.h1>

        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 1, delay: 1.1 }}
          className="text-white/90 text-xl md:text-2xl mb-12 leading-relaxed"
        >
          Every moment with you is a gift, every memory a treasure.
          Let me share with you how much you mean to me...
        </motion.p>

        <motion.button
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          whileHover={{ scale: 1.05, backgroundColor: "rgba(255,255,255,0.3)" }}
          whileTap={{ scale: 0.95 }}
          transition={{ duration: 0.3 }}
          onClick={onContinue}
          className="px-10 py-4 bg-white/10 backdrop-blur-lg rounded-full 
                   text-white text-xl border-2 border-white/30 
                   hover:border-white/50 transition-all duration-300
                   shadow-lg hover:shadow-xl"
        >
          Begin Our Journey ↓
        </motion.button>
      </motion.div>
    </section>
  );
}
