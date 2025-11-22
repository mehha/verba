import { HeaderClient } from './Component.client'
import { getCachedGlobal } from '@/utilities/getGlobals'
import React from 'react'

import type { Header, User } from '@/payload-types'
import { getCurrentUser } from '@/utilities/getCurrentUser'
import { cookies } from 'next/headers'

export async function Header() {
  const headerData: Header = await getCachedGlobal('header', 1)()
  const { user } = await getCurrentUser()
  const u = user as User
  const cookieStore = await cookies()

  const uiModeCookie = cookieStore.get('uiMode')?.value
  const isParentMode = uiModeCookie === 'parent'

  return <HeaderClient data={headerData} currentUser={user as User | null} isParentMode={isParentMode} hasPin={Boolean(u?.parentPinHash)} />
}
