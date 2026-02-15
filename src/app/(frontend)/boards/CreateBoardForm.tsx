'use client'

import { useMemo, useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { PlusCircle } from 'lucide-react'

type CreateBoardFormProps = {
  createBoard: (formData: FormData) => Promise<void>
}

export function CreateBoardForm({ createBoard }: CreateBoardFormProps) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')

  const canSubmit = useMemo(() => name.trim().length > 0, [name])

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen)
        if (!nextOpen) setName('')
      }}
    >
      <DialogTrigger asChild>
        <Button type="button" className="gap-2">
          <PlusCircle className="h-4 w-4" />
          Lisa uus tahvel
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Lisa uus tahvel</DialogTitle>
          <DialogDescription>
            Sisesta tahvli nimi, et see luua.
          </DialogDescription>
        </DialogHeader>

        <form action={createBoard} className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="new-board-name">Nimi</Label>
            <Input
              id="new-board-name"
              name="name"
              placeholder="Nt Kodu"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoComplete="off"
              autoFocus
            />
          </div>

          <DialogFooter className="gap-2">
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Loobu
              </Button>
            </DialogClose>
            <Button type="submit" disabled={!canSubmit}>
              Lisa uus tahvel
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
