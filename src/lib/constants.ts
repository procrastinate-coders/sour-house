/**
 * Application-wide constants.
 * Single source of truth for breakpoints, sizing, physics, and wave geometry.
 * These values must stay in sync with the breakpoints defined in globals.css.
 */

// ─── Layout Breakpoints ─────────────────────────────────
export const BREAKPOINT_MOBILE  = 768   // px — mobile → tablet
export const BREAKPOINT_DESKTOP = 1200  // px — tablet → desktop

// ─── Reference Widths (for amplitude scaling) ────────────
export const DESKTOP_REF_WIDTH = 1440
export const MOBILE_REF_WIDTH  = 375

// ─── Jelly Wave Sizing ──────────────────────────────────
export const WAVE_HEIGHT_MOBILE  = 150   // px max-height on mobile
export const WAVE_HEIGHT_DESKTOP = 300   // px max-height on desktop

// ─── Physics — Hero Jelly ────────────────────────────────
/** Exact values reverse-engineered from kremkanel.com */
export const HERO_SPRING   = 0.01
export const HERO_FRICTION = 0.9

// ─── Physics — Menu / Page Jelly Waves ──────────────────
/** Exact values from kremkanel.com's minified source (nt=0.01, it=0.9) */
export const WAVE_SPRING   = 0.01
export const WAVE_FRICTION = 0.9

// ─── Wave Control Points — Desktop (7 pts) ──────────────
/** X positions as fraction of container width — kremkanel 'about' layer exact */
export const WAVE_DT_X   = [0, 0.12, 0.30, 0.56, 0.73, 0.92, 1.001] as const
/** Amplitude offsets — kremkanel 'about' layer exact values */
export const WAVE_DT_AMP = [30, -40, 50, 0, 32, 0, 0] as const

// ─── Wave Control Points — Mobile (5 pts) ───────────────
export const WAVE_MB_X   = [0, 0.20, 0.50, 0.80, 1.001] as const
export const WAVE_MB_AMP = [25, -35, 30, -15, 0] as const
