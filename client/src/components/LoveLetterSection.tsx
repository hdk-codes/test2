import { useRef, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useScrollReveal } from "@/hooks/use-scroll-reveal";
import { useParallax } from "@/hooks/use-parallax";

function FloatingHearts({ isLetterOpen }: { isLetterOpen: boolean }) {
  const heartsContainerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (!heartsContainerRef.current) return;
    
    const container = heartsContainerRef.current;
    const numHearts = isLetterOpen ? 24 : 12; // More hearts when open
    const colors = ['#ff3366', '#ffb6c1', '#ff9e9e', '#ff4d79'];
    const sizes = [4, 5, 6, 7];
    
    // Clear existing hearts
    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }
    
    // Add floating animation if it doesn't exist
    if (!document.getElementById("float-animation")) {
      const style = document.createElement("style");
      style.id = "float-animation";
      style.textContent = `
        @keyframes float-3d {
          0%, 100% { transform: translateY(0) translateZ(0) rotate(0deg); }
          25% { transform: translateY(-15px) translateZ(20px) rotate(5deg); }
          50% { transform: translateY(-30px) translateZ(40px) rotate(0deg); }
          75% { transform: translateY(-15px) translateZ(20px) rotate(-5deg); }
        }
        
        @keyframes pulse-glow {
          0%, 100% { filter: drop-shadow(0 0 3px rgba(255, 51, 102, 0.7)); }
          50% { filter: drop-shadow(0 0 8px rgba(255, 51, 102, 0.9)); }
        }
      `;
      document.head.appendChild(style);
    }
    
    // Generate hearts with 3D positions
    for (let i = 0; i < numHearts; i++) {
      const heart = document.createElement("div");
      heart.className = "heart-item absolute";
      heart.style.transformStyle = "preserve-3d";
      
      // Position randomly with more depth when open
      const depthRange = isLetterOpen ? 100 : 40;
      const zPos = isLetterOpen ? Math.random() * depthRange - (depthRange / 2) : 0;
      
      heart.style.left = `${Math.random() * 80 + 10}%`;
      heart.style.top = `${Math.random() * 80 + 10}%`;
      heart.style.transform = `translateZ(${zPos}px)`;
      
      // Random animation with different settings for opened/closed states
      const duration = 5 + Math.random() * 5;
      const delay = Math.random() * 3;
      heart.style.animation = `float-3d ${duration}s ease-in-out infinite, pulse-glow 2s ease-in-out infinite`;
      heart.style.animationDelay = `${delay}s, ${delay + 1}s`;
      
      // Random size - larger hearts when open
      const sizeIndex = Math.floor(Math.random() * sizes.length);
      const size = isLetterOpen ? sizes[sizeIndex] + 1 : sizes[sizeIndex];
      
      // Random color
      const colorIndex = Math.floor(Math.random() * colors.length);
      const color = colors[colorIndex];
      
      // Create heart SVG
      heart.innerHTML = `
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          viewBox="0 0 24 24" 
          class="w-${size} h-${size} opacity-${Math.floor(Math.random() * 3) + 7}0" 
          fill="${color}"
          style="filter: drop-shadow(0 0 3px rgba(255, 51, 102, 0.7));"
        >
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
        </svg>
      `;
      
      container.appendChild(heart);
    }
    
    return () => {
      while (container.firstChild) {
        container.removeChild(container.firstChild);
      }
    };
  }, [isLetterOpen]);
  
  return (
    <div 
      className="floating-hearts-container absolute inset-0 flex items-center justify-center" 
      ref={heartsContainerRef}
      style={{ 
        transformStyle: 'preserve-3d',
        perspective: '1000px'
      }} 
    />
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
      
      // Create 3D star field with z-positions
      const size = Math.random() * 2 + 1;
      const x = Math.random() * 100;
      const y = Math.random() * 100;
      const z = Math.random() * 100 - 50; // z between -50 and 50
      
      star.style.width = `${size}px`;
      star.style.height = `${size}px`;
      star.style.left = `${x}%`;
      star.style.top = `${y}%`;
      star.style.opacity = (Math.random() * 0.5 + 0.3).toString();
      star.style.transform = `translateZ(${z}px)`;
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
    <div 
      className="stars-background absolute inset-0" 
      ref={starsRef}
      style={{ transformStyle: 'preserve-3d' }}
    />
  );
}

// Custom 3D folding letter animation
function ThreeDLetter({ isOpen, onToggle, children }: { 
  isOpen: boolean; 
  onToggle: () => void;
  children: React.ReactNode;
}) {
  const letterRef = useRef<HTMLDivElement>(null);
  
  const handleTouchStart = () => {
    // Add subtle sound effect
    if (typeof window !== 'undefined') {
      try {
        const audio = new Audio();
        audio.src = isOpen 
          ? 'data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4Ljc2LjEwMAAAAAAAAAAAAAAA//tQxAAAAAAAAAAAAAAAAAAAAAAASW5mbwAAAA8AAAASAAAeMwAUFBQUFCIiIiIiIjAwMDAwMD4+Pj4+PkxMTExMTFpaWlpaWmhoaGhoaHZ2dnZ2doSEhISEhJKSkpKSkqCgoKCgoK6urq6urrKysr6+vr6+vr6+vr6+vsbGxsbGxtLS0tLS0tra2tra2uLi4uLi4urq6urq6vLy8vLy8vr6+vr6+v///wAAADxhdmMxOUQMUAAAAwAAAAAAATwwWkAAAAAAAAAAAAAAAAAAAAAAACIiIiIiIhE+PT09PTWmpqampppaXl5eXl48XDz///9MfT///zE+Pj4+PiIiIiIiIgAAAAAAAAAAAAD/+2DEUQAMiABnmEAABYwIOMckJqinOnQ5OX9uBGBkMcJ0dCdFwOh+Lh0QQggKAyKhxK6bYe4HGaTwOm4UIWwsHg8HwZBBBH/+jkOQZIgnEA4Pj4Kh4Ph8EAQBDnEc//EeIfERiMP+jEUTiCMQd/4hGP4iEP////////ygYE0Tf/yE01Tf2oAAAAAAAAQAAAAIQmpqampqGGxMTEgYPjq+vy4d9eI4ji+L4OGBQ0IAQ4aBRM//54nBQbGxgcNDAoYEAoaDAwNCggMCAgICAgMDdBUTf/5cBUTf6DCUGxQUDhIGBQQGgpBnAACgLw0mGgaBgVAwQFAYaBwQGhQMCgMChQGBQGCAYBAgDBAIBgQEgYICA'
          : 'data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4Ljc2LjEwMAAAAAAAAAAAAAAA//tQxAAAAAAAAAAAAAAAAAAAAAAASW5mbwAAAA8AAAASAAAeMwAUFBQUFCIiIiIiIjAwMDAwMD4+Pj4+PkxMTExMTFpaWlpaWmhoaGhoaHZ2dnZ2doSEhISEhJKSkpKSkqCgoKCgoK6urq6urrKysr6+vr6+vr6+vr6+vsbGxsbGxtLS0tLS0tra2tra2uLi4uLi4urq6urq6vLy8vLy8vr6+vr6+v///wAAADxhdmMxOUQMUAAAAwAAAAAAATwwWkAAAAAAAAAAAAAAAAAAAAAAACIiIiIiIhE+PT09PTWmpqampppaXl5eXl48XDz///9MfT///zE+Pj4+PiIiIiIiIgAAAAAAAAAAAAD/+0LEcQAMKABnmDAAAYQACPMAAAAAKgjAo9CCNCCCRgg8IBTMfC3R5ipiRCAuOCCB0zN0vBeeMEcJQQIEAweCAIGDx9ZC8Kj+BTM7P6Orj+fPfMfT889M4/5Ppp/w0/PvQ/TPO/4hP8Mz8o/n/D03//w3/mc+fmf//M5/nO+fhF/i2t/yfM5/wyf/8p////yX////uQAGP//MZ///If///8jK//in////xE///yL///8JCaAkDkMf/yZv/+ZP//5kxm//Mv///yf///KCgIgU//pIKv/6k///+Sk///nCSzjDNCZkmfo5jLAilpESgkIjckdU+p3XkZCiMUlJDNHKlWsNS8JWQ6oCkqRLwWzSpIk4aii5CrVCfmMQFIIhQVSQ1KSZOTrJdpIJQcBihZDYgBEG4USHZN////';
        audio.volume = 0.2;
        audio.play();
      } catch (e) {
        console.log('Audio not supported');
      }
    }
    onToggle();
  };
  
  return (
    <div 
      ref={letterRef}
      className="three-d-letter w-full cursor-pointer"
      onClick={handleTouchStart}
      style={{ 
        transformStyle: 'preserve-3d',
        perspective: '1500px',
        transition: 'all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
      }}
    >
      <motion.div 
        className="letter-wrapper"
        style={{
          transformStyle: 'preserve-3d',
          transformOrigin: 'center center',
          boxShadow: isOpen ? '0 15px 40px rgba(0, 0, 0, 0.3)' : '0 5px 20px rgba(0, 0, 0, 0.2)'
        }}
        animate={{
          rotateY: isOpen ? 180 : 0,
          z: isOpen ? 50 : 0
        }}
        transition={{
          type: "spring",
          stiffness: 150,
          damping: 15
        }}
      >
        {/* Front of the letter - showing when closed */}
        <div 
          className="letter-front absolute inset-0 w-full h-full bg-gradient-to-r from-[#ffb6c1] to-[#ff3366] rounded-lg p-6"
          style={{
            backfaceVisibility: 'hidden',
            transformStyle: 'preserve-3d'
          }}
        >
          <div className="envelope-design h-full w-full flex flex-col items-center justify-center">
            <div className="seal w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mx-auto">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" className="w-10 h-10">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
              </svg>
            </div>
            <p 
              className="font-['Dancing_Script'] text-2xl text-white mt-4 text-center"
              style={{ 
                textShadow: '0 2px 4px rgba(0,0,0,0.3)', 
                transform: 'translateZ(20px)'
              }}
            >
              For my love
            </p>
            <div 
              className="envelope-edge absolute bottom-0 left-0 right-0 h-2 bg-[#ff2356]"
              style={{ transform: 'translateZ(1px)' }}
            />
          </div>
        </div>
        
        {/* Back of the letter - showing when open */}
        <div 
          className="letter-back absolute inset-0 w-full h-full bg-gradient-to-r from-[#ff9e9e] to-[#ff6b8b] rounded-lg"
          style={{
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
            transformStyle: 'preserve-3d'
          }}
        >
          {children}
        </div>
      </motion.div>
    </div>
  );
}

// 3D miniature scene that appears inside the letter
function MiniatureScene() {
  return (
    <div 
      className="miniature-scene w-full h-full p-4 flex items-center justify-center"
      style={{ transformStyle: 'preserve-3d' }}
    >
      <div 
        className="scene-container w-full h-full relative overflow-hidden rounded-lg bg-gradient-to-b from-[#241c5c] to-[#0c0a21]"
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* 3D scene elements */}
        <div className="scene-sky absolute inset-0" style={{ transformStyle: 'preserve-3d' }}>
          <StarsBackground />
        </div>
        
        <div className="scene-content flex items-center justify-center h-full" style={{ transformStyle: 'preserve-3d' }}>
          <div 
            className="moon absolute w-20 h-20 rounded-full bg-[#f5f5f5]"
            style={{ 
              top: '15%', 
              right: '15%',
              boxShadow: '0 0 20px rgba(255,255,255,0.4)',
              transform: 'translateZ(10px)'
            }}
          />
          
          <div 
            className="mountains absolute bottom-0 w-full"
            style={{ transform: 'translateZ(20px)' }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" preserveAspectRatio="none" width="100%" height="100">
              <path fill="#352a6d" fillOpacity="0.5" d="M0,160L48,165.3C96,171,192,181,288,165.3C384,149,480,107,576,80C672,53,768,43,864,64C960,85,1056,139,1152,154.7C1248,171,1344,149,1392,138.7L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
            </svg>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" preserveAspectRatio="none" width="100%" height="120" style={{ marginTop: '-50px' }}>
              <path fill="#141033" fillOpacity="0.9" d="M0,64L48,80C96,96,192,128,288,133.3C384,139,480,117,576,128C672,139,768,181,864,186.7C960,192,1056,160,1152,160C1248,160,1344,192,1392,208L1440,224L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
            </svg>
          </div>
          
          {/* Silhouette of couple */}
          <div 
            className="silhouette absolute bottom-10 left-1/2 transform -translate-x-1/2"
            style={{ transform: 'translateZ(40px)' }}
          >
            <svg width="120" height="80" viewBox="0 0 120 80" fill="black">
              <path d="M40,70 C40,50 30,40 20,40 C10,40 0,50 0,70 L40,70 Z" fill="black"/>
              <path d="M80,70 C80,50 70,40 60,40 C50,40 40,50 40,70 L80,70 Z" fill="black"/>
              <circle cx="20" cy="30" r="10" fill="black" />
              <circle cx="60" cy="30" r="10" fill="black" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}

interface LoveLetterSectionProps {
  scrollProgress?: number;
  isActive?: boolean;
  progress?: number;
  onContinue?: () => void;
}

export default function LoveLetterSection({
  scrollProgress = 0,
  isActive = false,
  progress = 0,
  onContinue
}: LoveLetterSectionProps) {
  const [isLetterOpen, setIsLetterOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const letterWrapperRef = useRef<HTMLDivElement>(null);
  const parallaxRef = useRef<HTMLDivElement>(null);
  
  // Enhanced scroll reveal
  useScrollReveal(letterWrapperRef, {
    threshold: 0.2,
    duration: 1.2
  });
  
  // Enhanced parallax effect
  useParallax(parallaxRef, 0.8);
  
  // Use scroll progress for enhanced depth effect
  useEffect(() => {
    if (!containerRef.current) return;
    
    // Apply dolly zoom effect
    const zTranslate = scrollProgress * 50;
    containerRef.current.style.transform = `translateZ(${zTranslate}px)`;
  }, [scrollProgress]);
  
  const toggleLetter = () => {
    setIsLetterOpen(!isLetterOpen);
  };
  
  return (
    <section 
      id="love-letter" 
      className="min-h-screen w-full flex flex-col items-center justify-center py-16 px-4 z-30 perspective-section"
      ref={containerRef}
      style={{ 
        transformStyle: 'preserve-3d',
        perspective: '1000px',
        transition: 'transform 0.2s ease-out'
      }}
    >
      <div 
        className="letter-container w-full max-w-md" 
        ref={parallaxRef}
        style={{ transformStyle: 'preserve-3d' }}
      >
        <div 
          className="letter-wrapper reveal" 
          ref={letterWrapperRef}
          style={{ transformStyle: 'preserve-3d' }}
        >
          <motion.div 
            className="foldable-letter relative bg-gradient-to-b from-white/10 to-white/5 backdrop-blur-sm rounded-xl p-6 shadow-xl"
            whileHover={{ 
              boxShadow: "0 0 30px rgba(255,255,255,0.3)"
            }}
            style={{ transformStyle: 'preserve-3d' }}
          >
            <ThreeDLetter 
              isOpen={isLetterOpen} 
              onToggle={toggleLetter}
            >
              <div className="letter-content px-2 py-4" style={{ transformStyle: 'preserve-3d' }}>
                <MiniatureScene />
                <FloatingHearts isLetterOpen={isLetterOpen} />
                
                <motion.div 
                  className="message absolute inset-0 flex items-center justify-center pointer-events-none"
                  initial={{ opacity: 0 }}
                  animate={{ 
                    opacity: 1,
                    y: isLetterOpen ? -10 : 0,
                    z: isLetterOpen ? 60 : 30
                  }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                  style={{ transform: 'translateZ(60px)' }}
                >
                  <p 
                    className="font-['Dancing_Script'] text-2xl text-white text-center px-4 pointer-events-none" 
                    style={{ 
                      textShadow: "0 0 10px rgba(0,0,0,0.8)",
                      opacity: 0.9
                    }}
                  >
                    My heart is yours, now and forever
                  </p>
                </motion.div>
              </div>
            </ThreeDLetter>
            
            <AnimatePresence>
              {!isLetterOpen && (
                <motion.div 
                  className="letter-note mt-6 p-4 bg-white/10 backdrop-blur-md rounded-lg"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  style={{ transform: 'translateZ(20px)' }}
                >
                  <p className="font-['Dancing_Script'] text-lg text-white/90 mb-2">
                    Touch the letter to reveal our special place...
                  </p>
                  <p className="text-white/70 text-sm">
                    Unfold to see our magical moment together
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
            
            <AnimatePresence>
              {isLetterOpen && (
                <motion.div 
                  className="letter-open-message mt-6 p-4 bg-white/10 backdrop-blur-md rounded-lg"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  style={{ transform: 'translateZ(20px)' }}
                >
                  <p className="font-['Dancing_Script'] text-lg text-white/90 mb-2">
                    Remember that night under the stars...
                  </p>
                  <p className="text-white/70 text-sm">
                    When I promised to love you forever
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
