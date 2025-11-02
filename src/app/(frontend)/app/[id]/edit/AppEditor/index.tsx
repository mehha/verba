// src/components/AppEditor/index.tsx
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
    onLayoutChange,
    addCell,
    make2x2,
    make4x4,
    make6x6,
    deleteCell,
    clearGrid,
    updateCellAction,
    actionBar,         // 👈 NEW
    updateActionBar,   // 👈 NEW
  } = useAppGrid(app)

  const vh = useViewportHeight()
  const { toggleModal } = useModal()
  const EDIT_MODAL_SLUG = 'edit-cell-modal'

  const [editingCellId, setEditingCellId] = useState<string | null>(null)

  const rowsNeeded =
    layout.length > 0 ? Math.max(...layout.map((l) => (l.y ?? 0) + (l.h ?? 1))) : 1

  const TOP_BAR = 36
  const HEADER = 98
  const FOOTER = 105
  const EXTRA = 24
  const reserved = TOP_BAR + HEADER + FOOTER + EXTRA

  const available = Math.max(200, vh - reserved)
  let rowHeight = Math.floor(available / rowsNeeded)
  rowHeight = Math.min(240, Math.max(48, rowHeight))

  const currentEditingCell =
    editingCellId != null ? (cells.find((c) => c.id === editingCellId) ?? null) : null

  const handleModalSave = (cellId: string, patch: {
    title?: string
    externalImageURL?: string
    h?: number
    image?: string | number | { id: string | number; url?: string } | null
  }) => {
    // we know our hook can handle this, so just cast it
    void updateCellAction(cellId, patch as any)
  }
  const renderCellImage = (cell: any) => {
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
          onClearAction={clearGrid}
          disableClear={cells.length === 0}
        />

        <Link href={`/app/${app.id}`}>
          <Button variant="default" size="sm">
            Mängi
          </Button>
        </Link>
      </div>

      {saving && <p className="text-xs text-slate-500 container">Salvestan…</p>}

      <div className="w-full h-full overflow-y-auto">
        <div className="p-2 mt-6">
          <div className="rounded border bg-white p-3 flex flex-wrap gap-3 items-center">
            <label className="inline-flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={actionBar.enabled}
                onChange={(e) => {
                  void updateActionBar(e.target.checked)
                }}
              />
              Kuvada tegevusriba
            </label>

            {/* small preview */}
            <div className="flex-1 min-w-[200px] text-xs text-slate-500">
              {actionBar.enabled ? (
                <div className="inline-flex items-center gap-2 bg-slate-100 px-2 py-1 rounded">
                  <span className="font-medium">Tegevusriba</span>
                  <span className="text-slate-400">— siia tulevad klikitud sõnad</span>
                </div>
              ) : (
                <span className="text-slate-400 italic">Tegevusriba peidetud</span>
              )}
            </div>
          </div>
        </div>

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
                >
                  <Trash width={14} />
                </Button>
              </div>

              {renderCellImage(cell)}

              {cell.title && (
                <div className="absolute w-full bottom-0 left-0 p-1 bg-slate-800/65 text-white text-center">
                  <div className="text-lg uppercase break-words leading-4">
                    {cell.title}
                  </div>
                </div>
              )}
            </div>
          ))}
        </ReactGridLayout>
      </div>

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
        onSaveAction={handleModalSave}
      />
    </div>
  )
}
