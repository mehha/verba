// src/blocks/AacFeatures/Component.tsx
import React from 'react'
import type { AacFeaturesBlock as AacFeaturesProps } from 'src/payload-types'
import { cn } from '@/utilities/ui'
import {
  ArrowRight,
  MessageCircle,
  Grid3X3,
  Images,
  Volume2,
  Share2,
  WifiOff,
  Rocket,
  Accessibility,
  Combine,
  Sparkles,
  type LucideIcon,
} from 'lucide-react'

type Props = {
  className?: string
} & AacFeaturesProps

const iconMap: Record<string, LucideIcon> = {
  'message-circle': MessageCircle,
  'grid-3x3': Grid3X3,
  images: Images,
  'volume-2': Volume2,
  'share-2': Share2,
  'wifi-off': WifiOff,
  rocket: Rocket,
  accessibility: Accessibility,
  combine: Combine,
  ai: Sparkles
}

const accentStyles = [
  'bg-[#fff4dc] text-[#cc6700]',
  'bg-[#ffe9e7] text-[#bf1f2b]',
  'bg-[#eaf5ff] text-[#1359b7]',
  'bg-[#e9f8f1] text-[#19724f]',
  'bg-[#eef1f7] text-[#22314c]',
  'bg-[#f9edf8] text-[#8a397e]',
]

export const AacFeaturesBlock: React.FC<Props> = ({
  className,
  eyebrow,
  title,
  subtitle,
  items,
}) => {
  if (!items || items.length === 0) return null

  return (
    <section className={cn('bg-[#f8fafc] py-20 text-[#22314c]', className)}>
      <div className="mx-auto flex max-w-7xl flex-col gap-12 px-4 sm:px-6 lg:px-8">
        <header className="max-w-3xl">
          {eyebrow && (
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-[#657189]">
              <span className="h-2.5 w-2.5 rounded-full bg-[#1c79dd]" />
              <span>{eyebrow}</span>
            </div>
          )}

          {title && (
            <h2 className="mt-4 text-balance text-3xl font-black leading-tight tracking-normal sm:text-4xl">
              {title}
            </h2>
          )}

          {subtitle && (
            <p className="mt-5 max-w-2xl text-base leading-7 text-[#56627a]">
              {subtitle}
            </p>
          )}
        </header>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {items.map((item, index) => {
            if (!item) return null
            const Icon =
              (item.icon && iconMap[item.icon]) ?? MessageCircle

            const isAccent = item.variant === 'accent'
            const accentClass = accentStyles[index % accentStyles.length]

            return (
              <article
                key={item.id}
                className={cn(
                  'relative flex h-full flex-col justify-between rounded-[28px] bg-white p-6 shadow-[0_18px_52px_rgba(34,49,76,0.08)] transition hover:-translate-y-0.5',
                  isAccent && 'ring-1 ring-[#1c79dd]/20 shadow-[0_22px_70px_rgba(28,121,221,0.14)] after:absolute after:right-5 after:top-5 after:h-16 after:w-16 after:rounded-full after:bg-[#eaf5ff] after:content-[""]',
                )}
              >
                <div className="flex items-start gap-4">
                  <div
                    className={cn(
                      'relative z-10 flex h-12 w-12 flex-none items-center justify-center rounded-2xl',
                      isAccent ? 'bg-[#1c79dd] text-white' : accentClass,
                    )}
                  >
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </div>

                  <div className="relative z-10">
                    {item.title && (
                      <h3 className="text-lg font-black tracking-normal">
                        {item.title}
                      </h3>
                    )}
                    {item.description && (
                      <p
                        className={cn(
                          'mt-2 text-sm leading-6',
                          isAccent ? 'text-[#36506f]' : 'text-[#56627a]',
                        )}
                      >
                        {item.description}
                      </p>
                    )}
                  </div>
                </div>

                {item.ctaLabel && item.ctaHref && (
                  <div className="relative z-10 mt-6">
                    <a
                      href={item.ctaHref}
                      className={cn(
                        'inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full px-4 text-sm font-semibold transition',
                        isAccent
                          ? 'bg-[#22314c] text-white hover:bg-[#172238]'
                          : 'border border-[#d8dde8] bg-white text-[#22314c] hover:border-[#22314c]/35 hover:bg-[#f8fafc]'
                      )}
                    >
                      {item.ctaLabel}
                      <ArrowRight className="h-4 w-4" />
                    </a>
                  </div>
                )}
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}
