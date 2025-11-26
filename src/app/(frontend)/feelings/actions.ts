'use server'

import { getCurrentUser } from '@/utilities/getCurrentUser'
import { FEELINGS, type FeelingValue } from './feelingsData'

const ALLOWED: FeelingValue[] = FEELINGS.map((f) => f.value)

export type LogFeelingState = {
  success: boolean
  error?: string
  lastFeeling?: string
  lastFeelingAt?: string
}

export async function logFeelingAction(
  _prevState: LogFeelingState,
  formData: FormData,
): Promise<LogFeelingState> {
  const feelingRaw = formData.get('feeling')

  if (typeof feelingRaw !== 'string' || !ALLOWED.includes(feelingRaw as FeelingValue)) {
    return { success: false, error: 'Vali sobiv emotsioon.' }
  }

  const feeling = feelingRaw as FeelingValue

  const { payload, user } = await getCurrentUser()

  if (!user) {
    return { success: false, error: 'Pole sisse logitud.' }
  }

  const timestamp = new Date().toISOString()

  try {
    await payload.update({
      collection: 'users',
      id: user.id,
      data: {
        lastFeeling: feeling,
        lastFeelingAt: timestamp,
      },
    })
  } catch (err) {
    console.error('Unable to save feeling', err)
    return { success: false, error: 'Salvestamine ebaõnnestus.' }
  }

  return { success: true, lastFeeling: feeling, lastFeelingAt: timestamp }
}
