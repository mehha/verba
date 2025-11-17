import clsx from 'clsx'
import React from 'react'
import {
  MessageCircleCode,
  MessageCircleHeart,
  MessageSquare,
  MessageSquareCode,
} from 'lucide-react'

interface Props {
  className?: string
  loading?: 'lazy' | 'eager'
  priority?: 'auto' | 'high' | 'low'
}

export const Logo = (props: Props) => {
  const { loading: loadingFromProps, priority: priorityFromProps, className } = props

  const loading = loadingFromProps || 'lazy'
  const priority = priorityFromProps || 'low'

  return (
    /* eslint-disable @next/next/no-img-element */
    <div className="flex items-center gap-[2px]">
      <div className="text-3xl font-extrabold leading-none">Verb</div>
      <MessageCircleHeart className="h-[22px] w-[22px] translate-y-0.5 transform -scale-x-100 text-pink-500" />
    </div>
  )
}
