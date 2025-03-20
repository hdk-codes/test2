import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useDeviceOrientation } from "@/hooks/use-device-orientation";

interface Star {
  x: number;
  y: number;
  z: number; // Added z-axis for depth
  size: number;
  opacity: number;
  animationDelay: number;
  color: string;
}

interface ParallaxLayer {
  imageSrc: string;
  depth: number;
  opacity: number;
  scale: number;
}

export default function ParallaxBackground({ scrollProgress = 0 }) {
  const starsContainerRef = useRef<HTMLDivElement>(null);
  const starFieldRef = useRef<HTMLDivElement>(null);
  const shootingStarsRef = useRef<HTMLDivElement>(null);
  const nebulaRef = useRef<HTMLDivElement>(null);
  const { beta, gamma } = useDeviceOrientation();
  const [starsGenerated, setStarsGenerated] = useState(false);
  
  // Define romantic couple background layers
  const coupleImages: ParallaxLayer[] = [
    {
      imageSrc: '/images/couple/wallpaperflare.com_wallpaper (8).jpg',
      depth: -400,
      opacity: 0.7,
      scale: 1.1
    },
    {
      imageSrc: '/images/couple/wallpaperflare.com_wallpaper.jpg',
      depth: -300,
      opacity: 0.6,
      scale: 1.2
    },
    {
      imageSrc: '/images/couple/wallpaperflare.com_wallpaper (2).jpg',
      depth: -200,
      opacity: 0.5,
      scale: 1.2
    },
    {
      imageSrc: '/images/couple/wallpaperflare.com_wallpaper (4).jpg',
      depth: -150,
      opacity: 0.4,
      scale: 1.3
    }
  ];
  
  // Current image is determined by scroll progress
  const activeImageIndex = Math.min(
    Math.floor(scrollProgress * (coupleImages.length + 1)), 
    coupleImages.length - 1
  );

  // Generate 3D star field with different layers for depth
  useEffect(() => {
    if (!starsContainerRef.current || starsGenerated) return;
    
    const container = starsContainerRef.current;
    const numStars = 300; // Increased star count
    
    // Add star styles if they don't exist
    if (!document.getElementById("star-styles")) {
      const styleSheet = document.createElement("style");
      styleSheet.id = "star-styles";
      styleSheet.textContent = `
        @keyframes twinkle {
          0% { opacity: var(--min-opacity); }
          100% { opacity: var(--max-opacity); }
        }
        
        @keyframes float-z {
          0% { transform: translateZ(0); }
          50% { transform: translateZ(var(--float-distance)); }
          100% { transform: translateZ(0); }
        }
        
        @keyframes shooting-star {
          0% { 
            transform: translateX(0) translateY(0) rotate(var(--angle)); 
            opacity: 0;
          }
          10% { opacity: var(--opacity); }
          100% { 
            transform: translateX(var(--distance-x)) translateY(var(--distance-y)) rotate(var(--angle)); 
            opacity: 0;
          }
        }
        
        @keyframes nebula-pulse {
          0% { transform: scale(1); opacity: 0.1; }
          50% { transform: scale(1.1); opacity: 0.2; }
          100% { transform: scale(1); opacity: 0.1; }
        }
        
        .star {
          position: absolute;
          border-radius: 50%;
          transform-style: preserve-3d;
          will-change: transform, opacity;
        }
        
        .shooting-star {
          position: absolute;
          background: linear-gradient(90deg, rgba(255,255,255,0) 0%, var(--star-color) 50%, rgba(255,255,255,0) 100%);
          height: 2px;
          width: 50px;
          opacity: 0;
          border-radius: 100px;
          transform-origin: center center;
          animation: shooting-star var(--duration) ease-out infinite;
          animation-delay: var(--delay);
        }
        
        .nebula {
          position: absolute;
          border-radius: 50%;
          background: radial-gradient(circle, var(--nebula-color) 0%, rgba(0,0,0,0) 70%);
          opacity: 0.1;
          filter: blur(30px);
          animation: nebula-pulse 15s ease-in-out infinite;
        }
      `;
      document.head.appendChild(styleSheet);
    }
    
    // Generate stars with three.js-like z-depth
    for (let i = 0; i < numStars; i++) {
      // Create star element
      const star = document.createElement("div");
      star.className = "star";
      
      // Random star properties with 3D position
      const x = Math.random() * 100;
      const y = Math.random() * 100;
      const z = Math.random() * 500 - 250; // z value between -250 and 250
      
      // Smaller stars appear further away (perspective effect)
      const baseSize = Math.random() * 3 + 1;
      const perspectiveScale = Math.max(0.2, (z + 250) / 500); // Scale based on z position
      const size = baseSize * perspectiveScale;
      
      // Brighter stars in foreground
      const minOpacity = 0.1 + (perspectiveScale * 0.3);
      const maxOpacity = 0.5 + (perspectiveScale * 0.5);
      
      // Slightly different colors for stars
      const colorVariant = Math.floor(Math.random() * 30);
      const colors = [
        `rgb(255, 255, 255)`, // White
        `rgb(255, ${255 - colorVariant}, ${255 - colorVariant * 1.5})`, // Slight red
        `rgb(${255 - colorVariant}, ${255 - colorVariant}, 255)`, // Slight blue
      ];
      const color = colors[Math.floor(Math.random() * colors.length)];
      
      // Set star style
      star.style.left = `${x}%`;
      star.style.top = `${y}%`;
      star.style.width = `${size}px`;
      star.style.height = `${size}px`;
      star.style.background = color;
      star.style.setProperty('--min-opacity', minOpacity.toString());
      star.style.setProperty('--max-opacity', maxOpacity.toString());
      star.style.setProperty('--float-distance', `${z / 10}px`);
      star.style.zIndex = Math.floor(z).toString();
      star.style.transform = `translateZ(${z}px)`;
      
      // Animation properties
      const animationDuration = 1 + Math.random() * 3;
      const animationDelay = Math.random() * 3;
      star.style.animation = `twinkle ${animationDuration}s infinite alternate, float-z ${8 + Math.random() * 10}s ease-in-out infinite`;
      star.style.animationDelay = `${animationDelay}s, ${Math.random() * 5}s`;
      
      container.appendChild(star);
    }
    
    // Add shooting stars
    if (shootingStarsRef.current) {
      const shootingStarsContainer = shootingStarsRef.current;
      const numberOfShootingStars = 10;
      
      for (let i = 0; i < numberOfShootingStars; i++) {
        const shootingStar = document.createElement("div");
        shootingStar.className = "shooting-star";
        
        const startX = Math.random() * 100;
        const startY = Math.random() * 50; // Only in top half
        const angle = Math.random() * 60 - 30; // -30 to 30 degrees
        const distanceX = Math.random() * 100 + 100; // 100-200%
        const distanceY = Math.random() * 100 + 50; // 50-150%
        const duration = 2 + Math.random() * 6; // 2-8 seconds
        const delay = Math.random() * 15; // 0-15 second delay
        const opacity = 0.5 + Math.random() * 0.5; // 0.5-1 opacity
        
        // Random hue for shooting stars
        const hue = Math.floor(Math.random() * 60); // 0-60 (mostly white to slight blue/pink)
        const starColor = `hsl(${hue}, 80%, 90%)`;
        
        shootingStar.style.left = `${startX}%`;
        shootingStar.style.top = `${startY}%`;
        shootingStar.style.setProperty('--angle', `${angle}deg`);
        shootingStar.style.setProperty('--distance-x', `${distanceX}%`);
        shootingStar.style.setProperty('--distance-y', `${distanceY}%`);
        shootingStar.style.setProperty('--duration', `${duration}s`);
        shootingStar.style.setProperty('--delay', `${delay}s`);
        shootingStar.style.setProperty('--opacity', opacity.toString());
        shootingStar.style.setProperty('--star-color', starColor);
        
        shootingStarsContainer.appendChild(shootingStar);
      }
    }
    
    // Add nebula clouds
    if (nebulaRef.current) {
      const nebulaContainer = nebulaRef.current;
      const numberOfNebulas = 5;
      
      for (let i = 0; i < numberOfNebulas; i++) {
        const nebula = document.createElement("div");
        nebula.className = "nebula";
        
        const size = 100 + Math.random() * 200; // 100-300px
        const x = Math.random() * 100;
        const y = Math.random() * 100;
        const hue = Math.random() * 60 + 220; // Blues and purples
        const nebulaColor = `hsla(${hue}, 70%, 50%, 0.1)`;
        
        nebula.style.width = `${size}px`;
        nebula.style.height = `${size}px`;
        nebula.style.left = `${x}%`;
        nebula.style.top = `${y}%`;
        nebula.style.setProperty('--nebula-color', nebulaColor);
        nebula.style.animationDelay = `${Math.random() * 5}s`;
        
        nebulaContainer.appendChild(nebula);
      }
    }
    
    setStarsGenerated(true);
    
    return () => {
      // Cleanup
      while (container.firstChild) {
        container.removeChild(container.firstChild);
      }
      if (shootingStarsRef.current) {
        while (shootingStarsRef.current.firstChild) {
          shootingStarsRef.current.removeChild(shootingStarsRef.current.firstChild);
        }
      }
      if (nebulaRef.current) {
        while (nebulaRef.current.firstChild) {
          nebulaRef.current.removeChild(nebulaRef.current.firstChild);
        }
      }
    };
  }, [starsGenerated]);

  // Effect to handle scroll-based zoom and movements
  useEffect(() => {
    if (!starFieldRef.current) return;
    
    // Apply dolly zoom effect - pull back camera (z) but increase field of view
    const zTranslate = -scrollProgress * 300;
    const scale = 1 + (scrollProgress * 0.5);
    
    starFieldRef.current.style.transform = `translateZ(${zTranslate}px) scale(${scale})`;
  }, [scrollProgress]);

  // Calculate parallax offset based on device orientation or mouse position
  const x = gamma ? gamma * 0.5 : 0;
  const y = beta ? beta * 0.5 : 0;

  return (
    <div 
      className="parallax-background fixed inset-0 -z-10 overflow-hidden"
      style={{ 
        perspective: '1000px',
        transformStyle: 'preserve-3d'
      }}
    >
      {/* Romantic couple image layers */}
      {coupleImages.map((layer, index) => (
        <motion.div
          key={`couple-layer-${index}`}
          className="couple-image-layer absolute inset-0"
          style={{
            backgroundImage: `url(${layer.imageSrc})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: index === activeImageIndex ? layer.opacity : 0,
            zIndex: index,
            transformStyle: 'preserve-3d',
            willChange: 'transform, opacity',
            transition: 'opacity 1.5s ease-in-out'
          }}
          animate={{
            x: x * (0.3 + index * 0.1),
            y: y * (0.3 + index * 0.1),
            scale: layer.scale,
            translateZ: layer.depth + (scrollProgress * 200)
          }}
          transition={{
            type: "spring",
            damping: 40 - index * 5,
            stiffness: 40 - index * 5
          }}
        >
          {/* Dark overlay to create depth and better contrast */}
          <div 
            className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"
            style={{ 
              mixBlendMode: 'multiply', 
              opacity: 0.7
            }}
          />
        </motion.div>
      ))}
      
      {/* Nebula layer (background) */}
      <motion.div
        ref={nebulaRef}
        className="nebula-layer absolute inset-0 z-0"
        animate={{
          x: x * 0.2, // Move less than stars = parallax effect
          y: y * 0.2
        }}
        transition={{
          type: "spring",
          damping: 50,
          stiffness: 30
        }}
      />
      
      {/* Main star field - reacts to scrolling and mouse movement */}
      <motion.div
        ref={starFieldRef}
        className="star-field absolute inset-0 z-10"
        style={{ 
          transformStyle: 'preserve-3d',
          willChange: 'transform',
          opacity: 0.7 // Make stars slightly transparent to let the images show through
        }}
        animate={{
          x: x * 0.6,
          y: y * 0.6,
        }}
        transition={{
          type: "spring",
          damping: 25,
          stiffness: 50
        }}
      >
        <div 
          id="stars-container" 
          ref={starsContainerRef} 
          className="absolute inset-0"
          style={{ transformStyle: 'preserve-3d' }}
        />
      </motion.div>
      
      {/* Shooting stars layer (foreground) */}
      <motion.div
        ref={shootingStarsRef}
        className="shooting-stars-layer absolute inset-0 z-20"
        animate={{
          x: x,
          y: y
        }}
        transition={{
          type: "spring",
          damping: 20,
          stiffness: 60
        }}
      />
      
      {/* Subtle vignette for depth */}
      <div 
        className="absolute inset-0 z-30 pointer-events-none"
        style={{
          background: 'radial-gradient(circle, transparent 40%, rgba(0,0,0,0.4) 100%)'
        }}
      />
    </div>
  );
}
