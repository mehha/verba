// src/app/(frontend)/app/[id]/edit/page.tsx
import { notFound, redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
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
  const { id } = await params

  const { payload, user } = await getCurrentUser()

  if (!user) {
    redirect('/admin')
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

  const isAdmin = user.role === 'admin'
  const ownerId =
    typeof app.owner === 'object' && app.owner !== null
      ? (app.owner as User).id
      : app.owner

  if (!isAdmin && ownerId !== user.id) {
    redirect('/desktop')
  }

  // --- server action: renameApp ---
  async function renameApp(formData: FormData) {
    'use server'

    const { payload, user } = await getCurrentUser()
    if (!user) {
      redirect('/admin')
    }

    const appId = formData.get('appId') as string
    const rawName = (formData.get('name') as string) ?? ''
    const name = rawName.trim() || 'Nimetu äpp'

    await payload.update({
      collection: 'apps',
      id: appId, // ei kasuta where, meil on id olemas
      data: { name },
    })

    // värskenda edit-lehte ja listi
    revalidatePath(`/app/${appId}/edit`)
    revalidatePath('/apps')
  }

  return <AppEditor app={app} renameApp={renameApp} />
}
