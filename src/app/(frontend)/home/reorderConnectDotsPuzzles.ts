'use server'

import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { getPayload } from 'payload'
import configPromise from '@payload-config'

export async function reorderConnectDotsPuzzles(puzzleIds: string[]) {
  const payload = await getPayload({ config: configPromise })
  const requestHeaders = await headers()
  const { user } = await payload.auth({ headers: requestHeaders })

  if (!user) {
    redirect('/admin')
  }

  await Promise.all(
    puzzleIds.map((id, index) =>
      payload.update({
        collection: 'connect-dots-puzzles',
        id,
        data: {
          order: index + 1,
        },
      }),
    ),
  )
}
