import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { motion, AnimatePresence } from "framer-motion";
import { useDeviceOrientation } from "@/hooks/use-device-orientation";

interface HeartCanvasProps {
  burstMoment?: boolean;
}

export default function HeartCanvas({ burstMoment = false }: HeartCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const heartRef = useRef<THREE.Mesh | null>(null);
  const particlesRef = useRef<THREE.Points | null>(null);
  const glowRef = useRef<THREE.Mesh | null>(null);
  const messageRef = useRef<HTMLDivElement>(null);
  const lastInteractionRef = useRef<number>(Date.now());
  const heartRateRef = useRef<number>(60); // BPM
  const heartPhaseRef = useRef<number>(0);
  const mouseInactiveTimeRef = useRef<number>(0);
  
  const { beta, gamma } = useDeviceOrientation();
  const [isInteracting, setIsInteracting] = useState(false);
  const [interactionIntensity, setInteractionIntensity] = useState(0);
  const [showLoveMessage, setShowLoveMessage] = useState(false);
  const [burstParticles, setBurstParticles] = useState<JSX.Element[]>([]);
  const [heartbeatState, setHeartbeatState] = useState<'rest' | 'active' | 'excited' | 'burst'>('rest');
  
  // Function to trigger heart burst effect with enhanced animation and feedback
  const triggerHeartBurst = () => {
    // Set heartbeat state to burst mode
    setHeartbeatState('burst');
    
    // Dramatically increase heart rate
    heartRateRef.current = 180;
    
    // Create explosion of particles
    createBurstParticles();
    
    // Trigger device vibration if available (stronger pulse pattern)
    if (navigator.vibrate && window.innerWidth <= 768) {
      navigator.vibrate([100, 50, 150, 50, 200]);
    }
    
    // Play heart beat sound with high intensity
    try {
      const audio = new Audio();
      audio.src = 'data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4Ljc2LjEwMAAAAAAAAAAAAAAA//tQxAAAAAAAAAAAAAAAAAAAAAAASW5mbwAAAA8AAAASAAAeMwAUFBQUFCIiIiIiIjAwMDAwMD4+Pj4+PkxMTExMTFpaWlpaWmhoaGhoaHZ2dnZ2doSEhISEhJKSkpKSkqCgoKCgoK6urq6urrKysr6+vr6+vr6+vr6+vsbGxsbGxtLS0tLS0tra2tra2uLi4uLi4urq6urq6vLy8vLy8vr6+vr6+v///wAAADxhdmMxOUQMUAAAAwAAAAAAATwwWkAAAAAAAAAAAAAAAAAAAAAAACIiIiIiIhE+PT09PTWmpqampppaXl5eXl48XDz///9MfT///zE+Pj4+PiIiIiIiIgAAAAAAAAAAAAD/+0LEcQAMKABnmDAAAYQACPMAAAAAKgjAo9CCNCCCRgg8IBTMfC3R5ipiRCAuOCCB0zN0vBeeMEcJQQIEAweCAIGDx9ZC8Kj+BTM7P6Orj+fPfMfT889M4/5Ppp/w0/PvQ/TPO/4hP8Mz8o/n/D03//w3/mc+fmf//M5/nO+fhF/i2t/yfM5/wyf/8p////yX////uQAGP//MZ///If///8jK//in////xE///yL///8JCaAkDkMf/yZv/+ZP//5kxm//Mv///yf///KCgIgU//pIKv/6k///+Sk///nCSzjDNCZkmfo5jLAilpESgkIjckdU+p3XkZCiMUlJDNHKlWsNS8JWQ6oCkqRLwWzSpIk4aii5CrVCfmMQFIIhQVSQ1KSZOTrJdpIJQcBihZDYgBEG4USHZN//////8wMDAxP//////8iBUVigoKsBAVFQoKCrAwVY2CxUFRVlRUVFWNgsVBUVZUVFRVjYQFRUFBVlRUVFWCBAWCAqKgoKsqKioqwQICgqCgqyoqKirBAVFQoKCrKioqKsbBYqCoqyoqKirGwWKgqKsqKioqxsICoqCgqyoqKirBAVFQoKCrKioqKsECAoKgoKsqKioqwQFRUKCgqyoqKirGwWKgqKsqKioqxsFioKirKioqKsEBUVCgoKsqKioqwQICgqCgqyoqKirBAgKCoKCrKioqKsEBUVCgoKsqKioqyZlVVVZlFVVZlIUUUUZlVVVZlVVVWZVVVVmVVVVmUUVVZlVVVWZVVVVmVVVVZlFVVWZVVVVmVVVVZlVVVWZRRVVmVVVVZlVVVWZVVVVmUUVVZlVVVWZVVVVmVVVVZlFFVWZVVVVmVVVV';
      audio.volume = 0.6;
      audio.playbackRate = 1.4;
      audio.play();
    } catch (e) {
      console.log('Audio not supported');
    }
    
    // Show love message after a short delay
    setTimeout(() => {
      setShowLoveMessage(true);
    }, 800);
    
    // Return to excited state after burst
    setTimeout(() => {
      setHeartbeatState('excited');
      heartRateRef.current = 120;
    }, 2000);
    
    // And finally return to resting state
    setTimeout(() => {
      setHeartbeatState('rest');
      heartRateRef.current = 80;
    }, 5000);
  };
  
  // Handle burst moment triggered from parent component
  useEffect(() => {
    if (burstMoment) {
      triggerHeartBurst();
    }
  }, [burstMoment]);
  
  // Core 3D scene setup
  useEffect(() => {
    if (!containerRef.current) return;
    
    let scene: THREE.Scene, 
        camera: THREE.PerspectiveCamera, 
        renderer: THREE.WebGLRenderer, 
        heart: THREE.Mesh,
        particles: THREE.Points,
        glow: THREE.Mesh,
        pointLight: THREE.PointLight,
        rimLight: THREE.SpotLight;
    
    let mouseX = 0, mouseY = 0;
    let targetX = 0, targetY = 0;
    let windowHalfX = window.innerWidth / 2;
    let windowHalfY = window.innerHeight / 2;
    let sceneInitialized = false;
    
    // Initialize Three.js scene with enhanced settings
    function init() {
      if (sceneInitialized) return;
      
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
      
      // Create heart shape with more detail and smoother curves
      const heartShape = new THREE.Shape();
      
      heartShape.moveTo(0, 0);
      heartShape.bezierCurveTo(0, -1, -2, -2.5, -2, 0);
      heartShape.bezierCurveTo(-2, 2.5, 0, 2.5, 0, 0.5);
      heartShape.bezierCurveTo(0, 2.5, 2, 2.5, 2, 0);
      heartShape.bezierCurveTo(2, -2.5, 0, -1, 0, 0);
      
      // Higher quality settings for smoother heart shape
      const extrudeSettings = {
        depth: 0.6,
        bevelEnabled: true,
        bevelSegments: 8,
        steps: 4,
        bevelSize: 0.2,
        bevelThickness: 0.2,
        curveSegments: 32
      };
      
      const geometry = new THREE.ExtrudeGeometry(heartShape, extrudeSettings);
      
      // Create more advanced material with fresnel effect for realistic shine
      const material = new THREE.MeshPhysicalMaterial({
        color: 0xff3366,
        roughness: 0.2,
        metalness: 0.7,
        reflectivity: 0.9,
        clearcoat: 0.8,
        clearcoatRoughness: 0.2,
        emissive: 0xff0066,
        emissiveIntensity: 0.5,
        envMapIntensity: 1.2
      });
      
      heart = new THREE.Mesh(geometry, material);
      heartRef.current = heart;
      heart.rotation.x = Math.PI;
      heart.scale.set(0.4, 0.4, 0.4); // Slightly smaller for better proportion
      heart.position.set(0, 0, 0); // Center position
      scene.add(heart);
      
      // Add a glowing aura around the heart
      const glowGeometry = new THREE.SphereGeometry(1.2, 32, 32);
      const glowMaterial = new THREE.MeshBasicMaterial({
        color: 0xff6b8b,
        transparent: true,
        opacity: 0.2,
        blending: THREE.AdditiveBlending
      });
      glow = new THREE.Mesh(glowGeometry, glowMaterial);
      glowRef.current = glow;
      glow.scale.set(1, 1, 0.6);
      glow.position.copy(heart.position);
      scene.add(glow);
      
      // Create ambient particle system that surrounds the heart
      createHeartParticles(scene, particles);
      
      // Enhanced lighting system for better visual quality
      // Main front light
      const mainLight = new THREE.DirectionalLight(0xffffff, 1.2);
      mainLight.position.set(1, 1, 2);
      mainLight.lookAt(heart.position);
      scene.add(mainLight);
      
      // Fill light from behind
      const fillLight = new THREE.DirectionalLight(0xfff0f5, 0.8);
      fillLight.position.set(-1, -1, -1);
      fillLight.lookAt(heart.position);
      scene.add(fillLight);
      
      // Ambient light for overall illumination
      const ambientLight = new THREE.AmbientLight(0x332244, 0.5);
      scene.add(ambientLight);
      
      // Add point light in the center of the heart for glow effect
      pointLight = new THREE.PointLight(0xff3366, 2, 5);
      pointLight.position.set(0, 0, 0.5);
      heart.add(pointLight); // Attach to heart so it moves with it
      
      // Add rim light for dramatic edge highlighting
      rimLight = new THREE.SpotLight(0xff9999, 2, 10, Math.PI / 4, 0.5, 1);
      rimLight.position.set(0, 0, -3);
      rimLight.lookAt(heart.position);
      scene.add(rimLight);
      
      // Add event listeners
      document.addEventListener('mousemove', onDocumentMouseMove);
      document.addEventListener('touchmove', onDocumentTouchMove);
      document.addEventListener('mousedown', onDocumentInteraction);
      document.addEventListener('touchstart', onDocumentInteraction);
      window.addEventListener('resize', onWindowResize);
      
      // Mark as initialized
      sceneInitialized = true;
      
      // Initial render
      animate();
    }
    
    // Create particle system for the heart
    function createHeartParticles(scene: THREE.Scene, particlesObj: THREE.Points) {
      const particlesCount = 180;
      const particlesGeometry = new THREE.BufferGeometry();
      const particlePositions = new Float32Array(particlesCount * 3);
      const particleSizes = new Float32Array(particlesCount);
      const particleColors = new Float32Array(particlesCount * 3);
      
      for (let i = 0; i < particlesCount; i++) {
        // Position particles in a heart-like shape using parametric equation
        const t = Math.random() * Math.PI * 2;
        const scale = 0.15; // Scale factor for heart size
        
        // Heart parametric equation (more pronounced heart shape)
        const x = 16 * Math.pow(Math.sin(t), 3);
        const y = 13 * Math.cos(t) - 5 * Math.cos(2*t) - 2 * Math.cos(3*t) - Math.cos(4*t);
        
        // Random position within the heart volume
        const depth = 1.5; // Thickness of the particle field
        const z = (Math.random() - 0.5) * depth;
        
        particlePositions[i * 3] = x * scale * (0.8 + Math.random() * 0.4);
        particlePositions[i * 3 + 1] = y * scale * (0.8 + Math.random() * 0.4);
        particlePositions[i * 3 + 2] = z;
        
        // Random sizes with larger particles in the center
        const sizeVariation = Math.max(0.5, 1 - Math.sqrt(x*x + y*y) / 20);
        particleSizes[i] = (Math.random() * 2 + 1) * sizeVariation;
        
        // Colors range from pink to white with variation
        const colorRatio = Math.random(); // 0-1 value for color interpolation
        const r = 1.0;  // Full red
        const g = 0.3 + colorRatio * 0.7; // 0.3-1.0
        const b = 0.5 + colorRatio * 0.5; // 0.5-1.0
        
        particleColors[i * 3] = r;
        particleColors[i * 3 + 1] = g;
        particleColors[i * 3 + 2] = b;
      }
      
      particlesGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
      particlesGeometry.setAttribute('size', new THREE.BufferAttribute(particleSizes, 1));
      particlesGeometry.setAttribute('color', new THREE.BufferAttribute(particleColors, 3));
      
      // Create advanced particle material with custom shaders
      const particleMaterial = new THREE.ShaderMaterial({
        uniforms: {
          color: { value: new THREE.Color(0xffffff) },
          time: { value: 0 },
          pointTexture: { value: createParticleTexture() }
        },
        vertexShader: `
          attribute float size;
          attribute vec3 color;
          varying vec3 vColor;
          uniform float time;
          
          float cubicPulse(float c, float w, float x) {
            x = abs(x - c);
            if (x > w) return 0.0;
            x /= w;
            return 1.0 - x * x * (3.0 - 2.0 * x);
          }
          
          void main() {
            vColor = color;
            vec3 pos = position;
            
            // Complex floating motion
            float xFreq = pos.x * 2.0;
            float yFreq = pos.y * 2.0;
            float zFreq = pos.z * 3.0;
            
            pos.x += sin(time * 0.5 + yFreq) * 0.06;
            pos.y += cos(time * 0.4 + xFreq) * 0.06;
            pos.z += sin(time * 0.7 + zFreq) * 0.08;
            
            // Add pulsing effect
            float pulse = 1.0 + 0.05 * sin(time * 2.0 + pos.x * pos.y);
            
            vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
            gl_PointSize = size * pulse * (30.0 / -mvPosition.z);
            gl_Position = projectionMatrix * mvPosition;
          }
        `,
        fragmentShader: `
          uniform vec3 color;
          uniform sampler2D pointTexture;
          varying vec3 vColor;
          
          void main() {
            vec4 texColor = texture2D(pointTexture, gl_PointCoord);
            if (texColor.a < 0.3) discard;
            gl_FragColor = vec4(vColor, 1.0) * texColor;
          }
        `,
        blending: THREE.AdditiveBlending,
        depthTest: false,
        transparent: true
      });
      
      particles = new THREE.Points(particlesGeometry, particleMaterial);
      particlesRef.current = particles;
      scene.add(particles);
    }
    
    // Create a nice soft particle texture
    function createParticleTexture(): THREE.Texture {
      const canvas = document.createElement('canvas');
      canvas.width = 32;
      canvas.height = 32;
      
      const context = canvas.getContext('2d');
      if (!context) throw new Error('Could not get canvas context');
      
      // Create a radial gradient for a soft particle
      const gradient = context.createRadialGradient(16, 16, 0, 16, 16, 16);
      gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
      gradient.addColorStop(0.3, 'rgba(255, 255, 255, 0.8)');
      gradient.addColorStop(0.7, 'rgba(255, 255, 255, 0.4)');
      gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
      
      context.fillStyle = gradient;
      context.fillRect(0, 0, 32, 32);
      
      const texture = new THREE.Texture(canvas);
      texture.needsUpdate = true;
      return texture;
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
        // Prevent default only if the heart is the main interactive element
        event.preventDefault();
        mouseX = (event.touches[0].pageX - windowHalfX) / 50;
        mouseY = (event.touches[0].pageY - windowHalfY) / 50;
      }
    }
    
    function onDocumentInteraction() {
      setIsInteracting(true);
      lastInteractionRef.current = Date.now();
      
      // Increase the heart rate with each interaction
      heartRateRef.current = Math.min(heartRateRef.current + 15, 150);
      
      // Set heartbeat state based on heart rate
      if (heartRateRef.current > 120) {
        setHeartbeatState('excited');
      } else if (heartRateRef.current > 80) {
        setHeartbeatState('active');
      }
      
      // Increase interaction intensity (for visual effects)
      setInteractionIntensity(prev => Math.min(prev + 0.25, 1.0));
      
      // Use browser vibration API on mobile
      if (navigator.vibrate && window.innerWidth <= 768) {
        navigator.vibrate(heartRateRef.current < 100 ? 30 : 50);
      }
      
      // Play heart beat sound with volume based on heart rate
      try {
        const audio = new Audio();
        audio.src = 'data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4Ljc2LjEwMAAAAAAAAAAAAAAA//tQxAAAAAAAAAAAAAAAAAAAAAAASW5mbwAAAA8AAAASAAAeMwAUFBQUFCIiIiIiIjAwMDAwMD4+Pj4+PkxMTExMTFpaWlpaWmhoaGhoaHZ2dnZ2doSEhISEhJKSkpKSkqCgoKCgoK6urq6urrKysr6+vr6+vr6+vr6+vsbGxsbGxtLS0tLS0tra2tra2uLi4uLi4urq6urq6vLy8vLy8vr6+vr6+v///wAAADxhdmMxOUQMUAAAAwAAAAAAATwwWkAAAAAAAAAAAAAAAAAAAAAAACIiIiIiIhE+PT09PTWmpqampppaXl5eXl48XDz///9MfT///zE+Pj4+PiIiIiIiIgAAAAAAAAAAAAD/+0LEcQAMKABnmDAAAYQACPMAAAAAKgjAo9CCNCCCRgg8IBTMfC3R5ipiRCAuOCCB0zN0vBeeMEcJQQIEAweCAIGDx9ZC8Kj+BTM7P6Orj+fPfMfT889M4/5Ppp/w0/PvQ/TPO/4hP8Mz8o/n/D03//w3/mc+fmf//M5/nO+fhF/i2t/yfM5/wyf/8p////yX////uQAGP//MZ///If///8jK//in////xE///yL///8JCaAkDkMf/yZv/+ZP//5kxm//Mv///yf///KCgIgU//pIKv/6k///+Sk///nCSzjDNCZkmfo5jLAilpESgkIjckdU+p3XkZCiMUlJDNHKlWsNS8JWQ6oCkqRLwWzSpIk4aii5CrVCfmMQFIIhQVSQ1KSZOTrJdpIJQcBihZDYgBEG4USHZN//////8wMDAxP//////8iBUVigoKsBAVFQoKCrAwVY2CxUFRVlRUVFWNgsVBUVZUVFRVjYQFRUFBVlRUVFWCBAWCAqKgoKsqKioqwQICgqCgqyoqKirBAVFQoKCrKioqKsbBYqCoqyoqKirGwWKgqKsqKioqxsICoqCgqyoqKirBAVFQoKCrKioqKsECAoKgoKsqKioqwQFRUKCgqyoqKirGwWKgqKsqKioqxsFioKirKioqKsEBUVCgoKsqKioqwQICgqCgqyoqKirBAgKCoKCrKioqKsEBUVCgoKsqKioqyZlVVVZlFVVZlIUUUUZlVVVZlVVVWZVVVVmVVVVmUUVVZlVVVWZVVVVmVVVVZlFVVWZVVVVmVVVVZlVVVWZRRVVmVVVVZlVVVWZVVVVmUUVVZlVVVWZVVVVmVVVVZlFFVWZVVVVmVVVV';
        
        // Adjust volume based on heart rate (more intense at higher BPM)
        const volumeBase = 0.3;
        const volumeBoost = (heartRateRef.current - 60) / 180; // 0 to 0.5 range based on 60-150 BPM
        audio.volume = Math.min(volumeBase + volumeBoost, 0.8);
        
        audio.playbackRate = Math.min(1 + (heartRateRef.current - 60) / 150, 1.5); // Speed up based on heart rate
        audio.play();
      } catch (e) {
        console.log('Audio not supported');
      }
      
      // Schedule heart to gradually calm down after a longer period
      setTimeout(() => {
        if (Date.now() - lastInteractionRef.current >= 2500) {
          heartRateRef.current = Math.max(heartRateRef.current - 10, 60);
          setInteractionIntensity(prev => Math.max(prev - 0.3, 0));
          
          // Return to normal state if heart has calmed enough
          if (heartRateRef.current < 80) {
            setHeartbeatState('rest');
          }
        }
      }, 3000);
      
      // Reset interaction flag (for animation triggers)
      setTimeout(() => {
        setIsInteracting(false);
      }, 800);
    }
    
    function triggerHeartBurst() {
      // This is called from the main function when burstMoment becomes true
      // Create explosion of particles
      createBurstParticles();
      
      // Show message after a short delay
      setTimeout(() => {
        setShowLoveMessage(true);
      }, 500);
      
      // Create a pulse animation for the heart
      if (heart) {
        const burstAnimation = {
          scale: [
            new THREE.Vector3(0.4, 0.4, 0.4),
            new THREE.Vector3(0.8, 0.8, 0.8),
            new THREE.Vector3(0.4, 0.4, 0.4)
          ],
          color: [
            new THREE.Color(0xff3366),
            new THREE.Color(0xffffff),
            new THREE.Color(0xff3366)
          ],
          emissiveIntensity: [0.5, 2, 0.5]
        };
        
        let startTime = Date.now();
        const duration = 1200; // Animation duration in ms
        
        function animateBurst() {
          const now = Date.now();
          const elapsed = now - startTime;
          const progress = Math.min(elapsed / duration, 1);
          
          // Ease in-out function for smoother animation
          const easedProgress = progress < 0.5
            ? 2 * progress * progress
            : 1 - Math.pow(-2 * progress + 2, 2) / 2;
          
          if (progress < 1) {
            // Animation still in progress
            if (heart && heart.material instanceof THREE.MeshPhysicalMaterial) {
              // Interpolate scale
              const scaleIndex = Math.min(Math.floor(easedProgress * 2), 1);
              const scaleT = (easedProgress * 2) - scaleIndex;
              const scale1 = burstAnimation.scale[scaleIndex];
              const scale2 = burstAnimation.scale[scaleIndex + 1];
              const scale = scale1.clone().lerp(scale2, scaleT);
              heart.scale.copy(scale);
              
              // Interpolate color
              const colorIndex = Math.min(Math.floor(easedProgress * 2), 1);
              const colorT = (easedProgress * 2) - colorIndex;
              const color1 = burstAnimation.color[colorIndex];
              const color2 = burstAnimation.color[colorIndex + 1];
              const color = new THREE.Color().copy(color1).lerp(color2, colorT);
              heart.material.color = color;
              heart.material.emissive = color.clone().multiplyScalar(0.5);
              
              // Interpolate emissive intensity
              const emissiveIndex = Math.min(Math.floor(easedProgress * 2), 1);
              const emissiveT = (easedProgress * 2) - emissiveIndex;
              const intensity1 = burstAnimation.emissiveIntensity[emissiveIndex];
              const intensity2 = burstAnimation.emissiveIntensity[emissiveIndex + 1];
              heart.material.emissiveIntensity = intensity1 + (intensity2 - intensity1) * emissiveT;
            }
            
            // Update glow
            if (glow) {
              const glowScale = 1 + easedProgress * 2;
              const glowOpacity = 0.2 + easedProgress * 0.4;
              glow.scale.set(glowScale, glowScale, glowScale * 0.6);
              if (glow.material instanceof THREE.MeshBasicMaterial) {
                glow.material.opacity = glowOpacity * (1 - easedProgress);
              }
            }
            
            // Continue animation
            requestAnimationFrame(animateBurst);
          } else {
            // Animation complete - reset to original state
            if (heart && heart.material instanceof THREE.MeshPhysicalMaterial) {
              heart.scale.set(0.4, 0.4, 0.4);
              heart.material.color = new THREE.Color(0xff3366);
              heart.material.emissive = new THREE.Color(0xff0066);
              heart.material.emissiveIntensity = 0.5;
            }
            
            // Reset glow
            if (glow) {
              glow.scale.set(1, 1, 0.6);
              if (glow.material instanceof THREE.MeshBasicMaterial) {
                glow.material.opacity = 0.2;
              }
            }
          }
        }
        
        // Start the animation
        animateBurst();
      }
    }
    
    function updateHeart() {
      // Use device orientation on mobile devices
      if (gamma !== null && beta !== null) {
        targetX = gamma / 8; // More responsive to device tilting
        targetY = beta / 8;
      } else {
        // Use mouse position on desktop
        targetX = mouseX * 0.25;
        targetY = mouseY * 0.25;
      }
      
      // Calculate heart rate and beatPhase
      const time = Date.now() * 0.001;
      const currentHeartRate = heartRateRef.current;
      const beatsPerSecond = currentHeartRate / 60;
      
      // Analyze mouse/touch inactivity to make heart gradually calm down when not interacted with
      mouseInactiveTimeRef.current = (Date.now() - lastInteractionRef.current) / 1000;
      if (mouseInactiveTimeRef.current > 3 && heartRateRef.current > 60) {
        // Gradually reduce heart rate to normal when not interacting
        heartRateRef.current = Math.max(60, heartRateRef.current - 0.2);
      }
      
      // Calculate heart beat phase (0 to 1)
      heartPhaseRef.current = (heartPhaseRef.current + beatsPerSecond * 0.016) % 1;
      const beatPhase = heartPhaseRef.current;
      
      // Create dynamic pulse based on current heart rate
      // This creates a realistic heartbeat pattern with systole and diastole phases
      let heartPulse;
      if (beatPhase < 0.1) { // Quick contraction phase (systole)
        heartPulse = 1 + 0.25 * Math.sin(beatPhase / 0.1 * Math.PI);
      } else if (beatPhase < 0.5) { // Relaxation phase (diastole)
        heartPulse = 1 + 0.1 * Math.sin((beatPhase - 0.1) / 0.4 * Math.PI + Math.PI);
      } else { // Resting phase
        heartPulse = 1 + 0.03 * Math.sin((beatPhase - 0.5) / 0.5 * Math.PI);
      }
      
      // Excitement factor (0-1) based on interaction and heart rate
      const excitement = Math.min(1, (heartRateRef.current - 60) / 90); // 60-150 BPM range

      if (heart) {
        // Smoother, more responsive heart rotation
        const rotationSpeed = 0.08;
        heart.rotation.y += rotationSpeed * (targetX - heart.rotation.y);
        heart.rotation.x += rotationSpeed * (targetY + Math.PI - heart.rotation.x);
        
        // Dynamic scale based on heart rate and phase
        const baseScale = 0.4 * (1 + excitement * 0.1); // Slightly larger when excited
        const beatStrength = heartbeatState === 'burst' ? 0.2 : 
                             heartbeatState === 'excited' ? 0.15 : 
                             heartbeatState === 'active' ? 0.1 : 0.05;
        
        heart.scale.set(
          baseScale * heartPulse * (1 + (beatPhase < 0.2 ? beatStrength : 0)),
          baseScale * heartPulse * (1 - (beatPhase < 0.2 ? beatStrength * 0.7 : 0)),
          baseScale * heartPulse * (1 + (beatPhase < 0.2 ? beatStrength * 0.5 : 0))
        );
        
        // Dynamic color based on excitement
        if (heart.material instanceof THREE.MeshPhysicalMaterial) {
          // More intense red when excited
          const r = 1.0;
          const g = 0.2 - excitement * 0.15;
          const b = 0.4 - excitement * 0.25;
          heart.material.emissive.setRGB(r * 0.5, g * 0.3, b * 0.3);
          heart.material.emissiveIntensity = 0.5 + excitement * 0.5;
          
          // More metallic/reflective when excited
          heart.material.metalness = 0.7 + excitement * 0.3;
          heart.material.clearcoat = 0.8 + excitement * 0.2;
        }
        
        // Update glow position and effects
        if (glow) {
          glow.position.copy(heart.position);
          glow.rotation.copy(heart.rotation);
          
          // Pulsating glow with phase offset from heart that intensifies with excitement
          const glowBaseIntensity = 0.2 + excitement * 0.2;
          const glowPulseStrength = 0.08 + excitement * 0.17;
          const glowPulse = glowBaseIntensity + glowPulseStrength * 
                            (beatPhase < 0.2 ? Math.sin(beatPhase / 0.2 * Math.PI) : 0);
          
          if (glow.material instanceof THREE.MeshBasicMaterial) {
            glow.material.opacity = glowPulse;
            
            // Color shifts with excitement from pink to red
            const r = 1.0;
            const g = 0.42 - excitement * 0.3;
            const b = 0.55 - excitement * 0.35;
            glow.material.color.setRGB(r, g, b);
          }
          
          // Glow size pulses with heartbeat
          const glowBaseScale = 1 + excitement * 0.3;
          const glowPulseScale = 1 + (beatPhase < 0.2 ? 0.2 * Math.sin(beatPhase / 0.2 * Math.PI) : 0);
          glow.scale.set(
            glowBaseScale * glowPulseScale, 
            glowBaseScale * glowPulseScale, 
            glowBaseScale * glowPulseScale * 0.6
          );
        }
        
        // Update point light
        if (pointLight) {
          // Light pulses with heart
          const lightBaseIntensity = 2 + excitement * 2;
          const lightPulse = lightBaseIntensity * (1 + (beatPhase < 0.15 ? 0.7 * Math.sin(beatPhase / 0.15 * Math.PI) : 0));
          pointLight.intensity = lightPulse;
          
          // Color shifts with heart rate
          const hue = 0.95 - excitement * 0.05; // Shift from pink to deeper red
          pointLight.color.setHSL(hue, 1, 0.5);
        }
        
        // Update rim light based on excitement
        if (rimLight) {
          rimLight.intensity = 2 + excitement * 1.5;
        }
      }
      
      // Update particles behavior based on excitement
      if (particles && particles.material instanceof THREE.ShaderMaterial) {
        particles.material.uniforms.time.value = time;
        
        // Particles move faster when heart is excited
        const particleSpeed = 1 + excitement * 1.5;
        particles.material.uniforms.time.value *= particleSpeed;
        
        // Subtle rotation of the particle system
        particles.rotation.y = Math.sin(time * 0.0005 * particleSpeed) * 0.2;
        
        // Scale particles during excitement
        const particleScale = 1.0 + excitement * 0.2;
        // Add pulsing effect timed with heartbeat
        const particlePulse = 1 + (beatPhase < 0.2 ? 0.1 * Math.sin(beatPhase / 0.2 * Math.PI) : 0);
        particles.scale.set(
          particleScale * particlePulse, 
          particleScale * particlePulse, 
          particleScale * particlePulse
        );
      }
    }
    
    function animate() {
      requestAnimationFrame(animate);
      updateHeart();
      renderer.render(scene, camera);
    }
    
    // Initialize
    init();
    
    // Respond to section changes
    const handleSectionChange = (event: CustomEvent) => {
      // Make the heart more prominent on specific sections
      if (event.detail && event.detail.to !== undefined) {
        // Adjust heart position/scale based on which section is active
        const targetSection = event.detail.to;
        
        if (heart) {
          if (targetSection === 0) {
            // Landing section - heart is centered
            gsapPositionHeart(heart, 0, 0, 0, 0.4);
          } else if (targetSection === 1) {
            // Birthday card section - heart moves slightly to the side
            gsapPositionHeart(heart, -1.5, 0.5, 0, 0.35);
          } else if (targetSection === 2) {
            // Love letter section - heart moves to the other side
            gsapPositionHeart(heart, 1.5, 0.5, 0, 0.35);
          } else if (targetSection === 3) {
            // Final section - heart returns to center and gets bigger
            gsapPositionHeart(heart, 0, 0, 0, 0.45);
          }
        }
      }
    };
    
    // Helper function for smooth heart transitions
    function gsapPositionHeart(heart: THREE.Mesh, x: number, y: number, z: number, scale: number) {
      // Create a simple animation using requestAnimationFrame instead of GSAP
      const startPos = heart.position.clone();
      const startScale = heart.scale.x; // Assuming uniform scale
      const duration = 1000; // ms
      const startTime = Date.now();
      
      function animateHeart() {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Ease in-out function
        const eased = progress < 0.5 
          ? 2 * progress * progress 
          : 1 - Math.pow(-2 * progress + 2, 2) / 2;
        
        // Update position
        heart.position.x = startPos.x + (x - startPos.x) * eased;
        heart.position.y = startPos.y + (y - startPos.y) * eased;
        heart.position.z = startPos.z + (z - startPos.z) * eased;
        
        // Update scale (uniform)
        const newScale = startScale + (scale - startScale) * eased;
        heart.scale.set(newScale, newScale, newScale);
        
        if (progress < 1) {
          requestAnimationFrame(animateHeart);
        }
      }
      
      animateHeart();
    }
    
    // Listen for section changes
    window.addEventListener('sectionchange', handleSectionChange as EventListener);
    
    // Cleanup on unmount
    return () => {
      if (containerRef.current && containerRef.current.contains(renderer.domElement)) {
        containerRef.current.removeChild(renderer.domElement);
      }
      
      // Remove all event listeners
      document.removeEventListener('mousemove', onDocumentMouseMove);
      document.removeEventListener('touchmove', onDocumentTouchMove);
      document.removeEventListener('mousedown', onDocumentInteraction);
      document.removeEventListener('touchstart', onDocumentInteraction);
      window.removeEventListener('resize', onWindowResize);
      window.removeEventListener('sectionchange', handleSectionChange as EventListener);
      
      // Clean up any THREE.js resources
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
      
      if (glow && glow.geometry) glow.geometry.dispose();
      if (glow && glow.material) {
        if (Array.isArray(glow.material)) {
          glow.material.forEach(m => m.dispose());
        } else {
          glow.material.dispose();
        }
      }
      
      renderer.dispose();
    };
  }, [beta, gamma, isInteracting]);
  
  // Create burst particles effect
  const createBurstParticles = () => {
    // Create explosion effect with particles
    const particlesArray: JSX.Element[] = [];
    const colors = ['#ff3366', '#ff6b8b', '#ff94a9', '#ffb6c1', '#ffffff'];
    
    for (let i = 0; i < 120; i++) {
      const size = Math.random() * 8 + 4;
      const angle = Math.random() * Math.PI * 2;
      const velocity = Math.random() * 10 + 5;
      const startDistance = Math.random() * 20;
      const startX = window.innerWidth / 2 + Math.cos(angle) * startDistance;
      const startY = window.innerHeight / 2 + Math.sin(angle) * startDistance;
      const delay = Math.random() * 200;
      const duration = Math.random() * 1000 + 1000;
      const color = colors[Math.floor(Math.random() * colors.length)];
      
      particlesArray.push(
        <motion.div 
          key={`burst-particle-${i}`}
          className="absolute rounded-full pointer-events-none z-50"
          initial={{ 
            x: startX, 
            y: startY, 
            opacity: 1,
            width: `${size}px`, 
            height: `${size}px`, 
            backgroundColor: color
          }}
          animate={{ 
            x: startX + Math.cos(angle) * velocity * 30, 
            y: startY + Math.sin(angle) * velocity * 30, 
            opacity: 0,
            scale: Math.random() * 0.5 + 0.5
          }}
          transition={{ 
            duration: duration / 1000, 
            delay: delay / 1000,
            ease: "easeOut" 
          }}
        />
      );
    }
    const particleCount = 150;
    const particles: JSX.Element[] = [];
    
    for (let i = 0; i < particleCount; i++) {
      // Random position in a sphere around the center
      const angle = Math.random() * Math.PI * 2;
      const radius = 100 + Math.random() * 200;
      
      // Transform coordinates
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      const delay = Math.random() * 0.5;
      const duration = 1.5 + Math.random();
      const size = Math.random() * 6 + 2;
      
      // Randomly choose between hearts and star particles
      const isHeart = Math.random() > 0.5;
      const particleColor = isHeart 
        ? `hsl(${350 + Math.random() * 20}, 100%, ${70 + Math.random() * 30}%)` 
        : `hsl(${40 + Math.random() * 20}, 100%, ${80 + Math.random() * 20}%)`;
      
      const style: React.CSSProperties = {
        position: 'absolute',
        left: '50%',
        top: '50%',
        width: `${size}px`,
        height: `${size}px`,
        transform: 'translate(-50%, -50%)',
        animation: `burst-particle ${duration}s ease-out forwards`,
        animationDelay: `${delay}s`,
        opacity: 0,
        color: particleColor,
        willChange: 'transform, opacity',
        zIndex: 1000
      };
      
      particles.push(
        <div
          key={`burst-particle-${i}`}
          className="burst-particle"
          style={style}
          data-x={x}
          data-y={y}
        >
          {isHeart ? (
            <svg viewBox="0 0 24 24" fill="currentColor" width="100%" height="100%">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="currentColor" width="100%" height="100%">
              <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
            </svg>
          )}
        </div>
      );
    }
    
    // Add burst animation styles
    const styleElement = document.createElement('style');
    styleElement.textContent = `
      @keyframes burst-particle {
        0% { 
          opacity: 1;
          transform: translate(-50%, -50%) scale(0);
        }
        10% { 
          opacity: 1;
          transform: translate(-50%, -50%) scale(1);
        }
        100% { 
          opacity: 0;
          transform: translate(calc(-50% + var(--x, 0px)), calc(-50% + var(--y, 0px))) scale(0.5) rotate(720deg);
        }
      }
    `;
    document.head.appendChild(styleElement);
    
    // Set particles and clean up after animation
    setBurstParticles(particles);
    setTimeout(() => {
      setBurstParticles([]);
      document.head.removeChild(styleElement);
    }, 3000);
  };
  
  // Create the floating message that appears after heart burst
  useEffect(() => {
    if (!showLoveMessage || !messageRef.current) return;
    
    // Add sparkle effect to the message
    const sparkleCount = 20;
    const messageElement = messageRef.current;
    
    for (let i = 0; i < sparkleCount; i++) {
      const sparkle = document.createElement('div');
      sparkle.className = 'sparkle';
      
      // Set random position around the message
      const left = Math.random() * 100;
      const top = Math.random() * 100;
      
      sparkle.style.cssText = `
        position: absolute;
        left: ${left}%;
        top: ${top}%;
        width: 5px;
        height: 5px;
        background: white;
        border-radius: 50%;
        opacity: 0;
        animation: sparkle ${0.5 + Math.random() * 1.5}s ease-in-out infinite;
        animation-delay: ${Math.random() * 2}s;
      `;
      
      messageElement.appendChild(sparkle);
    }
    
    // Add sparkle animation
    const style = document.createElement('style');
    style.innerHTML = `
      @keyframes sparkle {
        0%, 100% { opacity: 0; transform: scale(0); }
        50% { opacity: 0.8; transform: scale(1); }
      }
      
      @keyframes float-message {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-10px); }
      }
    `;
    document.head.appendChild(style);
    
    // Play love confession sound
    try {
      const audio = new Audio();
      audio.src = 'data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4Ljc2LjEwMAAAAAAAAAAAAAAA//tQxAAACjCWU8IHgAqQ3C7DQYAAFYdnv/8bkPbr/2rY3ve3Xz/Pn+7/d3d77aed/d/t3/PD2f/t1f8gBQDAEhCQcF0HD+IMihQdCvv1K+FQ8IHEIUjTt+JQgZA0CgZFRzBD4P//qDoO/Lg8GA7Bvw///uoB/bLg2Dv/5cHQ7//5UJBUUfvl//nAThMHwZBn//+dBcRhQFAmAg///14QBkNBEJgb///nhAJB4UhQT///PBINiIZEwz//+gAgbE4uKiYS//+xEAYOjQwJCH//6WEwXFRMJA///zwmFhIXFBH//8MDYAQBocFBQR//qQoMioqIAr//8TEhIVERP//+vDAmKCQk///9kDIPCYoJv//5YXEw0JCr//6gLh4VFA7//9OCAaFRAP//+nCgiLCQi///2gUER/4cFBH///Og8JioqJiT//9YEAuIiYm///+iC4kKCQj///mBMTExMT///9qDB0FhAP//+xCgqKiYm///1QYHRUUEv//+wCQkKiIl///owoIiwkJP//+mCwiKCYm///rgkIiomJP//9kFRIVEhJ///sFhIVEhJ///nBYTFBIS///64MCYoKCL//9kD4iKigg///qAwIiooIf//8uCQiKiYk///1QOiooJiT//+0CgiKiYk///1QSERUSEn//7YLCQqJCT//+cFRMUEhL///qgwJigoIv//2QPiIqJCD//+oDAiKCgh///y4JCIqJCX//9UDoqJiQk///tAsIiokJP//5wVExQSEv///qgwJigo///9kD4iKiQg///qAwIigoIf//8uCQiKiQl///VA6KiYkJ///sAsIiokI///5wVExMSEn///agwNiggH///SggFhATDv//1wSDA0HgSD//9SDAMgYAAL//zQMAgCQQBP/+sP//GDHkR3VxMGAALAsB8IBEEgQCYJAWBgFg0BQLgUBoGAkCAIAYAwCAgCAFAIDAPAUC4MA4CQFAkBYGAKBYEgLAwBgKA0CQEgOAgCwHAYA4CgRAsCAGAMBQFgCMBYAgEAUBwFAYBYEgKAkCQGgMAwBwJAYBADAOAwBQGgUBYEgMAgCgFAQA4CAHAYBACgLAcAwBgCAQA4DgIAIAgCwLAgBQGgQAwCAIAUBQCgFAcBACAIAoCAGAQAwCgFAUBADAKA0CQFAWBIEgOAsCQNAuBADAKAwCQIAgCgGA8CQGgkBYEAaBQFgQM2T39ChMZI7k1TGQBBNpEd5xmZkNUKP//80BIIgQBAJA0CAfAgCRGCwJAsBwFAWA4CgHAkBoEAKA0CAEAQBgEAOAQCwIAQAwBAIAYBQDgMA0BwGAUBYDALAwCQJAuCgL//tQxMKPlsQh+n9+AAEUg7X/PnPPH//PD2eH//+fnPPP//P///////HHP/////5/////+f//////+f////////+c/9/n//////////5z///////////////////////n////+f////5//////znP//////////5/////8/////+f//////8/////////8/////8/////+f///////z///////z///////5////////nP/n////Oc////////nP///////8////////nP/////853/////+c/////+c/////+f/////////+c/+f///+f///////n///////n///////5////////n///////n/////+f///////n//////+f///////5///////5////////nP/////85////////nP/////853/////+c/////+c////////y/8///x//53/3//vn/f/+ed8////+f98/75//5/////////////////////////////////////////////////////////////////DQXEBENCJbTY6LEEwVBSCRULGABJIFEsizMkxXZgWFQODAYBQFgOA4FwTAoCgLAgBAFAsCAFA0BICgZA0EwPAsDgQA0EQOBEDwMA0DwPBIDwQA8EgNBYDgMBEDwOA0CAFAkDgIA8DoGGwGYJA8CwTA4DoQAUCgLAMEAMAoEQOAU2AcS///9MQEhMVEBCmq2IB4TEBIMFdTABYUFRARq6uFxQUEBGrqYgKCoqICFXVwwKCogIVdXERUVEBCrq4YFBQQEKuriAkJiogI1VTEBQWFRAQq6uHigqICFXVxAUFRUQEaqphgUFBARq6uJCgqICFXVxEVFRAQq6uGBQUEBCrq4gJiYqICNVUxATFRUQEKuriAoKiohV1cMCgqICNXVxIUFBCrq4gKiogIVdXDQoKCAjV1cRExQREKuriAmKiAjVVMRFRUQEKuriAoKiAhV1cMCgqICFXVxUSFBEnJyfnJ+bn////7APBoDgSAkDATA4CwHAUCQLggCQJAeCAHAiBoGAUCEIA2Bw1BIDwTBEDQNA4DQKAwDQPAcCQGgUB4HA2DAKAwBwIA4CQOAoCQJAgDAOBCDwYBUEQQBADAHAkCy97nf3vf/f3jWggKYNAsCwKA0EgQA4CwOAgBAFgqB4IAcCQLAgCQFAaB4GgiB4GAQBYEgUA4DQNAkCwOAwDAIAgBwEgQBwGguCYGggB4FAQB4HgcBoIAeCAHgkB4JAaCIGgsCYHgcCAHgYBYDgMAwCQIAkB//swxPaP7KhMbVnzoAYwCo3vPtABQNAoCgHAiCIIgiCIGA0CAJAcBYDgLA0CANAkCgLAkCQIAmCAHggB4DANBEEANAsCwIAcCYGgUBADAKAwCQIAwDQQA8EASBAEAOBEDgXBUFATA0EQQAsEQNA8EAQBgDQLAgBwIAgCQIggB4GgUBcDQKAgB4HAaBoFAQAgBwFgIAsDQIAgCQKAgB4IAaCQHAkCAHA0CQKAuCAHggBwJAcBwJAgCgJAkCgLAgCgJAgCQIgcCIHgcCIFgOAwDQJAkBwEAOBIEgSA0CgLA0CgLAcCIIAgBwIgYBgEgMAsCQHAeCIGAQBYDgLAcBwIAoCIIAcB4IA2BwEAQBIDgPBEDwMA4CwLAkCIJAeB4HgaCAGAQA4EQOAwDQJAkBwFA0CQJAoBwIAYBYDgNA4DQLAgCQGAUCIIAgB4JAgBwHAgCQJAeCQIAaB4HgYBIEgQBAEASBEEAOA0DwOA0DQKAoCAIAgBoIgcBwHAgBwHggBwJAgCcBggBwHgiB4HgaCAIf/8/////98///////7/////+dAcB4HgeBgEAOA4DANA8DwNAkCQHAeCIIASA4DwQA8DQNAkCAHAeCAIAcB4FAQBADwRA0CQHg2BQEgNAkCgLAgBwJAkCAHgcBoHgcCIHARBUEQRBEEQQAkBwIAYBQEARBIDgOA4EQeCAHgeBgEgXA8DgOBADwNA8DwOA4DgOBEDgNA0DQKAgCgIAgBUCAgCQIAcCIJAeCgJAeCAGgcBIEQRBEEQRBEEAQBIEQQAoDwKAoCgIAYCAGAgBgIAUAgCQIAcCIJAcCIJAcCA';
      audio.volume = 0.3;
      audio.play();
    } catch (e) {
      console.log('Audio not supported');
    }
    
    return () => {
      // Clean up
      document.head.removeChild(style);
    };
  }, [showLoveMessage]);
  
  return (
    <>
      <div 
        id="canvas-container" 
        ref={containerRef} 
        className="fixed top-0 left-0 w-full h-full z-10 cursor-pointer"
        style={{ pointerEvents: 'auto' }}
      />
      
      {/* Burst particles */}
      <div className="burst-particles-container">
        {burstParticles.map((particle) => particle)}
      </div>
      
      {/* Love message that appears after burst */}
      <AnimatePresence>
        {showLoveMessage && (
          <motion.div 
            ref={messageRef}
            className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 text-center"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ 
              scale: 1, 
              opacity: 1,
              y: [0, -10, 0],
              transition: { 
                duration: 0.8, 
                y: { repeat: Infinity, duration: 3, ease: "easeInOut" }
              }
            }}
            exit={{ scale: 0, opacity: 0 }}
            style={{ 
              textShadow: "0 0 10px rgba(255,51,102,0.8)",
              filter: "drop-shadow(0 0 10px rgba(255,51,102,0.5))"
            }}
          >
            <h2 className="text-white font-['Dancing_Script'] text-4xl md:text-5xl">
              I Love You So Much!
            </h2>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
