import Link from 'next/link'
import React from 'react'
import type { Metadata } from 'next'

import { Button } from '@/components/ui/button'

export const metadata: Metadata = {
  description: 'Soovitud lehte ei leitud.',
  robots: {
    follow: false,
    index: false,
  },
  title: '404',
}

export default function NotFound() {
  return (
    <div className="container py-28">
      <div className="prose max-w-none">
        <h1 style={{ marginBottom: 0 }}>404</h1>
        <p className="mb-4">This page could not be found.</p>
      </div>
      <Button asChild variant="default">
        <Link href="/">Go home</Link>
      </Button>
    </div>
  )
}
