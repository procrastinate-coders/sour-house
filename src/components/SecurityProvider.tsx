'use client'

import { useEffect } from 'react'

export function SecurityProvider() {
  useEffect(() => {
    // Prevent right-click context menu
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault()
    }

    // Prevent common keyboard shortcuts for DevTools and saving
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === 'F12' ||
        (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J' || e.key === 'C')) ||
        (e.ctrlKey && e.key === 'U') ||
        (e.metaKey && e.altKey && (e.key === 'I' || e.key === 'J' || e.key === 'U')) ||
        (e.metaKey && e.key === 's') ||
        (e.ctrlKey && e.key === 's') ||
        (e.ctrlKey && e.key === 'c') ||
        (e.metaKey && e.key === 'c')
      ) {
        e.preventDefault()
      }
    }

    // Prevent dragging elements
    const handleDragStart = (e: DragEvent) => {
      e.preventDefault()
    }

    document.addEventListener('contextmenu', handleContextMenu)
    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('dragstart', handleDragStart)

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu)
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('dragstart', handleDragStart)
    }
  }, [])

  return null
}
