// src/hooks/useDeviceMotion.ts
import { useState, useEffect } from 'react';

export interface DeviceMotion {
  alpha: number | null;
  beta: number | null;
  gamma: number | null;
}

export const useDeviceMotion = (): DeviceMotion => {
  const [motion, setMotion] = useState<DeviceMotion>({
    alpha: null,
    beta: null,
    gamma: null
  });

  useEffect(() => {
    const handleDeviceMotion = (event: DeviceOrientationEvent) => {
      setMotion({
        alpha: event.alpha,
        beta: event.beta,
        gamma: event.gamma
      });
    };

    window.addEventListener('deviceorientation', handleDeviceMotion);
    return () => {
      window.removeEventListener('deviceorientation', handleDeviceMotion);
    };
  }, []);

  return motion;
};