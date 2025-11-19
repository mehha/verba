// src/blocks/UsageContexts/Component.tsx
import Link from 'next/link'
import { cn } from '@/utilities/ui'
import { Button } from '@/components/ui/button'
import { Media } from '@/components/Media'
import type { Media as PayloadMedia } from '@/payload-types'

type UsageContextsItem = {
  id?: string | number
  title: string
  description: string
  image?: PayloadMedia | null
  button?: {
    label: string
    href: string
  } | null
}

export type UsageContextsBlockProps = {
  heading?: string | null
  items: UsageContextsItem[]
  className?: string
}

export function UsageContextsBlockComponent({
  heading,
  items,
  className,
}: UsageContextsBlockProps) {
  if (!items?.length) return null

  return (
    <section
      className={cn(
        'w-full bg-slate-50',
        className,
      )}
    >
      <div className="container mx-auto px-4 lg:px-8">
        {heading && (
          <h2 className="mb-8 text-balance text-3xl font-semibold tracking-tight md:text-4xl">
            {heading}
          </h2>
        )}

        <div className="flex flex-col gap-8 lg:gap-10">
          {items.map((item, index) => (
            <article
              key={item.id ?? index}
              className="grid items-center gap-8 rounded-[32px] bg-white px-6 py-8 shadow-sm md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] md:px-10 md:py-10"
            >
              {/* Text column */}
              <div className="flex flex-col gap-4">
                <h3 className="text-2xl font-semibold tracking-tight md:text-3xl">
                  {item.title}
                </h3>
                <p className="max-w-prose text-sm leading-relaxed text-slate-600 md:text-base">
                  {item.description}
                </p>

                {item.button?.href && (
                  <div className="mt-4">
                    <Button asChild size="lg" className="rounded-full px-6">
                      <Link href={item.button.href}>{item.button.label}</Link>
                    </Button>
                  </div>
                )}
              </div>

              {/* Image column */}
              <div className="relative h-56 overflow-hidden rounded-[28px] bg-slate-100 md:h-64 lg:h-72">
                {item.image && (
                  <Media
                    resource={item.image}
                    fill
                    pictureClassName="block h-full w-full"
                    imgClassName="object-cover"
                    priority={false}
                  />
                )}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
