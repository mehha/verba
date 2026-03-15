import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { ConnectDotsManagerList, type ConnectDotsManagerPuzzle } from '@/components/ConnectDots/ConnectDotsManagerList'
import { getCurrentUser } from '@/utilities/getCurrentUser'
import { requireActiveMembership } from '@/utilities/membership'
import { requireParentMode } from '@/utilities/uiMode'

export const dynamic = 'force-dynamic'

export default async function ConnectDotsManagePage() {
  await requireParentMode()

  const { payload, user } = await getCurrentUser()
  if (!user) {
    redirect('/login')
  }
  requireActiveMembership(user)

  const isAdmin = user.role === 'admin'

  const result = await payload.find({
    collection: 'connect-dots-puzzles',
    depth: 1,
    overrideAccess: false,
    sort: 'updatedAt',
    user,
    where: isAdmin
      ? {}
      : {
          owner: {
            equals: user.id,
          },
        },
  })

  const puzzles = result.docs as unknown as ConnectDotsManagerPuzzle[]

  async function deletePuzzle(formData: FormData) {
    'use server'

    await requireParentMode()

    const { payload, user } = await getCurrentUser()
    if (!user) {
      redirect('/login')
    }
    requireActiveMembership(user)

    const puzzleId = formData.get('puzzleId')
    if (!puzzleId || typeof puzzleId !== 'string') {
      throw new Error('Puzzle id puudub.')
    }

    await payload.delete({
      collection: 'connect-dots-puzzles',
      id: puzzleId,
      overrideAccess: false,
      user,
    })

    revalidatePath('/connect-dots')
    revalidatePath('/connect-dots/manage')
  }

  return (
    <main className="container space-y-6 py-6">
      <ConnectDotsManagerList deletePuzzle={deletePuzzle} isAdmin={isAdmin} puzzles={puzzles} />
    </main>
  )
}
