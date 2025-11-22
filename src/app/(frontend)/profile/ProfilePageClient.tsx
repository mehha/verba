// src/app/(frontend)/profile/ProfilePageClient.tsx
'use client'

import { useActionState, useState } from 'react'
import { updatePinAction, clearPinAction } from './actions'
import { Button } from '@/components/ui/button'
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from '@/components/ui/input-otp'
import { Label } from '@/components/ui/label'
import { cn } from '@/utilities/ui'

const initialState = {
  success: false,
  error: undefined as string | undefined,
}

type Props = {
  hasPin: boolean
}

export function ProfilePageClient({ hasPin: initialHasPin }: Props) {
  const [pin, setPin] = useState('')
  const [state, formAction] = useActionState(updatePinAction, initialState)

  // derived staatus: kui server action õnnestus, eelda et PIN on nüüd olemas
  const effectiveHasPin =
    initialHasPin || (state.success && !state.error)

  return (
    <section className="rounded-2xl border bg-card p-6 space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-medium">Vanema PIN</h2>
          <p className="text-sm text-muted-foreground">
            PIN-i kasutatakse vanema vaate avamiseks koduvaates.
          </p>
          <p className="mt-2 text-sm">
            Staatus:{' '}
            <span
              className={cn(
                'font-medium',
                effectiveHasPin ? 'text-emerald-600' : 'text-muted-foreground',
              )}
            >
              {effectiveHasPin
                ? 'PIN on seadistatud'
                : 'PIN ei ole seadistatud'}
            </span>
          </p>
        </div>
      </div>

      {/* PIN seadmine / uuendamine – üks form */}
      <form action={formAction} className="space-y-4">
        <div className="space-y-2">
          <Label>Uus PIN (4 numbrit)</Label>
          <InputOTP
            maxLength={4}
            value={pin}
            onChange={setPin}
            containerClassName="justify-start"
          >
            <InputOTPGroup>
              <InputOTPSlot index={0} />
              <InputOTPSlot index={1} />
              <InputOTPSlot index={2} />
              <InputOTPSlot index={3} />
            </InputOTPGroup>
          </InputOTP>

          {/* saadame PIN-i FormData-s kaasa */}
          <input type="hidden" name="pin" value={pin} />
        </div>

        {state.error && (
          <p className="text-sm text-red-500">{state.error}</p>
        )}
        {state.success && !state.error && (
          <p className="text-sm text-emerald-600">PIN salvestatud.</p>
        )}

        <Button type="submit" disabled={pin.length !== 4}>
          {effectiveHasPin ? 'Uuenda PIN' : 'Sea PIN'}
        </Button>
      </form>

      {/* PIN eemaldamine – eraldi form, mitte form-i sees, ja EI mingit inline "use server" */}
      {effectiveHasPin && (
        <form action={clearPinAction}>
          <Button type="submit" variant="outline">
            Eemalda PIN
          </Button>
        </form>
      )}
    </section>
  )
}
