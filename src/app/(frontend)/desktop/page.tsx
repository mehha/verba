import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { headers } from 'next/headers'
import type { App } from '@/payload-types'
import { CreateAppButton } from './CreateAppButton' // 👈 client part

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
      ? {}
      : {
          owner: {
            equals: user.id,
          },
        },
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
        <h1 className="text-2xl font-semibold">Minu rakendused</h1>
        {/* 👇 client component with modal */}
        <CreateAppButton createApp={createApp} />
      </header>

      {apps.length === 0 ? (
        <p className="text-muted-foreground">Sul pole veel rakendusi.</p>
      ) : (
        <ul className="flex gap-4">
          {apps.map((app) => (
            <li key={app.id} className="border p-4 flex flex-col gap-2 aspect-[4/3] w-[240px] relative rounded-xl bg-white shadow-lg ring-1 ring-gray-900/5">
              <div className="flex items-center justify-between gap-2">
                <h2 className="font-medium">{app.name}</h2>
                {isAdmin && (
                  <span className="text-xs bg-slate-200 px-2 py-0.5 rounded">
                    admin
                  </span>
                )}
              </div>
              <div className="flex gap-2">
                <Link
                  href={`/app/${app.id}`}
                  className="text-sm underline underline-offset-2"
                >
                  Mängi
                </Link>
                <Link
                  href={`/app/${app.id}/edit`}
                  className="text-sm underline underline-offset-2"
                >
                  Muuda
                </Link>

                <form action={deleteApp}>
                  <input type="hidden" name="appId" value={app.id} />
                  <button
                    type="submit"
                    className="text-sm text-red-600 hover:underline"
                  >
                    Kustuta
                  </button>
                </form>
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  )
}
