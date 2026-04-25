// app/(frontend)/next/groq/route.ts
import { NextResponse } from 'next/server'
import Groq from 'groq-sdk'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import type { User } from '@/payload-types'
import { hasActiveMembership } from '@/utilities/membershipStatus'

export const runtime = 'nodejs'

const client = new Groq({ apiKey: process.env.GROQ_API_KEY })
const GROQ_MODEL = process.env.GROQ_MODEL ?? 'qwen/qwen3-32b'

type GroqBody = {
  contextTail?: string[]
  task?: 'symbol-search-terms'
  token?: string
}

function normalizeSymbolSearchTerms(value: unknown, original: string) {
  if (!Array.isArray(value)) return []

  const seen = new Set<string>()
  const terms: string[] = []

  for (const item of value) {
    if (typeof item !== 'string') continue
    const term = item.toLowerCase().replace(/[^\p{L}\p{N}\s-]/gu, '').replace(/\s+/g, ' ').trim()
    if (!term || term.length > 40 || term === original.toLowerCase() || seen.has(term)) continue
    seen.add(term)
    terms.push(term)
    if (terms.length >= 8) break
  }

  return terms
}

export async function POST(req: Request) {
  if (!process.env.GROQ_API_KEY) {
    return NextResponse.json({ error: 'GROQ_API_KEY missing' }, { status: 500 })
  }

  const payload = await getPayload({ config: configPromise })
  const { user } = await payload.auth({ headers: req.headers })

  if (!user) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  if (!hasActiveMembership(user as User)) {
    return NextResponse.json({ error: 'membership_required' }, { status: 402 })
  }

  const body = (await req.json().catch(() => ({}))) as GroqBody
  const raw = (body.token ?? '').trim()
  if (!raw) return NextResponse.json({ error: 'missing token' }, { status: 400 })

  if (body.task === 'symbol-search-terms') {
    const system = [
      'You create ARASAAC pictogram search terms for AAC communication board cards.',
      'Input can be Estonian or English, one word or a short phrase.',
      'Return an ordered list of English search terms that are likely to exist as simple ARASAAC pictograms.',
      '',
      'Rules:',
      '1) Prefer concrete base words: nouns, verbs, adjectives, and common AAC concepts.',
      '2) Include translations and close synonyms, not explanations.',
      '3) For phrases, include the main concept first, then useful phrase-level alternatives.',
      '4) Use lowercase English only.',
      '5) Do not include Estonian terms unless the input is already English-looking.',
      '6) Put the most likely exact ARASAAC search term first, then synonyms or broader alternatives.',
      '7) Return 5-8 terms when possible.',
      '',
      'Examples:',
      '- eksam -> exam, examination, test',
      '- vahetund -> break, recess',
      '- söökla -> cafeteria, canteen',
      '',
      'Return ONLY JSON: {"terms":["..."]}',
    ].join('\n')

    try {
      const completion = await client.chat.completions.create({
        model: GROQ_MODEL,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: `Card label: ${raw}` },
        ],
        temperature: 0.2,
      })

      const txt = (completion.choices?.[0]?.message?.content ?? '').trim()
      const parsed = JSON.parse(txt) as { terms?: unknown }

      return NextResponse.json({ terms: normalizeSymbolSearchTerms(parsed.terms, raw) })
    } catch {
      return NextResponse.json({ terms: [], note: 'sdk_error' }, { status: 200 })
    }
  }

  const tail = Array.isArray(body.contextTail) ? body.contextTail : []

  // Esimest tokenit ei muudeta – odavam, pole vaja Groq’i üldse
  if (tail.length === 0) {
    return NextResponse.json({ surface: raw })
  }

  // piirame konteksti 2 viimasele – piisav, odav
  const context = tail.slice(-2).join(' ')

  const system = [
    'Sa parandad eesti keele morfosüntaksit ühe tokeni kaupa.',
    'Sulle antakse:',
    '- "Kontekst": 0–2 eelmist sõna (või fraasi),',
    '- "Token": praegune sõna või fraas, mida tuleb kohandada.',
    '',
    'Reeglid:',
    '1) Ära lisa ega kustuta sõnu.',
    '2) Hoia tokeni tüvi sama, muuda ainult vormi (kääne/pööre/lõpp).',
    '3) Kui token sisaldab mitu sõna, muuda ainult VIIMAST sõna.',
    '4) Kasuta vajadusel õiget mitmuse käänet (nt "kaks kass" → "kaks kassi").',
    '5) Kohakäänded: olek/seisund → seesütlev ("koolis"), liikumine → sisseütlev ("kooli").',
    '',
    'Tagasta VAINULT JSON kujul: {"surface":"..."}',
  ].join('\n')

  const prompt = [
    `Kontekst: ${context || '-'}`,
    `Token: ${raw}`,
    'Vastus:',
  ].join('\n')

  try {
    const completion = await client.chat.completions.create({
      model: GROQ_MODEL,
      response_format: { type: 'json_object' }, // garanteerib JSONi
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: prompt },
      ],
      temperature: 0,
    })

    const txt = (completion.choices?.[0]?.message?.content ?? '').trim()

    let surface = raw

    try {
      const parsed = JSON.parse(txt) as { surface?: string }
      if (parsed?.surface && parsed.surface.trim()) {
        surface = parsed.surface.trim()
      }
    } catch {
      // fallback, kui mudel ikka midagi muud lisab
      const m = txt.match(/\{\s*"surface"\s*:\s*"([^"]*)"\s*\}/)
      if (m) surface = m[1]
    }

    // Turvavõrk mitmesõnalise tokeni puhul: prefix peab jääma samaks
    if (raw.includes(' ')) {
      const parts = raw.split(/\s+/)
      const prefix = parts.slice(0, -1).join(' ')
      if (!surface.startsWith(prefix + ' ')) {
        const outLast = surface.split(/\s+/).pop() ?? parts[parts.length - 1]
        surface = `${prefix} ${outLast}`
      }
    }

    return NextResponse.json({ surface })
  } catch {
    // Soft-fail: kui Groq error, loeme lihtsalt algset tokenit
    return NextResponse.json({ surface: raw, note: 'sdk_error' }, { status: 200 })
  }
}
