import { useEffect } from "react";
import ParallaxBackground from "@/components/ParallaxBackground";
import HeartCanvas from "@/components/HeartCanvas";
import LandingSection from "@/components/LandingSection";
import BirthdayCardSection from "@/components/BirthdayCardSection";
import LoveLetterSection from "@/components/LoveLetterSection";
import FinalSection from "@/components/FinalSection";

export default function Home() {
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
    <div className="min-h-screen flex flex-col">
      <ParallaxBackground />
      <HeartCanvas />
      <LandingSection />
      <BirthdayCardSection />
      <LoveLetterSection />
      <FinalSection />
    </div>
  );
}
