// src/utilities/resolveHref.ts
import type { Page, Post } from '@/payload-types'

type LinkLike = {
  type?: 'custom' | 'reference' | null
  url?: string | null
  reference?: {
    relationTo: 'pages' | 'posts'
    value: Page | Post | string | number
  } | null
}

export function resolveHref(link?: LinkLike): string | null {
  if (!link) return null

  if (
    link.type === 'reference' &&
    link.reference &&
    typeof link.reference.value === 'object' &&
    (link.reference.value as any).slug
  ) {
    const base = link.reference.relationTo !== 'pages' ? `/${link.reference.relationTo}` : ''
    return `${base}/${(link.reference.value as any).slug}`
  }
  return link.url ?? null
}

// strict-ish match: exact or as a parent (e.g. /blog matches /blog/article)
export function isPathActive(pathname: string, href: string | null): boolean {
  if (!href) return false
  if (href !== '/' && pathname === '/') return false
  if (pathname === href) return true
  return pathname.startsWith(href.endsWith('/') ? href : `${href}/`)
}
