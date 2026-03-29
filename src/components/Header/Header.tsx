'use client'

import { useState, useEffect, useRef } from 'react'
import styles from './Header.module.css'
import { gsap } from '@/lib/gsap'
import type { SiteConfig } from '@/config/site'

interface HeaderProps {
  visible:  boolean
  tagline:  string
  address:  SiteConfig['address']
  phone:    SiteConfig['phone']
}

export default function Header({ visible, tagline, address, phone }: HeaderProps) {
  const headerRef = useRef<HTMLElement>(null)
  const [open, setOpen] = useState(false)

  // Set opacity 0 on mount so header is invisible before loader completes
  useEffect(() => {
    if (headerRef.current) gsap.set(headerRef.current, { opacity: 0 })
  }, [])

  // Fade in once loaderDone fires
  useEffect(() => {
    if (visible && headerRef.current) {
      gsap.to(headerRef.current, { opacity: 1, duration: 0.6, ease: 'power2.inOut' })
    }
  }, [visible])

  return (
    <>
      <header ref={headerRef} className={styles.header}>
        <div className={`${styles.wrap} container-fluid`}>

          {/* Left — slogan */}
          <p className={styles.slogan}>{tagline}</p>

          {/* Centre — address (desktop only) */}
          <div className={styles.address}>
            <a href={address.mapsUrl} target="_blank" rel="noopener noreferrer">
              {address.text}
            </a>
          </div>

          {/* Right — phone (desktop only) */}
          <div className={styles.phone}>
            <a href={phone.href}>{phone.display}</a>
          </div>

          {/* Mobile/tablet burger */}
          <button
            className={styles.burger}
            aria-label={open ? 'Close info' : 'Open info'}
            aria-expanded={open}
            onClick={() => setOpen((o) => !o)}
          >
            <span>Infos</span>
            <span className={open ? styles.chevronOpen : styles.chevron} aria-hidden="true">
              <svg width="10" height="6" viewBox="0 0 10 6" fill="none">
                <path
                  d="M7.40235 0.314604C7.79513-0.00574636 8.37413 0.0168474 8.74024 0.382963C9.10636 0.749079 9.12895 1.32808 8.8086 1.72085L8.74024 1.79703L5.24024 5.29703C4.87413 5.66314 4.29513 5.68574 3.90235 5.36539L3.82618 5.29703L0.326182 1.79703L0.257822 1.72085C-0.0625281 1.32808-0.0399343 0.749079 0.326182 0.382963C0.692298 0.0168474 1.2713-0.00574636 1.66407 0.314604L1.74024 0.382963L4.53321 3.17593L7.32618 0.382963L7.40235 0.314604Z"
                  fill="currentColor"
                />
              </svg>
            </span>
          </button>

        </div>

        {/* Dropdown — mobile/tablet only */}
        <div className={`${styles.dropdown} ${open ? styles.dropdownOpen : ''}`}>
          <a
            className={styles.dropdownItem}
            href={address.mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            {address.text}
          </a>
          <a className={styles.dropdownItem} href={phone.href}>
            {phone.display}
          </a>
        </div>

      </header>

      {/* Invisible spacer so grid content starts below header */}
      <div className={styles.spacer} aria-hidden="true" />
    </>
  )
}
