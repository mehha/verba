'use client'

import { useEffect, useState } from 'react'
import { Volume, Volume1, Volume2 } from 'lucide-react'

type AnimatedVolumeIconProps = {
  busy: boolean
  className?: string
}

export function AnimatedVolumeIcon({ busy, className }: AnimatedVolumeIconProps) {
  const frames = [Volume1, Volume2, Volume]
  const [index, setIndex] = useState(0)

  useEffect(() => {
    if (!busy) {
      setIndex(0)
      return
    }

    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % frames.length)
    }, 200) // 200ms = suht pehme animatsioon

    return () => clearInterval(interval)
  }, [busy, frames.length])

  const Icon = frames[index]
  return <Icon className={className} />
}
