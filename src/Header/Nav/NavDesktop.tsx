// app/_components/header/NavDesktop.tsx
'use client'

import * as React from 'react'
import Link from 'next/link'
import { CMSLink } from '@/components/Link'
import type { Header as HeaderType } from '@/payload-types'
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuTrigger,
  NavigationMenuContent,
  NavigationMenuLink,
} from '@/components/ui/navigation-menu'

type Props = { data: HeaderType }

export function NavDesktop({ data }: Props) {
  const items = data?.navItems ?? []

  return (
    <NavigationMenu className="hidden md:block">
      <NavigationMenuList>
        {items.map((item, i) => {
          const computedTopLabel =
            item.label ||
            item.link?.label ||
            (typeof item.link?.reference?.value === 'object'
              ? item.link?.reference?.value?.title
              : '')
          const hasChildren = Array.isArray(item.children) && item.children.length > 0

          if (hasChildren) {
            return (
              <NavigationMenuItem key={i}>
                <NavigationMenuTrigger>{computedTopLabel}</NavigationMenuTrigger>
                <NavigationMenuContent className="p-4">
                  <ul className="grid gap-2 min-w-[260px]">
                    {item.children!.map((child, ci) => {
                      const computedChildLabel =
                        child.label ||
                        child.link?.label ||
                        (typeof child.link?.reference?.value === 'object'
                          ? child.link?.reference?.value?.title
                          : '')
                      return (
                        <li key={ci}>
                          <NavigationMenuLink asChild>
                            {/* Pass NO children; override label if needed */}
                            <CMSLink
                              className="px-4"
                              appearance="link"
                              {...(child.link ?? {})}
                              label={computedChildLabel}
                            />
                          </NavigationMenuLink>
                        </li>
                      )
                    })}
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>
            )
          }

          // No children: render as a simple link
          return (
            <NavigationMenuItem key={i}>
              <NavigationMenuLink asChild>
                <CMSLink
                  appearance="link"
                  className="px-4"
                  {...(item.link ?? {})}
                  label={computedTopLabel}
                />
              </NavigationMenuLink>
            </NavigationMenuItem>
          )
        })}

        {/* Search icon */}
        <NavigationMenuItem className="pl-2">
          <Link href="/search" className="text-primary inline-flex items-center">
            <span className="sr-only">Search</span>
            <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M21 21l-4.3-4.3M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Z" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round"/>
            </svg>
          </Link>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  )
}
