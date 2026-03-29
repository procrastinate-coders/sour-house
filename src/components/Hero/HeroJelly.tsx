'use client'

/**
 * HeroJelly — Spring-Physics Jelly Wave
 * ──────────────────────────────────────
 * Faithfully replicates kremkanel.com's wavy section-divider SVG.
 *
 * The original uses a multi-point SPRING PHYSICS simulation where each
 * control point independently oscillates toward a scroll-driven target y,
 * creating an organic, jiggly "jelly" effect.
 *
 * Architecture:
 *  1. ResizeObserver tracks the hero container's W × H
 *  2. GSAP ScrollTrigger drives scrollProgress (0→1)
 *  3. scrollProgress sets the target y: min + progress * amplitude
 *  4. RAF loop runs per-point spring physics every frame
 *  5. Each frame redraws the SVG paths using S (smooth cubic) commands
 *
 * Two-layer effect:
 *  hero-light (#e8d9d7 cream)  — 7 control points, organic wave
 *  hero-dark  (#894036 brown)  — 9 control points, tighter wave (3D lip)
 *
 * Physics constants match the original exactly:
 *  base spring = 0.01, base friction = 0.9
 */

import { useEffect, useRef, useCallback, RefObject } from 'react'
import styles from './HeroJelly.module.css'
import { gsap, ScrollTrigger } from '@/lib/gsap'
import { FRAME_MS, SpringPoint } from '@/lib/physics'
import {
  HERO_SPRING,
  HERO_FRICTION,
  BREAKPOINT_MOBILE,
  DESKTOP_REF_WIDTH,
} from '@/lib/constants'

// ─── JellyLayer ──────────────────────────────────────────
// Each layer is an SVG <path> with N control points.
// The path is drawn as: M → H → V → S... → V  (smooth cubic bezier)
class JellyLayer {
  el: SVGPathElement
  points: SpringPoint[]
  upside: boolean

  constructor(el: SVGPathElement, points: SpringPoint[], upside = false) {
    this.el = el
    this.points = points
    this.upside = upside
  }

  /** Update x-positions and scale amplitudes based on container width */
  resize(_w: number, _xPositions: number[], _amplitudes: number[]) {
    const scale = Math.min(1, window.innerWidth / DESKTOP_REF_WIDTH)
    for (let i = 0; i < this.points.length; i++) {
      this.points[i].x = _xPositions[i] * _w
      this.points[i].amplitude = _amplitudes[i] * scale
    }
  }

  /** Draw the SVG path from current point y positions */
  draw(w: number, h: number) {
    const pts = this.points
    const base = this.upside ? 0 : h

    // Start: right edge → sweep left to -1 → vertical to first point
    let d = `M${w},${base} H-1 V${pts[0].y} `

    // Smooth cubic bezier segments (S command uses previous control point implicitly)
    for (let i = 1; i < pts.length; i += 2) {
      d += `S${pts[i].x},${pts[i].y} ${pts[i + 1].x},${pts[i + 1].y} `
    }

    // Close back to base
    d += `V${base}`

    this.el.setAttribute('d', d)
  }

  /** Move all points to a specific y instantly (no spring) */
  moveAllPointsTo(y: number) {
    for (const pt of this.points) {
      pt.y = y
      pt.velocity = 0
    }
  }
}

// ─── Layer Configurations (Desktop ≥ 768px) ─────────────
// Exact values from kremkanel.com's minified source

function createHeroLightPoints(): SpringPoint[] {
  return [
    new SpringPoint(0, HERO_SPRING * 1.12, HERO_FRICTION * 1.03),
    new SpringPoint(0, HERO_SPRING, HERO_FRICTION),
    new SpringPoint(0, HERO_SPRING, HERO_FRICTION),
    new SpringPoint(0, HERO_SPRING, HERO_FRICTION),
    new SpringPoint(0, HERO_SPRING * 1.08, HERO_FRICTION * 1.02),
    new SpringPoint(0, HERO_SPRING, HERO_FRICTION),
    new SpringPoint(0, HERO_SPRING, HERO_FRICTION),
  ]
}

const HERO_LIGHT_X = [0, 0.12, 0.30, 0.56, 0.73, 0.92, 1.001]
const HERO_LIGHT_AMP = [-30, 40, -50, 0, -32, 0, 0]

function createHeroDarkPoints(): SpringPoint[] {
  return [
    new SpringPoint(0, HERO_SPRING, HERO_FRICTION),
    new SpringPoint(0, HERO_SPRING * 1.12, HERO_FRICTION * 1.05),
    new SpringPoint(0, HERO_SPRING, HERO_FRICTION),
    new SpringPoint(0, HERO_SPRING, HERO_FRICTION),
    new SpringPoint(0, HERO_SPRING * 1.05, HERO_FRICTION * 1.025),
    new SpringPoint(0, HERO_SPRING, HERO_FRICTION),
    new SpringPoint(0, HERO_SPRING, HERO_FRICTION),
    new SpringPoint(0, HERO_SPRING * 1.12, HERO_FRICTION * 1.05),
    new SpringPoint(0, HERO_SPRING * 1.05, HERO_FRICTION * 1.025),
  ]
}

const HERO_DARK_X = [0, 0.15, 0.30, 0.45, 0.55, 0.70, 0.82, 0.95, 1.001]
const HERO_DARK_AMP = [0, 60, -60, -40, 10, 0, -30, -5, 30]

// ─── Mobile Layer Configurations (< 768px) ───────────────

function createHeroLightPointsMobile(): SpringPoint[] {
  return [
    new SpringPoint(0, HERO_SPRING * 1.15, HERO_FRICTION * 1.03),
    new SpringPoint(0, HERO_SPRING, HERO_FRICTION),
    new SpringPoint(0, HERO_SPRING, HERO_FRICTION),
    new SpringPoint(0, HERO_SPRING, HERO_FRICTION),
    new SpringPoint(0, HERO_SPRING * 1.07, HERO_FRICTION * 1.025),
  ]
}

const HERO_LIGHT_X_MOBILE = [0, 0.12, 0.30, 0.90, 1.0]
const HERO_LIGHT_AMP_MOBILE = [-50, 70, -80, 0, -55]

function createHeroDarkPointsMobile(): SpringPoint[] {
  return [
    new SpringPoint(0, HERO_SPRING, HERO_FRICTION),
    new SpringPoint(0, HERO_SPRING * 1.12, HERO_FRICTION * 1.05),
    new SpringPoint(0, HERO_SPRING, HERO_FRICTION),
    new SpringPoint(0, HERO_SPRING, HERO_FRICTION),
    new SpringPoint(0, HERO_SPRING * 1.05, HERO_FRICTION * 1.025),
  ]
}

const HERO_DARK_X_MOBILE = [0, 0.15, 0.40, 0.80, 1.0]
const HERO_DARK_AMP_MOBILE = [0, 80, -55, -20, 20]

// ─── Component ───────────────────────────────────────────

interface HeroJellyProps {
  containerRef: RefObject<HTMLElement | null>
  loaderReady?: boolean
}

export default function HeroJelly({ containerRef, loaderReady = false }: HeroJellyProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const lightRef = useRef<SVGPathElement>(null)
  const darkRef = useRef<SVGPathElement>(null)

  // Mutable state held in refs for the RAF loop
  const stateRef = useRef({
    w: 0,
    h: 0,
    targetY: 0,
    min: 0,
    amplitude: 0,
    scrollProgress: 0,
    active: false,
    lightLayer: null as JellyLayer | null,
    darkLayer: null as JellyLayer | null,
    lastTime: 0,
    rafId: 0,
  })

  // ── Initialize layers (once DOM is ready) ────────────
  const initLayers = useCallback(() => {
    const light = lightRef.current
    const dark = darkRef.current
    if (!light || !dark) return

    const mobile = window.innerWidth < BREAKPOINT_MOBILE

    const lightLayer = new JellyLayer(
      light,
      mobile ? createHeroLightPointsMobile() : createHeroLightPoints()
    )
    const darkLayer = new JellyLayer(
      dark,
      mobile ? createHeroDarkPointsMobile() : createHeroDarkPoints()
    )

    stateRef.current.lightLayer = lightLayer
    stateRef.current.darkLayer = darkLayer
  }, [])

  // ── Resize handler ───────────────────────────────────
  const handleResize = useCallback(() => {
    const container = containerRef.current
    const svg = svgRef.current
    const state = stateRef.current
    const { lightLayer, darkLayer } = state

    if (!container || !svg || !lightLayer || !darkLayer) return

    const rect = container.getBoundingClientRect()
    const w = Math.round(rect.width)
    const h = Math.round(rect.height)
    state.w = w
    state.h = h

    // Update SVG dimensions
    svg.setAttribute('width', `${w}px`)
    svg.setAttribute('height', `${h}px`)
    svg.setAttribute('viewBox', `0 0 ${w} ${h}`)

    const mobile = window.innerWidth < BREAKPOINT_MOBILE

    // Compute min & amplitude based on viewport
    if (mobile) {
      state.min = h * 0.55
      state.amplitude = (h * 0.3) >> 0
    } else {
      // On desktop: position relative to media element
      const media = container.querySelector('figure')
      if (media) {
        const mediaBCR = media.getBoundingClientRect()
        const containerTop = rect.top
        state.min = mediaBCR.top - containerTop + mediaBCR.height * 0.2
      } else {
        state.min = h * 0.4
      }
      state.amplitude = (h * 0.5) >> 0
    }

    // Resize layers with correct configs
    if (mobile) {
      lightLayer.resize(w, HERO_LIGHT_X_MOBILE, HERO_LIGHT_AMP_MOBILE)
      darkLayer.resize(w, HERO_DARK_X_MOBILE, HERO_DARK_AMP_MOBILE)
    } else {
      lightLayer.resize(w, HERO_LIGHT_X, HERO_LIGHT_AMP)
      darkLayer.resize(w, HERO_DARK_X, HERO_DARK_AMP)
    }

    // Set target y and render immediately
    state.targetY = state.min + state.scrollProgress * state.amplitude

    if (!state.active) {
      // Before activation, snap all points to target (no spring animation)
      lightLayer.moveAllPointsTo(state.targetY)
      darkLayer.moveAllPointsTo(state.targetY)
    }

    lightLayer.draw(w, h + 1)
    darkLayer.draw(w, h + 1)
  }, [containerRef])

  // ── Spring physics RAF loop ──────────────────────────
  const runPhysics = useCallback((timestamp: number) => {
    const state = stateRef.current
    const { lightLayer, darkLayer, w, h } = state

    if (!lightLayer || !darkLayer || w === 0) {
      state.rafId = requestAnimationFrame(runPhysics)
      return
    }

    // Compute delta for frame-rate independence
    if (state.lastTime === 0) state.lastTime = timestamp
    const dt = timestamp - state.lastTime
    state.lastTime = timestamp
    const deltaScale = Math.min(1, (dt * 1000 / 1000) / FRAME_MS)

    // Update target y from scroll progress
    state.targetY = state.min + state.scrollProgress * state.amplitude

    // Run spring simulation on all points
    const allPoints = [...lightLayer.points, ...darkLayer.points]
    for (const pt of allPoints) {
      const force = (state.targetY + pt.amplitude - pt.y) * (pt.spring * deltaScale)
      pt.velocity += force
      pt.velocity *= pt.friction
      pt.y += pt.velocity
    }

    // Redraw paths
    lightLayer.draw(w, h + 1)
    darkLayer.draw(w, h + 1)

    state.rafId = requestAnimationFrame(runPhysics)
  }, [])

  // ── Mount: create layers, observe resize, start RAF ──
  useEffect(() => {
    // Keep SVG invisible until loaderReady — prevents flash at rest position
    gsap.set(svgRef.current, { opacity: 0 })

    initLayers()
    handleResize()

    const container = containerRef.current
    if (!container) return

    // ResizeObserver for container
    const ro = new ResizeObserver(() => handleResize())
    ro.observe(container)

    // Start RAF loop
    const state = stateRef.current
    state.lastTime = 0
    state.rafId = requestAnimationFrame(runPhysics)

    return () => {
      ro.disconnect()
      cancelAnimationFrame(state.rafId)
    }
  }, [containerRef, initLayers, handleResize, runPhysics])

  // ── GSAP ScrollTrigger — only after loaderReady ──────
  useEffect(() => {
    if (!loaderReady) return
    const container = containerRef.current
    if (!container) return

    const state = stateRef.current

    // Displace points below rest, reveal SVG, then let spring pull them back — entry wave
    const { lightLayer, darkLayer, targetY } = state
    if (lightLayer && darkLayer) {
      lightLayer.moveAllPointsTo(targetY + 140)
      darkLayer.moveAllPointsTo(targetY + 140)
    }
    gsap.set(svgRef.current, { opacity: 1 })

    // Activate the spring simulation (points will start bouncing toward target)
    state.active = true

    const st = ScrollTrigger.create({
      trigger: container,
      start: 'top top',
      end: 'bottom top',
      scrub: 0.5,
      onUpdate: (self) => {
        state.scrollProgress = self.progress
      },
    })

    // Refresh after creating to ensure accurate measurements
    ScrollTrigger.refresh()

    return () => st.kill()
  }, [containerRef, loaderReady])

  // ── Handle window resize (reinitialize layers for mobile/desktop switch)
  useEffect(() => {
    let lastMobile = window.innerWidth < BREAKPOINT_MOBILE

    const onResize = () => {
      const nowMobile = window.innerWidth < BREAKPOINT_MOBILE
      if (nowMobile !== lastMobile) {
        lastMobile = nowMobile
        initLayers()
      }
      handleResize()
    }

    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [initLayers, handleResize])

  return (
    <svg
      ref={svgRef}
      className={styles.jelly}
      width="0"
      height="0"
      viewBox="0 0 0 0"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* hero-light: white layer — blends with page bg, shapes the wave */}
      <path ref={lightRef} d="" fill="#e8d9d7" vectorEffect="non-scaling-stroke" />
      {/* hero-dark: primary layer — tighter wave, 3D lip illusion */}
      <path ref={darkRef} d="" fill="#894036" vectorEffect="non-scaling-stroke" />
    </svg>
  )
}
