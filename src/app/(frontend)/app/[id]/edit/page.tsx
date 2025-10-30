// src/app/(frontend)/app/[id]/edit/page.tsx
import { notFound, redirect } from 'next/navigation'
import AppEditor from './AppEditor/index'
import { getCurrentUser } from '@/utilities/getCurrentUser'
import type { App, User } from '@/payload-types'

type Params = {
  id: string
}

export default async function AppEditPage({
  params,
}: {
  params: Promise<Params>
}) {
  // ✅ unwrap params first (this removes the warning)
  const { id } = await params

  const { payload, user } = await getCurrentUser()

  if (!user) {
    redirect('/login')
  }

  const doc = await payload
    .findByID({
      collection: 'apps',
      id,
      depth: 2,
    })
    .catch(() => null)

  if (!doc) {
    notFound()
  }

  const app = doc as App

  // extra safety: only admin or owner
  const isAdmin = user.role === 'admin'
  const ownerId =
    typeof app.owner === 'object' && app.owner !== null
      ? (app.owner as User).id
      : app.owner

  if (!isAdmin && ownerId !== user.id) {
    redirect('/desktop') // or 403
  }

  return <AppEditor app={app} />
}
