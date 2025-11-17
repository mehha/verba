import { redirect } from 'next/navigation'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { headers, cookies } from 'next/headers'
import type { App, User } from '@/payload-types'
import { SortableApps } from './SortableApps'
import { reorderApps } from './reorderApps'
import { MonitorCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ParentUnlockDialog } from './ParentUnlockDialog'
import { switchToChildModeAction } from './modeActions'

export const dynamic = 'force-dynamic'

export default async function DesktopPage() {
  const payload = await getPayload({ config: configPromise })
  const requestHeaders = await headers()
  const cookieStore = await cookies()

  const { user } = await payload.auth({ headers: requestHeaders })

  if (!user) {
    redirect('/login')
  }

  const u = user as User
  const uiModeCookie = cookieStore.get('uiMode')?.value
  const mode: 'child' | 'parent' = uiModeCookie === 'parent' ? 'parent' : 'child'
  const isParentMode = mode === 'parent'

  const appsRes = await payload.find({
    collection: 'apps',
    where: u.role === 'admin'
      ? {
          pinned: {
            equals: true,
          },
        }
      : {
          and: [
            {
              owner: {
                equals: u.id,
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

  return (
    <main className="p-6 space-y-6">
      <header className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <MonitorCheck className="h-6 w-6 text-pink-500" />
          <h1 className="text-2xl font-semibold">Desktop</h1>
        </div>

        <div className="flex items-center gap-3">
          {isParentMode ? (
            <form action={switchToChildModeAction}>
              <Button variant="outline" size="sm">
                Lapse vaade
              </Button>
            </form>
          ) : (
            <ParentUnlockDialog hasPin={Boolean(u.parentPinHash)} />
          )}
        </div>
      </header>

      {apps.length === 0 ? (
        <p className="text-muted-foreground">Sul pole veel rakendusi.</p>
      ) : (
        <SortableApps
          apps={apps}
          // canManage = ainult parent mode
          canManage={isParentMode}
          isAdmin={u.role === 'admin'}
          onReorder={reorderApps}
          // NB: unpinAction ikka sinu olemasolev server action DesktopPage'st
          // kui tahad, võime selle ka eraldi actions-faili tõsta
          unpinAction={async (formData: FormData) => {
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

            await payload.update({
              collection: 'apps',
              id: appId,
              data: {
                pinned: false,
              },
            })

            redirect('/desktop')
          }}
        />
      )}
    </main>
  )
}
