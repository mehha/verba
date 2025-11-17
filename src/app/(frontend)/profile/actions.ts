// src/app/(frontend)/profile/actions.ts
'use server'

import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import bcrypt from 'bcryptjs'
import { getCurrentUser } from '@/utilities/getCurrentUser'

type PinState = {
  success: boolean
  error?: string
}

export async function updatePinAction(
  _prevState: PinState,
  formData: FormData,
): Promise<PinState> {
  const rawPin = formData.get('pin')?.toString() ?? ''

  const { user, payload } = await getCurrentUser()
  if (!user) {
    redirect('/admin')
  }

  if (!/^\d{4}$/.test(rawPin)) {
    return { success: false, error: 'PIN peab olema 4 numbrit.' }
  }

  const hash = await bcrypt.hash(rawPin, 10)

  await payload.update({
    collection: 'users',
    id: user.id,
    data: {
      parentPinHash: hash,
      pinUpdatedAt: new Date().toISOString(),
    },
  })

  return { success: true }
}

// NB: vormi actionina kasutatav server action – EI mingit inline "use server"
export async function clearPinAction(_formData: FormData) {
  const { user, payload } = await getCurrentUser()
  if (!user) {
    redirect('/admin')
  }

  await payload.update({
    collection: 'users',
    id: user.id,
    data: {
      parentPinHash: null,
      pinUpdatedAt: null,
    },
  })

  // uiMode tagasi child'iks
  const cookieStore = await cookies()
  cookieStore.set('uiMode', 'child', {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24,
  })

  // lihtne refresh profiilile
  redirect('/profile')
}
