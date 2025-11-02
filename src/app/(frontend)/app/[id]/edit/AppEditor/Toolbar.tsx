"use client";

import { Button } from "@/components/ui/button";
import { Grid2X2, Trash } from 'lucide-react'

type ToolbarProps = {
  onAddCellAction: () => void;
  onMake2x2Action: () => void;
  onMake4x4Action: () => void;
  onMake6x6Action: () => void;
  onAddActionCellAction: () => void;
  onClearAction: () => void;
  disableAction: boolean;
  disableClear: boolean;
};

export function AppEditorToolbar({
  onAddCellAction,
  onMake2x2Action,
  onMake4x4Action,
  onMake6x6Action,
  onAddActionCellAction,
  onClearAction,
  disableAction,
  disableClear,
}: ToolbarProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {/* primary CTA */}
      <Button variant="outline" size="sm" type="button" onClick={onAddCellAction}>
        + Lisa üks ruut
      </Button>

      {/* layout presets */}
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={onMake2x2Action}
      >
        Lisa 2×2 <Grid2X2 width={14} style={{marginLeft: '2px'}} />
      </Button>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={onMake4x4Action}
      >
        Lisa 4×4 <Grid2X2 width={14} style={{marginLeft: '2px'}} />
      </Button>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={onMake6x6Action}
      >
        Lisa 6×6 <Grid2X2 width={14} style={{marginLeft: '2px'}} />
      </Button>

      {/* action cell */}
      <Button
        type="button"
        size="sm"
        variant={disableAction ? "outline" : "secondary"}
        onClick={onAddActionCellAction}
        disabled={disableAction}
      >
        + Lisa Tegevuskast
      </Button>

      {/* clear */}
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
  );
}
