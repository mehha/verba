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
  // real base cols from Payload – e.g. 12
  const baseCols = app.grid?.cols ?? 12

  const [saving, setSaving] = useState(false)

  // we DON'T let presets overwrite cols anymore
  const [cols] = useState(() => baseCols)

  const [cells, setCells] = useState<LocalCell[]>(() => {
    const initial = app.grid?.cells ?? []
    return initial.map((c) => c as LocalCell)
  })

  const hasActionCell = cells.some((c) => c.locked)

  const layout: Layout[] = useMemo(
    () =>
      cells.map((cell) => ({
        i: cell.id,
        x: cell.x ?? 0,
        y: cell.y ?? 0,
        w: cell.w ?? 1,
        h: cell.h ?? 1,
        static: !!cell.locked,
      })),
    [cells],
  )

  const saveGrid = useCallback(
    async (nextCells: LocalCell[]) => {
      // strip local image object → send only id
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
          locked: c.locked ?? false,
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
          grid: {
            ...(app.grid || {}),
            cols: baseCols, // 👈 always keep 12 (or whatever app had)
            cells: cellsForServer,
          },
        }),
      })
      setSaving(false)
    },
    [app.id, app.grid, baseCols],
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
          locked: item.static ?? orig?.locked ?? false,
        }
      })
      setCells(nextCells)
      await saveGrid(nextCells)
    },
    [cells, saveGrid],
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
      locked: false,
    }
    const nextCells = [...cells, newCell]
    setCells(nextCells)
    await saveGrid(nextCells)
  }, [cells, saveGrid])

  /**
   * Build an N×N logical grid INSIDE baseCols.
   * Example: baseCols = 12, n = 4 → cellW = 12 / 4 = 3, so x = 0,3,6,9
   */
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
            locked: false,
          })
        }
      }

      setCells(nextCells)
      await saveGrid(nextCells)
    },
    [baseCols, saveGrid],
  )

  const make2x2 = useCallback(() => makeLogicalGrid(2), [makeLogicalGrid])
  const make4x4 = useCallback(() => makeLogicalGrid(4), [makeLogicalGrid])
  const make6x6 = useCallback(() => makeLogicalGrid(6), [makeLogicalGrid])

  const addActionCell = useCallback(async () => {
    if (hasActionCell) return
    const action: LocalCell = {
      id: 'action-cell',
      x: 0,
      y: 0,
      w: baseCols, // 👈 full width of 12
      h: 1,
      title: 'Action',
      locked: true,
    }
    const shifted = cells.map((c) => ({
      ...c,
      y: (c.y ?? 0) + 1,
    }))
    const nextCells = [action, ...shifted]
    setCells(nextCells)
    await saveGrid(nextCells)
  }, [hasActionCell, baseCols, cells, saveGrid])

  const deleteCell = useCallback(
    async (cellId: string) => {
      const cell = cells.find((c) => c.id === cellId)
      if (!cell) return

      let nextCells: LocalCell[]

      if (cell.locked) {
        nextCells = cells
          .filter((c) => c.id !== cellId)
          .map((c) => ({
            ...c,
            y: Math.max(0, (c.y ?? 0) - 1),
          }))
      } else {
        nextCells = cells.filter((c) => c.id !== cellId)
      }

      setCells(nextCells)
      await saveGrid(nextCells)
    },
    [cells, saveGrid],
  )

  const updateCellAction = useCallback(
    async (cellId: string, patch: Partial<LocalCell>) => {
      const nextCells = cells.map((c) =>
        c.id === cellId ? { ...c, ...patch } : c,
      )
      setCells(nextCells)
      await saveGrid(nextCells)
    },
    [cells, saveGrid],
  )

  const clearGrid = useCallback(async () => {
    setCells([])
    await saveGrid([])
  }, [saveGrid])

  return {
    saving,
    cols: baseCols, // 👈 expose the real cols
    cells,
    layout,
    hasActionCell,
    onLayoutChange,
    addCell,
    make2x2,
    make4x4,
    make6x6,
    addActionCell,
    deleteCell,
    clearGrid,
    updateCellAction,
  }
}
