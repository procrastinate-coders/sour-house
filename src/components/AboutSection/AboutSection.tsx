'use client'

import { useEffect, useRef } from 'react'
import Image from 'next/image'
import styles from './AboutSection.module.css'
import JellyWave from '@/components/JellyWrapper/JellyWave'
import { gsap, ScrollTrigger } from '@/lib/gsap'
import type { SiteConfig } from '@/config/site'

interface AboutSectionProps {
  about: SiteConfig['about']
}

export default function AboutSection({ about }: AboutSectionProps) {
  const sectionRef = useRef<HTMLElement>(null)
  const accentRef  = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const section = sectionRef.current
    const accent  = accentRef.current
    const content = contentRef.current
    if (!section || !accent || !content) return

    const ctx = gsap.context(() => {
      // Floating parallax on accent image — drifts upward as you scroll past
      gsap.to(accent, {
        y: -90,
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          start: 'top bottom',
          end:   'bottom top',
          scrub: 1.2,
        },
      })

      // Content stagger fade-up when scrolled into view
      const els = content.querySelectorAll<HTMLElement>('[data-anim]')
      gsap.fromTo(
        els,
        { opacity: 0, y: 50 },
        {
          opacity: 1,
          y: 0,
          duration: 1.1,
          ease: 'power3.out',
          stagger: 0.14,
          scrollTrigger: { trigger: content, start: 'top 80%', once: true },
        }
      )

      ScrollTrigger.refresh()
    }, section)

    return () => ctx.revert()
  }, [])

  return (
    <section ref={sectionRef} className={styles.section}>
      {/* ── Dark jelly wave at top — mirrors kremkanel's about layer ── */}
      <JellyWave containerRef={sectionRef} position="top" color="var(--color-dark)" />

      <div className={`${styles.inner} container-fluid`}>

        {/* ── Left column — portrait image + floating accent ── */}
        <div className={styles.imageCol}>
          <figure className={styles.mainImage}>
            <Image
              src={about.mainImage.src}
              alt={about.mainImage.alt}
              fill
              sizes="(max-width: 767px) 90vw, (max-width: 1199px) 45vw, 40vw"
              className="image-as-background"
            />
          </figure>

          {/* Square accent image — parallax */}
          <div ref={accentRef} className={styles.accent}>
            <Image
              src={about.accentImage.src}
              alt={about.accentImage.alt}
              fill
              sizes="(max-width: 767px) 40vw, 20vw"
              className="image-as-background"
            />
          </div>
        </div>

        {/* ── Right column — text ── */}
        <div ref={contentRef} className={styles.textCol}>
          <h2 data-anim className={styles.title}>{about.title}</h2>
          <p  data-anim className={styles.subtitle}>{about.subtitle}</p>
          <p  data-anim className={styles.body}>{about.body}</p>
        </div>

      </div>
    </section>
  )
}
