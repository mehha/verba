// src/hooks/useViewportHeight.ts
'use client'

import { useEffect, useState } from 'react'

export function useViewportHeight() {
  const [vh, setVh] = useState(0)

  useEffect(() => {
    const update = () => setVh(window.innerHeight)
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  return vh
}
