// app/_components/header/NavMobile.tsx
'use client'

import * as React from 'react'
import { CMSLink } from '@/components/Link'
import type { Header as HeaderType } from '@/payload-types'
import { Menu } from 'lucide-react'
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Logo } from '@/components/Logo/Logo'

type Props = { data: HeaderType }

export function NavMobile({ data }: Props) {
  const items = data?.navItems ?? []
  const [open, setOpen] = React.useState(false)

  return (
    <div className="lg:hidden">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" aria-label="Open menu">
            <Menu className="h-6 w-6" />
          </Button>
        </SheetTrigger>

        <SheetContent
          side="right"
          className="flex w-[84vw] max-w-[400px] flex-col overflow-hidden p-0"
        >
          <SheetHeader className="items-start shrink-0 p-4 pr-16 text-left">
            <SheetTitle className="flex justify-start">
              <Logo />
            </SheetTitle>
          </SheetHeader>

          <nav className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))]">
            <ul className="space-y-1">
              {items.map((item, i) => {
                const topLabel =
                  item.label ||
                  item.link?.label ||
                  (typeof item.link?.reference?.value === 'object'
                    ? item.link?.reference?.value?.title
                    : '')

                // Leaf item
                return (
                  <li key={i} className="px-3 py-2">
                    <SheetClose asChild>
                      <CMSLink
                        appearance="link"
                        {...(item.link ?? {})}
                        label={topLabel}
                        onClick={() => setOpen(false)}
                      />
                    </SheetClose>
                  </li>
                )
              })}
            </ul>
          </nav>
        </SheetContent>
      </Sheet>
    </div>
  )
}
