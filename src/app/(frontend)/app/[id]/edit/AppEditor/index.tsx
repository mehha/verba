'use client'

import RGL, { WidthProvider } from 'react-grid-layout'
import 'react-grid-layout/css/styles.css'
import 'react-resizable/css/styles.css'
import type { App } from '@/payload-types'
import { useAppGrid } from './useAppGrid'
import { AppEditorToolbar } from './Toolbar'
import { useViewportHeight } from '@/utilities/useViewportHeight'

const ReactGridLayout = WidthProvider(RGL)

type Props = {
  app: App
}

export default function AppEditor({ app }: Props) {
  const {
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
  } = useAppGrid(app)

  const vh = useViewportHeight()

  // how many rows do we actually need right now?
  const rowsNeeded =
    layout.length > 0
      ? Math.max(...layout.map((l) => (l.y ?? 0) + (l.h ?? 1)))
      : 1

  // space taken by toolbar + paddings
  const TOP_BAR = 36
  const HEADER = 98
  const FOOTER = 105
  const EXTRA = 24 // padding/margins
  const reserved = TOP_BAR + HEADER + FOOTER + EXTRA // = 165

  const available = Math.max(200, vh - reserved) // don’t go negative

  // responsive row height
  let rowHeight = Math.floor(available / rowsNeeded)

  // clamp to avoid too small / too big
  const MIN_ROW = 48
  const MAX_ROW = 240
  rowHeight = Math.min(MAX_ROW, Math.max(MIN_ROW, rowHeight))

  return (
    <div className="space-y-2">
      <div className="container">
        <AppEditorToolbar
          onAddCellAction={addCell}
          onMake4x4Action={make4x4}
          onMake6x6Action={make6x6}
          onAddActionCellAction={addActionCell}
          onClearAction={clearGrid}
          disableAction={hasActionCell || cells.length === 0}
          disableClear={cells.length === 0}
        />
      </div>

      {saving && <p className="text-xs text-slate-500">Saving…</p>}

      <ReactGridLayout
        className="layout"
        cols={cols}
        rowHeight={rowHeight}
        width={1200}
        layout={layout}
        onLayoutChange={onLayoutChange}
        isResizable
        isDraggable
      >
        {cells.map((cell) => (
          <div
            key={cell.id}
            className="rounded border bg-white flex items-center justify-center p-2 relative"
          >
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                e.preventDefault()
                deleteCell(cell.id)
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
