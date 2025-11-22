// src/app/(frontend)/boards/page.tsx
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import type { Board } from '@/payload-types'
import { BoardsList } from './BoardsList'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

export const dynamic = 'force-dynamic'

export default async function BoardsPage() {
  const payload = await getPayload({ config: configPromise })
  const requestHeaders = await headers()

  const { user } = await payload.auth({ headers: requestHeaders })
  if (!user) redirect('/admin')

  const isAdmin = user.role === 'admin'

  const boardsRes = await payload.find({
    collection: 'boards',
    where: isAdmin
      ? {} // admin näeb kõiki tahvleid
      : {
          owner: { equals: user.id },
        },
    sort: 'createdAt',
    depth: 1,
  })

  const boards = boardsRes.docs as Board[]

  // --- server actions ---

  async function createBoard(formData: FormData) {
    'use server'

    const payload = await getPayload({ config: configPromise })
    const requestHeaders = await headers()
    const { user } = await payload.auth({ headers: requestHeaders })
    if (!user) redirect('/admin')

    const name = (formData.get('name') as string) || 'Uus tahvel'

    await payload.create({
      collection: 'boards',
      data: {
        name,
        owner: user.id,
        grid: { cols: 6, rows: 8, cells: [] },
        pinned: false, // vaikimisi mitte koduvaates
      },
    })

    redirect('/boards')
  }

  async function togglePinned(formData: FormData) {
    'use server'

    const boardId = formData.get('boardId') as string
    const pinned = formData.get('pinned') === 'true'

    const payload = await getPayload({ config: configPromise })
    const requestHeaders = await headers()
    const { user } = await payload.auth({ headers: requestHeaders })
    if (!user) redirect('/admin')

    await payload.update({
      collection: 'boards',
      id: boardId,
      data: { pinned },
    })

    redirect('/boards')
  }

  async function deleteBoard(formData: FormData) {
    'use server'

    const boardId = formData.get('boardId')

    if (!boardId || typeof boardId !== 'string') {
      console.error('Missing boardId in deleteBoard', boardId)
      throw new Error('boardId puudub FormData-st')
    }

    const payload = await getPayload({ config: configPromise })
    const requestHeaders = await headers()
    const { user } = await payload.auth({ headers: requestHeaders })
    if (!user) redirect('/admin')

    await payload.delete({ collection: 'boards', id: boardId })

    redirect('/boards')
  }

  return (
    <main className="container space-y-6">
      <header className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold">Kõik tahvlid</h1>

        <form action={createBoard} className="flex gap-2">
          <div className="">
            <Label htmlFor="name" className="sr-only">
              Uue tahvli nimi
            </Label>
            <Input
              id="name"
              name="name"
              placeholder="Uue tahvli nimi"
            />
          </div>

          <Button type="submit">
            Lisa uus tahvel
          </Button>
        </form>
      </header>

      <BoardsList
        boards={boards}
        isAdmin={isAdmin}
        togglePinned={togglePinned}
        deleteBoard={deleteBoard}
      />
    </main>
  )
}
