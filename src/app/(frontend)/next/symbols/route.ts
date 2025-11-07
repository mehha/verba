// src/app/(frontend)/next/symbols/route.ts
import { NextResponse } from 'next/server'

export const runtime = 'nodejs'

type SymbolItem = {
  id: string
  title: string
  preview: string
  source: 'arasaac' | 'openmoji'
  license: string
  attribution?: string
  raw?: any
}

async function fetchArasaac(locale: string, q: string, limit: number) {
  console.log('locale', locale)
  const r = await fetch(
    `https://api.arasaac.org/api/pictograms/${encodeURIComponent(locale)}/search/${encodeURIComponent(q)}`,
    { headers: { Accept: 'application/json' } },
  )
  if (!r.ok) return []
  const arr = await r.json()
  return (arr || []).slice(0, limit).map((p: any) => ({
    id: `arasaac-${p._id}`,
    title: p.keywords?.[0]?.keyword || q,
    preview: `https://static.arasaac.org/pictograms/${p._id}/${p._id}_500.png?download=false&color=true`,
    source: 'arasaac' as const,
    license: 'CC BY-NC-SA 4.0 (ARASAAC)',
    attribution: '© ARASAAC (Gobierno de Aragón); author listed on symbol page',
    raw: p,
  })) as SymbolItem[]
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const q = (searchParams.get('q') || '').trim()
  const source = (searchParams.get('source') || 'arasaac').toLowerCase()
  const limit = Math.min(Number(searchParams.get('limit') || 40), 100)

  if (!q) return NextResponse.json({ items: [] })

  try {
    if (source === 'openmoji') {
      const r = await fetch('https://unpkg.com/openmoji@15.0.0/data/openmoji.json')
      const data = await r.json()
      const needle = q.toLowerCase()
      const items: SymbolItem[] = data
        .filter((e: any) =>
          [e.annotation, ...(e.tags || [])].some((t: string) => String(t).toLowerCase().includes(needle)),
        )
        .slice(0, limit)
        .map((e: any) => ({
          id: `openmoji-${e.hexcode}`,
          title: e.annotation,
          preview: `https://unpkg.com/openmoji@15.0.0/color/svg/${e.hexcode}.svg`,
          source: 'openmoji',
          license: 'CC BY-SA 4.0 (OpenMoji)',
          attribution: '© OpenMoji',
          raw: e,
        }))
      return NextResponse.json({ items })
    }

    // ARASAAC with locale + fallback to 'en' if empty
    const requested = (searchParams.get('locale') || 'en').toLowerCase()
    let items = await fetchArasaac(requested, q, limit)
    if (!items.length && requested !== 'en') {
      const fallback = await fetchArasaac('en', q, limit)
      if (fallback.length) items = fallback
    }
    return NextResponse.json({ items })
  } catch {
    return NextResponse.json({ items: [] })
  }
}
