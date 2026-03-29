'use client'

import { useEffect, useRef } from 'react'
import Image from 'next/image'
import styles from './Hero.module.css'
import HeroJelly from './HeroJelly'
import { gsap, ScrollTrigger } from '@/lib/gsap'
import type { SiteConfig } from '@/config/site'

interface HeroProps {
  hero:       SiteConfig['hero']
  mediaRef?:  React.RefObject<HTMLElement>
  /** Gate logo/cards animations — fires when iris wipe starts */
  loaderReady?: boolean
  /** Gate HeroJelly ScrollTrigger — fires with hero reveal signal */
  jellyReady?:  boolean
}

export default function Hero({ hero, mediaRef, loaderReady = false, jellyReady = false }: HeroProps) {
  const heroRef = useRef<HTMLElement>(null)
  const logoRef = useRef<HTMLHeadingElement>(null)
  const hoursRef = useRef<HTMLDivElement>(null)

  // Set initial animation states immediately on mount (before loader finishes)
  // so elements don't flash at default opacity/scale during the loader sequence
  useEffect(() => {
    const logo = logoRef.current
    const hours = hoursRef.current
    if (!logo || !hours) return

    const letters = logo.querySelectorAll<HTMLSpanElement>('.letter')
    const words = logo.querySelectorAll<HTMLSpanElement>(`.${styles.logoWord}`)
    const cards = hours.querySelectorAll<HTMLDivElement>(`.${styles.card}`)

    gsap.set(words, { scale: 0.9, y: 30 })
    gsap.set(letters, { opacity: 0 })
    gsap.set(cards, { opacity: 0, x: (i: number) => i % 2 === 0 ? '10vw' : '-10vw' })
  }, [])

  // Create ScrollTrigger animations ONLY after loader is done (Lenis is active)
  useEffect(() => {
    if (!loaderReady) return

    const hero = heroRef.current
    const logo = logoRef.current
    const hours = hoursRef.current
    if (!hero || !logo || !hours) return

    const letters = logo.querySelectorAll<HTMLSpanElement>('.letter')
    const words = logo.querySelectorAll<HTMLSpanElement>(`.${styles.logoWord}`)
    const cards = hours.querySelectorAll<HTMLDivElement>(`.${styles.card}`)

    const ctx = gsap.context(() => {
      // Logo words burst-in — fires immediately (hero already in viewport)
      gsap.fromTo(words,
        { scale: 0.9, y: 30 },
        {
          scale: 1, y: 0,
          duration: 1.5,
          ease: 'back.out(1.4)',
          stagger: 0.06,
          scrollTrigger: { trigger: hero, start: 'top 90%', once: true },
        }
      )

      // Letter stagger — fires immediately with logo words
      gsap.fromTo(letters,
        { opacity: 0 },
        {
          opacity: 1,
          duration: 0.12,
          ease: 'none',
          stagger: 0.04,
          scrollTrigger: { trigger: hero, start: 'top 90%', once: true },
        }
      )

      // Hours cards slide in from alternating sides when scrolled into view
      gsap.fromTo(cards,
        { opacity: 0, x: (i: number) => i % 2 === 0 ? '10vw' : '-10vw' },
        {
          opacity: 1,
          x: 0,
          duration: 1.5,
          ease: 'back.out(1.7)',
          stagger: 0.1,
          scrollTrigger: { trigger: hours, start: 'top 95%', once: true },
        }
      )

      // Refresh so ScrollTrigger measures positions with Lenis active
      ScrollTrigger.refresh()
    }, hero)

    return () => ctx.revert()
  }, [loaderReady])

  return (
    <section ref={heroRef} className={styles.hero}>
      {/* ── Jelly wave SVG at the section bottom ── */}
      <HeroJelly containerRef={heroRef} loaderReady={jellyReady} />

      {/* ── H1 Brand Logo ── */}
      <h1 ref={logoRef} className={styles.logo} aria-label={hero.ariaLabel}>
        <LogoText label={hero.logoLabel} words={hero.logoWords} />
      </h1>

      {/* ── Hero media ── */}
      <figure ref={mediaRef} className={styles.media}>
        <Image
          src={hero.media.src}
          alt={hero.media.alt}
          fill
          priority
          sizes="(max-width: 767px) 100vw, (max-width: 1199px) 50vw, 55vw"
          className="image-as-background"
        />
      </figure>

      {/* ── Opening hours ── */}
      <div ref={hoursRef} className={styles.hours}>
        {/* Featured title card */}
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>{hero.hours.featured.title}</h2>
          <p className={styles.cardDay}>{hero.hours.featured.day}</p>
          <p className={styles.cardTime}>{hero.hours.featured.time}</p>
        </div>

        {hero.hours.cards.map(({ day, time }) => (
          <div key={day} className={styles.card}>
            <p className={styles.cardDay}>{day}</p>
            <p className={styles.cardTime}>{time}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

/* ─────────────────────────────────────────────────────────
   LOGO TEXT
   Each word is split into individual letter spans.
   GSAP animates opacity with stagger via querySelectorAll('.letter')
───────────────────────────────────────────────────────── */

function LogoText({ label, words }: { label: string; words: string[] }) {
  return (
    <>
      {/* Small label — always visible, no animation */}
      <span className={styles.logoLabel}>{label}</span>

      {words.map((word, wi) => (
        <span key={wi} className={styles.logoWord} aria-hidden="true">
          {word.split('').map((char, ci) => (
            <span key={`${wi}-${ci}`} className="letter">{char}</span>
          ))}
        </span>
      ))}
    </>
  )
}
