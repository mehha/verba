// src/components/AppEditor/useAppGrid.ts
'use client'

import { useCallback, useMemo, useState } from 'react'
import type { Layout } from 'react-grid-layout'
import type { App } from '@/payload-types'
import { getClientSideURL } from '@/utilities/getURL'

type Grid = NonNullable<App['grid']>
type Cells = NonNullable<Grid['cells']>
type Cell = Cells[number]

// allow local image object
type LocalCell = Cell & {
  image?: Cell['image'] | { id: string | number; url?: string } | null
}

export function useAppGrid(app: App) {
  const baseCols = app.grid?.cols ?? 12

  // 👇 NEW: keep actionBar in state too
  const [actionBar, setActionBar] = useState<{ enabled: boolean }>(() => ({
    enabled: app.actionBar?.enabled !== false,
  }))

  const [saving, setSaving] = useState(false)

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

  // 👇 single saver for BOTH grid + actionBar
  const saveAll = useCallback(
    async (
      nextCells: LocalCell[],
      nextActionBar: { enabled: boolean; } = actionBar,
    ) => {
      const cellsForServer = nextCells.map((c) => {
        let image: any = c.image
        if (image && typeof image === 'object' && 'id' in image) {
          image = image.id
        }
        return {
          id: c.id,
          x: c.x,
          y: c.y,
          w: c.w,
          h: c.h,
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
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          actionBar: nextActionBar,
          grid: {
            ...(app.grid || {}),
            cols: baseCols,
            cells: cellsForServer,
          },
        }),
      })
      setSaving(false)
    },
    [app.id, app.grid, baseCols, actionBar],
  )

  const onLayoutChange = useCallback(
    async (newLayout: Layout[]) => {
      const nextCells: LocalCell[] = newLayout.map((item) => {
        const orig = cells.find((c) => c.id === item.i)
        return {
          ...(orig || {}),
          id: item.i,
          x: item.x,
          y: item.y,
          w: item.w,
          h: item.h,
        }
      })
      setCells(nextCells)
      await saveAll(nextCells)
    },
    [cells, saveAll],
  )

  const addCell = useCallback(async () => {
    const id =
      typeof crypto !== 'undefined' && 'randomUUID' in crypto
        ? crypto.randomUUID()
        : `cell-${Date.now()}`
    const newCell: LocalCell = {
      id,
      x: 0,
      y: Infinity,
      w: 1,
      h: 1,
      title: '',
    }
    const nextCells = [...cells, newCell]
    setCells(nextCells)
    await saveAll(nextCells)
  }, [cells, saveAll])

  // build logical NxN inside baseCols
  const makeLogicalGrid = useCallback(
    async (n: number) => {
      const cellW = Math.max(1, Math.floor(baseCols / n))
      const nextCells: LocalCell[] = []

      let i = 0
      for (let y = 0; y < n; y += 1) {
        for (let x = 0; x < n; x += 1) {
          nextCells.push({
            id: `cell-${n}x${n}-${i++}`,
            x: x * cellW,
            y,
            w: cellW,
            h: 1,
            title: '',
          })
        }
      }

      setCells(nextCells)
      await saveAll(nextCells)
    },
    [baseCols, saveAll],
  )

  const make2x2 = useCallback(() => makeLogicalGrid(2), [makeLogicalGrid])
  const make4x4 = useCallback(() => makeLogicalGrid(4), [makeLogicalGrid])
  const make6x6 = useCallback(() => makeLogicalGrid(6), [makeLogicalGrid])

  const deleteCell = useCallback(
    async (cellId: string) => {
      const nextCells = cells.filter((c) => c.id !== cellId)
      setCells(nextCells)
      await saveAll(nextCells)
    },
    [cells, saveAll],
  )

  const updateCellAction = useCallback(
    async (cellId: string, patch: Partial<LocalCell>) => {
      const nextCells = cells.map((c) =>
        c.id === cellId ? { ...c, ...patch } : c,
      )
      setCells(nextCells)
      await saveAll(nextCells)
    },
    [cells, saveAll],
  )

  const clearGrid = useCallback(async () => {
    setCells([])
    await saveAll([])
  }, [saveAll])

  // 👇 NEW: update action bar only
  const updateActionBar = useCallback(
    async (enabled: boolean) => {
      const next = { enabled }
      setActionBar(next)
      await saveAll(cells, next)
    },
    [cells, saveAll],
  )

  return {
    saving,
    cols: baseCols,
    cells,
    layout,
    onLayoutChange,
    addCell,
    make2x2,
    make4x4,
    make6x6,
    deleteCell,
    clearGrid,
    updateCellAction,
    // 👇 expose for editor
    actionBar,
    updateActionBar,
  }
}
