'use client'
import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'

export function TopLoader() {
  const pathname = usePathname()
  const [width, setWidth] = useState(0)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    setVisible(true)
    setWidth(20)
    const t1 = setTimeout(() => setWidth(65), 120)
    const t2 = setTimeout(() => setWidth(90), 400)
    const t3 = setTimeout(() => {
      setWidth(100)
      setTimeout(() => { setVisible(false); setWidth(0) }, 250)
    }, 700)
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3) }
  }, [pathname])

  if (!visible) return null
  return (
    <div className="fixed top-0 left-0 right-0 z-[9999] h-0.5 pointer-events-none">
      <div
        className="h-full bg-end-blue transition-all ease-out"
        style={{ width: `${width}%`, transitionDuration: width === 100 ? '200ms' : '600ms' }}
      />
    </div>
  )
}
