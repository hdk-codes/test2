import { useRef, useState } from "react";
import InteractiveHeart from "@/components/InteractiveHeart";
import { useScrollReveal } from "@/hooks/use-scroll-reveal";
import { useParallax } from "@/hooks/use-parallax";
import { motion } from "framer-motion";

function GiftBox() {
  const [isOpen, setIsOpen] = useState(false);
  
  const openGift = () => {
    setIsOpen(true);
  };
  
  return (
    <div 
      className="gift-box relative mx-auto w-40 h-40 cursor-pointer"
      id="gift-box" 
      onClick={openGift}
    >
      <motion.div 
        className="gift-box-top absolute inset-x-0 top-0 h-1/3 bg-[#ffb6c1] rounded-t-lg z-10 origin-bottom"
        animate={{ 
          rotateX: isOpen ? -180 : 0,
          opacity: isOpen ? 0 : 1
        }}
        transition={{ 
          type: "spring",
          stiffness: 100,
          damping: 10
        }}
      />
      
      <div className="gift-box-body absolute inset-0 bg-[#ff3366] rounded-lg" />
      
      <motion.div 
        className="gift-ribbon absolute top-0 left-1/2 w-6 h-16 bg-white -translate-x-1/2 -translate-y-4 z-20"
        animate={{ 
          height: isOpen ? 0 : 16,
          opacity: isOpen ? 0 : 1
        }}
        transition={{ delay: 0.1 }}
      />
      
      <motion.div 
        className="gift-ribbon-horizontal absolute top-0 inset-x-0 h-6 bg-white rounded-full z-20"
        animate={{ 
          opacity: isOpen ? 0 : 1,
          scale: isOpen ? 0 : 1
        }}
        transition={{ delay: 0.1 }}
      />
      
      <motion.div 
        className="gift-message absolute inset-0 flex items-center justify-center"
        animate={{ 
          opacity: isOpen ? 1 : 0
        }}
        transition={{ 
          delay: 0.5,
          duration: 0.5
        }}
      >
        <p className="font-['Dancing_Script'] text-xl text-white text-center p-4">
          I love you more than words can say ❤️
        </p>
      </motion.div>
    </div>
  );
}

interface FinalSectionProps {
  isActive?: boolean;
  progress?: number;
  onHeartBurst?: () => void;
}

export default function FinalSection({
  isActive = false,
  progress = 0,
  onHeartBurst
}: FinalSectionProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const heartRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const giftBoxRef = useRef<HTMLDivElement>(null);
  const parallaxRef = useRef<HTMLDivElement>(null);
  
  useScrollReveal(titleRef);
  useScrollReveal(subtitleRef, { delay: 0.2 });
  useScrollReveal(giftBoxRef, { delay: 0.4 });
  useParallax(parallaxRef, 0.8);
  
  return (
    <section 
      id="final-section" 
      className="min-h-screen w-full flex flex-col items-center justify-center py-16 px-4 z-40"
      ref={containerRef}
    >
      <div 
        className="final-container max-w-md text-center"
        ref={parallaxRef}
      >
        <div className="final-heart-container relative w-40 h-40 mx-auto mb-8" ref={heartRef}>
          <InteractiveHeart id="final-heart" size="medium" pulseEffect={true} />
        </div>
        
        <h2 
          className="font-['Dancing_Script'] text-4xl md:text-5xl text-white text-center mb-6 reveal"
          ref={titleRef}
        >
          Happy Birthday, my love.
        </h2>
        
        <p 
          className="text-2xl text-white/90 mb-12 reveal"
          ref={subtitleRef}
        >
          You're my everything.
        </p>
        
        <div ref={giftBoxRef} className="reveal">
          <GiftBox />
        </div>
      </div>
    </section>
  );
}
