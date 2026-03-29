'use client'

/**
 * JellyWave — reusable spring-physics jelly wave
 *
 * position="bottom"  →  absolute; bottom: 0  — fills from bottom UP to wave
 * position="top"     →  absolute; top:    0  — fills from top  DOWN to wave
 *
 * Activation: IntersectionObserver watches the SVG element itself, so it
 * fires correctly regardless of how tall the container is.
 */

import { useEffect, useRef, useCallback, RefObject } from 'react'
import { ScrollTrigger } from '@/lib/gsap'
import {
  FRAME_MS,
  SpringPoint,
  drawWavePath,
  createWavePoints,
} from '@/lib/physics'
import {
  BREAKPOINT_MOBILE,
  DESKTOP_REF_WIDTH,
  WAVE_HEIGHT_MOBILE,
  WAVE_HEIGHT_DESKTOP,
  MOBILE_REF_WIDTH,
  WAVE_SPRING,
  WAVE_FRICTION,
  WAVE_DT_X,
  WAVE_DT_AMP,
  WAVE_MB_X,
  WAVE_MB_AMP,
} from '@/lib/constants'
import styles from './JellyWave.module.css'

// ─── Types ───────────────────────────────────────────────

export interface JellyWaveProps {
  containerRef: RefObject<HTMLElement | null>
  position?: 'top' | 'bottom'
  color?: string
}

// ─── Helpers ─────────────────────────────────────────────

const isMobile = () =>
  typeof window !== 'undefined' && window.innerWidth < BREAKPOINT_MOBILE

function getWaveConfig(mobile: boolean) {
  return {
    xs: mobile ? WAVE_MB_X : WAVE_DT_X,
    amps: mobile ? WAVE_MB_AMP : WAVE_DT_AMP,
    maxH: mobile ? WAVE_HEIGHT_MOBILE : WAVE_HEIGHT_DESKTOP,
    ratio: mobile ? WAVE_HEIGHT_MOBILE / MOBILE_REF_WIDTH : WAVE_HEIGHT_DESKTOP / DESKTOP_REF_WIDTH,
  }
}

// ─── Component ───────────────────────────────────────────

export default function JellyWave({
  containerRef,
  position = 'bottom',
  color = '#ffffff',
}: JellyWaveProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const pathRef = useRef<SVGPathElement>(null)

  const stateRef = useRef({
    w: 0,
    h: 0,
    targetY: 0,
    scrollProgress: 0,
    points: [] as SpringPoint[],
    rafId: 0,
    lastTime: 0,
    active: false,
  })

  // ── Resize ─────────────────────────────────────────────
  const handleResize = useCallback(() => {
    const svg = svgRef.current
    const path = pathRef.current
    const container = containerRef.current
    if (!svg || !path || !container) return

    const mobile = isMobile()
    const { xs, amps, maxH, ratio } = getWaveConfig(mobile)
    const w = container.offsetWidth
    const h = Math.min(w * ratio, maxH)
    const amplitudeScale = Math.min(1, window.innerWidth / DESKTOP_REF_WIDTH)
    const state = stateRef.current

    state.w = w
    state.h = h
    // Base Y — kremkanel's about layer: 15% from top
    // Scroll adds up to h×0.35 more (see runPhysics dynTarget)
    state.targetY = position === 'bottom' ? h * 0.15 : h * 0.55

    svg.setAttribute('width', String(w))
    svg.setAttribute('height', String(h))
    svg.setAttribute('viewBox', `0 0 ${w} ${h}`)

    const pts = state.points
    for (let i = 0; i < pts.length; i++) {
      pts[i].x = xs[i] * w
      pts[i].amplitude = amps[i] * amplitudeScale
    }

    if (!state.active) {
      // Pre-activation: points at the invisible edge
      const edgeY = position === 'bottom' ? h : 0
      for (const pt of pts) { pt.y = edgeY; pt.velocity = 0 }
    }

    drawWavePath(path, pts, w, h, position === 'bottom' ? h : 0)
  }, [containerRef, position])

  // ── RAF Physics Loop ───────────────────────────────────
  const runPhysics = useCallback((timestamp: number) => {
    const state = stateRef.current
    const path = pathRef.current

    if (state.active && path && state.w > 0) {
      if (state.lastTime === 0) state.lastTime = timestamp
      const dt = timestamp - state.lastTime
      state.lastTime = timestamp
      const ds = Math.min(1, dt / FRAME_MS)

      // kremkanel exact formula: base + scrollProgress × h×0.35
      // (mirrors 'about' layer: middle=h×0.15, amplitude=h×0.35)
      const scrollOffset = state.scrollProgress * state.h * 0.35
      const dynTarget = state.targetY + (position === 'bottom' ? scrollOffset : -scrollOffset)

      for (const pt of state.points) {
        const force = (dynTarget + pt.amplitude - pt.y) * pt.spring * ds
        pt.velocity += force
        pt.velocity *= pt.friction
        pt.y += pt.velocity
      }

      drawWavePath(path, state.points, state.w, state.h, position === 'bottom' ? state.h : 0)
    }

    state.rafId = requestAnimationFrame(runPhysics)
  }, [position])

  // ── Per-point spring/friction multipliers (kremkanel 'about'/'No' class exact) ──
  const applyPointMultipliers = useCallback(() => {
    const pts = stateRef.current.points
    // Reset all to base values first (undoes createWavePoints stagger)
    for (const pt of pts) { pt.spring = WAVE_SPRING; pt.friction = WAVE_FRICTION }
    // Apply kremkanel's specific overrides
    if (pts.length >= 7) {
      pts[2].spring = WAVE_SPRING * 1.05; pts[2].friction = WAVE_FRICTION * 1.03
      pts[4].spring = WAVE_SPRING * 1.12; pts[4].friction = WAVE_FRICTION * 1.05
      pts[5].spring = WAVE_SPRING * 1.02; pts[5].friction = WAVE_FRICTION * 1.02
    }
  }, [])

  // ── Mount ──────────────────────────────────────────────
  useEffect(() => {
    const { amps } = getWaveConfig(isMobile())
    stateRef.current.points = createWavePoints([...amps], WAVE_SPRING, WAVE_FRICTION)
    applyPointMultipliers()

    handleResize()

    const container = containerRef.current
    const svg = svgRef.current
    if (!container || !svg) return

    const ro = new ResizeObserver(handleResize)
    ro.observe(container)

    stateRef.current.lastTime = 0
    stateRef.current.rafId = requestAnimationFrame(runPhysics)

    // Observe the SVG — activate once on first entry, no jump, no re-animation
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          const state = stateRef.current
          // Snap all points to current scroll-driven position before activating
          // so the wave starts at rest and just waves with scroll from here
          const scrollOffset = state.scrollProgress * state.h * 0.35
          const currentTarget = state.targetY + (position === 'bottom' ? scrollOffset : -scrollOffset)
          for (const pt of state.points) { pt.y = currentTarget; pt.velocity = 0 }
          state.active = true
          io.disconnect()
        }
      },
      { threshold: 0.1 },
    )
    io.observe(svg)

    // ScrollTrigger — continuously updates scrollProgress so the wave
    // shifts its rest position as the user scrolls past the container
    const st = ScrollTrigger.create({
      trigger: container,
      start: 'top bottom',
      end: 'bottom top',
      scrub: true,
      onUpdate: (self) => {
        stateRef.current.scrollProgress = self.progress
      },
    })

    return () => {
      ro.disconnect()
      io.disconnect()
      cancelAnimationFrame(stateRef.current.rafId)
      st.kill()
    }
  }, [containerRef, handleResize, runPhysics, applyPointMultipliers])

  // ── Breakpoint Switch ──────────────────────────────────
  useEffect(() => {
    let lastMobile = isMobile()

    const onResize = () => {
      const nowMobile = isMobile()
      if (nowMobile !== lastMobile) {
        lastMobile = nowMobile
        const { amps } = getWaveConfig(nowMobile)
        stateRef.current.points = createWavePoints([...amps], WAVE_SPRING, WAVE_FRICTION)
        applyPointMultipliers()
      }
      handleResize()
    }

    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [handleResize, applyPointMultipliers])

  return (
    <svg
      ref={svgRef}
      className={position === 'top' ? styles.jellyTop : styles.jellyBottom}
      width="0"
      height="0"
      viewBox="0 0 0 0"
      fill="none"
      aria-hidden="true"
    >
      <path ref={pathRef} d="" fill={color} vectorEffect="non-scaling-stroke" />
    </svg>
  )
}
