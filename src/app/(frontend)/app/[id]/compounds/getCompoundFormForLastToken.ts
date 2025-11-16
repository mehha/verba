// src/lib/aac/getCompoundFormForLastToken.ts
import type { App } from '@/payload-types'
import {SelectedToken} from "@/app/(frontend)/app/[id]/compounds/applyCompounds";

/**
 * Leia vorm viimasele tokenile:
 * - vaatab KÕIKI reegleid
 * - iga reegli puhul leiab suurima k (1..min(ruleLen, seqLen)),
 *   mille korral reegli prefix (cells[0..k-1]) = jada suffix (viimased k tokenit)
 * - globaalne valik: suurem k võidab
 * - kui mitu reeglit sama k-ga, võidab see, mis esimesena rules massiivis.
 */
export function getCompoundFormForLastToken(
  tokens: SelectedToken[],
  rules: App['compounds'] | null | undefined,
): { surface: string; tts: string } | null {
  if (!rules?.length || tokens.length === 0) return null

  const n = tokens.length
  let best: { k: number; surface: string; tts: string } | null = null

  rulesLoop: for (const rule of rules) {
    const pattern = rule.cells?.map((c) => c.cellId) ?? []
    const parts = rule.parts ?? []
    const L = pattern.length

    if (!L || parts.length !== L) continue

    const maxK = Math.min(L, n)
    let matchedK = 0

    // Leia selle reegli jaoks suurim k
    for (let k = maxK; k >= 1; k--) {
      let ok = true
      for (let j = 0; j < k; j++) {
        const expectedId = pattern[j]
        const actualId = tokens[n - k + j].id
        if (expectedId !== actualId) {
          ok = false
          break
        }
      }
      if (ok) {
        matchedK = k
        break
      }
    }

    if (matchedK > 0) {
      const part = parts[matchedK - 1]
      const surface = (part.surface ?? '').trim()
      const tts = (part.tts ?? '').trim() || surface

      if (!surface) continue

      if (!best || matchedK > best.k) {
        best = { k: matchedK, surface, tts }
      }
      // NB: ei tee `continue rulesLoop` midagi erilist – tsükkel nagunii jätkub järgmise reegliga
    }
  }

  if (!best) return null
  return { surface: best.surface, tts: best.tts }
}
