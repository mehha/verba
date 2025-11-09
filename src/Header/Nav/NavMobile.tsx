// app/_components/header/NavMobile.tsx
'use client'

import * as React from 'react'
import { CMSLink } from '@/components/Link'
import type { Header as HeaderType } from '@/payload-types'
import { Menu } from 'lucide-react'
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetClose,
} from '@/components/ui/sheet'
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/accordion'
import { Button } from '@/components/ui/button'

type Props = { data: HeaderType }

export function NavMobile({ data }: Props) {
  const items = data?.navItems ?? []

  return (
    <div className="md:hidden">
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" aria-label="Open menu">
            <Menu className="h-6 w-6" />
          </Button>
        </SheetTrigger>

        <SheetContent side="right" className="w-[84vw] sm:w-[400px] p-0">
          <SheetHeader className="p-4 border-b">
            <SheetTitle>Menu</SheetTitle>
          </SheetHeader>

          <nav className="p-2">
            <ul className="space-y-1">
              {items.map((item, i) => {
                const hasChildren = Array.isArray(item.children) && item.children.length > 0
                const topLabel =
                  item.label ||
                  item.link?.label ||
                  (typeof item.link?.reference?.value === 'object'
                    ? item.link?.reference?.value?.title
                    : '')

                if (hasChildren) {
                  return (
                    <li key={i}>
                      <Accordion type="single" collapsible>
                        <AccordionItem value={`item-${i}`} className="border-b">
                          <AccordionTrigger className="px-3 py-2 text-base">
                            {topLabel}
                          </AccordionTrigger>
                          <AccordionContent className="px-3 pb-3">
                            <ul className="space-y-2">
                              {item.children!.map((child, ci) => {
                                const childLabel =
                                  child.label ||
                                  child.link?.label ||
                                  (typeof child.link?.reference?.value === 'object'
                                    ? child.link?.reference?.value?.title
                                    : '')
                                return (
                                  <li key={ci}>
                                    <SheetClose asChild>
                                      <CMSLink appearance="link" {...(child.link ?? {})}>
                                        {childLabel}
                                      </CMSLink>
                                    </SheetClose>
                                  </li>
                                )
                              })}
                            </ul>
                          </AccordionContent>
                        </AccordionItem>
                      </Accordion>
                    </li>
                  )
                }

                return (
                  <li key={i} className="px-3 py-2">
                    <SheetClose asChild>
                      <CMSLink appearance="link" {...(item.link ?? {})}>
                        {topLabel}
                      </CMSLink>
                    </SheetClose>
                  </li>
                )
              })}
              {/* Optional search */}
              <li className="px-3 py-2">
                <SheetClose asChild>
                  <CMSLink appearance="link" type="custom" url="/search">
                    Search
                  </CMSLink>
                </SheetClose>
              </li>
            </ul>
          </nav>
        </SheetContent>
      </Sheet>
    </div>
  )
}
