import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useDeviceOrientation } from "@/hooks/use-device-orientation";

interface Star {
  x: number;
  y: number;
  size: number;
  opacity: number;
  animationDelay: number;
}

export default function ParallaxBackground() {
  const starsContainerRef = useRef<HTMLDivElement>(null);
  const { beta, gamma } = useDeviceOrientation();

  useEffect(() => {
    if (!starsContainerRef.current) return;
    
    const container = starsContainerRef.current;
    const stars: Star[] = [];
    const numStars = 200;
    
    // Generate random stars
    for (let i = 0; i < numStars; i++) {
      stars.push({
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 3 + 1,
        opacity: Math.random() * 0.7 + 0.3,
        animationDelay: Math.random() * 2
      });
    }
    
    // Create and append star elements
    stars.forEach((star) => {
      const starElement = document.createElement("div");
      starElement.className = "absolute rounded-full bg-white";
      starElement.style.left = `${star.x}%`;
      starElement.style.top = `${star.y}%`;
      starElement.style.width = `${star.size}px`;
      starElement.style.height = `${star.size}px`;
      starElement.style.opacity = star.opacity.toString();
      starElement.style.animation = `twinkle 2s infinite alternate`;
      starElement.style.animationDelay = `${star.animationDelay}s`;
      container.appendChild(starElement);
    });
    
    // Add twinkle animation if it doesn't exist
    if (!document.getElementById("twinkle-animation")) {
      const styleSheet = document.createElement("style");
      styleSheet.id = "twinkle-animation";
      styleSheet.textContent = `
        @keyframes twinkle {
          from { opacity: 0.2; }
          to { opacity: 1; }
        }
      `;
      document.head.appendChild(styleSheet);
    }
    
    return () => {
      // Cleanup
      while (container.firstChild) {
        container.removeChild(container.firstChild);
      }
    };
  }, []);

  // Calculate parallax offset based on device orientation or mouse position
  const x = gamma ? gamma * 0.5 : 0;
  const y = beta ? beta * 0.5 : 0;

  return (
    <motion.div
      className="parallax-background fixed inset-0 -z-10"
      animate={{
        x: x,
        y: y
      }}
      transition={{
        type: "spring",
        damping: 25,
        stiffness: 50
      }}
    >
      <div 
        id="stars-container" 
        ref={starsContainerRef} 
        className="absolute inset-0"
      />
    </motion.div>
  );
}
