'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import styles from './Loader.module.css'
import { gsap } from '@/lib/gsap'

interface LoaderProps {
  /** Called when all animations are done — page can unlock scroll */
  onComplete?: () => void
  /** Ref to the hero <figure> — loader iris-wipes down to match it exactly */
  heroMediaRef?: React.RefObject<HTMLElement>
  /** Called the moment the iris wipe starts (hero logo/cards can begin animating) */
  onHeroReveal?: () => void
}

export default function Loader({ onComplete, heroMediaRef, onHeroReveal }: LoaderProps) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const swirlRef = useRef<HTMLDivElement>(null)
  const swirlSvgRef = useRef<SVGSVGElement>(null)
  const mediaElRef = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const wrap = wrapRef.current
    const swirl = swirlRef.current
    const swirlSvg = swirlSvgRef.current
    const mediaEl = mediaElRef.current
    if (!wrap || !swirl || !swirlSvg || !mediaEl) return

    // Set initial GSAP-controlled states
    gsap.set(wrap, { clipPath: 'inset(0% round 0px)' })
    gsap.set(mediaEl, { clipPath: 'inset(50% round 20px)' })

    // Start spiral spinning immediately (replaces CSS swirlSpin keyframe)
    const swirlAnim = gsap.to(swirlSvg, {
      rotation: 360,
      duration: 10,
      ease: 'none',
      repeat: -1,
      transformOrigin: '53% 51%',
    })

    // Let the spiral breathe for ~1.2s before triggering exit
    const triggerTimer = setTimeout(() => {
      // Compute hero figure bounds and map loader to it
      const figure = heroMediaRef?.current
      if (figure) {
        const rect = figure.getBoundingClientRect()
        const vw = window.innerWidth
        const vh = window.innerHeight
        const radius = window.getComputedStyle(figure).borderRadius

        // Position & size the media element to sit exactly over the figure
        mediaEl.style.top = `${rect.top + rect.height / 2}px`
        mediaEl.style.left = `${rect.left + rect.width / 2}px`
        mediaEl.style.width = `${rect.width}px`
        mediaEl.style.height = `${rect.height}px`

        const clipTo = `inset(${rect.top}px ${vw - rect.right}px ${vh - rect.bottom}px ${rect.left}px round ${radius})`

        // Exit timeline: iris wipe + spiral scale (simultaneous), then media bloom
        const tl = gsap.timeline()
        tl.call(() => onHeroReveal?.(), undefined, 1.4)
          .to(wrap, { clipPath: clipTo, duration: 1.5, ease: 'expo.inOut' }, 0.1)
          .to(swirl, { scale: 0.5, duration: 1.5, ease: 'expo.inOut' }, 0.1)
          .to(mediaEl, {
            clipPath: `inset(0% round ${radius})`,
            duration: 0.85,
            ease: 'expo.inOut',
          }, 0.95)
      } else {
        // Fallback if no figure ref — simple centre shrink
        const tl = gsap.timeline()
        tl.to(wrap, { clipPath: 'inset(50% round 20px)', duration: 1.5, ease: 'expo.inOut' }, 0.1)
          .to(swirl, { scale: 0.5, duration: 1.5, ease: 'expo.inOut' }, 0.1)
      }

      // Unmount 2800ms after exit trigger fires (matches original timing)
      gsap.delayedCall(2.8, () => {
        setVisible(false)
        onComplete?.()
      })
    }, 1200)

    return () => {
      clearTimeout(triggerTimer)
      swirlAnim.kill()
      gsap.killTweensOf([wrap, swirl, mediaEl])
    }
  }, [onComplete, heroMediaRef, onHeroReveal])

  if (!visible) return null

  return (
    <div className={styles.loader} aria-hidden="true">
      <div ref={wrapRef} className={styles.wrap}>

        {/* ── Cinnamon-roll spiral SVG ── */}
        <div ref={swirlRef} className={styles.swirl} aria-hidden="true">
          <svg
            ref={swirlSvgRef}
            width="1551"
            height="1601"
            viewBox="0 0 1551 1601"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Outer path — primary */}
            <path
              d="M383.736 371.395C459.57 302.274 549.974 259.239 631.568 239.372C646.1 235.833 674.281 230.611 688.784 232.842C703.759 235.145 716.867 246.671 718.076 261.793C719.069 274.214 711.152 288.292 692.504 295.295C655.353 307.689 619.01 322.386 583.688 339.303C473.936 391.867 352.216 542.236 321.525 665.487C281.165 827.565 294.801 962.248 393.775 1111.61C429.806 1165.98 526.932 1261.16 620.693 1295.97C740.918 1340.93 863.395 1350.12 986.616 1300.4C1200.4 1214.11 1315.78 981.024 1251.92 768.456C1170.53 497.446 879.034 452.433 713.727 544.994C605.584 605.58 548.637 702.096 553.032 824.295C557.103 939.627 618.996 1025.91 726.891 1071.83C846.219 1123.01 988.36 1059.2 1022.52 939.516C1029.81 914.148 1031.64 876.233 1018.81 856.952C1010.47 844.419 1000.1 834.215 985.442 837.652C976.483 839.753 971.919 842.4 966.239 849.639C960.277 857.238 958.421 866.291 958.841 875.94C960.518 914.459 932.621 981.214 877.279 1005.18C817.329 1031.08 758.898 1018.38 707.635 981.056C622.603 919.065 604.142 784.702 659.108 693.297C731.209 566.285 980.336 503.157 1133.1 707.228C1274.66 896.285 1140.37 1215.82 889.681 1252.51C712.765 1278.41 572.724 1222.1 468.923 1074.62C359.777 918.766 349.698 756.681 443.417 593.947C545.355 417.254 716.004 322.077 908.633 325.42C1222.31 347.983 1491.39 596.564 1427.53 968.409C1383.61 1224.2 1241.87 1410.01 989.99 1492.89C799.446 1555.61 616.886 1515.81 448.893 1413.82C147.931 1231.15 94.9948 864.231 227.421 582.793C265.013 502.672 318.146 430.815 383.736 371.395Z"
              fill="#894036"
            />
            {/* Inner path — white highlight */}
            <path
              d="M984.113 14.7109C1109.34 37.4611 1219.81 94.2109 1300.81 159.711C1315.24 171.376 1341.6 195.233 1350.31 211.211C1359.31 227.711 1357.81 249.31 1343.81 261.883C1332.31 272.211 1312.47 275 1291.53 261.883C1251.35 234.58 1209.51 209.808 1166.24 187.712C1031.81 119.057 791.94 112.211 647.314 174.711C457.128 256.9 334.592 371.711 261.814 581.711C235.319 658.161 214.572 825.561 250.814 944.211C296.972 1096.59 380.09 1224.27 521.854 1308.34C767.836 1454.19 1084.49 1392.53 1246.03 1169.59C1451.99 885.362 1276.98 564.069 1061.3 470.739C920.174 409.707 782.148 426.197 664.967 522.501C554.312 613.317 515.82 739.282 551.742 880.231C591.091 1036.41 760.989 1128.53 904.708 1072.14C935.206 1060.23 973.967 1033.5 983.323 1006.34C989.406 988.687 991.658 970.779 977.239 958.914C968.425 951.662 962.38 949.153 950.967 949.001C938.988 948.841 928.664 953.824 919.467 961.501C882.749 992.145 795.931 1014.88 730.652 978.348C659.99 938.733 628.538 871.559 626.757 792.923C623.883 662.425 742.473 543.097 873.967 528.501C1053.47 504.001 1303.21 702.129 1216.97 1006.34C1137.1 1288.22 720.967 1396.3 496.111 1176.73C337.428 1021.78 287.55 841.315 354.844 627.969C426.369 403.052 578.6 271.124 809.592 241.054C1060.53 208.583 1282.81 305.211 1424.5 497.661C1638.33 823.928 1595.74 1276.33 1181.04 1493.23C895.772 1642.44 605.88 1642.52 334.592 1456.55C129.338 1315.88 31.1888 1105.91 5.3142 863.51C-41.0818 429.277 280.86 100.93 658.026 19.6865C765.319 -3.54953 876.16 -5.24104 984.113 14.7109Z"
              fill="#FFFFFF"
            />
          </svg>
        </div>

        {/* ── Food image — blooms open at the end ── */}
        <div ref={mediaElRef} className={styles.media} aria-hidden="true">
          <Image
            src="/images/hero.webp"
            alt="Krem & Kanel"
            fill
            priority
            sizes="300px"
          />
        </div>

      </div>
    </div>
  )
}
