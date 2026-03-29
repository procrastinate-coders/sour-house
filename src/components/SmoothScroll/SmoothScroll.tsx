'use client'

import { createContext, useContext, useEffect, useRef, ReactNode } from 'react'
import Lenis from 'lenis'
import { gsap, ScrollTrigger } from '@/lib/gsap'

const LenisContext = createContext<Lenis | null>(null)

export function useLenis() {
  return useContext(LenisContext)
}

interface SmoothScrollProps {
  children: ReactNode
  disabled?: boolean
}

export default function SmoothScroll({ children, disabled = false }: SmoothScrollProps) {
  const lenisRef = useRef<Lenis | null>(null)

  useEffect(() => {
    if (disabled) return

    const lenis = new Lenis({
      duration: 1.4,
      wheelMultiplier: 0.7,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      smoothWheel: true,
    })

    lenisRef.current = lenis
    ;(window as any).__lenis = lenis

    // Drive Lenis from GSAP ticker — ScrollTrigger stays perfectly in sync
    const update = (time: number) => lenis.raf(time * 1000)
    gsap.ticker.add(update)
    gsap.ticker.lagSmoothing(0)

    // Keep ScrollTrigger positions current as Lenis scrolls
    lenis.on('scroll', ScrollTrigger.update)

    // Tell ScrollTrigger to read scroll position from Lenis (not native scroll)
    ScrollTrigger.scrollerProxy(document.body, {
      scrollTop(value?: number) {
        if (arguments.length && value !== undefined) {
          lenis.scrollTo(value)
        }
        return lenis.scroll
      },
      getBoundingClientRect() {
        return { top: 0, left: 0, width: window.innerWidth, height: window.innerHeight }
      },
    })

    ScrollTrigger.refresh()

    return () => {
      gsap.ticker.remove(update)
      lenis.off('scroll', ScrollTrigger.update)
      lenis.destroy()
      lenisRef.current = null
    }
  }, [disabled])

  return (
    <LenisContext.Provider value={lenisRef.current}>
      {children}
    </LenisContext.Provider>
  )
}
