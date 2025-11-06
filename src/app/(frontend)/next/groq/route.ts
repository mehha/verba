// app/(frontend)/next/groq/route.ts
import { NextResponse } from 'next/server'
import Groq from 'groq-sdk'

export const runtime = 'nodejs'

const client = new Groq({ apiKey: process.env.GROQ_API_KEY })
const GROQ_MODEL = process.env.GROQ_MODEL ?? 'qwen/qwen3-32b'

export async function POST(req: Request) {
  if (!process.env.GROQ_API_KEY) {
    return NextResponse.json({ error: 'GROQ_API_KEY missing' }, { status: 500 })
  }

  const { contextTail = [], token = '' } = await req.json().catch(() => ({}))
  const raw = (token ?? '').trim()
  if (!raw) return NextResponse.json({ error: 'missing token' }, { status: 400 })

  // First token is never changed
  const isFirst = !Array.isArray(contextTail) || contextTail.length === 0
  if (isFirst) return NextResponse.json({ surface: raw })

  const context = Array.isArray(contextTail) ? contextTail.slice(-2).join(' ') : ''

  const system = [
    'Sa oled eesti keele morfosüntaksi korrigeerija.',
    'VÄLJUND peab olema täpne JSON ilma lisatekstita.',
    'REEGLID:',
    '1) Ära kunagi kustuta sõnu.',
    '2) Esimest tokenit ei muudeta (seda rakendus tagab).',
    '3) Kui token on tegusõna ja kontekstis on alus, anna alati oleviku 3. pööre ainsus (nt "minema"→"läheb", "sittuma"→"situb").',
    '4) Kui token on mitmesõnaline nimisõnafraas, hoia kõik eelnevad sõnad IDENTSELT samad ning muuda ainult viimase sõna käänet.',
    '5) Kohavalik: seisundi/asendi verbide järel kasuta seesütlevat (inessiiv: "-s" → "koolis", "metsas"); liikumisverbide järel sisseütlevat (illatiiv: "-sse"/tüvi → "kooli", "metsasse").',
    'Seisund/asend: "on", "asub", "elab", "viibib", "istub", "seisab", "magab", "ootab", "töötab", "puhkab", "pissib", "situb".',
    'Liikumine: "läheb", "jookseb", "kõnnib", "sõidab", "suundub", "tormab".',
    'Tagasta ainult JSON: {"surface":"..."}',
  ].join('\n')

  const user = [
    `Kontekst: ${context || '—'}`,
    `Token: ${raw}`,
    'Vastus:',
  ].join('\n')

  try {
    const completion = await client.chat.completions.create({
      model: GROQ_MODEL,
      // enforce strict JSON object
      response_format: { type: 'json_object' },
      reasoning_effort: 'none' as any,
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
      temperature: 0,
    })

    const txt = (completion.choices?.[0]?.message?.content ?? '').trim()

    // Parse JSON safely
    let surface = raw
    try {
      const parsed = JSON.parse(txt) as { surface?: string }
      if (parsed?.surface && parsed.surface.trim()) surface = parsed.surface.trim()
    } catch {
      const m = txt.match(/\{\s*"surface"\s*:\s*"([^"]*)"\s*\}/)
      if (m) surface = m[1]
    }

    // Never drop words for multiword tokens: keep prefix identical
    if (raw.includes(' ')) {
      const parts = raw.split(/\s+/)
      const prefix = parts.slice(0, -1).join(' ')
      if (!surface.startsWith(prefix + ' ')) {
        const outLast = surface.split(/\s+/).pop() ?? parts[parts.length - 1]
        surface = `${prefix} ${outLast}`
      }
    }

    return NextResponse.json({ surface })
  } catch (err) {
    // Soft-fail to raw token on any SDK/network error
    return NextResponse.json({ surface: raw, note: 'sdk_error' }, { status: 200 })
  }
}
