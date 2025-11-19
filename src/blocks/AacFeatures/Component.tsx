// src/blocks/AacFeatures/Component.tsx
import React from 'react'
import type { AacFeaturesBlock as AacFeaturesProps } from 'src/payload-types'
import { cn } from '@/utilities/ui'
import {
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

export const AacFeaturesBlock: React.FC<Props> = ({
  className,
  eyebrow,
  title,
  subtitle,
  items,
}) => {
  if (!items || items.length === 0) return null

  return (
    <section className={cn('', className)}>
      <div className="mx-auto flex max-w-6xl flex-col gap-14">
        {/* Ülemine osa: dot + label + pealkiri */}
        <header className="text-center space-y-6">
          {eyebrow && (
            <div className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
              <span className="h-2 w-2 rounded-full bg-red-500" />
              <span>{eyebrow}</span>
            </div>
          )}

          {title && (
            <h1 className="mx-auto max-w-3xl text-balance text-4xl font-semibold leading-tight md:text-4xl">
              {title}
            </h1>
          )}

          {subtitle && (
            <p className="mx-auto max-w-2xl text-sm text-muted-foreground md:text-base">
              {subtitle}
            </p>
          )}
        </header>

        {/* Kaardid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => {
            if (!item) return null
            const Icon =
              (item.icon && iconMap[item.icon]) ?? MessageCircle

            const isAccent = item.variant === 'accent'

            return (
              <article
                key={item.id}
                className={cn(
                  'relative flex h-full flex-col justify-between rounded-3xl border bg-white p-6 shadow-sm transition-transform hover:-translate-y-1',
                  isAccent && 'border-transparent bg-sky-100/90 dark:bg-sky-900/40'
                )}
              >
                <div className="flex items-start gap-4">
                  <div
                    className={cn(
                      'flex p-2 w-10 items-center justify-center rounded-full',
                      isAccent
                        ? 'bg-sky-500 text-white'
                        : 'bg-yellow-400 text-black'
                    )}
                  >
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </div>

                  <div className="space-y-1">
                    {item.title && (
                      <h3 className="text-base font-semibold md:text-lg">
                        {item.title}
                      </h3>
                    )}
                    {item.description && (
                      <p className="text-sm leading-relaxed text-muted-foreground">
                        {item.description}
                      </p>
                    )}
                  </div>
                </div>

                {item.ctaLabel && item.ctaHref && (
                  <div className="mt-6">
                    <a
                      href={item.ctaHref}
                      className={cn(
                        'inline-flex w-full items-center justify-center rounded-full px-4 py-2 text-sm font-medium',
                        isAccent
                          ? 'bg-foreground text-background hover:opacity-90'
                          : 'border border-input bg-background hover:bg-muted'
                      )}
                    >
                      {item.ctaLabel}
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
