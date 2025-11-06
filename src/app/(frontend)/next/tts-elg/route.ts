import { NextResponse } from 'next/server'

const TTS_URL = process.env.TTS_URL ?? 'http://localhost:7000/process'
export const runtime = 'nodejs'

export async function POST(req: Request) {
  const { text = '', rate = '1.0', voice = 'eki_et_eva.htsvoice' } = await req.json().catch(() => ({}))
  if (!text.trim()) return NextResponse.json({ error: 'missing text' }, { status: 400 })

  const tr = await fetch(TTS_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      type: 'text',
      content: text,
      params: { cmdline: ['-m', voice, '-r', rate] },
    }),
  })

  if (!tr.ok) return NextResponse.json({ error: 'tts failed' }, { status: 502 })

  const wav = await tr.arrayBuffer()
  return new NextResponse(wav, { status: 200, headers: { 'Content-Type': 'audio/wav' } })
}
