/**
 * gsap.ts
 * ───────
 * Single registration point for GSAP plugins.
 * Import gsap / ScrollTrigger / CustomEase from here — never directly from 'gsap'.
 * SSR-safe: plugins are registered only in the browser.
 */

import gsap from 'gsap'
import ScrollTrigger from 'gsap/ScrollTrigger'
import CustomEase from 'gsap/CustomEase'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger, CustomEase)
}

export { gsap, ScrollTrigger, CustomEase }
