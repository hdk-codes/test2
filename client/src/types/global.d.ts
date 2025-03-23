interface Gyroscope {
  x: number;
  y: number;
  z: number;
  addEventListener(type: string, listener: EventListenerOrEventListenerObject): void;
  removeEventListener(type: string, listener: EventListenerOrEventListenerObject): void;
  start(): void;
  stop(): void;
}

interface DeviceMotionEventRotationRate {
  alpha: number | null;
  beta: number | null;
  gamma: number | null;
}

interface DeviceMotionEvent extends Event {
  rotationRate: DeviceMotionEventRotationRate | null;
}

interface Window {
  DeviceMotionEvent: {
    prototype: DeviceMotionEvent;
    new(): DeviceMotionEvent;
    requestPermission?(): Promise<'granted' | 'denied'>;
  };
  Gyroscope: {
    prototype: Gyroscope;
    new(options?: { frequency: number }): Gyroscope;
  };
}
