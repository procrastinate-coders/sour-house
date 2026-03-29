'use client'

import { Fragment, useEffect, useRef } from 'react'
import Image from 'next/image'
import styles from './MenuSection.module.css'
import { gsap } from '@/lib/gsap'
import type { MenuGroup, MenuImageData } from '@/types/menu'

// ─── Types ────────────────────────────────────────────────

export type { MenuItemData, MenuGroup, MenuImageData } from '@/types/menu'

export interface MenuSectionProps {
  /** Title split across lines, e.g. ["Le", "Fournil"] */
  titleLines: string[]
  ariaLabel:  string
  groups:     MenuGroup[]
  images:     MenuImageData[]
  /** Flip layout: images left, menu right */
  reverse?:   boolean
}

// ─── Sub-components ───────────────────────────────────────

function TitleChars({ text }: { text: string }) {
  return (
    <>
      {text.split('').map((char, i) => (
        <span key={i} className="charMask">
          <span className="char">{char}</span>
        </span>
      ))}
    </>
  )
}

function MenuItem({ name, desc, price }: { name: string; desc?: string; price: string }) {
  return (
    <li className={styles.menuItem}>
      <p className={styles.itemName}>{name}</p>
      {desc && <p className={styles.itemDesc}>{desc}</p>}
      <p className={styles.itemPrice}>{price}</p>
    </li>
  )
}

// ─── Component ────────────────────────────────────────────

export default function MenuSection({
  titleLines,
  ariaLabel,
  groups,
  images,
  reverse = false,
}: MenuSectionProps) {
  const sectionRef = useRef<HTMLElement>(null)
  const titleRef   = useRef<HTMLHeadingElement>(null)
  const imgsRef    = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const section = sectionRef.current
    const title   = titleRef.current
    const imgs    = imgsRef.current
    if (!section || !title || !imgs) return

    const chars       = title.querySelectorAll<HTMLSpanElement>('.char')
    const figures     = imgs.querySelectorAll<HTMLElement>(`.${styles.imgWrap}`)
    const scalingFigs = Array.from(figures).slice(1)

    // ── 1. Title chars — slide up on first enter ──
    gsap.set(chars, { yPercent: 110 })

    const titleObserver = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        gsap.to(chars, {
          yPercent: 0,
          duration: 0.65,
          ease:     'back.out(1.2)',
          stagger:  0.045,
        })
        titleObserver.disconnect()
      },
      { threshold: 0.1 },
    )
    titleObserver.observe(section)

    // ── 2. Images — scale in on desktop only; all visible on mobile/tablet ──
    const mm = gsap.matchMedia()

    mm.add('(min-width: 1200px)', () => {
      gsap.set(scalingFigs, { scale: 0 })

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start:   'top top',
          end:     'bottom bottom',
          scrub:   true,
        },
      })
      tl
        .to({},             { duration: 1 }, 0)
        .to(scalingFigs[0], { scale: 1, ease: 'power3.inOut', duration: 1 }, 1)
        .to(scalingFigs[1], { scale: 1, ease: 'power3.inOut', duration: 1 }, 2)
        .to({},             { duration: 1 }, 3)

      return () => {
        tl.scrollTrigger?.kill()
        tl.kill()
      }
    })

    return () => {
      titleObserver.disconnect()
      mm.revert()
      gsap.killTweensOf([...Array.from(chars), ...scalingFigs])
    }
  }, [])

  const sectionClass = [
    styles.section,
    reverse ? styles.sectionReverse : '',
  ].filter(Boolean).join(' ')

  return (
    <section ref={sectionRef} className={sectionClass}>

      {/* ── INNER CARD — lighter shade, rounded, padded ── */}
      <div className={styles.inner}>

        {/* ── LEFT — scrolling title + menu list ── */}
        <div className={styles.left}>
          <h2 ref={titleRef} className={styles.title} aria-label={ariaLabel}>
            {titleLines.map((line, i) => (
              <span key={i}>
                {i > 0 && <br />}
                <TitleChars text={line} />
              </span>
            ))}
          </h2>

          <ul className={styles.menu}>
            {groups.map((group) => (
              <Fragment key={group.title}>
                <li className={`${styles.menuTitle}${group.format ? ` ${styles.menuTitleWithFormat}` : ''}`}>
                  <h3 className={styles.menuTitleText}>{group.title}</h3>
                  {group.format && (
                    <span className={styles.menuTitleFormat}>{group.format}</span>
                  )}
                </li>
                {group.items.map((item) => (
                  <MenuItem key={item.name} {...item} />
                ))}
              </Fragment>
            ))}
          </ul>
        </div>

        {/* ── RIGHT — sticky image stack ── */}
        <div className={styles.right}>
          <div ref={imgsRef} className={styles.imgs}>
            {images.map((img, i) => (
              <figure
                key={img.src}
                className={styles.imgWrap}
                style={{ '--index': i + 1 } as React.CSSProperties}
              >
                <Image
                  src={img.src}
                  alt={img.alt}
                  fill
                  sizes="(max-width: 1199px) 33vw, 45vw"
                  className={styles.img}
                />
              </figure>
            ))}
          </div>
        </div>

      </div>

    </section>
  )
}
