import { redirect } from 'next/navigation'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { headers } from 'next/headers'
import type { App } from '@/payload-types'
import { SortableApps } from './SortableApps'
import { reorderApps } from './reorderApps'
import { MonitorCheck } from 'lucide-react' // 👈 client part

export const dynamic = 'force-dynamic'

export default async function DesktopPage() {
  const payload = await getPayload({ config: configPromise })
  const requestHeaders = await headers()

  const { user } = await payload.auth({ headers: requestHeaders })

  if (!user) {
    redirect('/admin')
  }

  const isAdmin = user.role === 'admin'

  const appsRes = await payload.find({
    collection: 'apps',
    where: isAdmin
      ? {
          pinned: {
            equals: true,
          },
        }
      : {
          and: [
            {
              owner: {
                equals: user.id,
              },
            },
            {
              pinned: {
                equals: true,
              },
            },
          ],
        },
    sort: 'order',
    depth: 1,
  })

  const apps = appsRes.docs as App[]

  // 👇 server action lives *inside* the component
  async function createApp(formData: FormData) {
    'use server'

    const payload = await getPayload({ config: configPromise })
    const requestHeaders = await headers()

    const { user } = await payload.auth({ headers: requestHeaders })

    if (!user) {
      redirect('/admin')
    }

    const name = (formData.get('name') as string) || 'Uus äpp'

    const doc = await payload.create({
      collection: 'apps',
      data: {
        name,
        owner: user.id,
        grid: {
          cols: 6,
          rows: 8,
          cells: [],
        },
      },
    })

    redirect(`/app/${doc.id}/edit`)
  }

  async function unpinApp(formData: FormData) {
    'use server'

    const appId = formData.get('appId') as string | null
    if (!appId) {
      redirect('/desktop')
    }

    const payload = await getPayload({ config: configPromise })
    const requestHeaders = await headers()
    const { user } = await payload.auth({ headers: requestHeaders })

    if (!user) {
      redirect('/admin')
    }

    // Payload access (isAdminOrOwner) kontrollib uuesti
    await payload.update({
      collection: 'apps',
      id: appId,
      data: {
        pinned: false,
      },
    })

    redirect('/desktop')
  }

  // --- delete ---
  async function deleteApp(formData: FormData) {
    'use server'

    const appId = formData.get('appId') as string | null
    if (!appId) {
      redirect('/desktop')
    }

    const payload = await getPayload({ config: configPromise })
    const requestHeaders = await headers()
    const { user } = await payload.auth({ headers: requestHeaders })

    if (!user) {
      redirect('/admin')
    }

    // will be checked again by Payload access (isAdminOrOwner)
    await payload.delete({
      collection: 'apps',
      id: appId,
    })

    // go back to list
    redirect('/desktop')
  }

  return (
    <main className="p-6 space-y-6">
      <header className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <MonitorCheck className={`h-6 w-6 text-pink-500`} />
          <h1 className="text-2xl font-semibold">Desktop</h1>
        </div>
      </header>

      {apps.length === 0 ? (
        <p className="text-muted-foreground">Sul pole veel rakendusi.</p>
      ) : (
        <SortableApps
          apps={apps}
          isAdmin={isAdmin}
          onReorder={reorderApps}
          unpinAction={unpinApp}
        />
      )}
    </main>
  )
}
