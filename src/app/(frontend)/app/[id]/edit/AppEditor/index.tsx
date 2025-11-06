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

type Props = { app: App }

export default function AppEditor({ app }: Props) {
  const {
    saving, dirty,
    cols, cells, layout,
    onLayoutChange,
    addCell, make2x2, make4x4, make6x6,
    deleteCell, clearGrid,
    updateCellAction,
    actionBar, updateActionBar,
    saveDraft,
  } = useAppGrid(app)

  const vh = useViewportHeight()
  const { toggleModal } = useModal()
  const EDIT_MODAL_SLUG = 'edit-cell-modal'
  const [editingCellId, setEditingCellId] = useState<string | null>(null)

  const rowsNeeded = layout.length > 0 ? Math.max(...layout.map((l) => (l.y ?? 0) + (l.h ?? 1))) : 1

  const TOP_BAR = 36, HEADER = 98, FOOTER = 105, EXTRA = 24
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
    <div className="space-y-2 py-10">
      <div className="container mb-10">
        <h1 className="text-3xl text-center font-semibold leading-6 mb-10">{app.name}</h1>

        <div className="flex justify-between items-center gap-2">
          <div className="flex items-center gap-2">
            <AppEditorToolbar
              onAddCellAction={addCell}
              onMake2x2Action={make2x2}
              onMake4x4Action={make4x4}
              onMake6x6Action={make6x6}
              onClearAction={clearGrid}
              disableClear={cells.length === 0}
            />
            <label className="inline-flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={actionBar.enabled}
                onChange={(e) => void updateActionBar(e.target.checked)}
              />
              Kuvada tegevusriba
            </label>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => void saveDraft()}
              disabled={!dirty || saving}
            >
              {saving ? 'Salvestan…' : (dirty ? 'Salvesta' : 'Salvestatud')}
            </Button>

            <Link href={`/app/${app.id}`}>
              <Button variant="default" size="sm">
                Mängi
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {saving && <p className="text-xs text-slate-500 container">Salvestan…</p>}

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
              className="border overflow-hidden flex flex-col gap-1 aspect-[4/3] relative rounded-xl bg-white p-0 shadow-lg ring-1 ring-gray-900/5"
            >
              <div className="absolute top-1 right-1 z-10 flex gap-1">
                <Button
                  type="button"
                  size="sm"
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
                  size="sm"
                  variant="destructive"
                  onClick={(e) => {
                    e.stopPropagation()
                    e.preventDefault()
                    deleteCell(cell.id)
                  }}
                  onMouseDown={(e) => e.stopPropagation()}
                >
                  <Trash width={14} />
                </Button>
              </div>

              {renderCellImage(cell)}

              {cell.title && (
                <div className="absolute w-full bottom-0 left-0 p-2 bg-slate-800/85 text-white text-center">
                  <div className="text-2xl uppercase break-words leading-4">
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
