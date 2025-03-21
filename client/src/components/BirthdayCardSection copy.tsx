import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useScrollReveal } from "@/hooks/use-scroll-reveal";
import { useParallax } from "@/hooks/use-parallax";

interface CardProps {
  id: string;
  gradient: string;
  frontContent: React.ReactNode;
  insideContent: React.ReactNode;
  decorations?: React.ReactNode;
  scrollProgress?: number;
  index: number;
}

function Card({ id, gradient, frontContent, insideContent, decorations, scrollProgress = 0, index }: CardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isFolded, setIsFolded] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  
  // Use scroll progress to create a staggered effect for cards
  useEffect(() => {
    if (!cardRef.current) return;
    
    // Calculate when this card should start emerging
    // Later cards should emerge later in the scroll
    const startThreshold = 0.25 + (index * 0.05);
    const endThreshold = startThreshold + 0.15;
    
    if (scrollProgress >= startThreshold && scrollProgress <= endThreshold) {
      // Map the scroll progress to a 0-1 range for this card's animation
      const normalizedProgress = (scrollProgress - startThreshold) / (endThreshold - startThreshold);
      
      // Apply 3D transforms as card emerges
      // Card emerges from "deeper" in the screen (z axis)
      const zTranslate = 500 - (normalizedProgress * 500);
      const scale = 0.7 + (normalizedProgress * 0.3);
      const opacity = normalizedProgress;
      const rotateY = (1 - normalizedProgress) * 15 * (index % 2 === 0 ? 1 : -1); // Alternate tilt direction
      
      cardRef.current.style.transform = `perspective(1000px) translateZ(${zTranslate}px) scale(${scale}) rotateY(${rotateY}deg)`;
      cardRef.current.style.opacity = opacity.toString();
    } else if (scrollProgress > endThreshold) {
      // Card is fully emerged
      cardRef.current.style.transform = `perspective(1000px) translateZ(0) scale(1) rotateY(0deg)`;
      cardRef.current.style.opacity = '1';
    } else {
      // Card is not yet visible
      cardRef.current.style.transform = `perspective(1000px) translateZ(500px) scale(0.7) rotateY(${index % 2 === 0 ? 15 : -15}deg)`;
      cardRef.current.style.opacity = '0';
    }
  }, [scrollProgress, index]);
  
  const toggleCard = () => {
    // Only allow toggle if card is fully emerged
    if (scrollProgress < 0.25 + ((index + 1) * 0.05)) return;
    
    setIsFolded(!isFolded);
    
    // Delay the flip animation to allow the fold to happen first
    setTimeout(() => {
      setIsOpen(!isOpen);
    }, 300);
    
    // Add a subtle sound effect
    if (typeof window !== 'undefined') {
      try {
        const audio = new Audio();
        audio.src = 'data:audio/mp3;base64,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';
        audio.volume = 0.2;
        audio.play();
      } catch (e) {
        console.log('Audio not supported');
      }
    }
  };
  
  return (
    <div 
      className={`fold-effect mb-16 ${isFolded ? 'folded' : ''}`} 
      id={id}
      ref={cardRef}
      style={{ 
        transformStyle: 'preserve-3d',
        transition: 'transform 0.8s cubic-bezier(0.23, 1, 0.32, 1), opacity 0.8s cubic-bezier(0.23, 1, 0.32, 1)'
      }}
    >
      <div 
        className={`card-3d relative ${gradient} rounded-xl shadow-2xl overflow-hidden p-8 h-64 md:h-72 transform transition-all duration-1000 ease-in-out hover:shadow-[0_0_30px_rgba(255,51,102,0.5)] ${isOpen ? 'card-open' : ''}`}
        onClick={toggleCard}
        style={{ transformStyle: 'preserve-3d' }}
      >
        <div 
          className="card-front absolute inset-0 p-8 flex flex-col justify-center items-center"
          style={{ 
            transformStyle: 'preserve-3d',
            backfaceVisibility: 'hidden',
            transform: isOpen ? 'rotateY(180deg)' : 'rotateY(0deg)',
            transition: 'transform 1s cubic-bezier(0.645, 0.045, 0.355, 1)'
          }}
        >
          {frontContent}
          
          <div className="card-decoration absolute top-4 right-4">
            {decorations}
          </div>
          
          <div className="absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-t from-white/10 to-transparent"></div>
        </div>
        
        <div 
          className="card-inside absolute inset-0 p-8 flex flex-col justify-center items-center transform" 
          style={{ 
            transformStyle: 'preserve-3d',
            backfaceVisibility: 'hidden',
            transform: isOpen ? 'rotateY(0deg)' : 'rotateY(180deg)',
            transition: 'transform 1s cubic-bezier(0.645, 0.045, 0.355, 1)'
          }}
        >
          {insideContent}
          
          {/* 3D floating elements */}
          <div className="floating-elements absolute inset-0 pointer-events-none" style={{ transformStyle: 'preserve-3d' }}>
            {[...Array(8)].map((_, i) => (
              <div 
                key={`float-${i}`}
                className="absolute w-6 h-6 opacity-40"
                style={{
                  left: `${Math.random() * 80 + 10}%`,
                  top: `${Math.random() * 80 + 10}%`,
                  transform: `translateZ(${Math.random() * 40 + 20}px)`,
                  animation: `float-in-space ${4 + Math.random() * 4}s ease-in-out infinite`,
                  animationDelay: `${Math.random() * 2}s`
                }}
              >
                {i % 2 === 0 ? (
                  // Heart
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                  </svg>
                ) : (
                  // Star
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white">
                    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
                  </svg>
                )}
              </div>
            ))}
          </div>
        </div>
        
        {/* Glow effect layer */}
        <div 
          className="absolute inset-0 glow-effect"
          style={{
            background: 'radial-gradient(circle at center, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0) 70%)',
            opacity: isOpen ? 0.8 : 0.4,
            transition: 'opacity 1s ease-in-out',
            pointerEvents: 'none'
          }}
        />
      </div>
    </div>
  );
}

function TapHeart() {
  const [hasInteracted, setHasInteracted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const spawnConfetti = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    setHasInteracted(true);
    
    const button = event.currentTarget;
    const rect = button.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const colors = ['#ff3366', '#ffb6c1', '#ff9e9e', '#ffffff'];
    
    // Create confetti style if it doesn't exist
    if (!document.getElementById('confetti-style')) {
      const style = document.createElement('style');
      style.id = 'confetti-style';
      style.textContent = `
        .confetti {
          position: absolute;
          width: 10px;
          height: 10px;
          transform-style: preserve-3d;
          background-color: var(--color);
          opacity: 0;
          animation: confetti-fall 3s ease-in-out forwards;
          z-index: 999;
        }
        
        @keyframes confetti-fall {
          0% { transform: translateY(0) translateZ(0) rotate(0deg); opacity: 1; }
          70% { opacity: 1; }
          100% { transform: translateY(300px) translateZ(100px) rotate(360deg); opacity: 0; }
        }
        
        @keyframes heart-pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.2); }
          100% { transform: scale(1); }
        }
      `;
      document.head.appendChild(style);
    }
    
    // Play heart beat sound
    try {
      const audio = new Audio();
      audio.src = 'data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4Ljc2LjEwMAAAAAAAAAAAAAAA//tQxAAAAAAAAAAAAAAAAAAAAAAASW5mbwAAAA8AAAASAAAeMwAUFBQUFCIiIiIiIjAwMDAwMD4+Pj4+PkxMTExMTFpaWlpaWmhoaGhoaHZ2dnZ2doSEhISEhJKSkpKSkqCgoKCgoK6urq6urrKysr6+vr6+vr6+vr6+vsbGxsbGxtLS0tLS0tra2tra2uLi4uLi4urq6urq6vLy8vLy8vr6+vr6+v///wAAADxhdmMxOUQMUAAAAwAAAAAAATwwWkAAAAAAAAAAAAAAAAAAAAAAACIiIiIiIhE+PT09PTWmpqampppaXl5eXl48XDz///9MfT///zE+Pj4+PiIiIiIiIgAAAAAAAAAAAAD/+0LEcQAMKABnmDAAAYQACPMAAAAAKgjAo9CCNCCCRgg8IBTMfC3R5ipiRCAuOCCB0zN0vBeeMEcJQQIEAweCAIGDx9ZC8Kj+BTM7P6Orj+fPfMfT889M4/5Ppp/w0/PvQ/TPO/4hP8Mz8o/n/D03//w3/mc+fmf//M5/nO+fhF/i2t/yfM5/wyf/8p////yX////uQAGP//MZ///If///8jK//in////xE///yL///8JCaAkDkMf/yZv/+ZP//5kxm//Mv///yf///KCgIgU//pIKv/6k///+Sk///nCSzjDNCZkmfo5jLAilpESgkIjckdU+p3XkZCiMUlJDNHKlWsNS8JWQ6oCkqRLwWzSpIk4aii5CrVCfmMQFIIhQVSQ1KSZOTrJdpIJQcBihZDYgBEG4USHZN//////8wMDAxP//////8iBUVigoKsBAVFQoKCrAwVY2CxUFRVlRUVFWNgsVBUVZUVFRVjYQFRUFBVlRUVFWCBAWCAqKgoKsqKioqwQICgqCgqyoqKirBAVFQoKCrKioqKsbBYqCoqyoqKirGwWKgqKsqKioqxsICoqCgqyoqKirBAVFQoKCrKioqKsECAoKgoKsqKioqwQFRUKCgqyoqKirGwWKgqKsqKioqxsFioKirKioqKsEBUVCgoKsqKioqwQICgqCgqyoqKirBAgKCoKCrKioqKsEBUVCgoKsqKioqyZlVVVZlFVVZlIUUUUZlVVVZlVVVWZVVVVmVVVVmUUVVZlVVVWZVVVVmVVVVZlFVVWZVVVVmVVVVZlVVVWZRRVVmVVVVZlVVVWZVVVVmUUVVZlVVVWZVVVVmVVVVZlFFVWZVVVVmVVVV/+xDE1QPK/It73YAAQWQRa3uzAA5lVVVZlVVVWZRRVVmVVVVZlVVVWZVVVVmUUVVZlVVVWZVVVVmVVVVZlFVVWZVVVVmVVVVWZVVVVmUUVVZlVVVWZVVVVmVVVVZlFFVWZVVVVmVVVVWZVVVVmUUVVZlVVVWZVVVVmVVVVZlFFVWZVVVVmVVVVWZVVVVmUUVVZlVVVWZVVVVf//0Bmqqqplmqqplm2VVMuZZqqqplmqqqZZtlVTLmWaqqmWaqqpllVVTLmWaqqqZZqqqlVmqqqZZtlVTLmWaqqmWaqqplm2VVMuZZqqqplmqqqZZtlVTLmWaqqplmqqptlzLNVVTLNVVUrNsqqZcyzVVUyzVVVSzbKqmXMs1VVMs1VVSs2yqplzLNVV';
      audio.volume = 0.3;
      audio.play();
    } catch (e) {
      console.log('Audio not supported');
    }
    
    // Add 3D confetti effect with depth
    for (let i = 0; i < 50; i++) {
      const confetti = document.createElement('div');
      confetti.classList.add('confetti');
      
      // Random position around heart
      const angle = Math.random() * Math.PI * 2;
      const distance = Math.random() * 20;
      const x = centerX + Math.cos(angle) * distance;
      const y = centerY + Math.sin(angle) * distance;
      
      confetti.style.left = `${x}px`;
      confetti.style.top = `${y}px`;
      
      // Random color
      const color = colors[Math.floor(Math.random() * colors.length)];
      confetti.style.setProperty('--color', color);
      
      // Random shape
      if (Math.random() > 0.5) {
        confetti.style.borderRadius = '0';
        confetti.style.width = `${Math.random() * 8 + 5}px`;
        confetti.style.height = `${Math.random() * 8 + 5}px`;
      }
      
      // Random rotation and delay
      confetti.style.animationDelay = `${Math.random() * 0.3}s`;
      
      document.body.appendChild(confetti);
      
      // Remove after animation
      setTimeout(() => {
        document.body.removeChild(confetti);
      }, 3000);
    }
    
    // Add heart pulse animation
    if (containerRef.current) {
      containerRef.current.style.animation = 'heart-pulse 0.6s ease-in-out';
      setTimeout(() => {
        if (containerRef.current) {
          containerRef.current.style.animation = '';
        }
      }, 600);
    }
  };
  
  return (
    <div className="interactive-element" ref={containerRef}>
      <button 
        className="tap-heart bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full p-4 transition-all duration-300 hover:scale-110"
        onClick={spawnConfetti}
        style={{ 
          boxShadow: '0 0 20px rgba(255, 51, 102, 0.5)',
          transformStyle: 'preserve-3d'
        }}
      >
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          className="h-8 w-8 text-white" 
          fill="currentColor" 
          viewBox="0 0 24 24"
        >
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
        </svg>
      </button>
      <p className="text-white/70 text-xs mt-2">Tap me</p>
    </div>
  );
}

function StarsBackground() {
  const starsRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (!starsRef.current) return;
    
    const container = starsRef.current;
    const numStars = 50;
    
    for (let i = 0; i < numStars; i++) {
      const star = document.createElement('div');
      star.className = 'absolute rounded-full bg-white';
      
      // Add 3D position with z-index for depth
      const size = Math.random() * 3 + 1;
      const x = Math.random() * 100;
      const y = Math.random() * 100;
      const z = Math.random() * 100 - 50; // z value between -50 and 50
      
      star.style.width = `${size}px`;
      star.style.height = `${size}px`;
      star.style.left = `${x}%`;
      star.style.top = `${y}%`;
      star.style.opacity = (Math.random() * 0.7 + 0.3).toString();
      star.style.animation = `twinkle 2s infinite alternate`;
      star.style.animationDelay = `${Math.random() * 2}s`;
      star.style.transform = `translateZ(${z}px)`;
      
      container.appendChild(star);
    }
    
    return () => {
      while (container.firstChild) {
        container.removeChild(container.firstChild);
      }
    };
  }, []);
  
  return (
    <div 
      className="stars-decoration absolute inset-0 overflow-hidden" 
      ref={starsRef}
      style={{ transformStyle: 'preserve-3d' }}
    />
  );
}

interface BirthdayCardSectionProps {
  scrollProgress?: number;
  isActive?: boolean;
  progress?: number;
  onContinue?: () => void;
}

export default function BirthdayCardSection({ 
  scrollProgress = 0,
  isActive = false,
  progress = 0,
  onContinue
}: BirthdayCardSectionProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const cardWrapperRef = useRef<HTMLDivElement>(null);
  const parallaxRef = useRef<HTMLDivElement>(null);
  
  // Enhance parallax effect based on scroll
  useEffect(() => {
    if (!containerRef.current) return;
    
    // Apply dolly zoom effect as you scroll into this section
    const zOffset = -scrollProgress * 100; // Move back as we scroll
    const scale = 1 + (scrollProgress * 0.2); // Scale up slightly to counteract
    
    // Update container transform directly for better performance
    containerRef.current.style.transform = `translateZ(${zOffset}px) scale(${scale})`;
  }, [scrollProgress]);
  
  // Use scroll reveal with a more dramatic effect
  useScrollReveal(cardWrapperRef, { 
    threshold: 0.1,
    duration: 1.5
  });
  
  // Enhanced parallax effect
  useParallax(parallaxRef, 0.6);
  
  return (
    <section 
      id="birthday-card" 
      className="min-h-screen w-full flex flex-col items-center justify-center py-16 px-4 z-20 perspective-section"
      ref={containerRef}
      style={{ 
        transformStyle: 'preserve-3d',
        perspective: '1000px',
        transition: 'transform 0.2s ease-out'
      }}
    >
      <div 
        className="card-container w-full max-w-md relative"
        ref={parallaxRef}
        style={{ transformStyle: 'preserve-3d' }}
      >
        <div 
          className="card-wrapper reveal" 
          ref={cardWrapperRef}
          style={{ transformStyle: 'preserve-3d' }}
        >
          {/* First fold of the card */}
          <Card
            id="card-fold-1"
            gradient="bg-gradient-to-r from-[#ff3366] to-[#ff9e9e]"
            index={0}
            scrollProgress={scrollProgress}
            frontContent={
              <h2 
                className="font-['Dancing_Script'] text-3xl md:text-4xl text-white text-center leading-relaxed tracking-wide mb-4" 
                style={{ 
                  textShadow: "0 0 10px rgba(255,255,255,0.5)",
                  transform: "translateZ(20px)" 
                }}
              >
                Happy Birthday to the most gorgeous girl in the world.
              </h2>
            }
            insideContent={
              <>
                <p 
                  className="font-['Dancing_Script'] text-2xl text-white text-center mb-4"
                  style={{ transform: "translateZ(30px)" }}
                >
                  To my love, you light up my world every day...
                </p>
                <p 
                  className="text-white/90 text-center text-sm md:text-base"
                  style={{ transform: "translateZ(15px)" }}
                >
                  Your smile brings me joy, your laughter fills my heart, and your love gives me purpose.
                </p>
              </>
            }
            decorations={
              <div 
                className="h-10 w-10 text-white opacity-70"
                style={{ transform: "translateZ(10px) rotate(-5deg)" }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-10 h-10">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm1-13h-2v6h2v-6zm0 8h-2v2h2v-2z"/>
                </svg>
              </div>
            }
          />
          
          {/* Second fold of the card */}
          <Card
            id="card-fold-2"
            gradient="bg-gradient-to-r from-[#ffb6c1] to-[#ff9e9e]"
            index={1}
            scrollProgress={scrollProgress}
            frontContent={
              <>
                <p 
                  className="font-['Dancing_Script'] text-3xl text-white text-center mb-6"
                  style={{ transform: "translateZ(25px)" }}
                >
                  Every moment with you feels like magic...
                </p>
                <div style={{ transform: "translateZ(40px)" }}>
                  <TapHeart />
                </div>
              </>
            }
            insideContent={
              <>
                <p 
                  className="font-['Dancing_Script'] text-3xl text-white text-center mb-4"
                  style={{ transform: "translateZ(35px)" }}
                >
                  You're my everything
                </p>
                <p 
                  className="text-white/90 text-center text-sm md:text-base"
                  style={{ transform: "translateZ(20px)" }}
                >
                  Every beat of my heart belongs to you, today and always.
                </p>
              </>
            }
          />
          
          {/* Third fold with interactive elements */}
          <Card
            id="card-fold-3"
            gradient="bg-gradient-to-r from-[#ff9e9e] to-[#ff3366]"
            index={2}
            scrollProgress={scrollProgress}
            frontContent={
              <>
                <StarsBackground />
                <h2 
                  className="font-['Dancing_Script'] text-3xl md:text-4xl text-white text-center mb-4 relative z-10"
                  style={{ transform: "translateZ(30px)" }}
                >
                  On your special day...
                </h2>
                <p 
                  className="text-white/90 text-center text-sm md:text-base relative z-10"
                  style={{ transform: "translateZ(15px)" }}
                >
                  I want to make all your wishes come true.
                </p>
              </>
            }
            insideContent={
              <div 
                className="flowers-container relative w-full h-full flex items-center justify-center"
                style={{ transformStyle: 'preserve-3d' }}
              >
                <div 
                  className="flower-center relative"
                  style={{ transform: "translateZ(40px)" }}
                >
                  <p className="font-['Dancing_Script'] text-2xl text-white text-center">
                    Forever yours ❤️
                  </p>
                </div>
              </div>
            }
          />
        </div>
      </div>
    </section>
  );
}
