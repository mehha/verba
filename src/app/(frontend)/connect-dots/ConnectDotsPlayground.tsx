'use client'

import React, { useMemo, useState } from 'react'
import { ConnectDotsBoard } from './ConnectDotsBoard'
import type { DotPuzzle } from './puzzles'
import { Label } from '@/components/ui/label'
import { cn } from '@/utilities/ui'

type Props = {
  puzzles: DotPuzzle[]
}

export function ConnectDotsPlayground({ puzzles }: Props) {
  const [selectedId, setSelectedId] = useState<string>(puzzles[0]?.id ?? '')

  const selected = useMemo(() => puzzles.find((p) => p.id === selectedId) || puzzles[0], [puzzles, selectedId])

  if (!selected) return null

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
        <div className="space-y-1">
          <Label htmlFor="puzzle">Vali pilt</Label>
          <select
            id="puzzle"
            className={cn(
              'w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
            )}
            value={selected.id}
            onChange={(e) => setSelectedId(e.target.value)}
          >
            {puzzles.map((puzzle) => (
              <option key={puzzle.id} value={puzzle.id}>
                {puzzle.name} ({puzzle.points.length} punkti)
              </option>
            ))}
          </select>
        </div>
        <div className="text-sm text-muted-foreground">
          {selected.description ?? 'Ühenda punktid järjekorras, et kujund ilmuks.'}
        </div>
      </div>

      <ConnectDotsBoard key={selected.id} puzzle={selected} />
    </div>
  )
}
