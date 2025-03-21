import { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import * as THREE from 'three';

interface ParallaxBackgroundProps {
  scrollProgress: number;
  activeSection: number;
  mouseEffect?: { x: number; y: number };
}

interface ParallaxLayer {
  imageSrc: string;
  depth: number;
  opacity: number;
  scale: number;
  blur: number;
}

const useDeviceOrientation = () => {
  const [orientation, setOrientation] = useState({ beta: 0, gamma: 0 });

  useEffect(() => {
    const handleOrientation = (event: DeviceOrientationEvent) => {
      setOrientation({
        beta: event.beta || 0,
        gamma: event.gamma || 0,
      });
    };

    window.addEventListener('deviceorientation', handleOrientation);
    return () => {
      window.removeEventListener('deviceorientation', handleOrientation);
    };
  }, []);

  return orientation;
};

export default function ParallaxBackground({ 
  scrollProgress = 0, 
  activeSection = 0,
  mouseEffect = { x: 0, y: 0 } 
}: ParallaxBackgroundProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const { beta, gamma } = useDeviceOrientation();
  const [isLoaded, setIsLoaded] = useState(false);
  const [allLayersLoaded, setAllLayersLoaded] = useState(false);
  const [loadProgress, setLoadProgress] = useState(0);
  
  // Define more layers for richer parallax experience
  const layerSets = [
    // Section 0 (Landing) layers
    [
      { imageSrc: "/backgrounds/stars.png", depth: -500, opacity: 0.8, scale: 1.2, blur: 0 },
      { imageSrc: "/backgrounds/clouds.png", depth: -400, opacity: 0.7, scale: 1.15, blur: 1 },
      { imageSrc: "/backgrounds/mountains.png", depth: -300, opacity: 0.9, scale: 1.1, blur: 2 },
      { imageSrc: "/backgrounds/hearts.png", depth: -200, opacity: 0.5, scale: 1.05, blur: 0 },
    ],
    // Section 1 (Birthday Card) layers
    [
      { imageSrc: "/backgrounds/particles.png", depth: -500, opacity: 0.6, scale: 1.2, blur: 1 },
      { imageSrc: "/backgrounds/flowers.png", depth: -400, opacity: 0.8, scale: 1.15, blur: 0 },
      { imageSrc: "/backgrounds/confetti.png", depth: -300, opacity: 0.7, scale: 1.1, blur: 1 },
      { imageSrc: "/backgrounds/bubbles.png", depth: -200, opacity: 0.7, scale: 1.05, blur: 2 },
    ],
    // Section 2 (Love Letter) layers
    [
      { imageSrc: "/backgrounds/nebula.png", depth: -500, opacity: 0.6, scale: 1.2, blur: 1 },
      { imageSrc: "/backgrounds/hearts2.png", depth: -400, opacity: 0.5, scale: 1.15, blur: 0 },
      { imageSrc: "/backgrounds/stars2.png", depth: -300, opacity: 0.7, scale: 1.1, blur: 2 },
      { imageSrc: "/backgrounds/moon.png", depth: -200, opacity: 0.8, scale: 1.05, blur: 1 },
    ],
    // Section 3 (Final) layers
    [
      { imageSrc: "/backgrounds/galaxy.png", depth: -500, opacity: 0.7, scale: 1.2, blur: 0 },
      { imageSrc: "/backgrounds/stardust.png", depth: -400, opacity: 0.6, scale: 1.15, blur: 1 },
      { imageSrc: "/backgrounds/aurora.png", depth: -300, opacity: 0.8, scale: 1.1, blur: 0 },
      { imageSrc: "/backgrounds/sparkles.png", depth: -200, opacity: 0.7, scale: 1.05, blur: 1 },
    ],
  ];
  
  // Use layerSets based on activeSection
  const currentLayers = layerSets[activeSection] || layerSets[0];

  // Preload all background images
  useEffect(() => {
    const totalImages = layerSets.flat().length;
    let loadedCount = 0;
    
    layerSets.flat().forEach(layer => {
      const img = new Image();
      img.src = layer.imageSrc;
      img.onload = () => {
        loadedCount++;
        setLoadProgress(loadedCount / totalImages);
        if (loadedCount === totalImages) {
          setAllLayersLoaded(true);
          setTimeout(() => setIsLoaded(true), 500);
        }
      };
      img.onerror = () => {
        loadedCount++;
        setLoadProgress(loadedCount / totalImages);
      };
    });
  }, []);

  useEffect(() => {
    if (!mountRef.current || !allLayersLoaded) return;

    // Setup Three.js scene for more advanced effects
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mountRef.current.appendChild(renderer.domElement);

    // Add ambient light and point lights with different colors
    const ambientLight = new THREE.AmbientLight(0x404040, 1);
    scene.add(ambientLight);

    const pointLight1 = new THREE.PointLight(0xff6b8b, 1, 100);
    pointLight1.position.set(5, 5, 5);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0x6b9fff, 1, 100);
    pointLight2.position.set(-5, -5, 5);
    scene.add(pointLight2);

    // Create particles
    const particleGeometry = new THREE.BufferGeometry();
    const particleCount = 1000;
    
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);
    
    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 10;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 10;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 10;
      
      colors[i * 3] = Math.random();
      colors[i * 3 + 1] = Math.random();
      colors[i * 3 + 2] = Math.random();
      
      sizes[i] = Math.random() * 0.1;
    }
    
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particleGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    particleGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    
    const particleMaterial = new THREE.PointsMaterial({
      size: 0.05,
      sizeAttenuation: true,
      transparent: true,
      opacity: 0.8,
      vertexColors: true,
      blending: THREE.AdditiveBlending
    });
    
    const particles = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particles);
    
    // Position camera
    camera.position.z = 0.1;
    
    // Animation loop
     const clock = new THREE.Clock();
    
    // const animate = () => {
    //   const elapsedTime = clock.getElapsedTime();
      
    //   // Rotate particles
    //   particles.rotation.x = elapsedTime * 0.05;
    //   particles.rotation.y = elapsedTime * 0.03;
      
    //   // Apply device orientation if available
    //   if (gamma || beta) {
    //     particles.rotation.x += beta * 0.01;
    //     particles.rotation.y += gamma * 0.01;
    //   }
      
    //   // Apply mouse effect
    //   particles.rotation.x += mouseEffect.y * 0.001;
    //   particles.rotation.y += mouseEffect.x * 0.001;
      
    //   // Apply section transition effect
    //   particles.scale.set(
    //     1 + scrollProgress * 0.0,
    //     1 + scrollProgress * 0.2,
    //     1 + scrollProgress * 0.2
    //   );
      
    //   // Update pointlights color based on active section
    //   const colors = [
    //     new THREE.Color(0xff6b8b), // Landing pink
    //     new THREE.Color(0xffb86c), // Birthday card orange
    //     new THREE.Color(0x6b9fff), // Love letter blue
    //     new THREE.Color(0xff6bdb)  // Final purple
    //   ];
      
    //   pointLight1.color.lerp(colors[activeSection], 0.05);
      
    //   renderer.render(scene, camera);
    //   requestAnimationFrame(animate);
    // };
    
    // animate();
    
    // Handle resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      if (mountRef.current && mountRef.current.contains(renderer.domElement)) {
        mountRef.current.removeChild(renderer.domElement);
      }
      window.removeEventListener('resize', handleResize);
    };
  }, [allLayersLoaded, beta, gamma, mouseEffect, scrollProgress, activeSection]);

  // Get more accurate parallax effect based on both device and mouse
  const getParallaxValues = (depth: number, index: number) => {
    const deviceFactor = 0.05;
    const mouseFactor = 0.08;
    const scrollFactor = 0.4;
    
    const deviceX = gamma ? gamma * deviceFactor : 0;
    const deviceY = beta ? beta * deviceFactor : 0;
    
    const mouseX = mouseEffect.x * mouseFactor;
    const mouseY = mouseEffect.y * mouseFactor;
    
    return {
      x: (deviceX + mouseX) * (index + 1),
      y: (deviceY + mouseY) * (index + 1),
      scale: 1 + scrollProgress * scrollFactor * (index + 1) / 10,
      z: depth + scrollProgress * 200
    };
  };

  return (
    <div
      className="fixed inset-0 -z-20 overflow-hidden"
      style={{ perspective: "1500px" }}
    >
     
      
      <div ref={mountRef} className="absolute inset-0" />
      
      <div className="absolute inset-0 bg-gradient-radial from-transparent to-black opacity-60 z-10" />
      
      {/* Render image layers with enhanced parallax effect */}
      {currentLayers.map((layer, index) => {
        const parallax = getParallaxValues(layer.depth, index);
        
        return (
          <motion.div
            key={`layer-${activeSection}-${index}`}
            className="absolute inset-0 transition-opacity duration-1000"
            style={{
              backgroundImage: `url(${layer.imageSrc})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              opacity: isLoaded ? layer.opacity : 0,
              zIndex: index,
              transformStyle: 'preserve-3d',
            }}
            initial={{ opacity: 0 }}
            animate={{
              x: parallax.x,
              y: parallax.y,
              scale: parallax.scale,
              translateZ: parallax.z,
              filter: `blur(${layer.blur}px) brightness(${1 + (index * 0.1)})`,
            }}
            transition={{ 
              type: 'spring',
              damping: 20,
              stiffness: 70 
            }}
          >
            <div
              className="absolute inset-0"
              style={{
                background: index === 0 
                  ? `radial-gradient(circle, rgba(0,0,0,0) 0%, rgba(0,0,0,0.7) 100%)` 
                  : 'none'
              }}
            />
          </motion.div>
        );
      })}
      
      {/* Light beams effect */}
      <motion.div 
        className="absolute inset-0 opacity-20 mix-blend-screen pointer-events-none"
        style={{
          background: 'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0) 70%)',
          filter: 'blur(40px)',
        }}
        animate={{
          x: mouseEffect.x * 0.5,
          y: mouseEffect.y * 0.5,
          opacity: [0.1, 0.2, 0.1],
          scale: [1, 1.05, 1],
        }}
        transition={{
          repeat: Infinity,
          duration: 5,
          ease: 'easeInOut',
        }}
      />
      
      {/* Vignette overlay */}
      <div 
        className="absolute inset-0 pointer-events-none z-10"
        style={{ 
          background: 'radial-gradient(ellipse at center, rgba(0,0,0,0) 0%, rgba(0,0,0,0.5) 100%)',
          mixBlendMode: 'multiply',
        }}
      />
    </div>
  );
}
