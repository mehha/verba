import { redirect } from 'next/navigation'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { headers } from 'next/headers'
import type { Board, User } from '@/payload-types'
import { SortableBoards } from './SortableBoards'
import { reorderBoards } from './reorderBoards'
import { MonitorCheck } from 'lucide-react'
import { isParentModeUtil } from '@/utilities/uiMode'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const payload = await getPayload({ config: configPromise })
  const requestHeaders = await headers()

  const { user } = await payload.auth({ headers: requestHeaders })

  if (!user) {
    redirect('/login')
  }

  const isParentMode = await isParentModeUtil()
  const u = user as User

  const boardsRes = await payload.find({
    collection: 'boards',
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

  const boards = boardsRes.docs as Board[]

  return (
    <main className="p-6 space-y-6">
      <header className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <MonitorCheck className="h-6 w-6 text-pink-500" />
          <h1 className="text-2xl font-semibold">Kodu</h1>
        </div>
      </header>

      {boards.length === 0 ? (
        <p className="text-muted-foreground">Sul pole veel midagi lisatud kodu vaatesse.</p>
      ) : (
        <SortableBoards
          boards={boards}
          // canManage = ainult parent mode
          canManage={isParentMode}
          isAdmin={u.role === 'admin'}
          onReorder={reorderBoards}
          // NB: unpinAction ikka sinu olemasolev server action koduvaates
          // kui tahad, võime selle ka eraldi actions-faili tõsta
          unpinAction={async (formData: FormData) => {
            'use server'

            const boardId = formData.get('boardId') as string | null
            if (!boardId) {
              redirect('/home')
            }

            const payload = await getPayload({ config: configPromise })
            const requestHeaders = await headers()
            const { user } = await payload.auth({ headers: requestHeaders })

            if (!user) {
              redirect('/admin')
            }

            await payload.update({
              collection: 'boards',
              id: boardId,
              data: {
                pinned: false,
              },
            })

            redirect('/home')
          }}
        />
      )}
    </main>
  )
}
