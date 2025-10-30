import type { CollectionBeforeChangeHook } from 'payload'

type GridCell = {
  id: string
  x: number
  y: number
  w: number
  h: number
  title?: string
  image?: string | number // or upload rel
  externalImageURL?: string
  audio?: string | number
  locked?: boolean
}

export const ensureActionCell: CollectionBeforeChangeHook = ({ req, data, originalDoc, operation }) => {
  // Ownership enforcement
  if (
    operation === 'update' &&
    req.user?.role !== 'admin' &&
    originalDoc?.owner !== req.user?.id
  ) {
    throw new Error('Not allowed')
  }

  const cols =
    data?.grid?.cols ??
    originalDoc?.grid?.cols ??
    6

  const actionId = 'action-cell'
  const action: GridCell = {
    id: actionId,
    x: 0,
    y: 0,
    w: cols,
    h: 1,
    title: 'Action',
    locked: true,
  }

  let cells: GridCell[] = Array.isArray(data?.grid?.cells)
    ? (data.grid.cells as GridCell[])
    : ((originalDoc?.grid?.cells as GridCell[]) || [])

  const idx = cells.findIndex((cell) => cell.id === actionId)

  if (idx === -1) {
    // insert action at top, push others down
    cells = [
      action,
      ...cells.map((cell) => ({
        ...cell,
        y: (cell.y ?? 0) + 1,
      })),
    ]
  } else {
    cells[idx] = {
      ...cells[idx],
      ...action,
      w: cols,
      x: 0,
      y: 0,
      locked: true,
    }
  }

  data.grid = {
    ...(data.grid || {}),
    cells,
    actionCellId: actionId,
    cols,
  }

  return data
}
