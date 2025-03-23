import { useState, useEffect } from 'react'

export function useMediaQuery(query: string): boolean {
  // Initialize with null during SSR
  const [matches, setMatches] = useState<boolean>(() => {
    // Check if window is defined (client-side)
    if (typeof window !== 'undefined') {
      return window.matchMedia(query).matches
    }
    return false
  })

  useEffect(() => {
    // Return early if window is not defined (SSR)
    if (typeof window === 'undefined') return undefined

    const mediaQuery = window.matchMedia(query)
    
    // Update matches state when the media query changes
    const updateMatches = (e: MediaQueryListEvent) => {
      setMatches(e.matches)
    }

    // Set initial value
    setMatches(mediaQuery.matches)

    // Add event listener
    mediaQuery.addEventListener('change', updateMatches)

    // Cleanup
    return () => {
      mediaQuery.removeEventListener('change', updateMatches)
    }
  }, [query])

  return matches
}
