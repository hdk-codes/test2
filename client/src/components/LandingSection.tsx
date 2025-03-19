import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import InteractiveHeart from "@/components/InteractiveHeart";
import { useParallax } from "@/hooks/use-parallax";

export default function LandingSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLHeadingElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const parallaxRef = useRef<HTMLDivElement>(null);
  
  useParallax(parallaxRef, 0.2);
  
  // Typing animation effect
  useEffect(() => {
    if (!textRef.current) return;
    
    // Add typewriter styles if they don't exist
    if (!document.getElementById("typewriter-styles")) {
      const style = document.createElement("style");
      style.id = "typewriter-styles";
      style.textContent = `
        .typewriter {
          overflow: hidden;
          border-right: .15em solid white;
          white-space: nowrap;
          width: 0;
          animation: typewriter 2.5s steps(11) 1s forwards, blink 1s step-end infinite;
        }
        
        @keyframes typewriter {
          from { width: 0 }
          to { width: 100% }
        }
        
        @keyframes blink {
          50% { border-color: transparent }
        }
      `;
      document.head.appendChild(style);
    }
    
    textRef.current.classList.add("typewriter");
    
    return () => {
      document.getElementById("typewriter-styles")?.remove();
    };
  }, []);
  
  const scrollToNextSection = () => {
    const birthdayCardSection = document.getElementById("birthday-card");
    if (birthdayCardSection) {
      birthdayCardSection.scrollIntoView({ behavior: "smooth" });
    }
  };
  
  return (
    <section 
      id="landing" 
      ref={containerRef}
      className="relative min-h-screen w-full flex flex-col items-center justify-center z-10 overflow-hidden"
    >
      <div 
        className="welcome-container relative text-center"
        ref={parallaxRef}
      >
        <h1 
          ref={textRef}
          className="font-['Dancing_Script'] text-4xl md:text-6xl mb-8 mx-auto overflow-hidden"
        >
          Hi love ❣️
        </h1>
        
        <InteractiveHeart id="main-heart" size="medium" pulseEffect={true} />
        
        <motion.div 
          className="scroll-indicator mt-16 opacity-80"
          animate={{ y: [0, 10, 0] }}
          transition={{ 
            repeat: Infinity, 
            duration: 1.5,
            ease: "easeInOut" 
          }}
          ref={scrollRef}
          onClick={scrollToNextSection}
        >
          <p className="text-sm mb-2">Scroll down</p>
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-6 w-6 mx-auto" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth="2" 
              d="M19 14l-7 7m0 0l-7-7m7 7V3" 
            />
          </svg>
        </motion.div>
      </div>
    </section>
  );
}
