import { useEffect, useState, useRef } from "react";
import ParallaxBackground from "@/components/ParallaxBackground";
import HeartCanvas from "@/components/HeartCanvas";
import LandingSection from "@/components/LandingSection";
import BirthdayCardSection from "@/components/BirthdayCardSection";
import LoveLetterSection from "@/components/LoveLetterSection";
import FinalSection from "@/components/FinalSection";

export default function Home() {
  const [scrollProgress, setScrollProgress] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Handle scroll for parallax and zoom effects
  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;
      
      const scrollPosition = window.pageYOffset;
      const windowHeight = window.innerHeight;
      const docHeight = document.documentElement.scrollHeight - windowHeight;
      const scrollPercentage = scrollPosition / docHeight;
      
      setScrollProgress(scrollPercentage);
      
      // Add dolly zoom effect to create perception of depth
      const scale = 1 + (scrollPercentage * 0.1);
      const perspective = 1000 - (scrollPercentage * 400);
      
      containerRef.current.style.transform = `scale(${scale})`;
      containerRef.current.style.perspective = `${perspective}px`;
      
      // Dispatch custom event for components to react to scroll
      const event = new CustomEvent('scrollprogress', { 
        detail: { progress: scrollPercentage } 
      });
      window.dispatchEvent(event);
    };
    
    window.addEventListener('scroll', handleScroll);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);
  
  // Remove scrollbar but keep scrolling functionality
  useEffect(() => {
    document.documentElement.style.overflow = "auto";
    document.documentElement.style.scrollbarWidth = "none"; // Firefox
    document.documentElement.style.msOverflowStyle = "none"; // IE and Edge
    
    const style = document.createElement("style");
    style.innerHTML = `
      body::-webkit-scrollbar {
        display: none;
      }
      html, body {
        scrollbar-width: none;
        -ms-overflow-style: none;
        margin: 0;
        padding: 0;
        overflow-x: hidden;
        background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
        background-attachment: fixed;
        scroll-behavior: smooth;
        height: 100%;
        font-family: 'Poppins', sans-serif;
        color: white;
        perspective: 1000px;
        perspective-origin: center;
      }
      
      /* 3D space container */
      .three-d-space {
        transform-style: preserve-3d;
        transition: transform 0.05s ease-out, perspective 0.05s ease-out;
      }
      
      /* Section perspective */
      .perspective-section {
        transform-style: preserve-3d;
        will-change: transform;
        transition: transform 0.5s cubic-bezier(0.23, 1, 0.32, 1);
      }
      
      /* Enhanced animations */
      @keyframes emerge {
        0% { opacity: 0; transform: translateZ(-100px); }
        100% { opacity: 1; transform: translateZ(0); }
      }
      
      @keyframes float-in-space {
        0% { transform: translateZ(-20px) translateY(0); }
        50% { transform: translateZ(20px) translateY(-10px); }
        100% { transform: translateZ(-20px) translateY(0); }
      }
      
      /* Particle effects */
      .particle {
        position: absolute;
        background-color: white;
        border-radius: 50%;
        pointer-events: none;
        opacity: 0;
        animation: particle-float 3s ease-in-out forwards;
      }
      
      @keyframes particle-float {
        0% { opacity: 0; transform: translateY(0) translateX(0) scale(0); }
        20% { opacity: 1; }
        100% { opacity: 0; transform: translateY(-100px) translateX(var(--x)) scale(1); }
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
      document.documentElement.style.overflow = "";
      document.documentElement.style.scrollbarWidth = "";
      document.documentElement.style.msOverflowStyle = "";
    };
  }, []);

  return (
    <div 
      className="min-h-screen flex flex-col three-d-space"
      ref={containerRef}
      style={{ 
        transform: `scale(${1 + (scrollProgress * 0.1)})`,
        perspective: `${1000 - (scrollProgress * 400)}px`
      }}
    >
      <ParallaxBackground />
      <HeartCanvas />
      <LandingSection />
      <BirthdayCardSection />
      <LoveLetterSection />
      <FinalSection />
    </div>
  );
}
