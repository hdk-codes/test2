import { useEffect, useState, useRef, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import ParallaxBackground from "@/components/ParallaxBackground";
import HeartCanvas from "@/components/HeartCanvas";
import LandingSection from "@/components/LandingSection";
import BirthdayCardSection from "@/components/BirthdayCardSection";
import LoveLetterSection from "@/components/LoveLetterSection";
import FinalSection from "@/components/FinalSection";
import { useDeviceMotion } from "@/hooks/useDeviceMotion";

export default function Home() {
  const [activeSection, setActiveSection] = useState(0);
  const [transitionProgress, setTransitionProgress] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [touchStartY, setTouchStartY] = useState(0);
  const [wheelLocked, setWheelLocked] = useState(false);
  const [heartBurstMoment, setHeartBurstMoment] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const { alpha, beta, gamma } = useDeviceMotion(); // For mobile tilt
  const totalSections = 4;
  const transitionDuration = 1200; // Smoother transitions

  const transitionToSection = useCallback(
    (targetSection: number) => {
      if (isTransitioning || targetSection === activeSection) return;
      if (targetSection < 0 || targetSection >= totalSections) return;

      setIsTransitioning(true);
      let startTime: number | null = null;
      const startSection = activeSection;

      const animateTransition = (timestamp: number) => {
        if (!startTime) startTime = timestamp;
        const elapsed = timestamp - startTime;
        const progress = Math.min(elapsed / transitionDuration, 1);
        const easedProgress = 1 - Math.pow(1 - progress, 4); // Ease-out-quart for smoothness

        setTransitionProgress(easedProgress);

        if (progress < 1) {
          requestAnimationFrame(animateTransition);
        } else {
          setActiveSection(targetSection);
          setTransitionProgress(0);
          setIsTransitioning(false);

          if (targetSection === totalSections - 1) {
            setHeartBurstMoment(true);
            setTimeout(() => setHeartBurstMoment(false), 2000);
          }
        }
      };

      requestAnimationFrame(animateTransition);

      window.dispatchEvent(
        new CustomEvent("sectionchange", {
          detail: { from: activeSection, to: targetSection, progress: 0 },
        })
      );
    },
    [activeSection, isTransitioning, totalSections]
  );

  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (wheelLocked) return;
      const delta = Math.abs(e.deltaY) > 50 ? e.deltaY : 0;
      if (delta > 0) {
        setWheelLocked(true);
        transitionToSection(Math.min(activeSection + 1, totalSections - 1));
        setTimeout(() => setWheelLocked(false), transitionDuration + 100);
      } else if (delta < 0) {
        setWheelLocked(true);
        transitionToSection(Math.max(activeSection - 1, 0));
        setTimeout(() => setWheelLocked(false), transitionDuration + 100);
      }
    };

    const handleTouchStart = (e: TouchEvent) => setTouchStartY(e.touches[0].clientY);
    const handleTouchMove = (e: TouchEvent) => {
      if (isTransitioning) return;
      const touchY = e.touches[0].clientY;
      const deltaY = touchStartY - touchY;
      if (Math.abs(deltaY) > 30) {
        if (deltaY > 0) transitionToSection(Math.min(activeSection + 1, totalSections - 1));
        else transitionToSection(Math.max(activeSection - 1, 0));
        setTouchStartY(touchY);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown") transitionToSection(Math.min(activeSection + 1, totalSections - 1));
      if (e.key === "ArrowUp") transitionToSection(Math.max(activeSection - 1, 0));
    };

    window.addEventListener("wheel", handleWheel, { passive: false });
    window.addEventListener("touchstart", handleTouchStart);
    window.addEventListener("touchmove", handleTouchMove);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("wheel", handleWheel);
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [activeSection, isTransitioning, touchStartY, wheelLocked, transitionToSection, totalSections]);

  useEffect(() => {
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";

    const style = document.createElement("style");
    style.innerHTML = `
      body {
        margin: 0;
        padding: 0;
        background: linear-gradient(135deg, #1e1e3e 0%, #2a2a5e 100%);
        height: 100vh;
        font-family: 'Poppins', sans-serif;
        color: #fff;
        perspective: 1200px;
      }
      .three-d-space {
        transform-style: preserve-3d;
        will-change: transform;
      }
      .section-layer {
        position: absolute;
        width: 100%;
        height: 100vh;
        transform-style: preserve-3d;
        will-change: transform, opacity, filter;
      }
      .section-indicator {
        position: fixed;
        right: 15px;
        top: 50%;
        transform: translateY(-50%);
        display: flex;
        flex-direction: column;
        gap: 12px;
        z-index: 1000;
      }
      .indicator-dot {
        width: 12px;
        height: 12px;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.4);
        cursor: pointer;
        transition: all 0.4s ease;
      }
      .indicator-dot.active {
        background: #ff6b8b;
        transform: scale(1.5);
        box-shadow: 0 0 15px rgba(255, 107, 139, 0.8);
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
      document.head.removeChild(style);
    };
  }, []);

  const getSectionStyle = (sectionIndex: number) => {
    const tiltX = gamma ? gamma * 0.1 : 0;
    const tiltY = beta ? beta * 0.1 : 0;

    if (sectionIndex === activeSection) {
      return {
        zIndex: 10 + (totalSections - sectionIndex),
        opacity: 1,
        transform: isTransitioning
          ? `translateZ(${600 * transitionProgress}px) scale(${1 + 0.4 * transitionProgress}) rotateX(${tiltX}deg) rotateY(${tiltY}deg)`
          : `translateZ(0px) scale(1) rotateX(${tiltX}deg) rotateY(${tiltY}deg)`,
        filter: isTransitioning ? `blur(${8 * transitionProgress}px)` : "blur(0px)",
      };
    }

    if (sectionIndex === activeSection + 1 && isTransitioning) {
      return {
        zIndex: 5 + (totalSections - sectionIndex),
        opacity: transitionProgress,
        transform: `translateZ(${-600 * (1 - transitionProgress)}px) scale(${0.6 + 0.4 * transitionProgress}) rotateX(${tiltX}deg) rotateY(${tiltY}deg)`,
        filter: `blur(${8 * (1 - transitionProgress)}px)`,
      };
    }

    if (sectionIndex < activeSection) {
      return {
        zIndex: 1 + (totalSections - sectionIndex),
        opacity: 0,
        transform: "translateZ(600px) scale(1.4)",
        display: "none",
      };
    }

    return {
      zIndex: 1 + (totalSections - sectionIndex),
      opacity: 0,
      transform: "translateZ(-600px) scale(0.6)",
      filter: "blur(8px)",
    };
  };

  return (
    <div className="relative min-h-screen overflow-hidden three-d-space" ref={containerRef}>
      <ParallaxBackground scrollProgress={transitionProgress} />
      <HeartCanvas burstMoment={heartBurstMoment} />

      <div className="depth-container">
        <motion.div className="section-layer" style={getSectionStyle(0)} initial={false}>
          <LandingSection
            isActive={activeSection === 0}
            progress={activeSection === 0 ? transitionProgress : 0}
            onContinue={() => transitionToSection(1)}
          />
        </motion.div>
        <motion.div className="section-layer" style={getSectionStyle(1)} initial={false}>
          <BirthdayCardSection
            isActive={activeSection === 1}
            progress={activeSection === 1 ? transitionProgress : 0}
            onContinue={() => transitionToSection(2)}
          />
        </motion.div>
        <motion.div className="section-layer" style={getSectionStyle(2)} initial={false}>
          <LoveLetterSection
            isActive={activeSection === 2}
            progress={activeSection === 2 ? transitionProgress : 0}
            onContinue={() => transitionToSection(3)}
          />
        </motion.div>
        <motion.div className="section-layer" style={getSectionStyle(3)} initial={false}>
          <FinalSection
            isActive={activeSection === 3}
            progress={activeSection === 3 ? transitionProgress : 0}
            onHeartBurst={() => setHeartBurstMoment(true)}
          />
        </motion.div>
      </div>

      <div className="section-indicator">
        {Array.from({ length: totalSections }).map((_, index) => (
          <div
            key={index}
            className={`indicator-dot ${activeSection === index ? "active" : ""}`}
            onClick={() => transitionToSection(index)}
          />
        ))}
      </div>
    </div>
  );
}