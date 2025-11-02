// src/components/Runner.tsx
'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import type { App, Media } from '@/payload-types'
import { speakET, speakText } from '@/utilities/speak'

type RunnerProps = {
  app: App
}

export default function Runner({ app }: RunnerProps) {
  const [sequence, setSequence] = useState<string[]>([])

  const cells = app.grid?.cells ?? []

  const actionBarEnabled = app.actionBar?.enabled !== false

  const handleCellClick = (cell: any) => {
    if (!cell) return

    if (cell.audio && typeof cell.audio === 'string') {
      const audio = new Audio(cell.audio)
      audio.play().catch(() => {
        if (cell.title) speakText(cell.title)
      })
    } else if (cell.title) {
      speakET(cell.title)
    }

    // only collect if action bar is ON
    if (actionBarEnabled && cell.title) {
      setSequence((prev) => [...prev, cell.title as string])
    }
  }

  const handlePlayAll = () => {
    if (!sequence.length) return
    const items = [...sequence]
    const sayNext = () => {
      const text = items.shift()
      if (!text) return
      const u = new SpeechSynthesisUtterance(text)
      u.onend = sayNext
      window.speechSynthesis.speak(u)
    }
    sayNext()
  }

  const handleClear = () => setSequence([])

  const renderCellImage = (cell: any) => {
    const src =
      cell?.externalImageURL ||
      (cell?.image &&
        typeof cell.image === 'object' &&
        (cell.image as Media).url) ||
      ''
    if (!src) return null
    return (
      <div className="relative w-full h-full overflow-hidden">
        <Image
          src={src}
          alt={cell.title ?? ''}
          fill
          sizes="(max-width: 768px) 100vw, 1200px"
          className="object-contain"
        />
      </div>
    )
  }

  // show bar if it's enabled OR we have something already
  const shouldShowActionBar = actionBarEnabled || sequence.length > 0

  return (
    <div className="p-6 space-y-4 flex-1">
      <div className="flex justify-end mb-2">
        <Link
          href={`/app/${app.id}/edit`}
          className="rounded px-3 py-1 text-sm bg-slate-900 text-white hover:bg-slate-700"
        >
          Edit
        </Link>
      </div>

      {shouldShowActionBar && (
        <div className="rounded border p-3 flex items-center gap-3 bg-slate-50">
          <div className="flex-1 text-sm text-slate-700 min-h-[1.5rem]">
            {sequence.length ? sequence.join(' ') : '—'}
          </div>

          <div className="flex gap-2">
            <button
              onClick={handlePlayAll}
              disabled={!sequence.length}
              className={`rounded px-3 py-1 text-sm ${
                sequence.length
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-400 cursor-not-allowed'
              }`}
            >
              Play all
            </button>
            <button
              onClick={handleClear}
              disabled={!sequence.length}
              className={`rounded px-3 py-1 text-sm ${
                sequence.length
                  ? 'bg-slate-200'
                  : 'bg-slate-100 text-slate-400 cursor-not-allowed'
              }`}
            >
              Clear
            </button>
          </div>
        </div>
      )}

      <div
        className="grid gap-3 h-full flex-1"
        style={{
          gridTemplateColumns: `repeat(${app.grid?.cols ?? 6}, minmax(0, 1fr))`,
        }}
      >
        {cells.map((cell) => (
          <button
            key={cell.id}
            onClick={() => handleCellClick(cell)}
            className="border rounded flex flex-col bg-white hover:bg-slate-50 text-left min-h-[200px] relative"
            style={{
              gridColumn: `span ${cell.w ?? 1}`,
              gridRow: `span ${cell.h ?? 1}`,
            }}
          >
            {renderCellImage(cell)}
            {cell.title && (
              <div className="absolute w-full bottom-0 left-0 p-1 bg-slate-800/65 text-white text-center">
                <div className="text-lg uppercase break-words leading-4">
                  {cell.title}
                </div>
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  )
}
