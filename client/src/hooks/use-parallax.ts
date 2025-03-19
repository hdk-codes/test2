import { RefObject, useEffect } from "react";
import { useDeviceOrientation } from "./use-device-orientation";

export function useParallax(
  elementRef: RefObject<HTMLElement>,
  depth: number = 0.2
) {
  const { beta, gamma } = useDeviceOrientation();

  useEffect(() => {
    if (!elementRef.current) return;

    const element = elementRef.current;
    
    // Handle mouse movement for desktop
    const handleMouseMove = (e: MouseEvent) => {
      const moveX = (e.clientX - window.innerWidth / 2) * depth;
      const moveY = (e.clientY - window.innerHeight / 2) * depth;
      
      element.style.transform = `translate(${moveX}px, ${moveY}px)`;
    };
    
    // Handle device orientation for mobile
    const handleOrientation = () => {
      if (gamma !== null && beta !== null) {
        const moveX = gamma * depth * 2; // left/right tilt
        const moveY = beta * depth * 2;  // forward/backward tilt
        
        element.style.transform = `translate(${moveX}px, ${moveY}px)`;
      }
    };
    
    if (window.DeviceOrientationEvent && (gamma !== null || beta !== null)) {
      // If device orientation is available and we have readings
      handleOrientation();
      window.addEventListener('deviceorientation', handleOrientation);
    } else {
      // Fallback to mouse parallax
      document.addEventListener('mousemove', handleMouseMove);
    }
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('deviceorientation', handleOrientation);
    };
  }, [elementRef, depth, beta, gamma]);
}
