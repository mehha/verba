'use client'

import { cn } from '@/utilities/ui'
import React, { useEffect, useRef } from 'react'

import type { Props as MediaProps } from '../types'

import { getMediaUrl } from '@/utilities/getMediaUrl'

export const VideoMedia: React.FC<MediaProps> = (props) => {
  const {
    onClick,
    resource,
    videoAutoPlay = true,
    videoClassName,
    videoControls = false,
  } = props

  const videoRef = useRef<HTMLVideoElement>(null)
  // const [showFallback] = useState<boolean>()

  useEffect(() => {
    const { current: video } = videoRef
    if (video) {
      video.addEventListener('suspend', () => {
        // setShowFallback(true);
        // console.warn('Video was suspended, rendering fallback image.')
      })
    }
  }, [])

  if (resource && typeof resource === 'object') {
    const { mimeType, updatedAt, url } = resource
    const src = getMediaUrl(url, updatedAt)

    if (!src) return null

    return (
      <video
        autoPlay={videoAutoPlay}
        className={cn(videoClassName)}
        controls={videoControls}
        loop={!videoControls}
        muted={!videoControls}
        onClick={onClick}
        playsInline
        ref={videoRef}
      >
        <source src={src} type={mimeType || undefined} />
      </video>
    )
  }

  return null
}
