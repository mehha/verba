// src/components/AppEditor.tsx
'use client'

import { useCallback, useMemo, useState } from 'react'
import RGL, { WidthProvider, type Layout } from 'react-grid-layout'
import 'react-grid-layout/css/styles.css'
import 'react-resizable/css/styles.css'
import type { App } from '@/payload-types'
import { getClientSideURL } from '@/utilities/getURL'

const ReactGridLayout = WidthProvider(RGL)

type Props = {
  app: App
}

export default function AppEditor({ app }: Props) {
  const [saving, setSaving] = useState(false)

  // local editable state, seeded from Payload
  const [cols, setCols] = useState(() => app.grid?.cols ?? 6)
  const [cells, setCells] = useState(() => app.grid?.cells ?? [])

  // does an action cell already exist?
  const hasActionCell = cells.some((c) => c.locked)

  // 1) map Payload cells -> RGL layout
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

  // save helper (reuse for buttons + drag)
  const saveGrid = useCallback(
    async (nextCols: number, nextCells: typeof cells) => {
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

  // 2) when layout changes
  const handleLayoutChange = useCallback(
    async (newLayout: Layout[]) => {
      // map RGL layout back -> Payload cells
      const nextCells = newLayout.map((item) => {
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

  // --- button handlers ---

  // 1) add single cell
  const handleAddCell = async () => {
    const id =
      typeof crypto !== 'undefined' && 'randomUUID' in crypto
        ? crypto.randomUUID()
        : `cell-${Date.now()}`
    // put it at the bottom
    const newCell = {
      id,
      x: 0,
      y: Infinity, // RGL will place it on next row
      w: 1,
      h: 1,
      title: '',
      locked: false,
    }
    const nextCells = [...cells, newCell]
    setCells(nextCells)
    await saveGrid(cols, nextCells)
  }

  // helper to generate full grid
  const makeGrid = (nCols: number, nRows: number) => {
    const result = []
    let counter = 0
    for (let y = 0; y < nRows; y += 1) {
      for (let x = 0; x < nCols; x += 1) {
        result.push({
          id: `cell-${nCols}x${nRows}-${counter++}`,
          x,
          y,
          w: 1,
          h: 1,
          title: '',
          locked: false,
        })
      }
    }
    return result
  }

  // 2) 4x4 grid
  const handleMake4x4 = async () => {
    const nextCols = 4
    const nextCells = makeGrid(4, 4)
    setCols(nextCols)
    setCells(nextCells)
    await saveGrid(nextCols, nextCells)
  }

  // 3) 6x6 grid
  const handleMake6x6 = async () => {
    const nextCols = 6
    const nextCells = makeGrid(6, 6)
    setCols(nextCols)
    setCells(nextCells)
    await saveGrid(nextCols, nextCells)
  }

  // 4) add locked action cell (top, full width)
  const handleAddActionCell = async () => {
    if (hasActionCell) return
    const action = {
      id: 'action-cell',
      x: 0,
      y: 0,
      w: cols,
      h: 1,
      title: 'Action',
      locked: true,
    }
    // push other cells down
    const shifted = cells.map((c) => ({
      ...c,
      y: (c.y ?? 0) + 1,
    }))
    const nextCells = [action, ...shifted]
    setCells(nextCells)
    await saveGrid(cols, nextCells)
  }

  const handleDeleteCell = useCallback(
    async (cellId: string) => {
      const cell = cells.find((c) => c.id === cellId)
      if (!cell) return

      let nextCells: typeof cells

      if (cell.locked) {
        // deleting the action cell: pull others up
        nextCells = cells
          .filter((c) => c.id !== cellId)
          .map((c) => ({
            ...c,
            y: Math.max(0, (c.y ?? 0) - 1),
          }))
      } else {
        // normal cell
        nextCells = cells.filter((c) => c.id !== cellId)
      }

      setCells(nextCells)
      await saveGrid(cols, nextCells)
    },
    [cells, cols, saveGrid],
  )

  return (
    <div className="space-y-2">
      {/* toolbar */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={handleAddCell}
          className="rounded bg-slate-200 px-3 py-1 text-sm"
        >
          + Add cell
        </button>
        <button
          type="button"
          onClick={handleMake4x4}
          className="rounded bg-slate-200 px-3 py-1 text-sm"
        >
          4 × 4 grid
        </button>
        <button
          type="button"
          onClick={handleMake6x6}
          className="rounded bg-slate-200 px-3 py-1 text-sm"
        >
          6 × 6 grid
        </button>
        <button
          type="button"
          onClick={handleAddActionCell}
          disabled={hasActionCell || cells.length === 0}
          className={`rounded px-3 py-1 text-sm ${
            hasActionCell || cells.length === 0
              ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
              : 'bg-amber-200'
          }`}
        >
          + Action cell
        </button>
      </div>

      {saving && <p className="text-xs text-slate-500">Saving…</p>}

      <ReactGridLayout
        className="layout"
        cols={cols}
        rowHeight={80}
        width={1200}
        layout={layout}
        onLayoutChange={handleLayoutChange}
        isResizable
        isDraggable
      >
        {cells.map((cell) => (
          <div
            key={cell.id}
            className="rounded border bg-white flex items-center justify-center p-2"
            data-locked={cell.locked ? 'true' : 'false'}
          >
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                e.preventDefault()
                handleDeleteCell(cell.id)
              }}
              onMouseDown={(e) => {
                e.stopPropagation()
              }}
              className="absolute top-1 right-1 rounded bg-red-500/90 text-white text-xs px-1.5 py-0.5 leading-none"
            >
              ×
            </button>

            {cell.locked ? (
              <div className="text-sm font-semibold">Action cell</div>
            ) : (
              <div className="text-sm">{cell.title ?? '—'}</div>
            )}
          </div>
        ))}
      </ReactGridLayout>
    </div>
  )
}
