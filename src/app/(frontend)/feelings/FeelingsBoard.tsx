'use client'

import React, { startTransition, useActionState, useMemo, useRef, useState } from 'react'
import { FEELINGS, type FeelingOption } from './feelingsData'
import { logFeelingAction, type LogFeelingState } from './actions'
import { Button } from '@/components/ui/button'
import { cn } from '@/utilities/ui'
import { Volume2, RefreshCw, Loader2 } from 'lucide-react'

const prepareForTTS = (text: string): string => {
  const trimmed = text.trim()
  if (!trimmed) return trimmed
  if (/[.!?]$/.test(trimmed)) return trimmed
  return `${trimmed}.`
}

type FeelingsBoardProps = {
  lastFeeling?: string
  lastFeelingAt?: string
}

export function FeelingsBoard({ lastFeeling, lastFeelingAt }: FeelingsBoardProps) {
  const [state, formAction] = useActionState<LogFeelingState, FormData>(logFeelingAction, {
    success: false,
    error: undefined,
    lastFeeling,
    lastFeelingAt,
  })
  const [busy, setBusy] = useState<string | null>(null)
  const [localError, setLocalError] = useState<string | undefined>(undefined)

  const audioRef = useRef<HTMLAudioElement | null>(null)
  const audioUnlockedRef = useRef(false)

  const effectiveFeeling = state.lastFeeling ?? lastFeeling
  const effectiveFeelingAt = state.lastFeelingAt ?? lastFeelingAt

  const feelingLabel = useMemo(
    () => FEELINGS.find((f) => f.value === effectiveFeeling)?.label ?? effectiveFeeling,
    [effectiveFeeling],
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

    if (!res.ok) {
      throw new Error('TTS response was not ok')
    }

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

  const handleSelect = async (feeling: FeelingOption) => {
    if (busy) return
    setLocalError(undefined)
    setBusy(feeling.value)

    const phrase = feeling.helper || `Ma tunnen ennast ${feeling.value}.`

    try {
      await playTTS(phrase)
      const fd = new FormData()
      fd.append('feeling', feeling.value)

      await new Promise<void>((resolve) => {
        startTransition(() => {
          Promise.resolve(formAction(fd)).finally(resolve)
        })
      })
    } catch (err) {
      console.error('TTS play failed', err)
      setLocalError('Heli ei saanud esitada. Palun proovi uuesti.')
    } finally {
      setBusy(null)
    }
  }

  const handleReplayLast = async () => {
    if (!effectiveFeeling) return
    const feeling = FEELINGS.find((f) => f.value === effectiveFeeling)
    if (!feeling) return

    if (busy) return
    setLocalError(undefined)
    setBusy(feeling.value)

    try {
      await playTTS(feeling.helper || `Ma tunnen ennast ${feeling.value}.`)
    } catch (err) {
      console.error('Replay failed', err)
      setLocalError('Heli ei saanud esitada. Palun proovi uuesti.')
    } finally {
      setBusy(null)
    }
  }

  const formattedTimestamp = useMemo(() => {
    if (!effectiveFeelingAt) return null
    try {
      const date = new Date(effectiveFeelingAt)
      return new Intl.DateTimeFormat('et-EE', {
        hour: '2-digit',
        minute: '2-digit',
        day: '2-digit',
        month: '2-digit',
      }).format(date)
    } catch {
      return null
    }
  }, [effectiveFeelingAt])

  const errorMessage = localError ?? state.error

  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-2">
        <p className="text-sm text-muted-foreground">
          Vali tunne, mille järgi kuvame lause “Ma tunnen ennast …” ja loeme selle ette.
        </p>
        {effectiveFeeling && (
          <div className="flex items-center gap-2 text-md text-muted-foreground">
            <span className="font-medium text-foreground">Viimane valik:</span>
            <span className="flex items-center gap-2">
              <span className="rounded-full bg-accent text-accent-foreground px-2 py-1 text-md">
                {feelingLabel}
              </span>
              {formattedTimestamp && <span className="text-sm text-muted-foreground">{formattedTimestamp}</span>}
            </span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleReplayLast}
              disabled={!!busy}
              className="ml-auto gap-2"
            >
              {busy === effectiveFeeling ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
              Kuula uuesti
            </Button>
          </div>
        )}
      </div>

      {errorMessage && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {errorMessage}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {FEELINGS.map((feeling) => {
          const isActive = busy === feeling.value
          return (
            <button
              key={feeling.value}
              onClick={() => handleSelect(feeling)}
              className={cn(
                'group relative overflow-hidden rounded-2xl border border-border p-4 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary/70',
              )}
              disabled={isActive}
            >
              <div
                className={cn(
                  'absolute inset-0 opacity-70 transition group-hover:opacity-100',
                  'bg-gradient-to-br',
                  feeling.accent,
                )}
              />
              <div className="relative flex flex-col gap-4">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-3">
                    <span className="text-6xl leading-none drop-shadow-sm">{feeling.emoji}</span>
                    <div className="space-y-1">
                      <p className="text-2xl font-semibold leading-tight text-foreground">{feeling.label}</p>
                      <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Emotsiooniratas</p>
                    </div>
                  </div>
                  <div className="ml-auto flex items-center">
                    <span className="inline-flex items-center justify-center gap-3 rounded-full border border-white/60 bg-white/85 px-4 py-3 text-base font-semibold text-foreground shadow-sm">
                      {isActive ? (
                        <>
                          <Loader2 className="h-5 w-5 animate-spin" />
                          Esitan...
                        </>
                      ) : (
                        <>
                          <Volume2 className="h-5 w-5" />
                          Mängi
                        </>
                      )}
                    </span>
                  </div>
                </div>

                <p className="text-sm text-foreground/90">
                  {feeling.helper}
                </p>
              </div>
            </button>
          )
        })}
      </div>
    </section>
  )
}
