// src/components/Runner.tsx
'use client'

import { useState } from 'react'
import type { App } from '@/payload-types'

type RunnerProps = {
  app: App
}

export default function Runner({ app }: RunnerProps) {
  const [sequence, setSequence] = useState<string[]>([])

  const cells = app.grid?.cells ?? []
  const actionCell = cells.find((c) => c.locked) // our ensureActionCell makes this exist
  const regularCells = cells.filter((c) => !c.locked)

  const speak = (text: string) => {
    if (typeof window === 'undefined') return
    const u = new SpeechSynthesisUtterance(text)
    window.speechSynthesis.speak(u)
  }

  const handleCellClick = (cell: any) => {
    if (!cell?.title) return
    speak(cell.title)
    setSequence((prev) => [...prev, cell.title!])
  }

  const handlePlayAll = () => {
    const items = [...sequence]
    if (!items.length) return
    const sayNext = () => {
      const text = items.shift()
      if (!text) return
      const u = new SpeechSynthesisUtterance(text)
      u.onend = sayNext
      window.speechSynthesis.speak(u)
    }
    sayNext()
  }

  return (
    <div className="space-y-4">
      {/* Action cell */}
      <div className="rounded border p-3 flex items-center gap-3 bg-slate-50">
        <div className="font-medium">{actionCell?.title ?? 'Action'}</div>
        <div className="flex-1 text-sm text-slate-700">
          {sequence.length ? sequence.join(' ') : '—'}
        </div>
        <button
          onClick={handlePlayAll}
          className="rounded bg-blue-600 text-white text-sm px-3 py-1"
        >
          Play all
        </button>
      </div>

      {/* simple grid for now */}
      <div
        className="grid gap-3"
        style={{
          gridTemplateColumns: `repeat(${app.grid?.cols ?? 6}, minmax(0, 1fr))`,
        }}
      >
        {regularCells.map((cell) => (
          <button
            key={cell.id}
            onClick={() => handleCellClick(cell)}
            className="border rounded p-2 flex flex-col gap-2 bg-white hover:bg-slate-50 text-left"
            style={{ gridColumn: `span ${cell.w}`, gridRow: `span ${cell.h}` }}
          >
            {cell.image && typeof cell.image === 'object' && 'url' in cell.image ? (
              <img src={cell.image.url as string} alt={cell.title ?? ''} className="w-full h-20 object-cover rounded" />
            ) : null}
            <span className="text-sm font-medium">{cell.title ?? '—'}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
