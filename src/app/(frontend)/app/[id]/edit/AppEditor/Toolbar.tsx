'use client'

import { Button } from '@/components/ui/button'
import { Grid2X2, Trash } from 'lucide-react'

type ToolbarProps = {
  onAddCellAction: () => void
  onMake2x2Action: () => void
  onMake4x4Action: () => void
  onMake6x6Action: () => void
  onClearAction: () => void
  disableClear: boolean
}

export function AppEditorToolbar({
  onAddCellAction,
  onMake2x2Action,
  onMake4x4Action,
  onMake6x6Action,
  onClearAction,
  disableClear,
}: ToolbarProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <Button variant="outline" size="sm" type="button" onClick={onAddCellAction}>
        + Lisa üks ruut
      </Button>

      <Button variant="outline" size="sm" type="button" onClick={onMake2x2Action}>
        Lisa 2×2 <Grid2X2 width={14} className="ml-1" />
      </Button>
      <Button variant="outline" size="sm" type="button" onClick={onMake4x4Action}>
        Lisa 4×4 <Grid2X2 width={14} className="ml-1" />
      </Button>
      <Button variant="outline" size="sm" type="button" onClick={onMake6x6Action}>
        Lisa 6×6 <Grid2X2 width={14} className="ml-1" />
      </Button>

      <Button
        title="Kustuta kõik kastid"
        type="button"
        size="sm"
        variant="destructive"
        onClick={onClearAction}
        disabled={disableClear}
      >
        <Trash width={14} />
      </Button>
    </div>
  )
}
