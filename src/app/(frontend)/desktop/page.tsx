import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { headers } from 'next/headers'
import type { App } from '@/payload-types'

export const dynamic = 'force-dynamic'

export default async function DesktopPage() {
  const payload = await getPayload({ config: configPromise })
  const requestHeaders = await headers()

  const { user } = await payload.auth({ headers: requestHeaders })

  if (!user) {
    redirect('/login')
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
  async function createApp() {
    'use server'

    const payload = await getPayload({ config: configPromise })
    const requestHeaders = await headers()

    const { user } = await payload.auth({ headers: requestHeaders })

    if (!user) {
      redirect('/login')
    }

    const doc = await payload.create({
      collection: 'apps',
      data: {
        name: 'Uus rakendus',
        owner: user.id,
        grid: {
          cols: 6,
          rows: 8,
          cells: [],
        },
      },
    })

    redirect(`/app/${doc.id}`)
  }

  return (
    <main className="p-6 space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Minu rakendused</h1>
        <form action={createApp}>
          <button
            type="submit"
            className="rounded bg-blue-600 px-4 py-2 text-white text-sm"
          >
            + Uus rakendus
          </button>
        </form>
      </header>

      {apps.length === 0 ? (
        <p className="text-muted-foreground">Sul pole veel rakendusi.</p>
      ) : (
        <ul className="grid gap-4 md:grid-cols-3">
          {apps.map((app) => (
            <li key={app.id} className="border rounded p-4 flex flex-col gap-2">
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
                  Ava / Play
                </Link>
                <Link
                  href={`/app/${app.id}/edit`}
                  className="text-sm underline underline-offset-2"
                >
                  Muuda
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  )
}
