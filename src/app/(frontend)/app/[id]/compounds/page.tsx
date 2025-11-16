// src/app/(frontend)/apps/[id]/compounds/page.tsx
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import type { App } from '@/payload-types'
import { CompoundsEditor } from './CompoundsEditor'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Play } from 'lucide-react'

export const dynamic = 'force-dynamic'

type PageProps = {
  params: { id: string }
}

export default async function AppCompoundsPage({ params }: PageProps) {
  const payload = await getPayload({ config: configPromise })
  const requestHeaders = await headers()
  const { id } = await params

  const { user } = await payload.auth({ headers: requestHeaders })
  if (!user) redirect('/admin')

  const isAdmin = user.role === 'admin'

  const appRes = await payload.findByID({
    collection: 'apps',
    id,
    depth: 1,
  })

  const app = appRes as App

  // omaniku kontroll
  if (!isAdmin && app.owner !== user.id) {
    redirect('/apps')
  }

  const cells =
    app.grid?.cells?.map((cell) => ({
      id: cell.id,
      title: cell.title || cell.id,
    })) ?? []

  async function saveCompounds(appId: string, compounds: App['compounds'] | null) {
    'use server'

    const payload = await getPayload({ config: configPromise })
    const requestHeaders = await headers()
    const { user } = await payload.auth({ headers: requestHeaders })
    if (!user) redirect('/admin')

    const isAdmin = user.role === 'admin'

    const existing = (await payload.findByID({
      collection: 'apps',
      id: appId,
    })) as App

    if (!isAdmin && existing.owner !== user.id) {
      throw new Error('No access')
    }

    await payload.update({
      collection: 'apps',
      id: appId,
      data: {
        compounds: compounds ?? [],
      },
    })

    // soovi korral:
    // revalidatePath(`/apps/${appId}/compounds`)
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">
            Sõnaühendid · <span className="font-normal">{app.name}</span>
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Määra cellide kombinatsioone, mille puhul kuvatekst ja TTS erinevad
            lihtsast summast (nt &quot;kaks&quot; + &quot;kass&quot; → &quot;kaks kassi&quot;).
          </p>
        </div>
        <Link href={`/app/${app.id}/edit`}>
          <Button>
            <ArrowLeft className="mr-2 h-4 w-4" />Tagasi appi seadetesse
          </Button>
        </Link>
        <Link href={`/app/${app.id}`}>
          <Button variant="positive" size="sm">
            <Play className="h-5 w-5" />
          </Button>
        </Link>
      </div>

      <CompoundsEditor
        appId={String(app.id)}
        initialCompounds={app.compounds}
        cells={cells}
        onSave={saveCompounds}
      />
    </div>
  )
}
