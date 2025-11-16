// src/app/(frontend)/apps/page.tsx
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import type { App } from '@/payload-types'
import { AppsList } from './AppsList'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

export const dynamic = 'force-dynamic'

export default async function AppsPage() {
  const payload = await getPayload({ config: configPromise })
  const requestHeaders = await headers()

  const { user } = await payload.auth({ headers: requestHeaders })
  if (!user) redirect('/admin')

  const isAdmin = user.role === 'admin'

  const appsRes = await payload.find({
    collection: 'apps',
    where: isAdmin
      ? {} // admin kõik äpid
      : {
          owner: { equals: user.id },
        },
    sort: 'createdAt',
    depth: 1,
  })

  const apps = appsRes.docs as App[]

  // --- server actions ---

  async function createApp(formData: FormData) {
    'use server'

    const payload = await getPayload({ config: configPromise })
    const requestHeaders = await headers()
    const { user } = await payload.auth({ headers: requestHeaders })
    if (!user) redirect('/admin')

    const name = (formData.get('name') as string) || 'Uus äpp'

    await payload.create({
      collection: 'apps',
      data: {
        name,
        owner: user.id,
        grid: { cols: 6, rows: 8, cells: [] },
        pinned: false, // vaikimisi mitte desktopil
      },
    })

    redirect('/apps')
  }

  async function togglePinned(formData: FormData) {
    'use server'

    const appId = formData.get('appId') as string
    const pinned = formData.get('pinned') === 'true'

    const payload = await getPayload({ config: configPromise })
    const requestHeaders = await headers()
    const { user } = await payload.auth({ headers: requestHeaders })
    if (!user) redirect('/admin')

    await payload.update({
      collection: 'apps',
      id: appId,
      data: { pinned },
    })

    // ei pea redirecti tegema, kui kasutad form+`return redirect('/apps')`,
    // aga lihtsa variandi jaoks jätame:
    redirect('/apps')
  }

  async function deleteApp(formData: FormData) {
    'use server'

    const appId = formData.get('appId')

    if (!appId || typeof appId !== 'string') {
      console.error('Missing appId in deleteApp', appId)
      throw new Error('appId puudub FormData-st')
    }

    const payload = await getPayload({ config: configPromise })
    const requestHeaders = await headers()
    const { user } = await payload.auth({ headers: requestHeaders })
    if (!user) redirect('/admin')

    await payload.delete({ collection: 'apps', id: appId })

    redirect('/apps')
  }

  return (
    <main className="container space-y-6">
      <header className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold">Kõik rakendused</h1>

        {/* vana CreateAppButton loogika siin */}
        <form action={createApp} className="flex gap-2">
          <div className="">
            <Label htmlFor="name" className="sr-only">
              Uue äpi nimi
            </Label>
            <Input
              id="name"
              name="name"
              placeholder="Uue äpi nimi"
            />
          </div>

          <Button type="submit">
            Lisa uus äpp
          </Button>
        </form>
      </header>

      <AppsList
        apps={apps}
        isAdmin={isAdmin}
        togglePinned={togglePinned}
        deleteApp={deleteApp}
      />
    </main>
  )
}
