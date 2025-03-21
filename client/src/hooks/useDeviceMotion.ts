// src/hooks/useDeviceMotion.ts
import { useState, useEffect } from 'react';

interface DeviceMotion {
  x: number | null;
  y: number | null;
  z: number | null;
}

export function useDeviceMotion(): DeviceMotion {
  const [motion, setMotion] = useState<DeviceMotion>({ x: null, y: null, z: null });

  useEffect(() => {
    const handleMotion = (e: DeviceMotionEvent) => {
      setMotion({
        x: e.accelerationIncludingGravity?.x ?? null,
        y: e.accelerationIncludingGravity?.y ?? null,
        z: e.accelerationIncludingGravity?.z ?? null,
      });
    };
    window.addEventListener('devicemotion', handleMotion);
    return () => window.removeEventListener('devicemotion', handleMotion);
  }, []);

  return motion;
}