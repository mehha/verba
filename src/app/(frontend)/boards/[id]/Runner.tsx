// src/app/(frontend)/boards/[id]/Runner.tsx
'use client'

import { useState, useMemo, useEffect, useRef } from 'react'
import Image from 'next/image'
import type { Board, Media } from '@/payload-types'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Sparkles, Slash, WholeWord, Trash, Undo2, Volume2Icon, Edit3 } from 'lucide-react'
import RGL, { WidthProvider, type Layout } from 'react-grid-layout'
import 'react-grid-layout/css/styles.css'
import 'react-resizable/css/styles.css'

// UUS: sõnaühendite util
import { applyCompounds, Compound, type SelectedToken } from './compounds/applyCompounds'
import { getCompoundFormForLastToken } from './compounds/getCompoundFormForLastToken'
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip'
import { AnimatedVolumeIcon } from '@/components/Animations/AnimatedVolumeIcon'

const ReactGridLayout = WidthProvider(RGL)

type RunnerProps = { board: Board; isParentMode: boolean }

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

export default function Runner({ board, isParentMode }: RunnerProps) {
  // UUS: hoiame cellId + teksti
  const [sequence, setSequence] = useState<SequenceItem[]>([])
  const [busy, setBusy] = useState(false)
  const [tempLabel, setTempLabel] = useState<{ id: string; text: string } | null>(null)

  const aiAllowed = board.extra?.ai ?? false
  const actionBarEnabled = board.actionBar?.enabled ?? false
  const [aiEnabled, setAiEnabled] = useState<boolean>(aiAllowed)
  const scrollContainerRef = useRef<HTMLDivElement | null>(null)

  const cols = board.grid?.cols ?? 6
  const cells = (board.grid?.cells ?? []).filter((c) => !c.locked)

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
    return applyCompounds(tokens, board.compounds)
  }, [tokens, board.compounds, aiEnabled])

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
        ? getCompoundFormForLastToken(nextTokens, board.compounds)
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

  const handleClear = () => {
    setSequence([])
    setTempLabel(null)
  }

  const handleUndoLast = () => {
    if (!sequence.length || busy) return

    setSequence((prev) => {
      const next = prev.slice(0, -1)
      const removed = prev[prev.length - 1]

      // kui viimane tempLabel oli selle celli küljes, nulli see
      if (removed) {
        setTempLabel((current) =>
          current && current.id === removed.cellId ? null : current,
        )
      }

      return next
    })
  }

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
          priority={false}
        />
      </div>
    )
  }

  const compounds = (board.compounds ?? []) as Compound[]

  const sequenceCells = useMemo(
    () =>
      sequence.map((item) => ({
        ...item,
        cell: cells.find((c) => String(c.id) === item.cellId) ?? null,
      })),
    [sequence, cells],
  )

  useEffect(() => {
    const el = scrollContainerRef.current
    if (!el) return

    el.scrollTo({
      left: el.scrollWidth,
      behavior: 'smooth',
    })
  }, [sequenceCells.length])

  return (
    <div>
      <div className="container">
        <TooltipProvider>
          <div className="mb-10 flex items-center justify-between gap-4 lg:gap-10">
            <h1 className="text-center text-3xl font-semibold sr-only">{board.name}</h1>

            {actionBarEnabled && (
              <div className="flex flex-1 min-h-[122px] items-center gap-3 rounded-3xl border bg-white ps-6 pe-2 py-2 shadow-lg ring-1 ring-gray-900/5">
                <div ref={scrollContainerRef} className="flex-1 flex items-center gap-2 overflow-x-auto py-1">
                  {sequenceCells.length === 0 ? (
                    <span className="text-sm text-slate-400">
                      Vali pilte, et fraasi koostada
                    </span>
                  ) : (
                    sequenceCells.map(({ cellId, cell, text }, index) => {
                      const src =
                        cell?.externalImageURL ||
                        (cell?.image &&
                          typeof cell.image === 'object' &&
                          (cell.image as Media).url) ||
                        ''

                      return (
                        <div
                          key={`${cellId}-${index}`}
                          className="relative h-24 w-24 shrink-0 overflow-hidden rounded-lg bg-white"
                        >
                          {src ? (
                            <>
                              <Image
                                src={src}
                                alt={cell?.title ?? text}
                                fill
                                sizes="96px"
                                className="object-contain"
                                priority={false}
                              />
                              {/* a11y: tekst ekraanilugejale */}
                              <span className="sr-only">{text}</span>
                            </>
                          ) : (
                            <div className="flex h-full w-full items-center justify-center px-1 text-center text-[10px] font-semibold uppercase leading-tight">
                              {text}
                            </div>
                          )}
                        </div>
                      )
                    })
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={handlePlayAll}
                    roundness="full"
                    size="icon"
                  >
                    {busy ? (
                      <span className="inline-flex items-center gap-2">
                        <AnimatedVolumeIcon busy className="h-6 w-6" />
                      </span>
                    ) : (
                      <Volume2Icon className="h-6 w-6" />
                    )}
                  </Button>
                  <Button
                    variant={sequence.length && !busy ? 'secondary' : 'muted'}
                    size="icon"
                    disabled={!sequence.length || busy}
                    onClick={handleUndoLast}
                    roundness="full"
                  >
                    <Undo2 className="h-6 w-6" />
                  </Button>
                  <Button
                    variant={sequence.length && !busy ? 'destructive' : 'muted'}
                    size="icon"
                    disabled={!sequence.length || busy}
                    onClick={handleClear}
                    roundness="full"
                  >
                    <Trash className="h-6 w-6" />
                  </Button>
                </div>
              </div>
            )}

            <div className="flex items-end flex-col gap-2">
              <Button
                type="button"
                size="sm"
                roundness="2xl"
                variant={aiEnabled ? 'positive' : 'muted'}
                onClick={() => setAiEnabled((v) => !v)}
                aria-pressed={aiEnabled}
                title={
                  aiEnabled ? 'AI on: parandab sõna kuju' : 'AI off: loeb täpselt valitud sõna'
                }
                className="inline-flex items-center gap-2"
              >
                {aiEnabled ? <Sparkles size={16} /> : <Slash size={16} />}
                {aiEnabled ? 'AI: sees' : 'AI: väljas'}
              </Button>

              {/* Halda sõnaühendeid + tooltip */}
              <Tooltip>
                <TooltipTrigger asChild>
                  {isParentMode ? (
                    <Button variant="secondary" size="sm" asChild>
                      <Link href={`/boards/${board.id}/compounds`}>
                        <WholeWord className="mr-2 h-5 w-5 text-pink-600" />
                        Halda sõnaühendeid
                      </Link>
                    </Button>
                  ) : (
                    <Button variant="secondary" size="sm">
                      <WholeWord className="h-5 w-5" />
                      <span className="sr-only">Sõnaühendite haldus</span>
                    </Button>
                  )}
                </TooltipTrigger>
                <TooltipContent className="max-w-sm">
                  {compounds.length === 0 ? (
                    <p className="text-xs text-muted-foreground">Sõnaühendeid pole veel lisatud.</p>
                  ) : (
                    <div className="max-h-[260px] space-y-2 overflow-y-auto text-xs">
                      {compounds.map((compound) => {
                        const surfaces = compound.parts?.map((p) => p.surface).join(' ') ?? ''

                        return (
                          <div key={compound.id} className="rounded border bg-muted/40 px-2 py-1">
                            <div className="font-medium">{surfaces || '—'}</div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </TooltipContent>
              </Tooltip>

              {isParentMode && (
                <Link href={`/boards/${board.id}/edit`}>
                  <Button variant="secondary" roundness="full" size="icon">
                    <Edit3 className="h-5 w-5" />
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </TooltipProvider>
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
