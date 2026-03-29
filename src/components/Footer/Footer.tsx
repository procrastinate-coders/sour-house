'use client'

import Image from 'next/image'
import styles from './Footer.module.css'
import type { SiteConfig } from '@/config/site'

interface FooterProps {
  config: Pick<SiteConfig, 'name' | 'tagline' | 'address' | 'phone' | 'footer'>
}

export default function Footer({ config }: FooterProps) {
  const { name, tagline, address, phone, footer } = config

  return (
    <footer className={styles.footer}>

      {/* ── Big brand name ── */}
      <div className={`${styles.brand} container-fluid`}>
        <p className={styles.brandName}>{name}</p>
        <p className={styles.brandTagline}>{tagline}</p>
      </div>

      {/* ── Image grid ── */}
      <div className={`${styles.grid} container-fluid`}>
        {footer.images.map((img) =>
          img.src.endsWith('.mp4') ? (
            <figure key={img.src} className={styles.gridItem}>
              <video
                className={styles.gridVideo}
                src={img.src}
                autoPlay
                loop
                muted
                playsInline
                aria-label={img.alt}
              />
            </figure>
          ) : (
            <figure key={img.src} className={styles.gridItem}>
              <Image
                src={img.src}
                alt={img.alt}
                fill
                sizes="(max-width: 767px) 45vw, (max-width: 1199px) 30vw, 20vw"
                className="image-as-background"
              />
            </figure>
          )
        )}
      </div>

      {/* ── Bottom bar ── */}
      <div className={`${styles.bottom} container-fluid`}>

        {/* Social */}
        <div className={styles.social}>
          <a href={footer.instagram} target="_blank" rel="noopener noreferrer">IG</a>
        </div>

        {/* Address */}
        <div className={styles.address}>
          <a href={address.mapsUrl} target="_blank" rel="noopener noreferrer">
            {address.text}
          </a>
        </div>

        {/* Phone */}
        <div className={styles.phone}>
          <a href={phone.href}>{phone.display}</a>
        </div>

        {/* Email */}
        <div className={styles.email}>
          <a href={`mailto:${footer.email}`}>{footer.email}</a>
        </div>

        {/* Copyright */}
        <div className={styles.copy}>
          © {2018} {name}
        </div>

        {/* Credit */}
        <div className={styles.credit}>
          Crafted with care by{' '}
          <a href="https://procrastinatecoder.com" target="_blank" rel="noopener noreferrer">
            Procrastinate Coders
          </a>
        </div>

      </div>

    </footer>
  )
}
