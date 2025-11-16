// src/lib/aac/applyCompounds.ts
import type { App } from '@/payload-types'

export type SelectedToken = {
  id: string
  text: string
}

export type Compound = NonNullable<App['compounds']>[number]

export type NormalizedToken = {
  id: string
  surface: string
  tts: string
}

export function applyCompounds(
  tokens: SelectedToken[],
  rules: Compound[] | null | undefined,
): { display: string; tts: string; tokens: NormalizedToken[] } {
  // Kui pole rules või tokens, tagasta lihtsalt algne jada
  if (!rules?.length || !tokens.length) {
    const normalized: NormalizedToken[] = tokens.map((t) => ({
      id: t.id,
      surface: t.text,
      tts: t.text,
    }))
    const base = normalized.map((t) => t.surface).join(' ')
    return { display: base, tts: base, tokens: normalized }
  }

  // Normaliseeritud jada: iga positsioonil surface + tts
  const normalized: NormalizedToken[] = tokens.map((t) => ({
    id: t.id,
    surface: t.text,
    tts: t.text,
  }))

  // Käime kõik reeglid läbi (järjekorras)
  for (const rule of rules) {
    const pattern = rule.cells?.map((c) => c.cellId) ?? []
    const parts = rule.parts ?? []
    const patternLen = pattern.length

    if (!patternLen || !parts.length || parts.length !== patternLen) continue
    if (patternLen > normalized.length) continue

    // libiseme üle jada ja override'ime sobivad lõigud
    for (let i = 0; i <= normalized.length - patternLen; i++) {
      let ok = true
      for (let j = 0; j < patternLen; j++) {
        if (normalized[i + j].id !== pattern[j]) {
          ok = false
          break
        }
      }
      if (!ok) continue

      // kui matchib, override iga positsiooni surface/tts
      for (let j = 0; j < patternLen; j++) {
        const part = parts[j]
        const surface = (part.surface ?? '').trim()
        const tts = (part.tts ?? '').trim()

        if (surface) {
          normalized[i + j].surface = surface
        }
        if (tts) {
          normalized[i + j].tts = tts
        } else if (surface) {
          normalized[i + j].tts = surface
        }
      }
    }
  }

  const display = normalized.map((t) => t.surface).join(' ')
  const tts = normalized.map((t) => t.tts).join(' ')

  return { display, tts, tokens: normalized }
}
