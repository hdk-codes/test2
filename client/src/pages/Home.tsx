import { useEffect, useState, useRef, useCallback, useMemo, memo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import ParallaxBackground from "@/components/ParallaxBackground";
import HeartCanvas from "@/components/HeartCanvas";
import LandingSection from "@/components/LandingSection";
import BirthdayCardSection from "@/components/BirthdayCardSection";
import LoveLetterSection from "@/components/LoveLetterSection";
import FinalSection from "@/components/FinalSection";
import { useDeviceMotion } from "@/hooks/useDeviceMotion";
import { useThrottledCallback } from "@/hooks/useThrottledCallback";
import { useSection } from "@/hooks/useSection";
import { LandingData, BirthdayCardData, LoveLetterData } from '@/lib/schema';
import { useQuery } from '@tanstack/react-query';
import { client } from '@/lib/sanityClient';

// Add type for section styles
type SectionStyleType = {
  zIndex: number;
  opacity: number;
  transform: string;
  filter?: string;
  transition?: string;
  pointerEvents?: 'none';
  display?: 'none';
};

type SectionKeys = 'landing' | 'birthday' | 'loveLetter' | 'final';

export default function Home() {
  const [activeSection, setActiveSection] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [transitionProgress, setTransitionProgress] = useState(0);
  const [mouseMoveEffect, setMouseMoveEffect] = useState({ x: 0, y: 0 });
  const [heartBeatRate, setHeartBeatRate] = useState(1000);
  const [heartScale, setHeartScale] = useState(1);
  const heartRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { alpha, beta, gamma } = useDeviceMotion();
  const totalSections = 4;

  // Add section data hooks
  const { data: landingData, loading: landingLoading } = useSection<LandingData>('landing');
  const { data: birthdayData, loading: birthdayLoading } = useSection<BirthdayCardData>('birthdayCard');

  // Update letter data fetching with simplified query and debug logs
  const { data: letterData, isLoading: letterLoading } = useQuery({
    queryKey: ['loveLetter'],
    queryFn: async () => {
      try {
        const query = `*[_type == "loveLetter"][0]{
          _id,
          title,
          theme { primaryColor, fontFamily, animation },
          content,
          letters[]{
            author,
            content,
            mood,
            createdAt,
            attachments[]{
              _type,
              platform,
              url,
              asset->{url, originalFilename}
            },
            reactions[] { emoji, timestamp }
          },
          privacy { isPrivate, password },
          sharedMemories[]{
            date,
            title,
            description,
            location,
            images[]{asset->{url}}
          },
          animations { openingEffect, backgroundEffect },
          effects
        }`;
        
        const data = await client.fetch(query);
        console.log('Love letter raw data:', data); // Debug log
        
        // Allow data to be null (no love letter exists)
        return data || null;
      } catch (error) {
        console.error('Error fetching love letter:', error);
        throw error;
      }
    },
    staleTime: Infinity
  });

  // Loading state for transitions
  const isLoading = landingLoading || birthdayLoading || letterLoading;

  // Add progress indicator
  const [loadingProgress, setLoadingProgress] = useState(0);

  // Simulate loading progress
  useEffect(() => {
    if (!isLoading) {
      setLoadingProgress(100);
      return;
    }
    const interval = setInterval(() => {
      setLoadingProgress((prev) => Math.min(prev + 10, 90));
    }, 300);
    return () => clearInterval(interval);
  }, [isLoading]);

  // Throttle mouse move handlers for better performance
  const handleMouseMove = useThrottledCallback((e: MouseEvent) => {
    const x = (e.clientX / window.innerWidth - 0.5) * 20;
    const y = (e.clientY / window.innerHeight - 0.5) * 20;
    setMouseMoveEffect({ x, y });
  }, 16); // ~60fps

  // Add cursor distance calculation for heart
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (heartRef.current) {
        const rect = heartRef.current.getBoundingClientRect();
        const heartCenterX = rect.left + rect.width / 2;
        const heartCenterY = rect.top + rect.height / 2;
        const distance = Math.sqrt(
          Math.pow(e.clientX - heartCenterX, 2) + Math.pow(e.clientY - heartCenterY, 2)
        );
        const normalizedDistance = Math.min(Math.max(distance / 300, 0), 1);
        setHeartBeatRate(1000 + normalizedDistance * 500);
        setHeartScale(1 + (1 - normalizedDistance) * 0.2);
      }
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const transitionToSection = useCallback(
    (targetSection: number) => {
      if (isTransitioning || targetSection === activeSection) return;
      if (targetSection < 0 || targetSection >= totalSections) return;

      setIsTransitioning(true);
      setTransitionProgress(0);
      let startTime: number | null = null;

      const audio = new Audio("/sounds/transition.mp3");
      audio.volume = 0.4;
      audio.play().catch(() => {});

      const animateTransition = (timestamp: number) => {
        if (!startTime) startTime = timestamp;
        const elapsed = timestamp - startTime;
        const progress = Math.min(elapsed / 1000, 1);
        const easedProgress = progress < 0.5 ? 2 * progress * progress : -1 + (4 - 2 * progress) * progress;
        
        setTransitionProgress(easedProgress);

        if (progress < 1) {
          requestAnimationFrame(animateTransition);
        } else {
          setActiveSection(targetSection);
          setIsTransitioning(false);
          setTransitionProgress(0);
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

  // Scroll and touch handling
  useEffect(() => {
    let scrollTimeout: NodeJS.Timeout;
    let touchStartTime = 0;
    let lastScrollTime = 0;
    const scrollCooldown = 800; // ms between scroll events

    const handleWheel = (e: WheelEvent) => {
      const now = Date.now();
      if (isTransitioning || now - lastScrollTime < scrollCooldown) {
        e.preventDefault();
        return;
      }

      const target = e.target as HTMLElement;
      const scrollableParent = target.closest('.scrollable-section');

      if (scrollableParent) {
        const { scrollTop, scrollHeight, clientHeight } = scrollableParent;
        const isAtTop = scrollTop <= 0;
        const isAtBottom = Math.abs(scrollHeight - scrollTop - clientHeight) <= 1;
        const isScrollingUp = e.deltaY < 0;
        const isScrollingDown = e.deltaY > 0;

        // Allow internal scrolling
        if (!isAtTop && !isAtBottom) return;

        // Prevent section change if not at bounds
        if ((isScrollingUp && !isAtTop) || (isScrollingDown && !isAtBottom)) {
          return;
        }

        e.preventDefault();
        lastScrollTime = now;
        transitionToSection(activeSection + (isScrollingUp ? -1 : 1));
      } else {
        e.preventDefault();
        lastScrollTime = now;
        transitionToSection(activeSection + (e.deltaY < 0 ? -1 : 1));
      }
    };

    const handleTouchStart = (e: TouchEvent) => {
      touchStartTime = Date.now();
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (isTransitioning) return;

      const touchY = e.touches[0].clientY;
      const deltaY = touchStartTime - touchY;
      const deltaTime = Date.now() - touchStartTime;

      const target = e.target as HTMLElement;
      const scrollableParent = target.closest('.scrollable-section');
      const isClickableElement = target.closest('button, a, input, [role="button"], .interactive');

      if (isClickableElement) return;

      // Improved touch handling logic here
      // ...rest of the touch handling code...
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
  }, [activeSection, isTransitioning, transitionToSection, totalSections]);

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
        perspective: 2000px;
        perspective-origin: center;
      }
      .depth-layer {
        position: absolute;
        width: 100%;
        height: 100%;
        transform-style: preserve-3d;
        pointer-events: none;
      }
      .reactive-glow {
        position: absolute;
        width: 100%;
        height: 100%;
        background: radial-gradient(
          circle at var(--mouse-x, 50%) var(--mouse-y, 50%),
          rgba(255, 182, 193, 0.15) 0%,
          transparent 50%
        );
        mix-blend-mode: screen;
        pointer-events: none;
        transition: opacity 0.3s ease;
      }
      .parallax-element {
        transform: translateZ(var(--depth)) scale(calc(1 + var(--depth) * -0.001));
        transition: transform 0.1s ease-out;
      }
      @keyframes floatAnimation {
        0%, 100% { transform: translateY(0) rotate(0deg); }
        25% { transform: translateY(-15px) rotate(5deg); }
        75% { transform: translateY(15px) rotate(-5deg); }
      }
      .floating {
        animation: floatAnimation 6s ease-in-out infinite;
      }
      .depth-shadow {
        filter: drop-shadow(0 10px 20px rgba(0, 0, 0, 0.15));
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
      .typing-text {
        display: inline-block;
        border-right: 2px solid #fff;
        white-space: nowrap;
        overflow: hidden;
        animation: typing 3.5s steps(40, end),
                   blink-caret .75s step-end infinite;
      }
      @keyframes typing {
        from { width: 0 }
        to { width: 100% }
      }
      @keyframes blink-caret {
        from, to { border-color: transparent }
        50% { border-color: #fff; }
      }
      .particle {
        position: absolute;
        pointer-events: none;
        animation: particle-fade 1s ease-out forwards;
      }
      @keyframes particle-fade {
        0% { opacity: 1; transform: scale(1); }
        100% { opacity: 0; transform: scale(0); }
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
    const tiltX = (gamma ? gamma * 0.12 : 0) + mouseMoveEffect.y * 0.08;
    const tiltY = (beta ? beta * 0.12 : 0) + mouseMoveEffect.x * 0.08;
    const baseDepth = 1000;
    const depthMultiplier = 1.5;

    if (sectionIndex === activeSection) {
      const scale = isTransitioning 
        ? 1 + (0.3 * Math.sin(transitionProgress * Math.PI))
        : 1;
      const rotation = isTransitioning
        ? 15 * Math.sin(transitionProgress * Math.PI)
        : 0;

      return {
        zIndex: 10 + (totalSections - sectionIndex),
        opacity: 1,
        transform: `
          translateZ(${isTransitioning ? baseDepth * transitionProgress : 0}px)
          scale(${scale})
          rotateX(${tiltX + rotation}deg)
          rotateY(${tiltY}deg)
          rotateZ(${rotation * 0.5}deg)
        `,
        filter: isTransitioning 
          ? `blur(${8 * transitionProgress}px) brightness(${1 - 0.2 * transitionProgress})`
          : 'none',
        transition: 'transform 0.1s ease-out',
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
        display: "none"
      };
    }

    return {
      zIndex: 1 + (totalSections - sectionIndex),
      opacity: 0,
      transform: "translateZ(-800px) scale(0.7)",
      filter: "blur(8px) brightness(0.7)",
      pointerEvents: "none"
    };
  };

  // Memoize section styles
  const sectionStyles = useMemo(() => ({
    landing: getSectionStyle(0),
    birthday: getSectionStyle(1),
    loveLetter: getSectionStyle(2),
    final: getSectionStyle(3)
  } as Record<SectionKeys, SectionStyleType>), [activeSection, transitionProgress, mouseMoveEffect, beta, gamma]);

  const heartContainerStyle: React.CSSProperties = {
    position: 'fixed',
    top: '50%',
    left: '50%',
    transform: `translate(-50%, -50%) scale(${heartScale})`,
    transition: `transform ${heartBeatRate}ms ease-in-out`,
    width: '300px',
    height: '300px',
    zIndex: 10,
    pointerEvents: 'none'
  };

  // Memoize heart container style
  const memoizedHeartContainerStyle = useMemo(() => ({
    ...heartContainerStyle,
    transform: `translate(-50%, -50%) scale(${heartScale})`,
    transition: `transform ${heartBeatRate}ms ease-in-out`
  }), [heartScale, heartBeatRate]);

  const handleHeartBurst = () => {
    setHeartScale(2);
    setTimeout(() => setHeartScale(1), 500);
  };

  // Enhanced section transitions
  const sectionVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0,
      scale: 0.8
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
      scale: 1
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0,
      scale: 0.8
    })
  };

  // Enhanced section rendering with proper transitions
  const renderSection = useCallback((
    Component: typeof LandingSection | typeof BirthdayCardSection | typeof LoveLetterSection | typeof FinalSection,
    index: number,
    props: any
  ) => {
    const sectionKey = Object.keys(sectionStyles)[index] as SectionKeys;
    return (
      <motion.div
        key={`section-${index}`}
        style={sectionStyles[sectionKey]}
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -50 }}
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 30,
          duration: 0.5
        }}
      >
        <Component {...props} />
      </motion.div>
    );
  }, [sectionStyles]);

  return (
    <div 
      className="relative min-h-screen overflow-hidden three-d-space bg-gradient-to-b from-slate-900 to-slate-800" 
      ref={containerRef}
      style={{
        '--mouse-x': `${50 + mouseMoveEffect.x}%`,
        '--mouse-y': `${50 + mouseMoveEffect.y}%`,
      } as React.CSSProperties}
    >
      {/* Enhanced Loading Overlay */}
      {isLoading && (
        <motion.div
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/70 backdrop-blur-lg"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="w-64 h-2 bg-white/20 rounded-full overflow-hidden mb-4">
            <motion.div 
              className="h-full bg-gradient-to-r from-pink-500 to-violet-500"
              initial={{ width: "0%" }}
              animate={{ width: `${loadingProgress}%` }}
            />
          </div>
          <motion.p 
            className="text-white/80 font-light text-lg"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ repeat: Infinity, duration: 2 }}
          >
            Creating your special moment...
          </motion.p>
        </motion.div>
      )}

      {/* Background Elements with enhanced parallax */}
      <motion.div 
        className="reactive-glow"
        animate={{
          opacity: [0.3, 0.6, 0.3],
          scale: [1, 1.1, 1]
        }}
        transition={{ duration: 5, repeat: Infinity }}
      />
      <ParallaxBackground
        scrollProgress={activeSection / (totalSections - 1)}
        activeSection={activeSection}
        mouseEffect={mouseMoveEffect}
      />

      {/* Enhanced Header */}
      <header className="fixed top-0 left-0 w-full z-50 p-5 flex justify-between items-center">
        <motion.div
          className="text-white font-semibold text-xl bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
        >
          <span className="text-gradient">Happy Birthday ❤️</span>
        </motion.div>
        
        <NavigationIndicator 
          totalSections={totalSections}
          activeSection={activeSection}
        />
      </header>

      {/* Heart Component */}
      <div ref={heartRef} style={memoizedHeartContainerStyle}>
        <HeartCanvas
          beatRate={heartBeatRate}
          scale={heartScale}
          isGlowing={activeSection > 0}
        />
      </div>

      {/* Main Content with enhanced transitions */}
      <main className="relative h-screen">
        <AnimatePresence custom={activeSection}>
          {activeSection === 0 && (
            <SectionWrapper
              key="landing"
              variants={sectionVariants}
              custom={activeSection}
            >
              <LandingSection 
                isActive={true}
                progress={transitionProgress}
                onContinue={() => transitionToSection(1)}
                data={landingData}
              />
            </SectionWrapper>
          )}

          {activeSection === 1 && (
            <SectionWrapper
              key="birthday"
              variants={sectionVariants}
              custom={activeSection}
            >
              <BirthdayCardSection 
                isActive={true}
                progress={transitionProgress}
                onContinue={() => transitionToSection(2)}
                data={birthdayData}
              />
            </SectionWrapper>
          )}

          {activeSection === 2 && (
            <SectionWrapper
              key="loveLetter"
              variants={sectionVariants}
              custom={activeSection}
            >
              <LoveLetterSection 
                isActive={true}
                progress={transitionProgress}
                onContinue={() => transitionToSection(3)}
                letterId={letterData?._id || ''} // Pass the letter ID
              />
            </SectionWrapper>
          )}

          {activeSection === 3 && (
            <SectionWrapper
              key="final"
              variants={sectionVariants}
              custom={activeSection}
            >
              <FinalSection 
                isActive={true}
                progress={transitionProgress}
                onHeartBurst={handleHeartBurst}
              />
            </SectionWrapper>
          )}
        </AnimatePresence>
      </main>

      {/* Enhanced Controls */}
      <footer className="fixed bottom-5 w-full flex justify-center items-center gap-8 z-50">
        <NavigationDots 
          totalSections={totalSections}
          activeSection={activeSection}
          onSectionChange={transitionToSection}
        />
        <AudioControl />
      </footer>
    </div>
  );
}

// Enhanced wrapper component for sections
const SectionWrapper = memo(({ children, variants, custom }: any) => (
  <motion.div
    variants={variants}
    initial="enter"
    animate="center"
    exit="exit"
    custom={custom}
    className="absolute inset-0 flex items-center justify-center"
    transition={{
      type: "spring",
      stiffness: 300,
      damping: 30,
      mass: 1
    }}
  >
    {children}
  </motion.div>
));

// Enhanced navigation indicator
const NavigationIndicator = memo(({ totalSections, activeSection }: any) => (
  <motion.div 
    className="fixed top-5 right-5 flex items-center gap-2 bg-white/10 backdrop-blur-sm px-3 py-2 rounded-full"
    initial={{ opacity: 0, x: 20 }}
    animate={{ opacity: 1, x: 0 }}
  >
    {Array.from({ length: totalSections }).map((_, i) => (
      <motion.div
        key={i}
        className={`w-2 h-2 rounded-full ${
          i === activeSection ? 'bg-white' : 'bg-white/30'
        }`}
        animate={{
          scale: i === activeSection ? 1.5 : 1,
          opacity: i === activeSection ? 1 : 0.5
        }}
      />
    ))}
  </motion.div>
));

// Extracted components for better organization
const NavigationDots = memo(({ totalSections, activeSection, onSectionChange }: {
  totalSections: number;
  activeSection: number;
  onSectionChange: (index: number) => void;
}) => (
  <div className="section-indicator">
    {Array.from({ length: totalSections }).map((_, index) => (
      <motion.div
        key={index}
        className={`indicator-dot ${activeSection === index ? "active" : ""}`}
        onClick={() => onSectionChange(index)}
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
));

const AudioControl = memo(() => (
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
    <AudioIcon />
  </motion.button>
));

const AudioIcon = () => (
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
);