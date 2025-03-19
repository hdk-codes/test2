import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { motion } from "framer-motion";
import { useDeviceOrientation } from "@/hooks/use-device-orientation";

export default function HeartCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { beta, gamma } = useDeviceOrientation();
  const [isInteracting, setIsInteracting] = useState(false);
  const [isHeartVisible, setIsHeartVisible] = useState(false);
  const [isHintVisible, setIsHintVisible] = useState(false);
  
  useEffect(() => {
    if (!containerRef.current) return;
    
    let scene: THREE.Scene, 
        camera: THREE.PerspectiveCamera, 
        renderer: THREE.WebGLRenderer, 
        heart: THREE.Mesh,
        particles: THREE.Points,
        glow: THREE.Mesh,
        pointLight: THREE.PointLight;
    
    let mouseX = 0, mouseY = 0;
    let targetX = 0, targetY = 0;
    let windowHalfX = window.innerWidth / 2;
    let windowHalfY = window.innerHeight / 2;
    
    // Initialize Three.js scene with enhanced settings
    function init() {
      // Scene setup with better rendering settings
      scene = new THREE.Scene();
      camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
      camera.position.z = 5;
      
      renderer = new THREE.WebGLRenderer({ 
        alpha: true,
        antialias: true,
        powerPreference: 'high-performance'
      });
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setClearColor(0x000000, 0);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Better performance
      containerRef.current?.appendChild(renderer.domElement);
      
      // Create heart shape with more detail
      const heartShape = new THREE.Shape();
      
      heartShape.moveTo(0, 0);
      heartShape.bezierCurveTo(0, -1, -2, -2, -2, 0);
      heartShape.bezierCurveTo(-2, 2, 0, 2, 0, 0);
      heartShape.bezierCurveTo(0, -1, 2, -2, 2, 0);
      heartShape.bezierCurveTo(2, 2, 0, 2, 0, 0);
      
      // Higher quality settings
      const extrudeSettings = {
        depth: 0.5,
        bevelEnabled: true,
        bevelSegments: 5,
        steps: 3,
        bevelSize: 0.1,
        bevelThickness: 0.1,
        curveSegments: 24
      };
      
      const geometry = new THREE.ExtrudeGeometry(heartShape, extrudeSettings);
      
      // Create more advanced material with fresnel effect
      const material = new THREE.MeshPhysicalMaterial({
        color: 0xff3366,
        roughness: 0.2,
        metalness: 0.8,
        reflectivity: 0.9,
        clearcoat: 0.5,
        clearcoatRoughness: 0.2,
        emissive: 0xff0066,
        emissiveIntensity: 0.4
      });
      
      heart = new THREE.Mesh(geometry, material);
      heart.rotation.x = Math.PI;
      heart.scale.set(0.5, 0.5, 0.5);
      heart.visible = false; // Hide initially
      scene.add(heart);
      
      // Add a glowing aura around the heart
      const glowGeometry = new THREE.SphereGeometry(1.2, 32, 32);
      const glowMaterial = new THREE.MeshBasicMaterial({
        color: 0xff6b8b,
        transparent: true,
        opacity: 0.15,
        blending: THREE.AdditiveBlending
      });
      glow = new THREE.Mesh(glowGeometry, glowMaterial);
      glow.scale.set(1, 1, 0.5);
      glow.visible = false;
      scene.add(glow);
      
      // Create particle system for floating particles
      const particlesCount = 150;
      const particlesGeometry = new THREE.BufferGeometry();
      const particlePositions = new Float32Array(particlesCount * 3);
      const particleSizes = new Float32Array(particlesCount);
      const particleColors = new Float32Array(particlesCount * 3);
      
      for (let i = 0; i < particlesCount; i++) {
        // Position particles in a heart-like shape
        const theta = Math.random() * Math.PI * 2;
        
        // Use parametric heart shape equation
        const scale = 0.1;
        const t = theta;
        const x = 16 * Math.pow(Math.sin(t), 3);
        const y = 13 * Math.cos(t) - 5 * Math.cos(2*t) - 2 * Math.cos(3*t) - Math.cos(4*t);
        const z = (Math.random() - 0.5) * 4;
        
        particlePositions[i * 3] = x * scale * (0.8 + Math.random() * 0.4);
        particlePositions[i * 3 + 1] = y * scale * (0.8 + Math.random() * 0.4);
        particlePositions[i * 3 + 2] = z;
        
        // Random sizes
        particleSizes[i] = Math.random() * 3 + 1;
        
        // Colors range from pink to white
        const r = 1.0;  // Full red
        const g = 0.3 + Math.random() * 0.7; // Varying green
        const b = 0.5 + Math.random() * 0.5; // Varying blue
        
        particleColors[i * 3] = r;
        particleColors[i * 3 + 1] = g;
        particleColors[i * 3 + 2] = b;
      }
      
      particlesGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
      particlesGeometry.setAttribute('size', new THREE.BufferAttribute(particleSizes, 1));
      particlesGeometry.setAttribute('color', new THREE.BufferAttribute(particleColors, 3));
      
      // Create particle material with custom shaders
      const particleMaterial = new THREE.ShaderMaterial({
        uniforms: {
          color: { value: new THREE.Color(0xffffff) },
          time: { value: 0 }
        },
        vertexShader: `
          attribute float size;
          attribute vec3 color;
          varying vec3 vColor;
          uniform float time;
          
          void main() {
            vColor = color;
            vec3 pos = position;
            // Float the particles
            pos.y += sin(time * 0.5 + pos.x * 3.0) * 0.1;
            pos.x += cos(time * 0.3 + pos.y * 3.0) * 0.1;
            
            vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
            gl_PointSize = size * (30.0 / -mvPosition.z);
            gl_Position = projectionMatrix * mvPosition;
          }
        `,
        fragmentShader: `
          uniform vec3 color;
          varying vec3 vColor;
          
          void main() {
            float r = 0.0;
            vec2 cxy = 2.0 * gl_PointCoord - 1.0;
            r = dot(cxy, cxy);
            if (r > 1.0) {
                discard;
            }
            gl_FragColor = vec4(vColor, 1.0) * (1.0 - r);
          }
        `,
        blending: THREE.AdditiveBlending,
        depthTest: false,
        transparent: true
      });
      
      particles = new THREE.Points(particlesGeometry, particleMaterial);
      particles.visible = false;
      scene.add(particles);
      
      // Enhanced lighting system
      const light1 = new THREE.DirectionalLight(0xffffff, 1.2);
      light1.position.set(1, 1, 1);
      scene.add(light1);
      
      const light2 = new THREE.DirectionalLight(0xffffff, 0.8);
      light2.position.set(-1, -1, 1);
      scene.add(light2);
      
      const ambientLight = new THREE.AmbientLight(0x404040, 0.7);
      scene.add(ambientLight);
      
      // Add point light in the center of the heart for glow effect
      pointLight = new THREE.PointLight(0xff3366, 1.5, 5);
      pointLight.position.set(0, 0, 1);
      scene.add(pointLight);
      
      // Add event listeners
      document.addEventListener('mousemove', onDocumentMouseMove);
      document.addEventListener('touchmove', onDocumentTouchMove);
      document.addEventListener('mousedown', onDocumentInteraction);
      document.addEventListener('touchstart', onDocumentInteraction);
      window.addEventListener('resize', onWindowResize);
      window.addEventListener('scroll', checkVisibility);
      
      // Show hint after a delay
      setTimeout(() => {
        setIsHintVisible(true);
      }, 3000);
      
      // Check initial visibility
      checkVisibility();
      
      // Initial render
      animate();
    }
    
    function onWindowResize() {
      windowHalfX = window.innerWidth / 2;
      windowHalfY = window.innerHeight / 2;
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    }
    
    function onDocumentMouseMove(event: MouseEvent) {
      mouseX = (event.clientX - windowHalfX) / 100;
      mouseY = (event.clientY - windowHalfY) / 100;
    }
    
    function onDocumentTouchMove(event: TouchEvent) {
      if (event.touches.length === 1) {
        event.preventDefault();
        mouseX = (event.touches[0].pageX - windowHalfX) / 50;
        mouseY = (event.touches[0].pageY - windowHalfY) / 50;
      }
    }
    
    function onDocumentInteraction() {
      if (isHeartVisible) {
        setIsInteracting(true);
        
        // Play heart beat sound
        try {
          const audio = new Audio();
          audio.src = 'data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4Ljc2LjEwMAAAAAAAAAAAAAAA//tQxAAAAAAAAAAAAAAAAAAAAAAASW5mbwAAAA8AAAASAAAeMwAUFBQUFCIiIiIiIjAwMDAwMD4+Pj4+PkxMTExMTFpaWlpaWmhoaGhoaHZ2dnZ2doSEhISEhJKSkpKSkqCgoKCgoK6urq6urrKysr6+vr6+vr6+vr6+vsbGxsbGxtLS0tLS0tra2tra2uLi4uLi4urq6urq6vLy8vLy8vr6+vr6+v///wAAADxhdmMxOUQMUAAAAwAAAAAAATwwWkAAAAAAAAAAAAAAAAAAAAAAACIiIiIiIhE+PT09PTWmpqampppaXl5eXl48XDz///9MfT///zE+Pj4+PiIiIiIiIgAAAAAAAAAAAAD/+0LEcQAMKABnmDAAAYQACPMAAAAAKgjAo9CCNCCCRgg8IBTMfC3R5ipiRCAuOCCB0zN0vBeeMEcJQQIEAweCAIGDx9ZC8Kj+BTM7P6Orj+fPfMfT889M4/5Ppp/w0/PvQ/TPO/4hP8Mz8o/n/D03//w3/mc+fmf//M5/nO+fhF/i2t/yfM5/wyf/8p////yX////uQAGP//MZ///If///8jK//in////xE///yL///8JCaAkDkMf/yZv/+ZP//5kxm//Mv///yf///KCgIgU//pIKv/6k///+Sk///nCSzjDNCZkmfo5jLAilpESgkIjckdU+p3XkZCiMUlJDNHKlWsNS8JWQ6oCkqRLwWzSpIk4aii5CrVCfmMQFIIhQVSQ1KSZOTrJdpIJQcBihZDYgBEG4USHZN//////8wMDAxP//////8iBUVigoKsBAVFQoKCrAwVY2CxUFRVlRUVFWNgsVBUVZUVFRVjYQFRUFBVlRUVFWCBAWCAqKgoKsqKioqwQICgqCgqyoqKirBAVFQoKCrKioqKsbBYqCoqyoqKirGwWKgqKsqKioqxsICoqCgqyoqKirBAVFQoKCrKioqKsECAoKgoKsqKioqwQFRUKCgqyoqKirGwWKgqKsqKioqxsFioKirKioqKsEBUVCgoKsqKioqwQICgqCgqyoqKirBAgKCoKCrKioqKsEBUVCgoKsqKioqyZlVVVZlFVVZlIUUUUZlVVVZlVVVWZVVVVmVVVVmUUVVZlVVVWZVVVVmVVVVZlFVVWZVVVVmVVVVZlVVVWZRRVVmVVVVZlVVVWZVVVVmUUVVZlVVVWZVVVVmVVVVZlFFVWZVVVVmVVVV';
          audio.volume = 0.2;
          audio.play();
        } catch (e) {
          console.log('Audio not supported');
        }
        
        // Reset after animation
        setTimeout(() => {
          setIsInteracting(false);
        }, 1000);
      }
    }
    
    function checkVisibility() {
      // Make heart visible when final section is in view
      const viewportTop = window.pageYOffset;
      const viewportBottom = viewportTop + window.innerHeight;
      const finalSection = document.getElementById('final-section');
      
      if (finalSection) {
        const finalSectionTop = finalSection.offsetTop;
        const inView = finalSectionTop <= viewportBottom && 
                       finalSectionTop >= viewportTop - finalSection.offsetHeight;
        
        // Update visibility state
        setIsHeartVisible(inView);
        
        if (heart) heart.visible = inView;
        if (glow) glow.visible = inView;
        if (particles) particles.visible = inView;
      }
    }
    
    function updateHeart() {
      // Use device orientation on mobile devices
      if (gamma !== null && beta !== null) {
        targetX = gamma / 10;
        targetY = beta / 10;
      } else {
        // Use mouse position on desktop
        targetX = mouseX * 0.2;
        targetY = mouseY * 0.2;
      }
      
      if (heart && heart.visible) {
        heart.rotation.y += 0.05 * (targetX - heart.rotation.y);
        heart.rotation.x += 0.05 * (targetY + Math.PI - heart.rotation.x);
        
        // Subtle oscillation for breathing effect
        const breathe = Math.sin(Date.now() * 0.001) * 0.03 + 1.0;
        const baseScale = isInteracting ? 0.55 : 0.5;
        heart.scale.set(
          baseScale * breathe,
          baseScale * breathe,
          baseScale * breathe
        );
        
        // Update glow position
        if (glow) {
          glow.position.copy(heart.position);
          glow.rotation.copy(heart.rotation);
          
          // Pulsating glow
          const glowIntensity = isInteracting ? 0.3 : 0.15;
          const glowPulse = Math.sin(Date.now() * 0.002) * 0.05 + glowIntensity;
          glow.material.opacity = glowPulse;
          
          // Glow scale
          const glowScale = isInteracting ? 1.2 : 1;
          glow.scale.set(glowScale, glowScale, 0.5);
        }
        
        // Update point light
        if (pointLight) {
          const intensity = isInteracting ? 2.5 : 1.5;
          pointLight.intensity = intensity + Math.sin(Date.now() * 0.003) * 0.3;
        }
      }
      
      // Update particles
      if (particles && particles.visible && particles.material instanceof THREE.ShaderMaterial) {
        particles.material.uniforms.time.value = Date.now() * 0.001;
        particles.rotation.y = Math.sin(Date.now() * 0.0005) * 0.2;
        
        // Scale particles during interaction
        const particleScale = isInteracting ? 1.2 : 1.0;
        particles.scale.set(particleScale, particleScale, particleScale);
      }
    }
    
    function animate() {
      requestAnimationFrame(animate);
      updateHeart();
      renderer.render(scene, camera);
    }
    
    // Initialize
    init();
    
    // Cleanup on unmount
    return () => {
      if (containerRef.current && containerRef.current.contains(renderer.domElement)) {
        containerRef.current.removeChild(renderer.domElement);
      }
      document.removeEventListener('mousemove', onDocumentMouseMove);
      document.removeEventListener('touchmove', onDocumentTouchMove);
      document.removeEventListener('mousedown', onDocumentInteraction);
      document.removeEventListener('touchstart', onDocumentInteraction);
      window.removeEventListener('resize', onWindowResize);
      window.removeEventListener('scroll', checkVisibility);
      
      // Clean up any other THREE.js resources
      if (heart && heart.geometry) heart.geometry.dispose();
      if (heart && heart.material) {
        if (Array.isArray(heart.material)) {
          heart.material.forEach(m => m.dispose());
        } else {
          heart.material.dispose();
        }
      }
      
      if (particles && particles.geometry) particles.geometry.dispose();
      if (particles && particles.material) {
        if (Array.isArray(particles.material)) {
          particles.material.forEach(m => m.dispose());
        } else {
          particles.material.dispose();
        }
      }
      
      renderer.dispose();
    };
  }, [beta, gamma, isInteracting, isHeartVisible]);
  
  return (
    <>
      <div 
        id="canvas-container" 
        ref={containerRef} 
        className={`fixed top-0 left-0 w-full h-full z-10 ${isHeartVisible ? 'cursor-pointer pointer-events-auto' : 'pointer-events-none'}`}
      />
      
      {/* Hint message */}
      {isHintVisible && isHeartVisible && (
        <motion.div 
          className="fixed bottom-8 left-0 right-0 text-center z-20 pointer-events-none"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 0.8, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <p className="text-white text-sm backdrop-blur-sm bg-black/30 px-4 py-2 rounded-full inline-block">
            Click the heart for a surprise
          </p>
        </motion.div>
      )}
    </>
  );
}
