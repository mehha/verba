'use client'

import RGL, { WidthProvider } from 'react-grid-layout'
import 'react-grid-layout/css/styles.css'
import 'react-resizable/css/styles.css'
import type { App, Media } from '@/payload-types'
import { useAppGrid } from './useAppGrid'
import { AppEditorToolbar } from './Toolbar'
import { useViewportHeight } from '@/utilities/useViewportHeight'
import { useModal } from '@faceless-ui/modal'
import { CellEditModal } from './CellEditModal'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Trash } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

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
    make2x2,
    make4x4,
    make6x6,
    addActionCell,
    deleteCell,
    clearGrid,
    updateCellAction,
  } = useAppGrid(app)

  const vh = useViewportHeight()
  const { toggleModal } = useModal()
  const EDIT_MODAL_SLUG = 'edit-cell-modal'

  const [editingCellId, setEditingCellId] = useState<string | null>(null)

  // how many rows do we actually need right now?
  const rowsNeeded = layout.length > 0 ? Math.max(...layout.map((l) => (l.y ?? 0) + (l.h ?? 1))) : 1

  // space taken by toolbar + paddings
  const TOP_BAR = 36
  const HEADER = 98
  const FOOTER = 105
  const EXTRA = 24 // padding/margins
  const reserved = TOP_BAR + HEADER + FOOTER + EXTRA

  const available = Math.max(200, vh - reserved)

  // responsive row height
  let rowHeight = Math.floor(available / rowsNeeded)

  // clamp
  const MIN_ROW = 48
  const MAX_ROW = 240
  rowHeight = Math.min(MAX_ROW, Math.max(MIN_ROW, rowHeight))

  const currentEditingCell =
    editingCellId != null ? (cells.find((c) => c.id === editingCellId) ?? null) : null

  // helper to render image preview just like runner
  const renderCellImage = (cell: any) => {
    // figure out source first
    const src =
      cell?.externalImageURL ||
      (cell?.image && typeof cell.image === 'object' && (cell.image as Media).url) ||
      ''

    if (!src) return null

    return (
      <div className="relative w-full h-full min-h-[4rem]">
        <Image
          src={src}
          alt={cell.title ?? ''}
          fill
          sizes="(max-width: 768px) 100vw, 1200px"
          className="object-contain rounded"
        />
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <div className="container flex justify-between items-center gap-2">
        <AppEditorToolbar
          onAddCellAction={addCell}
          onMake2x2Action={make2x2}
          onMake4x4Action={make4x4}
          onMake6x6Action={make6x6}
          onAddActionCellAction={addActionCell}
          onClearAction={clearGrid}
          disableAction={hasActionCell || cells.length === 0}
          disableClear={cells.length === 0}
        />

        <Link href={`/app/${app.id}`}>
          <Button variant="default" size="sm">
            Mängi
          </Button>
        </Link>
      </div>

      {saving && <p className="text-xs text-slate-500">Saving…</p>}

      <div className="w-full h-full overflow-y-auto">
        <ReactGridLayout
          className="layout"
          cols={cols}
          rowHeight={200}
          width={1200}
          layout={layout}
          onLayoutChange={onLayoutChange}
          isResizable
          isDraggable
        >
          {cells.map((cell) => (
            <div
              key={cell.id}
              className="rounded border bg-white p-0 relative flex flex-col gap-1 min-h-[4rem]"
            >
              <div className="absolute top-1 right-1 z-10 flex gap-1">

                {/* edit */}
                {!cell.locked &&
                  <Button
                    type="button"
                    size="xs"
                    variant="secondary"
                    onClick={(e) => {
                      e.stopPropagation()
                      e.preventDefault()
                      setEditingCellId(cell.id)
                      toggleModal(EDIT_MODAL_SLUG)
                    }}
                    onMouseDown={(e) => e.stopPropagation()}
                  >
                    Muuda
                  </Button>
                }

                {/* delete */}
                <Button
                  type="button"
                  size="xs"
                  variant="destructive"
                  onClick={(e) => {
                    e.stopPropagation()
                    e.preventDefault()
                    deleteCell(cell.id)
                  }}
                  onMouseDown={(e) => {
                    e.stopPropagation()
                  }}
                  className=""
                >
                  <Trash width={14} />
                </Button>
              </div>

              {cell.locked && <div className="text-sm font-semibold">Mänguriba</div>}

              {!cell.locked && (
                <>
                  {renderCellImage(cell)}

                  {cell.title && (
                    <div className="absolute w-full bottom-0 left-0 p-1 bg-slate-800/65 text-white text-center">
                      <div className="text-lg uppercase break-words leading-4">{cell.title}</div>
                    </div>
                  )}
                </>
              )}
            </div>
          ))}
        </ReactGridLayout>
      </div>

      {/* modal */}
      <CellEditModal
        slug={EDIT_MODAL_SLUG}
        cell={
          currentEditingCell
            ? {
                id: currentEditingCell.id,
                title: currentEditingCell.title ?? '',
                externalImageURL: currentEditingCell.externalImageURL ?? '',
                h: currentEditingCell.h ?? 1,
              }
            : null
        }
        onSaveAction={updateCellAction}
      />
    </div>
  )
}
