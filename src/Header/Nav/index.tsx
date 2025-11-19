'use client'

import React from 'react'
import { usePathname } from 'next/navigation'

import type { Header as HeaderType } from '@/payload-types'

import { CMSLink } from '@/components/Link'
import { UserMenu } from '@/Header/Nav/UserMenu'
// import Link from 'next/link'
// import { SearchIcon } from 'lucide-react'

export const HeaderNav: React.FC<{ data: HeaderType }> = ({ data }) => {
  const navItems = data?.navItems || []

  const pathname = usePathname()

  return (
    <nav className="flex gap-6 items-center">
      {navItems.map(({ link }, i) => {
        const currentSlug = pathname.replace(/^\/+/, '') // "/slug" -> "slug"
        const linkSlug = typeof link?.reference?.value === 'object' && link?.reference?.value?.slug

        const isCurrent = currentSlug === linkSlug

        return <CMSLink key={i} {...link} appearance="link" className={`${isCurrent ? 'underline' : ''}`} />
      })}
      {/*<Link href="/search">*/}
      {/*  <span className="sr-only">Search</span>*/}
      {/*  <SearchIcon className="w-5 text-primary" />*/}
      {/*</Link>*/}
    </nav>
  )
}
