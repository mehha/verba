'use client'

import React, { useState, useTransition } from 'react'
import Link from 'next/link'
import type { App } from '@/payload-types'
import { DndContext, closestCenter, type DragEndEvent } from '@dnd-kit/core'
import {
  SortableContext,
  useSortable,
  arrayMove,
  rectSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import {
  CircleArrowRight,
  Edit,
  GripVertical,
  ImageIcon,
  TrashIcon,
  UserCog,
} from 'lucide-react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { Media } from '@/components/Media'

type SortableAppsProps = {
  apps: App[]
  canManage: boolean // parent mode
  isAdmin: boolean   // roll, ainult ikooniks jms
  onReorder: (ids: string[]) => Promise<void>
  unpinAction: (formData: FormData) => Promise<void>
}

type SortableAppCardProps = {
  app: App
  canManage: boolean
  isAdmin: boolean
  unpinAction: (formData: FormData) => Promise<void>
}

function getVisualCell(app: App): any | undefined {
  const cells = (app as any)?.grid?.cells as any[] | undefined
  if (!Array.isArray(cells) || cells.length === 0) return undefined
  return cells.find((cell) => cell?.image || cell?.externalImageURL)
}

function SortableAppCard({
  app,
  canManage,
  isAdmin,
  unpinAction,
}: SortableAppCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({
      id: app.id,
    })

  const visualCell = getVisualCell(app)
  const hasUploadImage =
    visualCell?.image && typeof visualCell.image === 'object' && visualCell.image.url
  const hasExternalImage = visualCell?.externalImageURL

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
  }

  return (
    <li
      ref={setNodeRef}
      style={style}
      className="relative border p-3 flex flex-col gap-3 aspect-[4/3] w-[280px] rounded-xl bg-white shadow-sm ring-1 ring-gray-900/5"
    >
      <div className="flex items-center justify-between gap-2">
        {/* DRAG HANDLE – ainult parent mode saab sortida */}
        {canManage ? (
          <button
            type="button"
            {...listeners}
            {...attributes}
            onClick={(e) => e.preventDefault()}
            className="cursor-grab active:cursor-grabbing touch-none hover:bg-muted"
            aria-label="Muuda rakenduse järjekorda"
          >
            <GripVertical className="w-5 h-5" />
          </button>
        ) : (
          <span className="w-5 h-5" aria-hidden="true" />
        )}

        {canManage && (
          <div className="flex items-center gap-2">
            {isAdmin && <UserCog className="w-5 h-5" />}

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link href={`/app/${app.id}/edit`}>
                    <Edit className="w-5 h-5" />
                  </Link>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Muuda</p>
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <form className="flex items-center" action={unpinAction}>
                    <input type="hidden" name="appId" value={app.id} />
                    <button type="submit">
                      <TrashIcon className="w-5 h-5 text-red-600" />
                    </button>
                  </form>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Eemalda desktopilt</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        )}
      </div>

      <div className="relative w-full h-28 rounded-lg overflow-hidden flex items-center justify-center">
        {hasUploadImage ? (
          <Media
            resource={visualCell.image}
            alt={visualCell.image.alt || app.name}
            pictureClassName="block h-full w-full rounded-xl"
            imgClassName="h-full w-full object-contain"
            priority={false}
          />
        ) : hasExternalImage ? (
          <img
            src={visualCell.externalImageURL as string}
            alt={app.name}
            className="h-full w-full object-contain rounded-2xl"
          />
        ) : (
          <ImageIcon className="h-10 w-10 text-slate-400" />
        )}
      </div>

      <Link
        href={`/app/${app.id}`}
        className="flex-1 flex gap-2 items-center justify-between bg-gray-900/95 text-white py-1 px-3 shadow-sm ring-1 ring-gray-900/5 rounded-xl"
      >
        <h2 className="font-medium">{app.name}</h2>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <CircleArrowRight className="w-8 h-8 stroke-1 fill-pink-100 stroke-gray-900" />
            </TooltipTrigger>
            <TooltipContent>
              <p>Mängi</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </Link>
    </li>
  )
}

export function SortableApps({
  apps,
  canManage,
  isAdmin,
  onReorder,
  unpinAction,
}: SortableAppsProps) {
  const [items, setItems] = useState<App[]>(apps)
  const [isPending, startTransition] = useTransition()

  const handleDragEnd = (event: DragEndEvent) => {
    if (!canManage) return

    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = items.findIndex((item) => item.id === active.id)
    const newIndex = items.findIndex((item) => item.id === over.id)

    if (oldIndex === -1 || newIndex === -1) return

    const newItems = arrayMove(items, oldIndex, newIndex)
    setItems(newItems)

    startTransition(async () => {
      await onReorder(newItems.map((item) => item.id as string))
    })
  }

  return (
    <>
      <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext
          items={items.map((item) => item.id as string)}
          strategy={rectSortingStrategy}
        >
          <ul className="flex flex-wrap gap-4">
            {items.map((app) => (
              <SortableAppCard
                key={app.id}
                app={app}
                canManage={canManage}
                isAdmin={isAdmin}
                unpinAction={unpinAction}
              />
            ))}
          </ul>
        </SortableContext>
      </DndContext>

      {isPending && (
        <p className="mt-2 text-xs text-muted-foreground">
          Salvestan järjekorda…
        </p>
      )}
    </>
  )
}
