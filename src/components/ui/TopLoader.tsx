'use client'
import { useEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'

export function TopLoader() {
  const pathname = usePathname()
  const prevPathname = useRef(pathname)
  const [progress, setProgress] = useState(0)
  const [visible, setVisible] = useState(false)
  const timers = useRef<ReturnType<typeof setTimeout>[]>([])

  const clearTimers = () => {
    timers.current.forEach(clearTimeout)
    timers.current = []
  }

  const start = () => {
    clearTimers()
    setVisible(true)
    setProgress(8)
    const t1 = setTimeout(() => setProgress(30), 80)
    const t2 = setTimeout(() => setProgress(55), 250)
    const t3 = setTimeout(() => setProgress(72), 500)
    const t4 = setTimeout(() => setProgress(88), 900)
    timers.current = [t1, t2, t3, t4]
  }

  const complete = () => {
    clearTimers()
    setProgress(100)
    const t = setTimeout(() => {
      setVisible(false)
      setProgress(0)
    }, 350)
    timers.current = [t]
  }

  // Démarre dès le clic sur un lien interne
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const anchor = (e.target as Element).closest('a')
      if (!anchor) return
      const href = anchor.getAttribute('href') ?? ''
      if (
        !href ||
        href.startsWith('#') ||
        href.startsWith('http') ||
        href.startsWith('mailto:') ||
        href.startsWith('tel:') ||
        anchor.target === '_blank'
      ) return
      start()
    }
    document.addEventListener('click', onClick)
    return () => document.removeEventListener('click', onClick)
  }, [])

  // Termine quand la nouvelle page est montée
  useEffect(() => {
    if (pathname !== prevPathname.current) {
      prevPathname.current = pathname
      complete()
    }
  }, [pathname])

  return (
    <div
      className="fixed top-0 left-0 right-0 z-[99999] h-[3px] pointer-events-none"
      style={{ opacity: visible ? 1 : 0, transition: 'opacity 0.25s ease' }}
    >
      <div
        style={{
          height: '100%',
          width: `${progress}%`,
          background: 'linear-gradient(90deg, #000 0%, #333 60%, #000 100%)',
          boxShadow: '0 0 6px rgba(0,0,0,0.5)',
          transition: progress === 100 ? 'width 0.2s ease' : 'width 0.5s cubic-bezier(0.25,0.46,0.45,0.94)',
        }}
      />
      {/* Lueur en tête de barre */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          right: `${100 - progress}%`,
          width: 80,
          height: '100%',
          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
          transform: 'translateX(50%)',
          opacity: visible && progress < 100 ? 1 : 0,
          transition: 'opacity 0.2s',
        }}
      />
    </div>
  )
}
