import { useRef, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useScrollReveal } from "@/hooks/use-scroll-reveal";
import { useParallax } from "@/hooks/use-parallax";

function FloatingHearts() {
  const heartsContainerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (!heartsContainerRef.current) return;
    
    const container = heartsContainerRef.current;
    const numHearts = 12;
    const colors = ['#ff3366', '#ffb6c1', '#ff9e9e'];
    const sizes = [4, 5, 6];
    
    // Add floating animation if it doesn't exist
    if (!document.getElementById("float-animation")) {
      const style = document.createElement("style");
      style.id = "float-animation";
      style.textContent = `
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
        }
      `;
      document.head.appendChild(style);
    }
    
    for (let i = 0; i < numHearts; i++) {
      const heart = document.createElement("div");
      heart.className = "heart-item absolute";
      
      // Position randomly
      heart.style.left = `${Math.random() * 80 + 10}%`;
      heart.style.top = `${Math.random() * 80 + 10}%`;
      
      // Random animation delay
      const delay = Math.random() * 2;
      heart.style.animation = `float 6s ease-in-out infinite`;
      heart.style.animationDelay = `${delay}s`;
      
      // Random size
      const sizeIndex = Math.floor(Math.random() * sizes.length);
      const size = sizes[sizeIndex];
      
      // Random color
      const colorIndex = Math.floor(Math.random() * colors.length);
      const color = colors[colorIndex];
      
      // Create heart SVG
      heart.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="w-${size} h-${size} opacity-${Math.floor(Math.random() * 3) + 7}0" fill="${color}">
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
        </svg>
      `;
      
      container.appendChild(heart);
    }
    
    return () => {
      while (container.firstChild) {
        container.removeChild(container.firstChild);
      }
      document.getElementById("float-animation")?.remove();
    };
  }, []);
  
  return (
    <div className="floating-hearts-container absolute inset-0 flex items-center justify-center" ref={heartsContainerRef} />
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
      
      const size = Math.random() * 2 + 1;
      star.style.width = `${size}px`;
      star.style.height = `${size}px`;
      star.style.left = `${Math.random() * 100}%`;
      star.style.top = `${Math.random() * 100}%`;
      star.style.opacity = (Math.random() * 0.5 + 0.3).toString();
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
    <div className="stars-background absolute inset-0" ref={starsRef} />
  );
}

export default function LoveLetterSection() {
  const [isLetterOpen, setIsLetterOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const letterWrapperRef = useRef<HTMLDivElement>(null);
  const parallaxRef = useRef<HTMLDivElement>(null);
  
  useScrollReveal(letterWrapperRef);
  useParallax(parallaxRef, 0.6);
  
  const toggleLetter = () => {
    setIsLetterOpen(!isLetterOpen);
  };
  
  return (
    <section 
      id="love-letter" 
      className="min-h-screen w-full flex flex-col items-center justify-center py-16 px-4 z-30"
      ref={containerRef}
    >
      <div 
        className="letter-container w-full max-w-md" 
        ref={parallaxRef}
      >
        <div className="letter-wrapper reveal" ref={letterWrapperRef}>
          <motion.div 
            className="foldable-letter relative bg-gradient-to-b from-white/10 to-white/5 backdrop-blur-sm rounded-xl p-6 shadow-xl cursor-pointer"
            whileHover={{ 
              boxShadow: "0 0 30px rgba(255,255,255,0.3)"
            }}
            onClick={toggleLetter}
          >
            <motion.div 
              className="letter-envelope relative w-full aspect-[3/2] bg-gradient-to-r from-[#ffb6c1] to-[#ff3366] rounded-lg shadow-md overflow-hidden"
              animate={{ 
                scale: isLetterOpen ? 1.05 : 1,
                y: isLetterOpen ? -10 : 0
              }}
              transition={{ 
                type: "spring",
                stiffness: 300,
                damping: 20
              }}
            >
              <motion.div 
                className="letter-content p-6 transition-all duration-1000"
                animate={{ 
                  scale: isLetterOpen ? 1.1 : 1
                }}
              >
                <div className="letter-scene relative w-full h-full flex items-center justify-center">
                  <div className="scene-container w-full h-48 relative overflow-hidden rounded-lg">
                    <StarsBackground />
                    <FloatingHearts />
                    
                    <div className="message absolute inset-0 flex items-center justify-center">
                      <p className="font-['Dancing_Script'] text-xl text-white text-center px-4" style={{ textShadow: "0 0 10px rgba(0,0,0,0.5)" }}>
                        My heart is yours, now and forever
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
            
            <div className="letter-note mt-6 p-4 bg-white/10 backdrop-blur-md rounded-lg">
              <p className="font-['Dancing_Script'] text-lg text-white/90 mb-2">
                Touch the letter to reveal our special place...
              </p>
              <p className="text-white/70 text-sm">
                Hover or tap to interact with the elements inside
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
