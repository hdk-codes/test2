import { RefObject, useEffect } from "react";

interface ScrollRevealOptions {
  threshold?: number;
  delay?: number;
  duration?: number;
  once?: boolean;
}

export function useScrollReveal(
  elementRef: RefObject<HTMLElement>,
  options: ScrollRevealOptions = {}
) {
  const {
    threshold = 0.1,
    delay = 0,
    duration = 1,
    once = true
  } = options;

  useEffect(() => {
    if (!elementRef.current) return;

    const element = elementRef.current;
    
    // Add reveal styles if they don't exist
    if (!document.getElementById("reveal-styles")) {
      const style = document.createElement("style");
      style.id = "reveal-styles";
      style.textContent = `
        .reveal {
          opacity: 0;
          transform: translateY(20px);
          transition: opacity var(--duration), transform var(--duration);
          transition-delay: var(--delay);
        }
        
        .reveal.active {
          opacity: 1;
          transform: translateY(0);
        }
      `;
      document.head.appendChild(style);
    }
    
    // Set the transition properties
    element.classList.add("reveal");
    element.style.setProperty("--duration", `${duration}s`);
    element.style.setProperty("--delay", `${delay}s`);
    
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            element.classList.add("active");
            
            if (once) {
              observer.disconnect();
            }
          } else if (!once) {
            element.classList.remove("active");
          }
        });
      },
      { threshold }
    );
    
    observer.observe(element);
    
    return () => {
      observer.disconnect();
    };
  }, [elementRef, threshold, delay, duration, once]);
}
