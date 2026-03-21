import type { User } from '@/payload-types'

type DocWithOwnerAndOrder = {
  id?: number | string | null
  order?: number | null
  owner?: number | string | { id?: number | string | null } | null
}

export function toIdString(value: unknown): string | null {
  if (typeof value === 'string' && value.trim()) return value
  if (typeof value === 'number') return String(value)
  return null
}

export function getOwnerId(value: DocWithOwnerAndOrder['owner']): string | null {
  if (!value) return null
  if (typeof value === 'object') {
    return toIdString(value.id)
  }

  return toIdString(value)
}

export function normalizeIdList(value: unknown): string[] {
  if (!Array.isArray(value)) return []

  const seen = new Set<string>()
  const normalized: string[] = []

  for (const item of value) {
    const id = toIdString(item)
    if (!id || seen.has(id)) continue
    seen.add(id)
    normalized.push(id)
  }

  return normalized
}

export function setHiddenState(ids: string[], targetId: string, hidden: boolean): string[] {
  if (hidden) {
    return ids.includes(targetId) ? ids : [...ids, targetId]
  }

  return ids.filter((id) => id !== targetId)
}

export function sortSharedDocs<T extends DocWithOwnerAndOrder>(docs: T[], preferredIds: string[]): T[] {
  const docsById = new Map<string, T>()

  for (const doc of docs) {
    const id = toIdString(doc.id)
    if (id) {
      docsById.set(id, doc)
    }
  }

  const ordered: T[] = []
  const seen = new Set<string>()

  for (const id of preferredIds) {
    const doc = docsById.get(id)
    if (!doc || seen.has(id)) continue
    ordered.push(doc)
    seen.add(id)
  }

  const remaining = docs
    .filter((doc) => {
      const id = toIdString(doc.id)
      return id ? !seen.has(id) : true
    })
    .sort((a, b) => {
      const aOrder = typeof a.order === 'number' ? a.order : Number.MAX_SAFE_INTEGER
      const bOrder = typeof b.order === 'number' ? b.order : Number.MAX_SAFE_INTEGER

      if (aOrder !== bOrder) return aOrder - bOrder

      const aId = toIdString(a.id) ?? ''
      const bId = toIdString(b.id) ?? ''
      return aId.localeCompare(bId)
    })

  return [...ordered, ...remaining]
}

export function isOwnedByUser(doc: DocWithOwnerAndOrder, userId: number | string): boolean {
  const ownerId = getOwnerId(doc.owner)
  return ownerId === String(userId)
}

export function getUserSharedHomePreferences(user: User | null | undefined) {
  return {
    hiddenSharedBoardIds: normalizeIdList(user?.hiddenSharedBoardIds),
    hiddenSharedPuzzleIds: normalizeIdList(user?.hiddenSharedPuzzleIds),
    sharedBoardOrder: normalizeIdList(user?.sharedBoardOrder),
    sharedPuzzleOrder: normalizeIdList(user?.sharedPuzzleOrder),
  }
}
