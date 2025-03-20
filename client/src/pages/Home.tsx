import { useEffect, useState, useRef, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import ParallaxBackground from "@/components/ParallaxBackground";
import HeartCanvas from "@/components/HeartCanvas";
import LandingSection from "@/components/LandingSection";
import BirthdayCardSection from "@/components/BirthdayCardSection";
import LoveLetterSection from "@/components/LoveLetterSection";
import FinalSection from "@/components/FinalSection";

export default function Home() {
  // State for the current active section (0-3) and progress (0-1)
  const [activeSection, setActiveSection] = useState(0);
  const [transitionProgress, setTransitionProgress] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [touchStartY, setTouchStartY] = useState(0);
  const [wheelLocked, setWheelLocked] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [heartBurstMoment, setHeartBurstMoment] = useState(false);
  
  // Total number of sections
  const totalSections = 4;
  
  // Duration for transition animations (in ms)
  const transitionDuration = 1500;
  
  // Handle section transitions with a smooth animation
  const transitionToSection = useCallback((targetSection: number) => {
    if (isTransitioning || targetSection === activeSection) return;
    if (targetSection < 0 || targetSection >= totalSections) return;
    
    setIsTransitioning(true);
    
    // Create animation frames for the transition
    let startTime: number | null = null;
    const startSection = activeSection;
    
    const animateTransition = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / transitionDuration, 1);
      
      setTransitionProgress(progress);
      
      if (progress < 1) {
        requestAnimationFrame(animateTransition);
      } else {
        // Transition complete
        setActiveSection(targetSection);
        setTransitionProgress(0);
        setIsTransitioning(false);
        
        // Special effects for specific transitions
        if (targetSection === totalSections - 1) {
          setTimeout(() => {
            setHeartBurstMoment(true);
          }, 1000);
        }
      }
    };
    
    requestAnimationFrame(animateTransition);
    
    // Emit event for components to react to the section change
    const event = new CustomEvent('sectionchange', { 
      detail: { 
        from: activeSection, 
        to: targetSection,
        progress: 0 
      } 
    });
    window.dispatchEvent(event);
  }, [activeSection, isTransitioning, totalSections]);
  
  // Handle wheel events to navigate between sections
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (wheelLocked) return;
      
      // Determine direction and navigate to next/previous section
      if (e.deltaY > 50) {
        // Scrolling down - go to next section
        setWheelLocked(true);
        transitionToSection(Math.min(activeSection + 1, totalSections - 1));
        
        // Prevent rapid scrolling by adding a cooldown period
        setTimeout(() => {
          setWheelLocked(false);
        }, transitionDuration + 200);
      } else if (e.deltaY < -50) {
        // Scrolling up - go to previous section
        setWheelLocked(true);
        transitionToSection(Math.max(activeSection - 1, 0));
        
        // Prevent rapid scrolling
        setTimeout(() => {
          setWheelLocked(false);
        }, transitionDuration + 200);
      }
    };
    
    // Handle touch events for mobile
    const handleTouchStart = (e: TouchEvent) => {
      setTouchStartY(e.touches[0].clientY);
    };
    
    const handleTouchMove = (e: TouchEvent) => {
      if (isTransitioning) return;
      
      const touchY = e.touches[0].clientY;
      const deltaY = touchStartY - touchY;
      
      // Require significant swipe to trigger section change
      if (Math.abs(deltaY) > 50) {
        if (deltaY > 0) {
          // Swiping up - go to next section
          transitionToSection(Math.min(activeSection + 1, totalSections - 1));
        } else {
          // Swiping down - go to previous section
          transitionToSection(Math.max(activeSection - 1, 0));
        }
        
        // Reset touch position to prevent multiple triggers
        setTouchStartY(touchY);
      }
    };
    
    // Dispatch progress events during transitions
    const emitProgressEvents = () => {
      if (isTransitioning) {
        const event = new CustomEvent('sectionprogress', { 
          detail: { 
            from: activeSection, 
            progress: transitionProgress 
          } 
        });
        window.dispatchEvent(event);
      }
      
      requestAnimationFrame(emitProgressEvents);
    };
    
    const animationFrame = requestAnimationFrame(emitProgressEvents);
    
    window.addEventListener('wheel', handleWheel, { passive: false });
    window.addEventListener('touchstart', handleTouchStart);
    window.addEventListener('touchmove', handleTouchMove);
    
    // Keyboard navigation
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown' || e.key === 'PageDown') {
        transitionToSection(Math.min(activeSection + 1, totalSections - 1));
      } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
        transitionToSection(Math.max(activeSection - 1, 0));
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('keydown', handleKeyDown);
      cancelAnimationFrame(animationFrame);
    };
  }, [activeSection, isTransitioning, transitionProgress, touchStartY, wheelLocked, transitionToSection, totalSections]);
  
  // Add enhanced visual styles for the 3D experience
  useEffect(() => {
    // Remove default scrolling
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    
    const style = document.createElement("style");
    style.innerHTML = `
      html, body {
        margin: 0;
        padding: 0;
        overflow: hidden;
        background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
        background-attachment: fixed;
        height: 100%;
        font-family: 'Poppins', sans-serif;
        color: white;
        perspective: 1000px;
        perspective-origin: center;
      }
      
      /* 3D space container */
      .three-d-space {
        transform-style: preserve-3d;
        will-change: transform, perspective;
        transition: transform 0.05s ease-out, perspective 0.05s ease-out;
      }
      
      /* Section perspective */
      .perspective-section {
        transform-style: preserve-3d;
        will-change: transform, opacity;
        transition: transform 0.5s cubic-bezier(0.23, 1, 0.32, 1), opacity 0.5s cubic-bezier(0.23, 1, 0.32, 1);
      }
      
      /* Enhanced animations */
      @keyframes emerge {
        0% { opacity: 0; transform: translateZ(-500px) scale(0.7); }
        100% { opacity: 1; transform: translateZ(0) scale(1); }
      }
      
      @keyframes recede {
        0% { opacity: 1; transform: translateZ(0) scale(1); }
        100% { opacity: 0; transform: translateZ(500px) scale(1.3); }
      }
      
      @keyframes float-in-space {
        0% { transform: translateZ(-50px) translateY(0) rotate(0deg); }
        33% { transform: translateZ(30px) translateY(-15px) rotate(3deg); }
        66% { transform: translateZ(10px) translateY(-5px) rotate(-2deg); }
        100% { transform: translateZ(-50px) translateY(0) rotate(0deg); }
      }
      
      /* Particle effects */
      .particle {
        position: absolute;
        background-color: white;
        border-radius: 50%;
        pointer-events: none;
        opacity: 0;
        animation: particle-float 3s ease-in-out forwards;
        transform-style: preserve-3d;
      }
      
      @keyframes particle-float {
        0% { opacity: 0; transform: translateY(0) translateZ(0) translateX(0) scale(0); }
        20% { opacity: 1; }
        100% { opacity: 0; transform: translateY(-100px) translateZ(100px) translateX(var(--x)) scale(1) rotate(180deg); }
      }
      
      /* Enhanced depth effect */
      .depth-container {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100vh;
        transform-style: preserve-3d;
        overflow: hidden;
      }
      
      /* Navigation indicators */
      .section-indicator {
        position: fixed;
        right: 20px;
        top: 50%;
        transform: translateY(-50%);
        display: flex;
        flex-direction: column;
        gap: 10px;
        z-index: 1000;
      }
      
      .indicator-dot {
        width: 10px;
        height: 10px;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.3);
        cursor: pointer;
        transition: all 0.3s ease;
      }
      
      .indicator-dot.active {
        background: rgba(255, 255, 255, 1);
        transform: scale(1.3);
        box-shadow: 0 0 10px rgba(255, 51, 102, 0.8);
      }
      
      /* Heart burst animation */
      @keyframes heart-burst {
        0% { transform: scale(1); filter: brightness(1); }
        50% { transform: scale(2); filter: brightness(1.5) blur(2px); }
        100% { transform: scale(1); filter: brightness(1); }
      }
      
      .heart-burst {
        animation: heart-burst 1.5s cubic-bezier(0.17, 0.67, 0.83, 0.67);
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
    };
  }, []);

  // Calculate the position for each section based on active section and transition progress
  const getSectionStyle = (sectionIndex: number) => {
    // For the active section
    if (sectionIndex === activeSection) {
      return {
        zIndex: 10 + (totalSections - sectionIndex),
        opacity: 1,
        transform: isTransitioning ? 
          `translateZ(${500 * transitionProgress}px) scale(${1 + 0.3 * transitionProgress})` : 
          'translateZ(0) scale(1)',
        filter: isTransitioning ? `blur(${10 * transitionProgress}px)` : 'blur(0px)'
      };
    }
    
    // For the next section (emerging)
    if (sectionIndex === activeSection + 1 && isTransitioning) {
      return {
        zIndex: 5 + (totalSections - sectionIndex),
        opacity: transitionProgress,
        transform: `translateZ(${-500 * (1 - transitionProgress)}px) scale(${0.7 + 0.3 * transitionProgress})`,
        filter: `blur(${10 * (1 - transitionProgress)}px)`
      };
    }
    
    // For previous sections (already shown)
    if (sectionIndex < activeSection) {
      return {
        zIndex: 1 + (totalSections - sectionIndex),
        opacity: 0,
        transform: 'translateZ(500px) scale(1.3)',
        display: 'none' // Hide completely to improve performance
      };
    }
    
    // For future sections (not yet shown)
    return {
      zIndex: 1 + (totalSections - sectionIndex),
      opacity: 0,
      transform: 'translateZ(-500px) scale(0.7)',
      filter: 'blur(10px)'
    };
  };

  return (
    <div 
      className="relative min-h-screen overflow-hidden three-d-space"
      ref={containerRef}
    >
      {/* Background layer */}
      <ParallaxBackground scrollProgress={transitionProgress} />
      
      {/* Main heart that's always present */}
      <HeartCanvas burstMoment={heartBurstMoment} />
      
      {/* Layered sections that emerge from behind */}
      <div className="depth-container">
        <motion.div 
          className="section-layer"
          style={getSectionStyle(0)}
          initial={false}
        >
          <LandingSection 
            isActive={activeSection === 0}
            progress={activeSection === 0 ? transitionProgress : 0}
            onContinue={() => transitionToSection(1)} 
          />
        </motion.div>
        
        <motion.div 
          className="section-layer"
          style={getSectionStyle(1)}
          initial={false}
        >
          <BirthdayCardSection 
            isActive={activeSection === 1}
            progress={activeSection === 1 ? transitionProgress : 0}
            onContinue={() => transitionToSection(2)} 
          />
        </motion.div>
        
        <motion.div 
          className="section-layer"
          style={getSectionStyle(2)}
          initial={false}
        >
          <LoveLetterSection 
            isActive={activeSection === 2}
            progress={activeSection === 2 ? transitionProgress : 0}
            onContinue={() => transitionToSection(3)} 
          />
        </motion.div>
        
        <motion.div 
          className="section-layer"
          style={getSectionStyle(3)}
          initial={false}
        >
          <FinalSection 
            isActive={activeSection === 3}
            progress={activeSection === 3 ? transitionProgress : 0}
            onHeartBurst={() => setHeartBurstMoment(true)}
          />
        </motion.div>
      </div>
      
      {/* Navigation indicators */}
      <div className="section-indicator">
        {Array.from({ length: totalSections }).map((_, index) => (
          <div 
            key={index}
            className={`indicator-dot ${activeSection === index ? 'active' : ''}`}
            onClick={() => transitionToSection(index)}
          />
        ))}
      </div>
    </div>
  );
}
