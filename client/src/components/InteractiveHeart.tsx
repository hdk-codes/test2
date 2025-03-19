import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";

interface InteractiveHeartProps {
  id: string;
  size?: "small" | "medium" | "large";
  pulseEffect?: boolean;
  onInteraction?: () => void;
}

export default function InteractiveHeart({
  id,
  size = "medium",
  pulseEffect = true,
  onInteraction
}: InteractiveHeartProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [proximity, setProximity] = useState(0);
  const heartRef = useRef<HTMLDivElement>(null);
  
  // Size variants
  const sizeVariants = {
    small: "w-20 h-20",
    medium: "w-40 h-40",
    large: "w-48 h-48"
  };
  
  // Track mouse or touch position relative to heart
  useEffect(() => {
    const heartElement = heartRef.current;
    if (!heartElement) return;
    
    const handleMouseMove = (e: MouseEvent) => {
      if (!heartElement) return;
      
      const rect = heartElement.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      const distX = e.clientX - centerX;
      const distY = e.clientY - centerY;
      
      // Calculate distance from center (normalized)
      const distance = Math.sqrt(distX * distX + distY * distY);
      const maxDistance = Math.max(window.innerWidth, window.innerHeight) / 2;
      const normalizedProximity = 1 - Math.min(distance / maxDistance, 1);
      
      setProximity(normalizedProximity);
    };
    
    const handleTouchMove = (e: TouchEvent) => {
      if (!heartElement || e.touches.length === 0) return;
      
      const touch = e.touches[0];
      const rect = heartElement.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      const distX = touch.clientX - centerX;
      const distY = touch.clientY - centerY;
      
      // Calculate distance from center (normalized)
      const distance = Math.sqrt(distX * distX + distY * distY);
      const maxDistance = Math.max(window.innerWidth, window.innerHeight) / 2;
      const normalizedProximity = 1 - Math.min(distance / maxDistance, 1);
      
      setProximity(normalizedProximity);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('touchmove', handleTouchMove);
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('touchmove', handleTouchMove);
    };
  }, []);
  
  // Calculate animation intensity based on proximity
  const scale = 1 + (isHovered ? 0.2 : proximity * 0.2);
  const glowOpacity = 0.3 + (isHovered ? 0.5 : proximity * 0.5);
  const pulseSpeed = pulseEffect ? (1.5 - proximity * 0.5) : 0;
  
  return (
    <div 
      id={id}
      ref={heartRef}
      className={`heart-container relative ${sizeVariants[size]} mx-auto`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onInteraction}
    >
      <motion.div 
        className="heart absolute inset-0 flex items-center justify-center"
        animate={{
          scale: scale,
          filter: `drop-shadow(0 0 ${10 + proximity * 10}px rgba(255,51,102,${0.7 + proximity * 0.2}))`
        }}
        transition={{ 
          type: "spring", 
          stiffness: 300, 
          damping: 15 
        }}
      >
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          viewBox="0 0 24 24" 
          className="w-full h-full fill-[#ff3366]"
          style={pulseEffect ? {
            animation: `heartbeat ${pulseSpeed}s ease-in-out infinite`
          } : {}}
        >
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
        </svg>
        
        <motion.div 
          className="heart-glow absolute inset-0 bg-[#ff3366] rounded-full blur-xl"
          animate={{ 
            opacity: glowOpacity
          }}
          transition={{ duration: 0.3 }}
        />
      </motion.div>
    </div>
  );
}
