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
}

function Card({ id, gradient, frontContent, insideContent, decorations }: CardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isFolded, setIsFolded] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  
  const toggleCard = () => {
    setIsFolded(!isFolded);
    
    // Delay the flip animation to allow the fold to happen first
    setTimeout(() => {
      setIsOpen(!isOpen);
    }, 300);
  };
  
  return (
    <div 
      className={`fold-effect mb-16 ${isFolded ? 'folded' : ''}`} 
      id={id}
      ref={cardRef}
    >
      <div 
        className={`card-3d relative ${gradient} rounded-xl shadow-2xl overflow-hidden p-8 h-64 md:h-72 transform transition-all duration-1000 ease-in-out hover:shadow-[0_0_30px_rgba(255,51,102,0.5)] ${isOpen ? 'card-open' : ''}`}
        onClick={toggleCard}
      >
        <div className="card-front absolute inset-0 p-8 flex flex-col justify-center items-center">
          {frontContent}
          
          <div className="card-decoration absolute top-4 right-4">
            {decorations}
          </div>
          
          <div className="absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-t from-white/10 to-transparent"></div>
        </div>
        
        <div className="card-inside absolute inset-0 p-8 flex flex-col justify-center items-center transform backface-hidden" 
             style={{ transform: isOpen ? 'rotateY(0deg)' : 'rotateY(180deg)' }}>
          {insideContent}
        </div>
      </div>
    </div>
  );
}

function TapHeart() {
  const [hasInteracted, setHasInteracted] = useState(false);
  
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
          background-color: var(--color);
          opacity: 0;
          animation: confetti-fall 3s ease-in-out forwards;
          z-index: 999;
        }
        
        @keyframes confetti-fall {
          0% { transform: translateY(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(300px) rotate(360deg); opacity: 0; }
        }
      `;
      document.head.appendChild(style);
    }
    
    for (let i = 0; i < 30; i++) {
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
      
      // Random rotation and delay
      confetti.style.animationDelay = `${Math.random() * 0.5}s`;
      confetti.style.transform = `rotate(${Math.random() * 360}deg)`;
      
      document.body.appendChild(confetti);
      
      // Remove after animation
      setTimeout(() => {
        document.body.removeChild(confetti);
      }, 3000);
    }
  };
  
  return (
    <div className="interactive-element">
      <button 
        className="tap-heart bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full p-4 transition-all duration-300 hover:scale-110"
        onClick={spawnConfetti}
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
      
      const size = Math.random() * 3 + 1;
      star.style.width = `${size}px`;
      star.style.height = `${size}px`;
      star.style.left = `${Math.random() * 100}%`;
      star.style.top = `${Math.random() * 100}%`;
      star.style.opacity = (Math.random() * 0.7 + 0.3).toString();
      star.style.animation = `twinkle 2s infinite alternate`;
      star.style.animationDelay = `${Math.random() * 2}s`;
      
      container.appendChild(star);
    }
    
    return () => {
      while (container.firstChild) {
        container.removeChild(container.firstChild);
      }
    };
  }, []);
  
  return (
    <div className="stars-decoration absolute inset-0 overflow-hidden" ref={starsRef} />
  );
}

export default function BirthdayCardSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const cardWrapperRef = useRef<HTMLDivElement>(null);
  const parallaxRef = useRef<HTMLDivElement>(null);
  
  useScrollReveal(cardWrapperRef);
  useParallax(parallaxRef, 0.4);
  
  return (
    <section 
      id="birthday-card" 
      className="min-h-screen w-full flex flex-col items-center justify-center py-16 px-4 z-20"
      ref={containerRef}
    >
      <div 
        className="card-container w-full max-w-md relative"
        ref={parallaxRef}
      >
        <div className="card-wrapper reveal" ref={cardWrapperRef}>
          {/* First fold of the card */}
          <Card
            id="card-fold-1"
            gradient="bg-gradient-to-r from-[#ff3366] to-[#ff9e9e]"
            frontContent={
              <h2 className="font-['Dancing_Script'] text-3xl md:text-4xl text-white text-center leading-relaxed tracking-wide mb-4" style={{ textShadow: "0 0 10px rgba(255,255,255,0.5)" }}>
                Happy Birthday to the most gorgeous girl in the world.
              </h2>
            }
            insideContent={
              <>
                <p className="font-['Dancing_Script'] text-2xl text-white text-center mb-4">
                  To my love, you light up my world every day...
                </p>
                <p className="text-white/90 text-center text-sm md:text-base">
                  Your smile brings me joy, your laughter fills my heart, and your love gives me purpose.
                </p>
              </>
            }
            decorations={
              <div className="h-10 w-10 text-white opacity-70">
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
            frontContent={
              <>
                <p className="font-['Dancing_Script'] text-3xl text-white text-center mb-6">
                  Every moment with you feels like magic...
                </p>
                <TapHeart />
              </>
            }
            insideContent={
              <>
                <p className="font-['Dancing_Script'] text-3xl text-white text-center mb-4">
                  You're my everything
                </p>
                <p className="text-white/90 text-center text-sm md:text-base">
                  Every beat of my heart belongs to you, today and always.
                </p>
              </>
            }
          />
          
          {/* Third fold with interactive elements */}
          <Card
            id="card-fold-3"
            gradient="bg-gradient-to-r from-[#ff9e9e] to-[#ff3366]"
            frontContent={
              <>
                <StarsBackground />
                <h2 className="font-['Dancing_Script'] text-3xl md:text-4xl text-white text-center mb-4 relative z-10">
                  On your special day...
                </h2>
                <p className="text-white/90 text-center text-sm md:text-base relative z-10">
                  I want to make all your wishes come true.
                </p>
              </>
            }
            insideContent={
              <div className="flowers-container relative w-full h-full flex items-center justify-center">
                <div className="flower-center relative">
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
