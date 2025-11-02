// src/app/(frontend)/api/pexels/route.ts
import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const q = searchParams.get('q') || 'cat'

  const res = await fetch(`https://api.pexels.com/v1/search?query=${encodeURIComponent(q)}&per_page=20`, {
    headers: {
      Authorization: process.env.PEXELS_API_KEY || '',
    },
  })

  if (!res.ok) {
    return NextResponse.json({ photos: [] }, { status: 200 })
  }

  const json = await res.json()
  return NextResponse.json(json)
}
