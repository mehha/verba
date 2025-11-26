'use client'

import React, { useMemo, useRef, useState } from 'react'
import { QuickChatButton } from './quickChatData'
import { cn } from '@/utilities/ui'
import { Volume2, Loader2 } from 'lucide-react'

const prepareForTTS = (text: string): string => {
  const trimmed = text.trim()
  if (!trimmed) return trimmed
  if (/[.!?]$/.test(trimmed)) return trimmed
  return `${trimmed}.`
}

const colorClasses: Record<NonNullable<QuickChatButton['color']>, string> = {
  emerald: 'from-emerald-200 to-emerald-400 text-emerald-950',
  rose: 'from-rose-200 to-rose-400 text-rose-950',
  sky: 'from-sky-200 to-sky-400 text-sky-950',
  amber: 'from-amber-200 to-yellow-400 text-amber-950',
  purple: 'from-purple-200 to-fuchsia-400 text-purple-950',
  indigo: 'from-indigo-200 to-indigo-400 text-indigo-950',
  slate: 'from-slate-200 to-slate-400 text-slate-950',
}

type QuickChatBoardProps = {
  buttons: QuickChatButton[]
}

export function QuickChatBoard({ buttons }: QuickChatBoardProps) {
  const [busy, setBusy] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const audioUnlockedRef = useRef(false)

  const activeButtons = useMemo(
    () => buttons.filter((b) => b.enabled !== false),
    [buttons],
  )

  const ensureAudioUnlocked = () => {
    if (!audioRef.current) {
      audioRef.current = new Audio()
      audioRef.current.preload = 'auto'
    }

    if (audioUnlockedRef.current || !audioRef.current) return

    const el = audioRef.current
    try {
      el.src = 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAIlYAAESsAAACABAAZGF0YQAAAAA='
      el.muted = true
      const attempt = el.play()

      if (attempt && typeof attempt.then === 'function') {
        attempt
          .then(() => {
            audioUnlockedRef.current = true
            el.pause()
            el.currentTime = 0
          })
          .catch(() => {
            audioUnlockedRef.current = false
          })
      } else {
        audioUnlockedRef.current = true
      }
    } catch {
      audioUnlockedRef.current = false
    } finally {
      el.muted = false
    }
  }

  const playTTS = async (text: string) => {
    ensureAudioUnlocked()

    const res = await fetch('/next/tts-ms', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: prepareForTTS(text) }),
    })

    if (!res.ok) throw new Error('TTS response was not ok')

    const blob = await res.blob()
    const url = URL.createObjectURL(blob)
    const audioEl = audioRef.current ?? new Audio()
    audioRef.current = audioEl

    await new Promise<void>((resolve, reject) => {
      let done = false
      const cleanup = () => {
        if (done) return
        done = true
        audioEl.onended = null
        audioEl.onerror = null
        URL.revokeObjectURL(url)
      }

      audioEl.onended = () => {
        cleanup()
        resolve()
      }
      audioEl.onerror = () => {
        cleanup()
        reject(new Error('TTS playback failed'))
      }

      audioEl.src = url
      audioEl.play().catch((err) => {
        cleanup()
        reject(err)
      })
    })
  }

  const handleClick = async (button: QuickChatButton) => {
    if (busy) return
    setError(null)
    setBusy(button.label)

    try {
      await playTTS(button.phrase)
    } catch (err) {
      console.error('Quick chat TTS failed', err)
      setError('Heli ei saanud esitada. Palun proovi uuesti.')
    } finally {
      setBusy(null)
    }
  }

  return (
    <section className="space-y-4">
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {activeButtons.map((button) => {
          const colorKey = button.color ?? 'emerald'
          return (
            <button
              key={button.label}
              onClick={() => handleClick(button)}
              className={cn(
                'relative overflow-hidden rounded-3xl border border-border px-4 py-6 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary/70',
                'min-h-[150px]',
              )}
              disabled={!!busy}
            >
              <div
                className={cn(
                  'absolute inset-0 opacity-80 transition group-hover:opacity-100',
                  'bg-gradient-to-br',
                  colorClasses[colorKey],
                )}
              />
              <div className="relative flex h-full flex-col gap-4">
                <div className="flex items-center gap-4">
                  <div className="flex flex-col gap-1">
                    <p className="text-3xl font-bold leading-tight text-foreground">{button.label}</p>
                    <p className="text-sm text-foreground/80">Kiirsuhtlus</p>
                  </div>
                  <div className="ml-auto flex items-center">
                    <span className="inline-flex items-center justify-center gap-3 rounded-full bg-white/90 px-4 py-3 text-base font-semibold text-foreground shadow-sm">
                      {busy === button.label ? (
                        <>
                          <Loader2 className="h-5 w-5 animate-spin" />
                          Esitan...
                        </>
                      ) : (
                        <>
                          <Volume2 className="h-5 w-5" />
                          Kuula
                        </>
                      )}
                    </span>
                  </div>
                </div>

                <p className="text-lg font-medium text-foreground/90 leading-snug">
                  {button.phrase}
                </p>
              </div>
            </button>
          )
        })}
      </div>
    </section>
  )
}
