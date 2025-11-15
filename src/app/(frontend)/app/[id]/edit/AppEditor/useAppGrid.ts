// src/components/AppEditor/useAppGrid.ts
'use client'

import { useCallback, useMemo, useState } from 'react'
import type { Layout } from 'react-grid-layout'
import type { App } from '@/payload-types'
import { getClientSideURL } from '@/utilities/getURL'

type Grid = NonNullable<App['grid']>
type Cells = NonNullable<Grid['cells']>
type Cell = Cells[number]

type LocalCell = Cell & {
  image?: Cell['image'] | { id: string | number; url?: string } | null
}

export function useAppGrid(app: App) {
  const baseCols = app.grid?.cols ?? 12

  // ---- DRAFT STATE (no autosave) ----
  const [saving, setSaving] = useState(false)
  const [dirty, setDirty] = useState(false)

  const [actionBar, setActionBar] = useState<{ enabled: boolean }>(() => ({
    enabled: app.actionBar?.enabled !== false,
  }))

  const [aiEnabled, setAiEnabled] = useState<boolean>(() => {
    return app.extra?.ai ?? false // vaikimisi false
  })

  const [cells, setCells] = useState<LocalCell[]>(() => {
    const initial = app.grid?.cells ?? []
    return initial.map((c) => c as LocalCell)
  })

  const layout: Layout[] = useMemo(
    () =>
      cells.map((cell) => ({
        i: cell.id,
        x: cell.x ?? 0,
        y: cell.y ?? 0,
        w: cell.w ?? 1,
        h: cell.h ?? 1,
      })),
    [cells],
  )

  // ---- SAVE (explicit) ----
  const saveDraft = useCallback(async () => {
    const cellsForServer = cells.map((c) => {
      let image: any = c.image
      if (image && typeof image === 'object' && 'id' in image) {
        image = image.id
      }
      return {
        id: c.id,
        x: c.x, y: c.y, w: c.w, h: c.h,
        title: c.title ?? undefined,
        externalImageURL: c.externalImageURL ?? undefined,
        audio: c.audio ?? undefined,
        image,
      }
    })

    setSaving(true)
    await fetch(`${getClientSideURL()}/api/apps/${app.id}`, {
      method: 'PATCH',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        actionBar,
        extra: {
          ...(app.extra || {}),
          ai: aiEnabled,
        },
        grid: { ...(app.grid || {}), cols: baseCols, cells: cellsForServer },
      }),
    })
    setSaving(false)
    setDirty(false)
  }, [app.id, app.grid, baseCols, cells, actionBar, aiEnabled, app.extra])

  // ---- RGL change: mark dirty, no save ----
  const onLayoutChange = useCallback((newLayout: Layout[]) => {
    const nextCells: LocalCell[] = newLayout.map((item) => {
      const orig = cells.find((c) => c.id === item.i)
      return {
        ...(orig || { id: item.i, title: '' }),
        x: item.x, y: item.y, w: item.w, h: item.h,
      }
    })
    setCells(nextCells)
    setDirty(true)
  }, [cells])

  const addCell = useCallback(() => {
    const id =
      typeof crypto !== 'undefined' && 'randomUUID' in crypto
        ? crypto.randomUUID()
        : `cell-${Date.now()}`
    // place at the first free row under current content
    const maxBottom = cells.reduce((m, c) => Math.max(m, (c.y ?? 0) + (c.h ?? 1)), 0)
    const newCell: LocalCell = { id, x: 0, y: maxBottom, w: 1, h: 1, title: '' }
    setCells(prev => [...prev, newCell])
    setDirty(true)
  }, [cells])

  // ---- Append NxN below existing cells (DON'T remove existing) ----
  const appendLogicalGrid = useCallback((n: number) => {
    const cellW = Math.max(1, Math.floor(baseCols / n))
    const startY = cells.reduce((m, c) => Math.max(m, (c.y ?? 0) + (c.h ?? 1)), 0)

    const newOnes: LocalCell[] = []
    let i = 0
    for (let row = 0; row < n; row += 1) {
      for (let col = 0; col < n; col += 1) {
        newOnes.push({
          id: `cell-${n}x${n}-${Date.now()}-${i++}`,
          x: col * cellW,
          y: startY + row,
          w: cellW,
          h: 1,
          title: '',
        })
      }
    }
    setCells(prev => [...prev, ...newOnes])
    setDirty(true)
  }, [baseCols, cells])

  const make2x2 = useCallback(() => appendLogicalGrid(2), [appendLogicalGrid])
  const make4x4 = useCallback(() => appendLogicalGrid(4), [appendLogicalGrid])
  const make6x6 = useCallback(() => appendLogicalGrid(6), [appendLogicalGrid])

  const deleteCell = useCallback((cellId: string) => {
    setCells(prev => prev.filter(c => c.id !== cellId))
    setDirty(true)
  }, [])

  const updateCellAction = useCallback((cellId: string, patch: Partial<LocalCell>) => {
    setCells(prev => prev.map(c => (c.id === cellId ? { ...c, ...patch } : c)))
    setDirty(true)
  }, [])

  const clearGrid = useCallback(() => {
    setCells([])
    setDirty(true)
  }, [])

  const updateActionBar = useCallback((enabled: boolean) => {
    setActionBar({ enabled })
    setDirty(true)
  }, [])

  const updateAi = useCallback((enabled: boolean) => {
    setAiEnabled(enabled)
    setDirty(true)
  }, [])

  return {
    // state
    saving, dirty,
    cols: baseCols,
    cells, layout,
    actionBar,
    aiEnabled,

    // callbacks
    onLayoutChange,
    addCell,
    make2x2, make4x4, make6x6,
    deleteCell, clearGrid,
    updateCellAction, updateActionBar,
    saveDraft,
    updateAi
  }
}
