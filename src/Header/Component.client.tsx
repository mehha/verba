'use client'
import { useHeaderTheme } from '@/providers/HeaderTheme'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React, { useEffect, useState } from 'react'

import type { Header } from '@/payload-types'

import { Logo } from '@/components/Logo/Logo'
import { NavDesktop } from '@/Header/Nav/NavDesktop'
import {NavMobile} from "@/Header/Nav/NavMobile";
import { HeaderNav } from '@/Header/Nav'
import { UserMenu } from '@/Header/Nav/UserMenu'

interface HeaderClientProps {
  data: Header
}

export const HeaderClient: React.FC<HeaderClientProps> = ({ data }) => {
  /* Storing the value in a useState to avoid hydration errors */
  const [theme, setTheme] = useState<string | null>(null)
  const { headerTheme, setHeaderTheme } = useHeaderTheme()
  const pathname = usePathname()

  useEffect(() => {
    setHeaderTheme(null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname])

  useEffect(() => {
    if (headerTheme && headerTheme !== theme) setTheme(headerTheme)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [headerTheme])

  return (
    <header className="container mt-6 relative z-20  " {...(theme ? { 'data-theme': theme } : {})}>
      <div className="p-4 px-8 flex justify-between bg-white rounded-full dark:bg-black shadow-sm ring-1 ring-gray-900/5">
        <Link href="/">
          <Logo loading="eager" priority="high" className="invert dark:invert-0" />
        </Link>

        {/* Desktop */}
        {/*<NavDesktop data={data} />*/}

        {/* Mobile */}
        {/*<NavMobile data={data} />*/}

        <HeaderNav data={data} />

        <UserMenu
          name="John Doe"
          email="john@example.com"
          avatarUrl="https://…/avatar.jpg"
          onSignOut={() => {
            // TODO: sign-out loogika (NextAuth signOut(), custom action vms)
          }}
        />
      </div>
    </header>
  )
}
