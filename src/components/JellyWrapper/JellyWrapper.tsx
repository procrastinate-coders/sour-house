'use client'

import { useRef, ReactNode } from 'react'
import JellyWave from './JellyWave'
import styles from './JellyWrapper.module.css'

export interface JellyWrapperProps {
  children: ReactNode
  /** Add jelly wave at the top edge */
  topJelly?: boolean
  /** Add jelly wave at the bottom edge */
  bottomJelly?: boolean
  /** Fill color for top wave (default: white) */
  topColor?: string
  /** Fill color for bottom wave (default: white) */
  bottomColor?: string
  className?: string
}

export default function JellyWrapper({
  children,
  topJelly = false,
  bottomJelly = false,
  topColor = '#ffffff',
  bottomColor = '#ffffff',
  className,
}: JellyWrapperProps) {
  const wrapperRef = useRef<HTMLDivElement>(null)

  return (
    <div
      ref={wrapperRef}
      className={[styles.wrapper, className].filter(Boolean).join(' ')}
    >
      {topJelly && (
        <JellyWave containerRef={wrapperRef} position="top" color={topColor} />
      )}

      {children}

      {bottomJelly && (
        <JellyWave containerRef={wrapperRef} position="bottom" color={bottomColor} />
      )}
    </div>
  )
}
