import { useEffect, useState, useRef } from "react";
import { motion, useSpring, useTransform } from "framer-motion";
import ParallaxBackground from "@/components/ParallaxBackground";
import HeartCanvas from "@/components/HeartCanvas"; // Restored
import LandingSection from "@/components/LandingSection";
import BirthdayCardSection from "@/components/BirthdayCardSection";
import LoveLetterSection from "@/components/LoveLetterSection";
import FinalSection from "@/components/FinalSection";
import { useDeviceMotion } from "@/hooks/useDeviceMotion";

export default function Home() {
  const [mouseMoveEffect, setMouseMoveEffect] = useState({ x: 0, y: 0 });
  const [heartBurstMoment, setHeartBurstMoment] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const { alpha, beta, gamma } = useDeviceMotion();
  const totalSections = 4;

  // Scroll tracking
  const [scrollY, setScrollY] = useState(0);
  const springScroll = useSpring(scrollY, { stiffness: 100, damping: 30 });
  const [activeSection, setActiveSection] = useState(0); // Restored for indicator and events

  // Mouse movement
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 20;
      const y = (e.clientY / window.innerHeight - 0.5) * 20;
      setMouseMoveEffect({ x, y });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  },);

  // Scroll handler with sound and events
  useEffect(() => {
    const handleScroll = () => {
      if (containerRef.current) {
        const scrollPos = containerRef.current.scrollTop;
        setScrollY(scrollPos);

        const newSection = Math.min(Math.floor(scrollPos / window.innerHeight), totalSections - 1);
        if (newSection !== activeSection) {
          // Play transition sound
          const audio = new Audio("/sounds/transition.mp3");
          audio.volume = 0.4;
          audio.play().catch(() => {});

          // Dispatch sectionchange event
          window.dispatchEvent(
            new CustomEvent("sectionchange", {
              detail: { from: activeSection, to: newSection, progress: scrollPos / window.innerHeight },
            })
          );

          setActiveSection(newSection);

          // Heart burst on final section
          if (newSection === totalSections - 1 && !heartBurstMoment) {
            setHeartBurstMoment(true);
            setTimeout(() => setHeartBurstMoment(false), 2000);
          }
        }
      }
    };

    const container = containerRef.current;
    if (container) container.addEventListener("scroll", handleScroll);
    return () => {
      if (container) container.removeEventListener("scroll", handleScroll);
    };
  }, [activeSection, heartBurstMoment, totalSections]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        containerRef.current?.scrollTo({
          top: Math.min((activeSection + 1) * window.innerHeight, (totalSections - 1) * window.innerHeight),
          behavior: "smooth",
        });
      }
      if (e.key === "ArrowUp") {
        containerRef.current?.scrollTo({
          top: Math.max((activeSection - 1) * window.innerHeight, 0),
          behavior: "smooth",
        });
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeSection, totalSections]);

  // Styles
  useEffect(() => {
    const style = document.createElement("style");
    style.innerHTML = `
      body {
        margin: 0;
        padding: 0;
        background: linear-gradient(135deg, #1e1e3e 0%, #2a2a5e 100%);
        height: 100vh;
        font-family: 'Poppins', sans-serif;
        color: #fff;
      }
      .scroll-container {
        height: 100vh;
        overflow-y: auto;
        scroll-behavior: smooth;
        perspective: 1500px;
        overscroll-behavior: none;
      }
      .content {
        height: ${totalSections * 100}vh;
        position: relative;
        transform-style: preserve-3d;
      }
      .section {
        width: 100%;
        height: 100vh; /* Ensure sections fill the viewport */
        position: relative; /* Remove sticky for now, see if it helps with overlap */
        display: flex;
        align-items: center;
        justify-content: center;
        will-change: transform, opacity;
      }
      .section > div { /* Style direct children of section to ensure content is contained */
        width: 80%; /* Adjust as needed */
        max-width: 1200px; /* Adjust as needed */
        text-align: center;
      }
      .scrollable-section {
        overflow-y: auto;
        max-height: 100vh;
        -webkit-overflow-scrolling: touch;
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

    return () => document.head.removeChild(style);
  }, [totalSections]);

  const getSectionStyle = (index: number) => {
    const sectionHeight = window.innerHeight;
    const progress = useTransform(
      springScroll,
      [index * sectionHeight, (index + 1) * sectionHeight],
      [1, 0]
    );
    const scale = useTransform(progress, [0, 1], [0.7, 1]);
    const translateZ = useTransform(progress, [0, 1], [-800, 0]);
    const opacity = useTransform(progress, [0, 1], [0, 1]);
    const tiltX = (gamma ? gamma * 0.08 : 0) + mouseMoveEffect.y * 0.05;
    const tiltY = (beta ? beta * 0.08 : 0) + mouseMoveEffect.x * 0.05;

    return {
      scale,
      translateZ,
      opacity,
      rotateX: tiltX,
      rotateY: tiltY,
    };
  };

  // Function to calculate a more refined scroll progress for the dolly zoom
  const getDollyZoomScrollProgress = () => {
    if (!containerRef.current) return 0;
    const scrollHeight = totalSections * window.innerHeight;
    const currentScroll = containerRef.current.scrollTop;
    return currentScroll / scrollHeight;
  };

  return (
    <div className="scroll-container" ref={containerRef}>
      <ParallaxBackground
        scrollProgress={getDollyZoomScrollProgress()} // Use the refined scroll progress
        activeSection={activeSection}
        mouseEffect={mouseMoveEffect}
      />

      <div className="content">
        <motion.div className="section" style={getSectionStyle(0)}>
          <LandingSection
            isActive={activeSection === 0}
            progress={scrollY / window.innerHeight}
            onContinue={() => containerRef.current?.scrollTo({ top: window.innerHeight, behavior: "smooth" })}
          />
        </motion.div>
        <motion.div className="section" style={getSectionStyle(1)}>
          <BirthdayCardSection
            isActive={activeSection === 1}
            progress={(scrollY - window.innerHeight) / window.innerHeight}
            onContinue={() => containerRef.current?.scrollTo({ top: 2 * window.innerHeight, behavior: "smooth" })}
          />
        </motion.div>
        <motion.div className="section" style={getSectionStyle(2)}>
          <LoveLetterSection
            isActive={activeSection === 2}
            progress={(scrollY - 2 * window.innerHeight) / window.innerHeight}
            onContinue={() => containerRef.current?.scrollTo({ top: 3 * window.innerHeight, behavior: "smooth" })}
          />
        </motion.div>
        <motion.div className="section" style={getSectionStyle(3)}>
          <FinalSection
            isActive={activeSection === 3}
            progress={(scrollY - 3 * window.innerHeight) / window.innerHeight}
            onHeartBurst={() => setHeartBurstMoment(true)}
          />
        </motion.div>
      </div>

      <motion.div
        className="fixed top-5 left-5 z-50 text-white font-semibold text-xl"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.8 }}
      >
        Happy Birthday ❤️
      </motion.div>

      <div className="section-indicator">
        {Array.from({ length: totalSections }).map((_, index) => (
          <motion.div
            key={index}
            className={`indicator-dot ${activeSection === index ? "active" : ""}`}
            onClick={() => containerRef.current?.scrollTo({ top: index * window.innerHeight, behavior: "smooth" })}
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

      {heartBurstMoment && <HeartCanvas />}

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
          <path d="M11 5L6 9H2V15H6L11 19V5Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M15.54 8.46C16.4774 9.39764 17.004 10.6692 17.004 11.995C17.004 13.3208 16.4774 14.5924 15.54 15.53" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M19.07 5.93C20.9447 7.80528 21.9979 10.3447 21.9979 13C21.9979 15.6553 20.9447 18.1947 19.07 20.07" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </motion.button>

      <audio src="/sounds/background.mp3" loop />
    </div>
  );
}