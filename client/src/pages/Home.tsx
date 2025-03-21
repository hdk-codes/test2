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
  const [mouseMoveEffect, setMouseMoveEffect] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const { alpha, beta, gamma } = useDeviceMotion(); // For mobile tilt
  const totalSections = 4;
  const transitionDuration = 1000;

  // Mouse movement for parallax
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 20;
      const y = (e.clientY / window.innerHeight - 0.5) * 20;
      setMouseMoveEffect({ x, y });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const transitionToSection = useCallback(
    (targetSection: number) => {
      if (isTransitioning || targetSection === activeSection) return;
      if (targetSection < 0 || targetSection >= totalSections) return;

      setIsTransitioning(true);
      let startTime: number | null = null;

      const audio = new Audio("/sounds/transition.mp3");
      audio.volume = 0.4;
      audio.play().catch(() => {});

      const animateTransition = (timestamp: number) => {
        if (!startTime) startTime = timestamp;
        const elapsed = timestamp - startTime;
        const progress = Math.min(elapsed / transitionDuration, 1);
        const easedProgress = progress < 0.5 ? 2 * progress * progress : -1 + (4 - 2 * progress) * progress;

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

  // Particle effects
  useEffect(() => {
    const particleContainer = document.createElement("div");
    particleContainer.className = "absolute inset-0 pointer-events-none z-10";
    document.body.appendChild(particleContainer);

    for (let i = 0; i < 50; i++) {
      const particle = document.createElement("div");
      particle.className = "absolute rounded-full bg-white opacity-40";
      particle.style.width = `${Math.random() * 3 + 1}px`;
      particle.style.height = particle.style.width;
      particle.style.left = `${Math.random() * 100}vw`;
      particle.style.top = `${Math.random() * 100}vh`;
      particle.style.animation = `float ${Math.random() * 10 + 10}s linear infinite`;
      particleContainer.appendChild(particle);
    }

    const style = document.createElement("style");
    style.textContent = `
      @keyframes float {
        0% { transform: translate(0, 0) rotate(0deg); }
        50% { transform: translate(100px, 100px) rotate(180deg); }
        100% { transform: translate(0, 0) rotate(360deg); }
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.body.removeChild(particleContainer);
      document.head.removeChild(style);
    };
  }, []);

  // Scroll and touch handling
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (wheelLocked || isTransitioning) return;

      const target = e.target as HTMLElement;
      const scrollable = target.closest(".scrollable-section"); // Add this class to scrollable areas

      if (scrollable) {
        const atTop = scrollable.scrollTop === 0;
        const atBottom =
          scrollable.scrollTop + scrollable.clientHeight >= scrollable.scrollHeight - 1;

        if ((e.deltaY < 0 && atTop) || (e.deltaY > 0 && atBottom)) {
          e.preventDefault();
          setWheelLocked(true);
          const delta = Math.sign(e.deltaY);
          transitionToSection(activeSection + delta);
          setTimeout(() => setWheelLocked(false), transitionDuration + 100);
        }
      } else {
        e.preventDefault();
        setWheelLocked(true);
        const delta = Math.sign(e.deltaY);
        transitionToSection(activeSection + delta);
        setTimeout(() => setWheelLocked(false), transitionDuration + 100);
      }
    };

    const handleTouchStart = (e: TouchEvent) => setTouchStartY(e.touches[0].clientY);

    const handleTouchMove = (e: TouchEvent) => {
      if (isTransitioning) return;
      const touchY = e.touches[0].clientY;
      const deltaY = touchStartY - touchY;

      const target = e.target as HTMLElement;
      const scrollable = target.closest(".scrollable-section");

      if (scrollable) {
        const atTop = scrollable.scrollTop === 0;
        const atBottom =
          scrollable.scrollTop + scrollable.clientHeight >= scrollable.scrollHeight - 1;

        if (Math.abs(deltaY) > 50) {
          if ((deltaY < 0 && atTop) || (deltaY > 0 && atBottom)) {
            transitionToSection(deltaY > 0 ? activeSection + 1 : activeSection - 1);
            setTouchStartY(touchY);
          }
        }
      } else if (Math.abs(deltaY) > 50) {
        transitionToSection(deltaY > 0 ? activeSection + 1 : activeSection - 1);
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

  // Styles
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
        perspective: 1500px;
        overscroll-behavior: none;
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
        transition: filter 0.5s cubic-bezier(0.645, 0.045, 0.355, 1.000);
      }
      .scrollable-section {
        overflow-y: auto;
        max-height: 100vh;
        -webkit-overflow-scrolling: touch; /* Smooth scrolling on iOS */
      }
      .section-indicator {
        position: fixed;
        right: 20px;
        top: 50%;
        transform: translateY(-50%);
        display: flex;
        flex-direction: column;
        gap: 15px;
        z-index: 1000;
      }
      .indicator-dot {
        width: 12px;
        height: 12px;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.4);
        cursor: pointer;
        transition: all 0.4s cubic-bezier(0.645, 0.045, 0.355, 1.000);
        box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
      }
      .indicator-dot.active {
        background: #ff6b8b;
        transform: scale(1.5);
        box-shadow: 0 0 20px rgba(255, 107, 139, 0.8);
      }
      .indicator-dot:hover {
        transform: scale(1.3);
        background: rgba(255, 255, 255, 0.8);
      }
      .indicator-dot.active:hover {
        transform: scale(1.5);
        background: #ff6b8b;
      }
      @keyframes heartPulse {
        0% { transform: scale(1); filter: brightness(1); }
        50% { transform: scale(1.3); filter: brightness(1.5); }
        100% { transform: scale(1); filter: brightness(1); }
      }
      .heart-pulse {
        animation: heartPulse 1.5s infinite ease-in-out;
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
    const tiltX = (gamma ? gamma * 0.08 : 0) + mouseMoveEffect.y * 0.05;
    const tiltY = (beta ? beta * 0.08 : 0) + mouseMoveEffect.x * 0.05;

    if (sectionIndex === activeSection) {
      return {
        zIndex: 10 + (totalSections - sectionIndex),
        opacity: 1,
        transform: isTransitioning
          ? `translateZ(${800 * transitionProgress}px) scale(${1 + 0.3 * transitionProgress}) rotateX(${tiltX}deg) rotateY(${tiltY}deg)`
          : `translateZ(0px) scale(1) rotateX(${tiltX}deg) rotateY(${tiltY}deg)`,
        filter: isTransitioning ? `blur(${6 * transitionProgress}px) brightness(${1 - 0.3 * transitionProgress})` : "blur(0px) brightness(1)",
      };
    }

    if (sectionIndex === activeSection + 1 && isTransitioning) {
      return {
        zIndex: 5 + (totalSections - sectionIndex),
        opacity: transitionProgress,
        transform: `translateZ(${-800 * (1 - transitionProgress)}px) scale(${0.7 + 0.3 * transitionProgress}) rotateX(${tiltX}deg) rotateY(${tiltY}deg)`,
        filter: `blur(${8 * (1 - transitionProgress)}px) brightness(${0.7 + 0.3 * transitionProgress})`,
      };
    }

    if (sectionIndex < activeSection) {
      return {
        zIndex: 1 + (totalSections - sectionIndex),
        opacity: 0,
        transform: "translateZ(800px) scale(1.3)",
        pointerEvents: "none",
        display: "none",
      };
    }

    return {
      zIndex: 1 + (totalSections - sectionIndex),
      opacity: 0,
      transform: "translateZ(-800px) scale(0.7)",
      filter: "blur(8px) brightness(0.7)",
      pointerEvents: "none",
    };
  };

  return (
    <div className="relative min-h-screen overflow-hidden three-d-space" ref={containerRef}>
      <ParallaxBackground
        scrollProgress={transitionProgress}
        activeSection={activeSection}
        mouseEffect={mouseMoveEffect}
      />

      <motion.div
        className="fixed top-5 left-5 z-50 text-white font-semibold text-xl"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.8 }}
      >
        Happy Birthday ❤️
      </motion.div>

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
          <motion.div
            key={index}
            className={`indicator-dot ${activeSection === index ? "active" : ""}`}
            onClick={() => transitionToSection(index)}
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.9 }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{
              scale: activeSection === index ? 1.5 : 1,
              opacity: 1,
              boxShadow: activeSection === index
                ? "0 0 15px rgba(255, 107, 139, 0.8)"
                : "0 0 5px rgba(255, 255, 255, 0.3)",
            }}
            transition={{ delay: index * 0.1 + 0.5, duration: 0.5, type: "spring" }}
          />
        ))}
      </div>

      <motion.button
        className="fixed bottom-5 right-5 z-50 w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition-all"
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1.5, type: "spring" }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => {
          const audioEl = document.querySelector("audio");
          if (audioEl) audioEl.paused ? audioEl.play() : audioEl.pause();
        }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M11 5L6 9H2V15H6L11 19V5Z"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M15.54 8.46C16.4774 9.39764 17.004 10.6692 17.004 11.995C17.004 13.3208 16.4774 14.5924 15.54 15.53"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M19.07 5.93C20.9447 7.80528 21.9979 10.3447 21.9979 13C21.9979 15.6553 20.9447 18.1947 19.07 20.07"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </motion.button>

      <audio src="/sounds/background.mp3" loop />
    </div>
  );
}