'use client'

import { useState, useCallback, useRef } from 'react'
import SmoothScroll from '@/components/SmoothScroll/SmoothScroll'
import Loader from '@/components/Loader/Loader'
import Header from '@/components/Header/Header'
import Hero from '@/components/Hero/Hero'
import MenuSection from '@/components/MenuSection/MenuSection'
import JellyWrapper from '@/components/JellyWrapper/JellyWrapper'
import AboutSection from '@/components/AboutSection/AboutSection'
import Footer from '@/components/Footer/Footer'
import styles from './page.module.css'
import { siteConfig } from '@/config/site'

export default function Home() {
  const [loaderDone, setLoaderDone] = useState(false)
  const [heroAnimReady, setHeroAnimReady] = useState(false)
  const heroMediaRef = useRef<HTMLElement>(null)

  const handleHeroReveal = useCallback(() => setHeroAnimReady(true), [])
  const handleLoaderComplete = useCallback(() => {
    setLoaderDone(true)
    document.body.classList.remove('loader-active')
  }, [])

  return (
    <>
      {/* Loader — unmounts itself after animations complete */}
      <Loader onComplete={handleLoaderComplete} heroMediaRef={heroMediaRef} onHeroReveal={handleHeroReveal} />

      {/* Smooth scroll wrapper — disabled until loader exits */}
      <SmoothScroll disabled={!loaderDone}>
        <div className={styles.page}>

          <div className={styles.content}>

            <Header
              visible={heroAnimReady}
              tagline={siteConfig.tagline}
              address={siteConfig.address}
              phone={siteConfig.phone}
            />

            <main>
              <Hero
                hero={siteConfig.hero}
                mediaRef={heroMediaRef}
                loaderReady={heroAnimReady}
                jellyReady={heroAnimReady}
              />

              {/* ── JellyWrapper — wraps all menu sections ── */}
              <JellyWrapper>
                {siteConfig.menuSections.map((section) => (
                  <MenuSection key={section.ariaLabel} {...section} />
                ))}
              </JellyWrapper>

              {/* ── About — wrapped so bottom jelly transitions to footer ── */}
              <JellyWrapper bottomJelly bottomColor="var(--color-dark)">
                <AboutSection about={siteConfig.about} />
              </JellyWrapper>

            </main>

          </div>

          {/* ── Footer — sticky underlay; content scrolls over it ── */}
          <Footer config={siteConfig} />

        </div>
      </SmoothScroll>
    </>
  )
}
