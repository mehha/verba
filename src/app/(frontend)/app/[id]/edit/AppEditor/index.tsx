// src/components/AppEditor/index.tsx (või src/app/(frontend)/app/[id]/edit/AppEditor/index.tsx)
'use client'

import RGL, { WidthProvider } from 'react-grid-layout'
import 'react-grid-layout/css/styles.css'
import 'react-resizable/css/styles.css'
import type { App, Media } from '@/payload-types'
import { useAppGrid } from './useAppGrid'
import { AppEditorToolbar } from './Toolbar'
import { useViewportHeight } from '@/utilities/useViewportHeight'
import { CellEditModal } from './CellEditModal'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Play, Trash, WholeWord, Edit3, Check, X } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'

const ReactGridLayout = WidthProvider(RGL)

type Props = {
  app: App
  renameApp: (formData: FormData) => Promise<void>
}

export default function AppEditor({ app, renameApp }: Props) {
  const {
    saving,
    dirty,
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
    actionBar,
    updateActionBar,
    saveDraft,
    aiEnabled,
    updateAi,
  } = useAppGrid(app)

  const vh = useViewportHeight()
  const [editingCellId, setEditingCellId] = useState<string | null>(null)

  // title edit local state
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [titleDraft, setTitleDraft] = useState(app.name ?? '')

  const rowsNeeded =
    layout.length > 0
      ? Math.max(...layout.map((l) => (l.y ?? 0) + (l.h ?? 1)))
      : 1

  const TOP_BAR = 36,
    HEADER = 98,
    FOOTER = 105,
    EXTRA = 24
  const reserved = TOP_BAR + HEADER + FOOTER + EXTRA
  const available = Math.max(200, vh - reserved)
  let rowHeight = Math.floor(available / rowsNeeded)
  rowHeight = Math.min(240, Math.max(48, rowHeight))

  const currentEditingCell =
    editingCellId != null
      ? cells.find((c) => c.id === editingCellId) ?? null
      : null

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
      (cell?.image &&
        typeof cell.image === 'object' &&
        (cell.image as Media).url) ||
      ''
    if (!src) return null
    return (
      <div className="relative h-full w-full min-h-[4rem]">
        <Image
          src={src}
          alt={cell.title ?? ''}
          fill
          sizes="(max-width: 768px) 100vw, 1200px"
          className="rounded object-contain"
        />
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <div className="container mb-10">
        <div className="mb-10 flex items-center justify-between gap-2">
          {/* Title + edit */}
          <div className="flex items-center gap-2">
            {isEditingTitle ? (
              <form
                action={renameApp}
                className="flex items-center gap-2"
                onSubmit={() => {
                  setIsEditingTitle(false)
                }}
              >
                <input type="hidden" name="appId" value={app.id as string} />
                <Input
                  name="name"
                  autoFocus
                  value={titleDraft}
                  onChange={(e) => setTitleDraft(e.target.value)}
                  className="h-9 w-64 text-lg font-semibold"
                  placeholder="Nimetu äpp"
                />
                <Button
                  type="submit"
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8"
                >
                  <Check className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8"
                  onClick={() => {
                    setIsEditingTitle(false)
                    setTitleDraft(app.name ?? '')
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </form>
            ) : (
              <>
                <h1 className="text-3xl font-semibold leading-6">
                  {app.name || 'Nimetu äpp'}
                </h1>
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8"
                  onClick={() => setIsEditingTitle(true)}
                >
                  <Edit3 className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>

          {/* Parempoolsed nupud */}
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => void saveDraft()}
              disabled={!dirty || saving}
            >
              {saving ? 'Salvestan…' : dirty ? 'Salvesta' : 'Salvestatud'}
            </Button>

            <Link
              href={`/app/${app.id}/compounds`}
              className="text-sm text-primary underline-offset-4 hover:underline"
            >
              <Button variant="secondary" size="sm">
                <WholeWord className="mr-2 h-5 w-5 text-pink-600" /> Halda sõnaühendeid
              </Button>
            </Link>

            <Link href={`/app/${app.id}`}>
              <Button variant="positive" size="sm">
                <Play className="h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>

        <div className="flex items-center justify-between gap-2">
          <AppEditorToolbar
            onAddCellAction={addCell}
            onMake2x2Action={make2x2}
            onMake4x4Action={make4x4}
            onMake6x6Action={make6x6}
            onClearAction={clearGrid}
            disableClear={cells.length === 0}
          />
          <div className="flex items-center gap-3">
            <div className="flex items-center space-x-2">
              <Switch
                id="action-bar-toggle"
                checked={actionBar.enabled}
                onCheckedChange={(checked) => {
                  void updateActionBar(checked)
                }}
              />
              <Label htmlFor="action-bar-toggle">
                {actionBar.enabled ? 'Peida tegevusriba' : 'Kuva tegevusriba'}
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="action-ai-toggle"
                checked={aiEnabled}
                onCheckedChange={(checked) => {
                  void updateAi(checked)
                }}
              />
              <Label htmlFor="action-ai-toggle">
                {aiEnabled ? 'Deaktiveeri AI' : 'Aktiveeri AI'}
              </Label>
            </div>
          </div>
        </div>
      </div>

      {saving && (
        <p className="container text-xs text-slate-500">Salvestan…</p>
      )}

      <div className="h-full w-full overflow-y-auto">
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
              className="relative flex aspect-[4/3] flex-col gap-1 overflow-hidden rounded-xl bg-white p-0 shadow-lg ring-1 ring-gray-900/5"
            >
              <div className="absolute right-1 top-1 z-10 flex gap-1">
                <Button
                  type="button"
                  size="xs"
                  variant="secondary"
                  onClick={(e) => {
                    e.stopPropagation()
                    e.preventDefault()
                    setEditingCellId(cell.id)
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
                  onMouseDown={(e) => e.stopPropagation()}
                >
                  <Trash width={14} />
                </Button>
              </div>

              {renderCellImage(cell)}

              {cell.title && (
                <div className="absolute bottom-0 left-0 w-full bg-slate-800/85 p-2 text-center text-white">
                  <div className="break-words text-2xl uppercase leading-4">
                    {cell.title}
                  </div>
                </div>
              )}
            </div>
          ))}
        </ReactGridLayout>
      </div>

      <CellEditModal
        open={!!currentEditingCell}
        onOpenChange={(open) => {
          if (!open) {
            setEditingCellId(null)
          }
        }}
        cell={
          currentEditingCell
            ? {
                id: currentEditingCell.id,
                title: currentEditingCell.title ?? '',
                externalImageURL: currentEditingCell.externalImageURL ?? '',
                h: currentEditingCell.h ?? 1,
                image: currentEditingCell.image,
              }
            : null
        }
        onSaveAction={handleModalSave}
      />
    </div>
  )
}
