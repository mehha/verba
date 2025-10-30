'use client'

import { useCallback, useMemo, useState } from 'react'
import type { Layout } from 'react-grid-layout'
import type { App } from '@/payload-types'
import { getClientSideURL } from '@/utilities/getURL'

type Grid = NonNullable<App['grid']>
type Cells = NonNullable<Grid['cells']>
type Cell = Cells[number]

export function useAppGrid(app: App) {
  const [saving, setSaving] = useState(false)

  // local state, editable
  const [cols, setCols] = useState(() => app.grid?.cols ?? 6)
  const [cells, setCells] = useState<Cell[]>(() => app.grid?.cells ?? [])

  const hasActionCell = cells.some((c) => c.locked)

  // RGL wants layout[]
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
    async (nextCols: number, nextCells: Cell[]) => {
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
            cols: nextCols,
            cells: nextCells,
          },
        }),
      })
      setSaving(false)
    },
    [app.id, app.grid],
  )

  const onLayoutChange = useCallback(
    async (newLayout: Layout[]) => {
      const nextCells: Cell[] = newLayout.map((item) => {
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
      await saveGrid(cols, nextCells)
    },
    [cells, cols, saveGrid],
  )

  // --- actions ---

  const addCell = useCallback(async () => {
    const id =
      typeof crypto !== 'undefined' && 'randomUUID' in crypto
        ? crypto.randomUUID()
        : `cell-${Date.now()}`
    const newCell: Cell = {
      id,
      x: 0,
      y: Infinity, // RGL will put it to bottom
      w: 1,
      h: 1,
      title: '',
      locked: false,
    }
    const nextCells = [...cells, newCell]
    setCells(nextCells)
    await saveGrid(cols, nextCells)
  }, [cells, cols, saveGrid])

  const makeGrid = useCallback(
    async (nCols: number, nRows: number) => {
      const nextCells: Cell[] = []
      let i = 0
      for (let y = 0; y < nRows; y += 1) {
        for (let x = 0; x < nCols; x += 1) {
          nextCells.push({
            id: `cell-${nCols}x${nRows}-${i++}`,
            x,
            y,
            w: 1,
            h: 1,
            title: '',
            locked: false,
          })
        }
      }
      setCols(nCols)
      setCells(nextCells)
      await saveGrid(nCols, nextCells)
    },
    [saveGrid],
  )

  const make4x4 = useCallback(() => makeGrid(4, 4), [makeGrid])
  const make6x6 = useCallback(() => makeGrid(6, 6), [makeGrid])

  const addActionCell = useCallback(async () => {
    if (hasActionCell) return
    const action: Cell = {
      id: 'action-cell',
      x: 0,
      y: 0,
      w: cols,
      h: 1,
      title: 'Action',
      locked: true,
    }
    // move everything else down
    const shifted = cells.map((c) => ({
      ...c,
      y: (c.y ?? 0) + 1,
    }))
    const nextCells = [action, ...shifted]
    setCells(nextCells)
    await saveGrid(cols, nextCells)
  }, [hasActionCell, cols, cells, saveGrid])

  const deleteCell = useCallback(
    async (cellId: string) => {
      const cell = cells.find((c) => c.id === cellId)
      if (!cell) return

      let nextCells: Cell[]

      if (cell.locked) {
        // deleting the action cell → pull other cells up
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
      await saveGrid(cols, nextCells)
    },
    [cells, cols, saveGrid],
  )

  const clearGrid = useCallback(async () => {
    setCells([])
    await saveGrid(cols, [])
  }, [cols, saveGrid])

  return {
    saving,
    cols,
    cells,
    layout,
    hasActionCell,
    onLayoutChange,
    addCell,
    make4x4,
    make6x6,
    addActionCell,
    deleteCell,
    clearGrid,
    setCols, // if you later want a select for cols
  }
}
