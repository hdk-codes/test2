import { useState, useEffect } from "react";

interface DeviceOrientationData {
  alpha: number | null; // rotation around z-axis
  beta: number | null;  // rotation around x-axis (front-to-back)
  gamma: number | null; // rotation around y-axis (left-to-right)
}

export function useDeviceOrientation(): DeviceOrientationData {
  const [orientation, setOrientation] = useState<DeviceOrientationData>({
    alpha: null,
    beta: null,
    gamma: null
  });

  useEffect(() => {
    const handleOrientation = (event: DeviceOrientationEvent) => {
      setOrientation({
        alpha: event.alpha,
        beta: event.beta,
        gamma: event.gamma
      });
    };

    // Check if the browser supports the DeviceOrientationEvent
    if (window.DeviceOrientationEvent) {
      window.addEventListener("deviceorientation", handleOrientation);
    } else {
      console.log("Device orientation not supported");
    }

    return () => {
      window.removeEventListener("deviceorientation", handleOrientation);
    };
  }, []);

  return orientation;
}
