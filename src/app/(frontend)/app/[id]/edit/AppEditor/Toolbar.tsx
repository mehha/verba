'use client'

type ToolbarProps = {
  onAddCellAction: () => void
  onMake4x4Action: () => void
  onMake6x6Action: () => void
  onAddActionCellAction: () => void
  onClearAction: () => void
  disableAction: boolean
  disableClear: boolean
}

export function AppEditorToolbar({
  onAddCellAction,
  onMake4x4Action,
  onMake6x6Action,
  onAddActionCellAction,
  onClearAction,
  disableAction,
  disableClear,
}: ToolbarProps) {
  return (
    <div className="flex gap-2 flex-wrap">
      <button
        type="button"
        onClick={onAddCellAction}
        className="rounded bg-slate-200 px-3 py-1 text-sm"
      >
        + Add cell
      </button>
      <button
        type="button"
        onClick={onMake4x4Action}
        className="rounded bg-slate-200 px-3 py-1 text-sm"
      >
        4 × 4 grid
      </button>
      <button
        type="button"
        onClick={onMake6x6Action}
        className="rounded bg-slate-200 px-3 py-1 text-sm"
      >
        6 × 6 grid
      </button>
      <button
        type="button"
        onClick={onAddActionCellAction}
        disabled={disableAction}
        className={`rounded px-3 py-1 text-sm ${
          disableAction
            ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
            : 'bg-amber-200'
        }`}
      >
        + Action cell
      </button>
      <button
        type="button"
        onClick={onClearAction}
        disabled={disableClear}
        className={`rounded px-3 py-1 text-sm ${
          disableClear
            ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
            : 'bg-red-100 text-red-700'
        }`}
      >
        Clear grid
      </button>
    </div>
  )
}
