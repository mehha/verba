// src/app/(frontend)/next/symbols/route.ts
import { NextResponse } from 'next/server'

// Optional: ARASAAC doesn’t require a key for basic search.
// But you can set one if you have it:
// process.env.ARASAAC_TOKEN

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

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const q = (searchParams.get('q') || '').trim()
  const source = (searchParams.get('source') || 'arasaac').toLowerCase()

  if (!q) return NextResponse.json({ items: [] })

  try {
    if (source === 'openmoji') {
      // Simple local search: you can ship a small prebuilt index or fetch from CDN.
      // For demo, fetch their emoji.json (or replace with your local file).
      const r = await fetch('https://unpkg.com/openmoji@15.0.0/data/openmoji.json')
      const data = await r.json()
      const needle = q.toLowerCase()
      const items: SymbolItem[] = data
        .filter((e: any) =>
          [e.annotation, ...(e.tags || [])].some((t: string) => String(t).toLowerCase().includes(needle)),
        )
        .slice(0, 40)
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

    // Default: ARASAAC
    // Locale choices: 'en', 'es', ... (Estonian results may be sparse; English works well)
    const locale = searchParams.get('locale') || 'en'
    const r = await fetch(
      `https://api.arasaac.org/api/pictograms/${encodeURIComponent(locale)}/search/${encodeURIComponent(q)}`,
      { headers: { 'Accept': 'application/json' } },
    )

    if (!r.ok) return NextResponse.json({ items: [] })

    const arr = await r.json()
    // ARASAAC image build: color=true|false, download=false keeps CDN link
    const items: SymbolItem[] = (arr || [])
      .slice(0, 40)
      .map((p: any) => ({
        id: `arasaac-${p._id}`,
        title: p.keywords?.[0]?.keyword || q,
        preview: `https://static.arasaac.org/pictograms/${p._id}/${p._id}_500.png?download=false&color=true`,
        source: 'arasaac',
        license: 'CC BY-NC-SA 4.0 (ARASAAC)',
        attribution: '© ARASAAC (Gobierno de Aragón); author listed on symbol page',
        raw: p,
      }))

    return NextResponse.json({ items })
  } catch (e) {
    return NextResponse.json({ items: [] })
  }
}
