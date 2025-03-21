declare module 'react-pinch-zoom' {
    import { ComponentType, ReactNode } from 'react';
  
    interface PinchZoomProps {
      children: ReactNode;
      [key: string]: any; // Allow additional props
    }
  
    const PinchZoom: ComponentType<PinchZoomProps>;
    export default PinchZoom;
  }