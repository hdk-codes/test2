import { useState, useEffect, useRef } from 'react';

interface HeartCursorProps {
  color?: string;
  size?: number;
  pulseEffect?: boolean;
  trail?: boolean;
  trailLength?: number;
}

export default function HeartCursor({
  color = "#ff3366",
  size = 24,
  pulseEffect = true, 
  trail = true,
  trailLength = 5
}: HeartCursorProps) {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(false);
  const [isClicked, setIsClicked] = useState(false);
  const [heartRate, setHeartRate] = useState(60); // BPM for pulsing
  const [trailPositions, setTrailPositions] = useState<Array<{x: number, y: number}>>([]);
  const frameRef = useRef<number>(0);
  const hoverElementRef = useRef<string | null>(null);
  const lastInteractionRef = useRef<number>(Date.now());

  useEffect(() => {
    // Initialize cursor off-screen
    setPosition({ x: -100, y: -100 });
    
    // Show cursor when mouse moves
    const handleMouseMove = (e: MouseEvent) => {
      setIsVisible(true);
      const { clientX, clientY } = e;
      
      // Update trail positions
      if (trail) {
        setTrailPositions(prev => {
          const newPositions = [...prev, { x: clientX, y: clientY }];
          if (newPositions.length > trailLength) {
            return newPositions.slice(newPositions.length - trailLength);
          }
          return newPositions;
        });
      }
      
      // Check if mouse is near interactive elements
      const target = e.target as HTMLElement;
      const isInteractive = 
        target.tagName === 'BUTTON' || 
        target.tagName === 'A' || 
        target.closest('button') || 
        target.closest('a') ||
        target.dataset.interactive === 'true';
      
      if (isInteractive) {
        setHeartRate(prev => Math.min(prev + 10, 120)); // Increase heart rate near interactive elements
        hoverElementRef.current = target.tagName.toLowerCase() || 
                             target.closest('button')?.tagName.toLowerCase() || 
                             target.closest('a')?.tagName.toLowerCase();
      } else if (heartRate > 60) {
        setHeartRate(prev => Math.max(prev - 3, 60)); // Gradually return to normal
        hoverElementRef.current = null;
      }
      
      // Animate cursor position with lag for smoother movement
      cancelAnimationFrame(frameRef.current);
      frameRef.current = requestAnimationFrame(() => {
        setPosition({ x: clientX, y: clientY });
      });
    };
    
    const handleMouseDown = () => {
      setIsClicked(true);
      setHeartRate(160); // Heart beats faster when clicked
      lastInteractionRef.current = Date.now();
      
      // Use browser vibration API if available
      if (navigator.vibrate) {
        navigator.vibrate(30);
      }
    };
    
    const handleMouseUp = () => {
      setIsClicked(false);
      setTimeout(() => {
        if (Date.now() - lastInteractionRef.current >= 500) {
          setHeartRate(prev => Math.max(prev - 40, 60));
        }
      }, 500);
    };
    
    // Hide default cursor
    document.body.style.cursor = 'none';
    
    // Add event listeners
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mouseup', handleMouseUp);
    
    // Clean up
    return () => {
      document.body.style.cursor = 'auto';
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mouseup', handleMouseUp);
      cancelAnimationFrame(frameRef.current);
    };
  }, [trail, trailLength]);

  // Calculate heart pulse animation
  const pulseScale = pulseEffect 
    ? 1 + 0.2 * Math.sin((Date.now() / (60000 / heartRate)) * Math.PI) 
    : 1;
  
  // Calculate color based on heart rate
  const heartRateRatio = (heartRate - 60) / 100; // 0 to 1 scale (60 to 160 BPM)
  const hoverColor = isClicked 
    ? '#ff0066' // Bright red when clicked
    : hoverElementRef.current 
      ? '#ff6b9d' // Pink when hovering over interactive elements
      : color;
  
  // Calculate brightness based on heart rate
  const brightness = 100 + heartRateRatio * 30;
  
  return (
    <>
      {/* Trail effect */}
      {trail && trailPositions.map((pos, index) => {
        // Calculate scale and opacity based on position in trail
        const trailOpacity = 0.1 + (index / trailPositions.length) * 0.3;
        const trailScale = 0.3 + (index / trailPositions.length) * 0.7;
        
        return (
          <div
            key={`trail-${index}`}
            className="absolute pointer-events-none z-[9999] transition-opacity"
            style={{
              left: pos.x,
              top: pos.y,
              transform: `translate(-50%, -50%) scale(${trailScale * size / 24})`,
              opacity: trailOpacity,
            }}
          >
            <svg 
              width={size} 
              height={size} 
              viewBox="0 0 24 24" 
              fill={hoverColor}
              style={{ filter: `brightness(${brightness}%)` }}
            >
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
            </svg>
          </div>
        );
      })}
      
      {/* Main cursor */}
      <div
        className={`fixed pointer-events-none z-[10000] transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
        style={{
          left: position.x,
          top: position.y,
          transform: `translate(-50%, -50%) scale(${pulseScale * (isClicked ? 1.3 : 1)})`,
          transition: isClicked ? 'transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)' : 'transform 0.3s ease-out',
          filter: `drop-shadow(0 0 ${2 + heartRateRatio * 6}px ${hoverColor})`,
        }}
      >
        <svg 
          width={size} 
          height={size} 
          viewBox="0 0 24 24" 
          fill={hoverColor}
          style={{ filter: `brightness(${brightness}%)` }}
        >
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
        </svg>
      </div>
    </>
  );
}