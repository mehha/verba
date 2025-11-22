'use server'

import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { getPayload } from 'payload'
import configPromise from '@payload-config'

export async function reorderBoards(boardIds: string[]) {
  const payload = await getPayload({ config: configPromise })
  const requestHeaders = await headers()
  const { user } = await payload.auth({ headers: requestHeaders })

  if (!user) {
    redirect('/admin')
  }

  // Kirjuta uued order väärtused järjest (1, 2, 3, ...)
  await Promise.all(
    boardIds.map((id, index) =>
      payload.update({
        collection: 'boards',
        id,
        data: {
          order: index + 1,
        },
      }),
    ),
  )
}
