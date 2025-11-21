// src/app/(frontend)/app/[id]/Runner.tsx
'use client'

import { useState, useMemo } from 'react'
import Image from 'next/image'
import type { App, Media } from '@/payload-types'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Sparkles, Slash } from 'lucide-react'
import RGL, { WidthProvider, type Layout } from 'react-grid-layout'
import 'react-grid-layout/css/styles.css'
import 'react-resizable/css/styles.css'

// UUS: sõnaühendite util
import { applyCompounds, type SelectedToken } from './compounds/applyCompounds'
import { getCompoundFormForLastToken } from '@/app/(frontend)/app/[id]/compounds/getCompoundFormForLastToken'

const ReactGridLayout = WidthProvider(RGL)

type RunnerProps = { app: App, isParentMode: boolean }

type SequenceItem = {
  cellId: string
  text: string
}

// Väike abifunktsioon prosody parandamiseks
function prepareForTTS(text: string): string {
  const trimmed = text.trim()
  if (!trimmed) return trimmed
  if (/[.!?]$/.test(trimmed)) return trimmed
  return `${trimmed}.`
}

async function playTTS(text: string) {
  const res = await fetch('/next/tts-tartu', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      text: prepareForTTS(text),
      speaker: 'mari', // eeldusel, et see on config.yaml-is olemas
      speed: 1,
    }),
  })

  if (!res.ok) return

  const blob = await res.blob()
  const url = URL.createObjectURL(blob)
  const audio = new Audio(url)

  await audio.play()
  await new Promise<void>((resolve) => {
    audio.onended = () => resolve()
    audio.onerror = () => resolve()
  })
  URL.revokeObjectURL(url)
}

export default function Runner({ app, isParentMode }: RunnerProps) {
  // UUS: hoiame cellId + teksti
  const [sequence, setSequence] = useState<SequenceItem[]>([])
  const [busy, setBusy] = useState(false)
  const [tempLabel, setTempLabel] = useState<{ id: string; text: string } | null>(null)

  const aiAllowed = app.extra?.ai ?? false
  const actionBarEnabled = app.actionBar?.enabled ?? false
  const [aiEnabled, setAiEnabled] = useState<boolean>(aiAllowed)

  const cols = app.grid?.cols ?? 6
  const cells = (app.grid?.cells ?? []).filter((c) => !c.locked)

  const layout: Layout[] = useMemo(
    () =>
      cells.map((c) => ({
        i: String(c.id),
        x: Number(c.x ?? 0),
        y: Number(c.y ?? 0),
        w: Number(c.w ?? 1),
        h: Number(c.h ?? 1),
        static: true,
      })),
    [cells],
  )

  const tokens: SelectedToken[] = useMemo(
    () =>
      sequence.map((item) => ({
        id: item.cellId,
        text: item.text,
      })),
    [sequence],
  )

  const compoundsResult = useMemo(() => {
    // AI sees: compounds ei kasutata, lihtsalt toores jada
    if (aiEnabled) {
      const base = tokens.map((t) => t.text).join(' ')
      return { display: base, tts: base }
    }

    // AI väljas: rakenda compounds
    return applyCompounds(tokens, app.compounds)
  }, [tokens, app.compounds, aiEnabled])

  const phrase = compoundsResult.display
  const ttsAll = compoundsResult.tts

  const handleCellClick = async (cell: any) => {
    const raw = cell?.title?.toString().trim()
    if (!raw) return

    setBusy(true)
    try {
      let surface = raw

      // AI korrigeerib ainult seda uut tokenit
      if (aiEnabled && sequence.length > 0) {
        try {
          const mr = await fetch('/next/groq', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contextTail: sequence.slice(-2).map((s) => s.text),
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

      // 1) Ehita nextSequence
      const nextSequence: SequenceItem[] = [...sequence, { cellId: String(cell.id), text: surface }]

      // 2) Teisenda SelectedTokeniteks
      const nextTokens: SelectedToken[] = nextSequence.map((item) => ({
        id: item.cellId,
        text: item.text,
      }))

      // 3) Kui AI on väljas, proovi compounds; kui AI sees, ära kasuta compounds
      const compoundForm = !aiEnabled
        ? getCompoundFormForLastToken(nextTokens, app.compounds)
        : null

      const spoken = compoundForm ? compoundForm.tts : surface

      // 4) Uuenda jada state
      setSequence(nextSequence)

      setTempLabel({ id: String(cell.id), text: spoken })

      // 5) Loeme ainult selle sõna vormi
      await playTTS(spoken)
    } finally {
      setBusy(false)
    }
  }

  const handlePlayAll = async () => {
    if (!sequence.length) return
    setBusy(true)
    try {
      // Sõnaühendite järgi kombineeritud fraas
      await playTTS(ttsAll)
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
    <div>
      <div className="container">
        <div className="mb-10 flex justify-between gap-2">
          <h1 className="text-center text-3xl font-semibold">{app.name}</h1>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              size="sm"
              roundness="2xl"
              variant={aiEnabled ? 'positive' : 'muted'}
              onClick={() => setAiEnabled((v) => !v)}
              aria-pressed={aiEnabled}
              title={aiEnabled ? 'AI on: parandab sõna kuju' : 'AI off: loeb täpselt valitud sõna'}
              className="inline-flex items-center gap-2"
            >
              {aiEnabled ? <Sparkles size={16} /> : <Slash size={16} />}
              {aiEnabled ? 'AI: sees' : 'AI: väljas'}
            </Button>

            {isParentMode &&
              <Link href={`/app/${app.id}/edit`}>
                <Button variant="default" roundness="2xl" size="sm">
                  Muuda
                </Button>
              </Link>
            }
          </div>
        </div>

        {actionBarEnabled && (
          <div className="mb-14 mx-auto flex max-w-[800px] items-center gap-3 rounded-full border bg-white ps-6 pe-2 py-2 shadow-lg ring-1 ring-gray-900/5">
            <div className="flex-1 h-full text-xl font-semibold uppercase text-slate-900">
              {sequence.length ? phrase : ''}
            </div>
            <div className="flex gap-2">
              <Button
                variant={sequence.length && !busy ? 'default' : 'muted'}
                disabled={!sequence.length || busy}
                onClick={handlePlayAll}
                roundness="2xl"
              >
                {busy ? 'Kuulan…' : 'Kuula'}
              </Button>
              <Button
                variant={sequence.length && !busy ? 'secondary' : 'muted'}
                disabled={!sequence.length || busy}
                onClick={handleClear}
                roundness="2xl"
              >
                Kustuta
              </Button>
            </div>
          </div>
        )}
      </div>

      <ReactGridLayout
        className="layout"
        cols={cols}
        rowHeight={200}
        width={1200}
        isResizable={false}
        isDraggable={false}
        margin={[16, 16]}
        compactType={null}
        preventCollision
        layout={layout}
      >
        {cells.map((cell) => {
          const cellIdString = String(cell.id)

          // UUS: Kontrollime, kas sellele kaardile on määratud ajutine tekst
          const isOverridden = tempLabel?.id === cellIdString
          const titleToShow = isOverridden && tempLabel ? tempLabel.text : cell.title

          return (
            <div
              key={cellIdString}
              className="relative flex aspect-[4/3] flex-col gap-1 overflow-hidden rounded-xl border bg-white p-0 shadow-lg ring-1 ring-gray-900/5"
            >
              {renderCellImage(cell)}

              {/* Muutsime tingimust, et kuvada titleToShow */}
              {titleToShow && (
                <div
                  className={`pointer-events-none absolute bottom-0 left-0 w-full p-2 text-center text-white transition-colors duration-200 ${
                    isOverridden ? 'bg-blue-600/90' : 'bg-slate-800/85'
                  }`}
                >
                  <div className="break-words text-2xl uppercase leading-4">{titleToShow}</div>
                </div>
              )}

              <button
                type="button"
                onClick={() => void handleCellClick(cell)}
                disabled={busy}
                className="absolute inset-0"
                aria-label={titleToShow ?? 'valik'}
              />
            </div>
          )
        })}
      </ReactGridLayout>
    </div>
  )
}
