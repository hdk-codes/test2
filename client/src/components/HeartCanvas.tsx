import * as THREE from 'three';
import { useEffect, useRef, useState } from 'react';
import type { Mesh, Material, Vector3 } from 'three';

interface HeartCanvasProps {
  beatRate: number;
  scale: number;
  isGlowing: boolean;
}

export default function HeartCanvas({ beatRate, scale, isGlowing }: HeartCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const heartRef = useRef<THREE.Mesh | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    // Setup scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Setup camera with better performance settings
    const camera = new THREE.PerspectiveCamera(75, 1, 1, 100);
    camera.position.z = 5;

    // Optimize renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: "high-performance"
    }) as THREE.WebGLRenderer & { forceContextLoss?: () => void };

    if (canvasRef.current) {
      renderer.domElement.style.background = 'transparent';
      canvasRef.current.appendChild(renderer.domElement);
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Limit pixel ratio
    renderer.setSize(300, 300);
    rendererRef.current = renderer;

    // Create heart shape
    const heartShape = new THREE.Shape();
    const x = 0, y = 0;
    heartShape.moveTo(x + 0.5, y + 0.5);
    heartShape.bezierCurveTo(x + 0.5, y + 0.5, x + 0.4, y, x, y);
    heartShape.bezierCurveTo(x - 0.6, y, x - 0.6, y + 0.7, x - 0.6, y + 0.7);
    heartShape.bezierCurveTo(x - 0.6, y + 1.1, x - 0.3, y + 1.54, x + 0.5, y + 1.9);
    heartShape.bezierCurveTo(x + 1.2, y + 1.54, x + 1.6, y + 1.1, x + 1.6, y + 0.7);
    heartShape.bezierCurveTo(x + 1.6, y + 0.7, x + 1.6, y, x + 1.0, y);
    heartShape.bezierCurveTo(x + 0.7, y, x + 0.5, y + 0.5, x + 0.5, y + 0.5);

    const geometry = new THREE.ExtrudeGeometry(heartShape, {
      depth: 0.2,
      bevelEnabled: true,
      bevelSegments: 3,
      steps: 2,
      bevelSize: 0.1,
      bevelThickness: 0.1
    });

    // Create material
    const material = new THREE.MeshBasicMaterial({
      color: new THREE.Color(0xff69b4),
      transparent: true,
      opacity: 1
    });

    // Create mesh
    const heart = new THREE.Mesh(geometry, material);
    const vector = new THREE.Vector3(0.1, 0.1, 0.1);
    heart.scale.copy(vector); // Fix scale setting
    scene.add(heart as unknown as THREE.Object3D);
    heartRef.current = heart;

    // Add lights
    const pointLight = new THREE.PointLight(0xffffff, 1, 100); // Fix light creation
    pointLight.position.set(5, 5, 5);
    scene.add(pointLight as unknown as THREE.Object3D);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight as unknown as THREE.Object3D);

    setIsLoaded(true);

    // Optimized animation loop
    let animationFrameId: number;
    const animate = () => {
      if (!heartRef.current || !rendererRef.current || !sceneRef.current) return;
      
      // Limit rotation speed
      heartRef.current.rotation.y += 0.005;
      renderer.render(scene, camera);
      
      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    // Handle resize
    const handleResize = () => {
      if (!rendererRef.current || !camera) return;
      renderer.setSize(300, 300); // Keep fixed size
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      if (rendererRef.current) {
        const renderer = rendererRef.current as THREE.WebGLRenderer & {
          forceContextLoss?: () => void;
          dispose?: () => void;
        };
        renderer.forceContextLoss?.();
        renderer.dispose?.();
      }
    };
  }, []);

  // Handle beatRate and scale changes
  useEffect(() => {
    if (!heartRef.current || !isLoaded) return;
    
    const scaleVector = new THREE.Vector3(0.5 * scale, 0.5 * scale, 0.5 * scale);
    heartRef.current.scale.copy(scaleVector);
  }, [scale, isLoaded]);

  // Handle glow effect
  useEffect(() => {
    if (!heartRef.current || !isLoaded) return;
    const heart = heartRef.current;
    if (heart instanceof THREE.Mesh) {
      const mat = heart.material as THREE.MeshBasicMaterial;
      mat.color.setHex(isGlowing ? 0xff69b4 : 0x000000);
      mat.opacity = isGlowing ? 0.5 : 0;
    }
  }, [isGlowing, isLoaded]);

  // Update material handling
  useEffect(() => {
    if (!heartRef.current || !isLoaded) return;
    const heart = heartRef.current;
    if (heart instanceof THREE.Mesh) {
      const material = heart.material as THREE.MeshBasicMaterial;
      if (material instanceof THREE.MeshBasicMaterial) {
        material.color.setHex(isGlowing ? 0xff69b4 : 0x000000);
        material.opacity = isGlowing ? 0.5 : 0;
      }
    }
  }, [isGlowing, isLoaded]);

  return (
    <canvas 
      ref={canvasRef} 
      className="w-full h-full"
      style={{ touchAction: 'none' }} // Prevent touch events from triggering scrolling
    />
  );
}
