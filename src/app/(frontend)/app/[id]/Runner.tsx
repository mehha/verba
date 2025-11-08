// src/app/(frontend)/app/[id]/Runner.tsx
'use client'

import { useState, useMemo } from 'react'
import Image from 'next/image'
import type { App, Media } from '@/payload-types'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Sparkles, Slash } from 'lucide-react'

// ✅ use the same lib as editor
import RGL, { WidthProvider, type Layout } from 'react-grid-layout'
import 'react-grid-layout/css/styles.css'
import 'react-resizable/css/styles.css'
const ReactGridLayout = WidthProvider(RGL)

type RunnerProps = { app: App }

export default function Runner({ app }: RunnerProps) {
  const [sequence, setSequence] = useState<string[]>([])
  const [busy, setBusy] = useState(false)
  const [aiEnabled, setAiEnabled] = useState(true)

  const cols = app.grid?.cols ?? 6
  const cells = (app.grid?.cells ?? []).filter((c) => !c.locked)

  // Build the SAME layout {x,y,w,h,i} that editor uses
  const layout: Layout[] = useMemo(
    () =>
      cells.map((c) => ({
        i: String(c.id),
        x: Number(c.x ?? 0),
        y: Number(c.y ?? 0),
        w: Number(c.w ?? 1),
        h: Number(c.h ?? 1),
        static: true, // read-only
      })),
    [cells]
  )

  const handleCellClick = async (cell: any) => {
    const raw = cell?.title?.toString().trim()
    if (!raw) return
    setBusy(true)
    try {
      let surface = raw

      if (aiEnabled && sequence.length > 0) {
        try {
          const mr = await fetch('/next/groq', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contextTail: sequence.slice(-2),
              token: raw,
            }),
            signal: AbortSignal.timeout(5000),
          })
          if (mr.ok) {
            const j = await mr.json().catch(() => null)
            if (j && typeof j.surface === 'string' && j.surface.trim()) {
              surface = j.surface.trim()
            }
          }
        } catch {
          surface = raw
        }
      }

      setSequence((prev) => [...prev, surface])

      const tr = await fetch('/next/tts-elg', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: surface, rate: '1.0', voice: 'eki_et_eva.htsvoice' }),
      })
      if (tr.ok) {
        const blob = await tr.blob()
        const url = URL.createObjectURL(blob)
        const audio = new Audio(url)
        await audio.play()
        await new Promise<void>((res) => (audio.onended = () => res()))
        URL.revokeObjectURL(url)
      }
    } finally {
      setBusy(false)
    }
  }

  const handlePlayAll = async () => {
    if (!sequence.length) return
    setBusy(true)
    try {
      const r = await fetch('/next/tts-elg', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: sequence.join(' '), rate: '1.0', voice: 'eki_et_eva.htsvoice' }),
      })
      if (!r.ok) return
      const blob = await r.blob()
      const url = URL.createObjectURL(blob)
      const audio = new Audio(url)
      await audio.play()
      await new Promise<void>((res) => (audio.onended = () => res()))
      URL.revokeObjectURL(url)
    } finally {
      setBusy(false)
    }
  }

  const handleClear = () => setSequence([])

  const renderCellImage = (cell: any) => {
    const src =
      cell?.externalImageURL ||
      (cell?.image && typeof cell.image === 'object' && (cell.image as Media).url) ||
      ''
    if (!src) return null
    return (
      <div className="relative w-full h-full min-h-[4rem]">
        <Image
          src={src}
          alt={cell.title ?? ''}
          fill
          sizes="(max-width: 768px) 100vw, 1200px"
          className="object-contain rounded"
        />
      </div>
    )
  }

  return (
    <div className="px-6 py-16 flex-1">
      <div className="container">
        <div className="flex justify-between gap-2 mb-10">
          <h1 className="text-3xl text-center font-semibold">{app.name}</h1>

          <div className={ "flex items-center gap-2"}>
            <Button
              type="button"
              size="sm"
              variant={aiEnabled ? 'positive' : 'muted'}
              onClick={() => setAiEnabled(v => !v)}
              aria-pressed={aiEnabled}
              title={aiEnabled ? 'AI on: parandab sõna kuju' : 'AI off: loeb täpselt valitud sõna'}
              className="inline-flex items-center gap-2" // spacing for the icon+label
            >
              {aiEnabled ? <Sparkles size={16} /> : <Slash size={16} />}
              {aiEnabled ? 'AI: ON' : 'AI: OFF'}
            </Button>

            <Link href={`/app/${app.id}/edit`}>
              <Button variant="default" size="sm">Muuda</Button>
            </Link>
          </div>
        </div>

        {/* Action bar */}
        <div className="border ps-6 pe-2 py-2 flex items-center gap-3 mx-auto max-w-[800px] mb-14 rounded-full bg-white p-0 shadow-lg ring-1 ring-gray-900/5">
          <div className="flex-1 text-xl text-slate-900 h-full uppercase font-semibold">
            {sequence.length ? sequence.join(' ') : ''}
          </div>
          <div className="flex gap-2">
            <Button
              variant={sequence.length && !busy ? 'default' : 'muted'} // blue when ready
              disabled={!sequence.length || busy}
              onClick={handlePlayAll}
            >
              {busy ? 'Mängin…' : 'Mängi'}
            </Button>

            <Button
              variant={sequence.length && !busy ? 'secondary' : 'muted'} // grey when disabled
              disabled={!sequence.length || busy}
              onClick={handleClear}
            >
              Kustuta
            </Button>
          </div>
        </div>
      </div>

      {/* ✅ EXACT SAME GRID using RGL (read-only) */}
      <ReactGridLayout
        className="layout"
        cols={cols}
        rowHeight={200}        // match editor's rowHeight
        width={1200}           // match editor's fixed width
        isResizable={false}
        isDraggable={false}
        margin={[16, 16]}
        compactType={null}
        preventCollision
        layout={layout}
      >
        {cells.map((cell) => (
          <div key={String(cell.id)} className="border overflow-hidden flex flex-col gap-1 aspect-[4/3] relative rounded-2xl bg-white p-0 shadow-lg ring-1 ring-gray-900/5">
            {renderCellImage(cell)}
            {cell.title && (
              <div className="absolute w-full bottom-0 left-0 p-2 bg-slate-800/85 text-white text-center pointer-events-none">
                <div className="text-2xl uppercase break-words leading-4">
                  {cell.title}
                </div>
              </div>
            )}
            {/* Overlay button to keep click target */}
            <button
              type="button"
              onClick={() => void handleCellClick(cell)}
              disabled={busy}
              className="absolute inset-0"
              aria-label={cell.title ?? 'valik'}
            />
          </div>
        ))}
      </ReactGridLayout>
    </div>
  )
}
