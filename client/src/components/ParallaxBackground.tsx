import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import * as THREE from "three";
import { useDeviceOrientation } from "@/hooks/use-device-orientation";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass";

interface ParallaxLayer {
  imageSrc: string;
  depth: number;
  opacity: number;
  scale: number;
}

export default function ParallaxBackground({ scrollProgress = 0 }) {
  const mountRef = useRef<HTMLDivElement>(null);
  const { beta, gamma } = useDeviceOrientation();
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  const layers: ParallaxLayer[] = [
    { imageSrc: "/backgrounds/bg1.jpg", depth: -400, opacity: 0.7, scale: 1.1 },
    { imageSrc: "/backgrounds/bg2.jpg", depth: -300, opacity: 0.6, scale: 1.2 },
    { imageSrc: "/backgrounds/bg3.jpg", depth: -200, opacity: 0.5, scale: 1.3 },
    { imageSrc: "/backgrounds/hearts.png", depth: -100, opacity: 0.4, scale: 1.0 },
  ];

  const activeLayerIndex = Math.min(Math.floor(scrollProgress * (layers.length + 1)), layers.length - 1);

  useEffect(() => {
    if (!mountRef.current) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mountRef.current.appendChild(renderer.domElement);

    // Post-processing
    const composer = new EffectComposer(renderer);
    const renderPass = new RenderPass(scene, camera);
    const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 0.8, 0.4, 0.85);
    composer.addPass(renderPass);
    composer.addPass(bloomPass);

    // Background plane
    const planeGeometry = new THREE.PlaneGeometry(20, 20);
    const planeMaterial = new THREE.MeshBasicMaterial({
      map: new THREE.TextureLoader().load("/backgrounds/gradient-texture.jpg", () => setIsLoaded(true)),
      transparent: true,
      opacity: 0.9,
    });
    const plane = new THREE.Mesh(planeGeometry, planeMaterial);
    scene.add(plane);

    // Particles (glowing hearts)
    const particleCount = 150;
    const particlesGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);
    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 15;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 15;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 10;
      colors[i * 3] = 1.0;
      colors[i * 3 + 1] = 0.5 + Math.random() * 0.3;
      colors[i * 3 + 2] = 0.6 + Math.random() * 0.2;
      sizes[i] = 0.2 + Math.random() * 0.3;
    }
    particlesGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    particlesGeometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    particlesGeometry.setAttribute("size", new THREE.BufferAttribute(sizes, 1));
    const particlesMaterial = new THREE.PointsMaterial({
      size: 0.25,
      vertexColors: true,
      transparent: true,
      opacity: 0.7,
      blending: THREE.AdditiveBlending,
    });
    const particles = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particles);

    camera.position.z = 5;

    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({
        x: (e.clientX / window.innerWidth) * 2 - 1,
        y: -(e.clientY / window.innerHeight) * 2 + 1,
      });
    };
    const handleTouchMove = (e: TouchEvent) => {
      const touch = e.touches[0];
      setMousePos({
        x: (touch.clientX / window.innerWidth) * 2 - 1,
        y: -(touch.clientY / window.innerHeight) * 2 + 1,
      });
    };
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("touchmove", handleTouchMove);

    const handleResize = () => {
      renderer.setSize(window.innerWidth, window.innerHeight);
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      composer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener("resize", handleResize);

    const animate = () => {
      const time = Date.now() * 0.001;
      const posArray = particlesGeometry.attributes.position.array as Float32Array;
      const sizeArray = particlesGeometry.attributes.size.array as Float32Array;
      for (let i = 0; i < particleCount; i++) {
        posArray[i * 3 + 1] += Math.sin(time + i) * 0.01;
        sizeArray[i] = 0.2 + Math.abs(Math.sin(time + i)) * 0.2;
        if (posArray[i * 3 + 1] > 7) posArray[i * 3 + 1] = -7;
      }
      particlesGeometry.attributes.position.needsUpdate = true;
      particlesGeometry.attributes.size.needsUpdate = true;

      plane.rotation.x = mousePos.y * 0.15 + (beta || 0) * 0.02;
      plane.rotation.y = mousePos.x * 0.15 + (gamma || 0) * 0.02;
      particles.rotation.x = mousePos.y * 0.1;
      particles.rotation.y = mousePos.x * 0.1;

      composer.render();
      requestAnimationFrame(animate);
    };
    animate();

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("resize", handleResize);
      mountRef.current?.removeChild(renderer.domElement);
      renderer.dispose();
    };
  }, [mousePos, beta, gamma]);

  const parallaxX = gamma ? gamma * 0.4 : mousePos.x * 40;
  const parallaxY = beta ? beta * 0.4 : mousePos.y * 40;

  return (
    <div
      className="fixed inset-0 -z-20 overflow-hidden"
      style={{ perspective: "1200px" }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={() => setIsHovered(true)}
      onTouchEnd={() => setIsHovered(false)}
    >
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900 text-white">
          Loading...
        </div>
      )}
      <div ref={mountRef} className="absolute inset-0" />
      {layers.map((layer, index) => (
        <motion.div
          key={`layer-${index}`}
          className="absolute inset-0"
          style={{
            backgroundImage: `url(${layer.imageSrc})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            opacity: index === activeLayerIndex ? layer.opacity : 0,
            zIndex: index,
            transformStyle: "preserve-3d",
          }}
          animate={{
            x: parallaxX * (0.3 + index * 0.1),
            y: parallaxY * (0.3 + index * 0.1),
            scale: layer.scale + scrollProgress * 0.4,
            translateZ: layer.depth + scrollProgress * 400,
            filter: isHovered ? "brightness(1.2) blur(1px)" : "brightness(1) blur(0px)",
          }}
          transition={{ type: "spring", damping: 30, stiffness: 100 }}
        >
          <div
            className="absolute inset-0"
            style={{ background: "radial-gradient(circle, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.6) 100%)" }}
          />
        </motion.div>
      ))}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        animate={{ opacity: isHovered ? 0.4 : 0 }}
        transition={{ duration: 0.6 }}
        style={{ background: "radial-gradient(circle, rgba(255, 107, 139, 0.3), transparent 70%)" }}
      />
    </div>
  );
}