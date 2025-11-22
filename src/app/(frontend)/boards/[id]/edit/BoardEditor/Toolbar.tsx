'use client'

import { Button } from '@/components/ui/button'
import { Grid2X2, Trash } from 'lucide-react'

type ToolbarProps = {
  onAddCellAction: () => void
  onMake2x2Action: () => void
  onAddRowAction: () => void
  onClearAction: () => void
  disableClear: boolean
}

export function BoardEditorToolbar({
  onAddCellAction,
  onMake2x2Action,
  onAddRowAction,
  onClearAction,
  disableClear,
}: ToolbarProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <Button variant="outline" size="xs" type="button" onClick={onAddCellAction}>
        + Lisa üks ruut
      </Button>

      <Button variant="outline" size="xs" type="button" className="relative pr-6" onClick={onMake2x2Action}>
        Lisa 2×2 <Grid2X2 width={14} className="absolute right-2 top-1/2 -translate-y-1/2" />
      </Button>
      <Button variant="outline" size="xs" type="button" className="relative pr-6" onClick={onAddRowAction}>
        Lisa rida <Grid2X2 width={14} className="absolute right-2 top-1/2 -translate-y-1/2" />
      </Button>

      <Button
        title="Kustuta kõik kastid"
        type="button"
        size="xs"
        variant="destructive"
        onClick={onClearAction}
        disabled={disableClear}
      >
        <Trash width={14} />
      </Button>
    </div>
  )
}
