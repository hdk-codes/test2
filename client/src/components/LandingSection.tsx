import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import InteractiveHeart from "@/components/InteractiveHeart";
import { useParallax } from "@/hooks/use-parallax";

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
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLHeadingElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const parallaxRef = useRef<HTMLDivElement>(null);
  const heartContainerRef = useRef<HTMLDivElement>(null);
  
  const [textDispersed, setTextDispersed] = useState(false);
  const [particles, setParticles] = useState<JSX.Element[]>([]);
  
  useParallax(parallaxRef, 0.2);
  
  // Listen for scroll progress
  useEffect(() => {
    const handleScrollProgress = (e: Event) => {
      const customEvent = e as CustomEvent;
      const progress = customEvent.detail?.progress || 0;
      
      // Start text dispersion effect when scrolled to about 15%
      if (progress > 0.15 && !textDispersed && textRef.current) {
        disperseText();
      }
      
      // Scale and move the text based on scroll
      if (textRef.current && !textDispersed) {
        const scaleValue = 1 + (progress * 4);
        const opacityValue = 1 - (progress * 5);
        textRef.current.style.transform = `scale(${scaleValue}) translateZ(${progress * 100}px)`;
        textRef.current.style.opacity = `${Math.max(0, opacityValue)}`;
      }
      
      // Scale heart and add depth effect
      if (heartContainerRef.current) {
        const heartProgress = Math.max(0, (progress - 0.2) * 2);
        const heartScale = 1 + heartProgress;
        const heartTranslate = progress * 50;
        heartContainerRef.current.style.transform = `scale(${heartScale}) translateZ(${heartTranslate}px)`;
      }
    };
    
    window.addEventListener('scrollprogress', handleScrollProgress);
    
    return () => {
      window.removeEventListener('scrollprogress', handleScrollProgress);
    };
  }, [textDispersed]);
  
  // Create advanced particle elements for text dispersion
  const disperseText = () => {
    if (!textRef.current) return;
    
    const text = textRef.current;
    const rect = text.getBoundingClientRect();
    const particlesArray: JSX.Element[] = [];
    
    // Create particles for each character in "Hi love ❣️"
    const textContent = "Hi love ❣️";
    const chars = textContent.split('');
    
    // Create character-based particles
    chars.forEach((char, charIndex) => {
      const charWidth = rect.width / chars.length;
      const startX = rect.left + (charWidth * charIndex) + (charWidth / 2);
      const startY = rect.top + (rect.height / 2);
      
      // Create multiple particles for each character
      for (let i = 0; i < 15; i++) {
        const size = Math.random() * 10 + 2;
        // Slightly randomize starting position around the character
        const particleX = startX + (Math.random() * charWidth - charWidth / 2);
        const particleY = startY + (Math.random() * 10 - 5);
        
        // Calculate random direction with 3D effect
        const xDirection = (Math.random() * 300 - 150);
        const zDirection = Math.random() * 100 + 50;
        
        // Choose color based on character (heart gets red particles)
        const isHeart = char === '❣' || char === '️';
        const pinkShades = ['#ff3366', '#ff6b9e', '#ff4d79', '#ff94b8', '#ff2d64'];
        const whiteShades = ['#ffffff', '#f0f0f0', '#e5e5e5', '#fafafa', '#f5f5f5'];
        
        const color = isHeart || charIndex % 3 === 0 ? 
                      pinkShades[Math.floor(Math.random() * pinkShades.length)] : 
                      whiteShades[Math.floor(Math.random() * whiteShades.length)];
        
        // Add glowing effect for some particles
        const glow = Math.random() > 0.7 ? `0 0 ${size * 2}px ${color}` : 'none';
        
        // Create different shapes (circles, squares, hearts)
        let shape = 'border-radius: 50%;'; // Default circle
        if (i % 8 === 0) shape = 'border-radius: 0%; rotate: 45deg;'; // Square
        if (i % 10 === 0 && isHeart) {
          // Heart shape for some particles on the heart character
          shape = `
            clip-path: path('M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z');
            transform: scale(0.5);
          `;
        }
        
        // Apply random animation durations for more natural movement
        const animDuration = 2 + Math.random() * 3;
        
        particlesArray.push(
          <div 
            key={`particle-${charIndex}-${i}`}
            className="particle"
            style={{
              width: `${size}px`,
              height: `${size}px`,
              left: `${particleX}px`,
              top: `${particleY}px`,
              '--x': `${xDirection}px`,
              animationDelay: `${Math.random() * 0.5}s`,
              animationDuration: `${animDuration}s`,
              backgroundColor: color,
              boxShadow: glow,
              opacity: Math.random() * 0.3 + 0.7,
            } as React.CSSProperties}
          />
        );
      }
    });
    
    // Add some extra sparkle particles
    for (let i = 0; i < 50; i++) {
      const size = Math.random() * 4 + 1;
      const startX = rect.left + (Math.random() * rect.width);
      const startY = rect.top + (Math.random() * rect.height);
      const xDirection = (Math.random() * 400) - 200;
      
      particlesArray.push(
        <div 
          key={`sparkle-${i}`}
          className="particle"
          style={{
            width: `${size}px`,
            height: `${size}px`,
            left: `${startX}px`,
            top: `${startY}px`,
            '--x': `${xDirection}px`,
            animationDelay: `${Math.random() * 0.8}s`,
            backgroundColor: i % 5 === 0 ? '#ffcce6' : '#ffffff',
            opacity: Math.random() * 0.5 + 0.5,
            boxShadow: '0 0 5px white',
          }}
        />
      );
    }
    
    setParticles(particlesArray);
    setTextDispersed(true);
    
    // Vibration effect on mobile devices
    if (navigator.vibrate) {
      navigator.vibrate(200);
    }
    
    // Clean up particles after animation
    setTimeout(() => {
      setParticles([]);
    }, 4000);
    
    // Trigger continue event
    if (onContinue) {
      setTimeout(() => {
        onContinue();
      }, 1500);
    }
  };
  
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
          transform-style: preserve-3d;
          will-change: transform, opacity;
          transition: transform 0.5s ease-out, opacity 0.5s ease-out;
        }
        
        @keyframes typewriter {
          from { width: 0 }
          to { width: 100% }
        }
        
        @keyframes blink {
          50% { border-color: transparent }
        }
        
        @keyframes pulsate3d {
          0% { transform: translateZ(0) scale(1); }
          50% { transform: translateZ(20px) scale(1.05); }
          100% { transform: translateZ(0) scale(1); }
        }
        
        .three-d-pulse {
          animation: pulsate3d 4s ease-in-out infinite;
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
      className="relative min-h-screen w-full flex flex-col items-center justify-center z-10 perspective-section overflow-hidden"
      style={{ transformStyle: 'preserve-3d' }}
    >
      <div 
        className="welcome-container relative text-center"
        ref={parallaxRef}
        style={{ transformStyle: 'preserve-3d' }}
      >
        <AnimatePresence>
          {!textDispersed && (
            <motion.h1 
              ref={textRef}
              className="font-['Dancing_Script'] text-4xl md:text-6xl mb-8 mx-auto overflow-hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{ transformStyle: 'preserve-3d' }}
            >
              Hi love ❣️
            </motion.h1>
          )}
        </AnimatePresence>
        
        {/* Particles for text dispersion effect */}
        {particles.map((particle) => particle)}
        
        <div 
          ref={heartContainerRef} 
          className={`heart-container transition-all duration-500 ease-out ${textDispersed ? 'scale-110 three-d-pulse' : ''}`}
          style={{ transformStyle: 'preserve-3d' }}
        >
          <InteractiveHeart 
            id="main-heart" 
            size={textDispersed ? "large" : "medium"} 
            pulseEffect={true} 
          />
        </div>
        
        <motion.div 
          className="scroll-indicator mt-16 opacity-80"
          animate={{ 
            y: [0, 10, 0],
            opacity: scrollProgress > 0.1 ? 0 : 0.8 
          }}
          transition={{ 
            repeat: Infinity, 
            duration: 1.5,
            ease: "easeInOut" 
          }}
          ref={scrollRef}
          onClick={scrollToNextSection}
        >
          <p className="text-sm mb-2">Scroll down for your surprise</p>
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
