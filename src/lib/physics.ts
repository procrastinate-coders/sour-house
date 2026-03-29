/**
 * Shared spring-physics primitives used by all jelly wave components.
 * Centralises SpringPoint, the SVG path builder, and the RAF frame constant.
 */

/** Target frame duration (ms) used to make spring forces frame-rate independent */
export const FRAME_MS = 1000 / 60

// ─── SpringPoint ────────────────────────────────────────

export class SpringPoint {
  x        = 0
  y        = 0
  velocity = 0

  constructor(
    public amplitude: number,
    public spring:    number,
    public friction:  number,
  ) {}
}

// ─── SVG Path Builder ───────────────────────────────────

/**
 * Writes a smooth cubic bezier wave path into an SVG <path> element.
 *
 * The path fills the region between `base` (flat edge: 0 for top, h for bottom)
 * and the current y-positions of the control points.
 *
 * @param el    - target SVG path element
 * @param pts   - array of spring control points
 * @param w     - container width in px
 * @param h     - container height in px
 * @param base  - the flat edge: 0 (top wave) or h (bottom wave)
 */
export function drawWavePath(
  el:   SVGPathElement,
  pts:  SpringPoint[],
  w:    number,
  h:    number,
  base: number,
): void {
  let d = `M${w},${base} H-1 V${pts[0].y} `
  for (let i = 1; i < pts.length; i += 2) {
    d += `S${pts[i].x},${pts[i].y} ${pts[i + 1].x},${pts[i + 1].y} `
  }
  d += `V${base}`
  el.setAttribute('d', d)
}

// ─── Factory ─────────────────────────────────────────────

/**
 * Creates an array of SpringPoints from parallel amplitude and X arrays,
 * with staggered spring values (each point slightly stiffer than the last).
 */
export function createWavePoints(
  amps:        readonly number[],
  baseSpring:  number,
  baseFriction: number,
): SpringPoint[] {
  return amps.map((amp, i) =>
    new SpringPoint(amp, baseSpring * (1 + i * 0.05), baseFriction)
  )
}
