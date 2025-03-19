import { useEffect, useRef } from "react";
import * as THREE from "three";
import { useDeviceOrientation } from "@/hooks/use-device-orientation";

export default function HeartCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { beta, gamma } = useDeviceOrientation();
  
  useEffect(() => {
    if (!containerRef.current) return;
    
    let scene: THREE.Scene, 
        camera: THREE.PerspectiveCamera, 
        renderer: THREE.WebGLRenderer, 
        heart: THREE.Mesh;
    
    let mouseX = 0, mouseY = 0;
    let targetX = 0, targetY = 0;
    let windowHalfX = window.innerWidth / 2;
    let windowHalfY = window.innerHeight / 2;
    
    // Initialize Three.js scene
    function init() {
      // Scene setup
      scene = new THREE.Scene();
      camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
      camera.position.z = 5;
      
      renderer = new THREE.WebGLRenderer({ alpha: true });
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setClearColor(0x000000, 0);
      containerRef.current?.appendChild(renderer.domElement);
      
      // Create heart shape
      const heartShape = new THREE.Shape();
      
      heartShape.moveTo(0, 0);
      heartShape.bezierCurveTo(0, -1, -2, -2, -2, 0);
      heartShape.bezierCurveTo(-2, 2, 0, 2, 0, 0);
      heartShape.bezierCurveTo(0, -1, 2, -2, 2, 0);
      heartShape.bezierCurveTo(2, 2, 0, 2, 0, 0);
      
      const extrudeSettings = {
        depth: 0.5,
        bevelEnabled: true,
        bevelSegments: 2,
        steps: 2,
        bevelSize: 0.1,
        bevelThickness: 0.1
      };
      
      const geometry = new THREE.ExtrudeGeometry(heartShape, extrudeSettings);
      const material = new THREE.MeshPhongMaterial({
        color: 0xff3366,
        shininess: 100,
        emissive: 0xff0066,
        emissiveIntensity: 0.3
      });
      
      heart = new THREE.Mesh(geometry, material);
      heart.rotation.x = Math.PI;
      heart.scale.set(0.5, 0.5, 0.5);
      heart.visible = false; // Hide initially
      scene.add(heart);
      
      // Add lights
      const light1 = new THREE.DirectionalLight(0xffffff, 1);
      light1.position.set(1, 1, 1);
      scene.add(light1);
      
      const light2 = new THREE.DirectionalLight(0xffffff, 0.5);
      light2.position.set(-1, -1, 1);
      scene.add(light2);
      
      const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
      scene.add(ambientLight);
      
      // Add event listeners
      document.addEventListener('mousemove', onDocumentMouseMove);
      window.addEventListener('resize', onWindowResize);
      
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
      
      if (heart) {
        heart.rotation.y += 0.05 * (targetX - heart.rotation.y);
        heart.rotation.x += 0.05 * (targetY + Math.PI - heart.rotation.x);
        
        // Make heart visible when final section is in view
        const viewportTop = window.pageYOffset;
        const viewportBottom = viewportTop + window.innerHeight;
        const finalSection = document.getElementById('final-section');
        
        if (finalSection) {
          const finalSectionTop = finalSection.offsetTop;
          
          if (finalSectionTop <= viewportBottom && finalSectionTop >= viewportTop - finalSection.offsetHeight) {
            heart.visible = true;
            heart.position.y = 0;
          } else {
            heart.visible = false;
          }
        }
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
      window.removeEventListener('resize', onWindowResize);
    };
  }, [beta, gamma]);
  
  return (
    <div 
      id="canvas-container" 
      ref={containerRef} 
      className="fixed top-0 left-0 w-full h-full pointer-events-none z-10"
    />
  );
}
