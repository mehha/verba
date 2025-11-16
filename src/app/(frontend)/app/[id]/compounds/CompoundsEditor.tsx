'use client'

import { useMemo, useState, useTransition } from 'react'
import Link from 'next/link'
import { Play, Trash } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { App } from '@/payload-types'

type CellOption = {
  id: string
  title: string
}

type Compound = NonNullable<App['compounds']>[number]

type CompoundsEditorProps = {
  appId: string
  initialCompounds: Compound[] | null | undefined
  cells: CellOption[]
  onSave: (appId: string, compounds: Compound[]) => Promise<void>
}

// Hoia cells/parts sama pikkusega
function normalizeCompoundStructure(c: Compound): Compound {
  const cells = c.cells ?? []
  const parts = c.parts ?? []
  const paddedParts = [...parts]

  if (paddedParts.length < cells.length) {
    for (let i = paddedParts.length; i < cells.length; i++) {
      paddedParts.push({ surface: '', tts: '' })
    }
  }

  return {
    ...c,
    cells,
    parts: paddedParts,
  }
}

export function CompoundsEditor({
  appId,
  initialCompounds,
  cells,
  onSave,
}: CompoundsEditorProps) {
  const [isPending, startTransition] = useTransition()
  const [status, setStatus] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [showTts, setShowTts] = useState(false)

  const cellTitleById = useMemo(
    () =>
      new Map<string, string>(
        cells.map((c) => [c.id, c.title || c.id]),
      ),
    [cells],
  )

  const [compounds, setCompounds] = useState<Compound[]>(() =>
    (initialCompounds ?? []).map(normalizeCompoundStructure),
  )

  const addCompound = () => {
    const defaultCellId = cells[0]?.id ?? ''
    const defaultTitle =
      defaultCellId && cellTitleById.get(defaultCellId)
        ? (cellTitleById.get(defaultCellId) as string)
        : defaultCellId

    const id =
      typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : `compound-${Date.now()}`

    const newCompound: Compound = normalizeCompoundStructure({
      id,
      cells: defaultCellId ? [{ cellId: defaultCellId }] : [],
      parts: defaultCellId
        ? [{ surface: defaultTitle, tts: defaultTitle }]
        : [],
    })

    setCompounds((prev) => [...prev, newCompound])
    setStatus(null)
    setError(null)
  }

  const removeCompound = (index: number) => {
    setCompounds((prev) => prev.filter((_, i) => i !== index))
    setStatus(null)
    setError(null)
  }

  const addCellToCompound = (compoundIndex: number) => {
    if (!cells.length) return

    const defaultCellId = cells[0].id
    const defaultTitle =
      cellTitleById.get(defaultCellId) ?? defaultCellId

    setCompounds((prev) =>
      prev.map((c, i) => {
        if (i !== compoundIndex) return c

        const nextCells = [...(c.cells ?? []), { cellId: defaultCellId }]
        const nextParts = [
          ...(c.parts ?? []),
          { surface: defaultTitle, tts: defaultTitle },
        ]

        return normalizeCompoundStructure({
          ...c,
          cells: nextCells,
          parts: nextParts,
        })
      }),
    )

    setStatus(null)
    setError(null)
  }

  const updateCellInCompound = (
    compoundIndex: number,
    cellIndex: number,
    newCellId: string,
  ) => {
    setCompounds((prev) =>
      prev.map((c, i) => {
        if (i !== compoundIndex) return c

        const nextCells = [...(c.cells ?? [])]
        const nextParts = [...(c.parts ?? [])]
        const oldCellId = nextCells[cellIndex]?.cellId

        nextCells[cellIndex] = { cellId: newCellId }

        const oldTitle =
          (oldCellId && cellTitleById.get(oldCellId)) ?? oldCellId ?? ''
        const newTitle =
          cellTitleById.get(newCellId) ?? newCellId

        if (!nextParts[cellIndex]) {
          nextParts[cellIndex] = { surface: newTitle, tts: newTitle }
        } else {
          const part = nextParts[cellIndex]
          const isSurfaceDefault =
            !part.surface || part.surface === oldTitle
          const isTtsDefault =
            !part.tts || part.tts === oldTitle

          nextParts[cellIndex] = {
            surface: isSurfaceDefault ? newTitle : part.surface,
            tts: isTtsDefault ? newTitle : part.tts,
          }
        }

        return normalizeCompoundStructure({
          ...c,
          cells: nextCells,
          parts: nextParts,
        })
      }),
    )

    setStatus(null)
    setError(null)
  }

  const removeCellFromCompound = (compoundIndex: number, cellIndex: number) => {
    setCompounds((prev) =>
      prev.map((c, i) => {
        if (i !== compoundIndex) return c

        const nextCells = [...(c.cells ?? [])].filter(
          (_, idx) => idx !== cellIndex,
        )
        const nextParts = [...(c.parts ?? [])].filter(
          (_, idx) => idx !== cellIndex,
        )

        return normalizeCompoundStructure({
          ...c,
          cells: nextCells,
          parts: nextParts,
        })
      }),
    )

    setStatus(null)
    setError(null)
  }

  const handlePartChange = (
    compoundIndex: number,
    partIndex: number,
    key: 'surface' | 'tts',
    value: string,
  ) => {
    setCompounds((prev) =>
      prev.map((c, i) => {
        if (i !== compoundIndex) return c

        const nextParts = [...(c.parts ?? [])]
        const existing = nextParts[partIndex] || { surface: '', tts: '' }
        const prevSurface = existing.surface ?? ''
        const prevTts = existing.tts ?? ''

        if (key === 'surface') {
          const newSurface = value
          const shouldCloneTts =
            !prevTts || prevTts === prevSurface

          nextParts[partIndex] = {
            surface: newSurface,
            tts: shouldCloneTts ? newSurface : prevTts,
          }
        } else {
          nextParts[partIndex] = {
            ...existing,
            tts: value,
          }
        }

        return normalizeCompoundStructure({
          ...c,
          parts: nextParts,
        })
      }),
    )

    setStatus(null)
    setError(null)
  }

  const handleSaveAll = () => {
    setStatus(null)
    setError(null)

    const invalid = compounds.find((c) => {
      if (!c.id || !c.id.trim()) return true
      if (!c.cells || c.cells.length === 0) return true
      if (!c.parts || c.parts.length !== c.cells.length) return true
      if (c.parts.some((p) => !p.surface || !p.surface.trim())) return true
      return false
    })

    if (invalid) {
      setError(
        'Kõik sõnaühendid vajavad vähemalt ühte celli ja igale positsioonile surface väärtust.',
      )
      return
    }

    startTransition(() => {
      onSave(appId, compounds)
        .then(() => {
          setStatus('Salvestatud.')
        })
        .catch((err) => {
          console.error(err)
          setError('Salvestamine ebaõnnestus.')
        })
    })
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-4">
        <div className="text-sm text-muted-foreground">
          <p>
            Sõnaühendid on cellide jada, kus igal positsioonil saad määrata
            kuvatava sõna ja (soovi korral) eraldi TTS-häälduse.
          </p>
          <p>
            Näiteks: cellid <code>kaks</code> + <code>kass</code> → sõnad{' '}
            <code>[&quot;kaks&quot;, &quot;kassi&quot;]</code>.
          </p>
        </div>
        <Button type="button" size="sm" onClick={addCompound}>
          Lisa sõnaühend
        </Button>
      </div>

      {!cells.length && (
        <p className="rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-800">
          Sellel appil ei ole ühtegi celli. Lisa kõigepealt cellid, et saaksid
          neist sõnaühendeid koostada.
        </p>
      )}

      {compounds.length === 0 && (
        <p className="text-sm text-muted-foreground">
          Sõnaühendeid pole veel lisatud.
        </p>
      )}

      <div className="flex flex-col gap-3">
        {compounds.map((compound, index) => (
          <div
            key={compound.id || index}
            className="flex flex-col gap-3 rounded-xl border bg-card p-4"
          >
            {/* Kaardi header */}
            <div className="flex items-center justify-between gap-3">
              <div className="flex flex-col">
                <span className="text-xs font-medium uppercase text-muted-foreground">
                  Sõnaühend #{index + 1}
                </span>
                {compound.id && (
                  <span
                    className="truncate text-[10px] text-muted-foreground"
                    title={compound.id}
                  >
                    ID: {compound.id}
                  </span>
                )}
              </div>
              <Button
                type="button"
                size="xs"
                variant="destructive"
                onClick={() => removeCompound(index)}
              >
                Kustuta sõnaühend
              </Button>
            </div>

            {/* TABEL: üks rida = üks positsioon fraasis */}
            <div className="overflow-x-auto rounded-lg border">
              <table className="w-full border-collapse text-sm">
                <thead className="bg-muted/60">
                  <tr>
                    <th className="w-10 border-b px-2 py-1 text-left text-[11px] font-medium uppercase text-muted-foreground">
                      #
                    </th>
                    <th className="border-b px-2 py-1 text-left text-[11px] font-medium uppercase text-muted-foreground">
                      Cell
                    </th>
                    <th className="border-b px-2 py-1 text-left text-[11px] font-medium uppercase text-muted-foreground">
                      Sõna
                    </th>
                    {showTts && (
                      <th className="border-b px-2 py-1 text-left text-[11px] font-medium uppercase text-muted-foreground">
                        TTS
                      </th>
                    )}
                    <th className="w-10 border-b px-2 py-1" />
                  </tr>
                </thead>
                <tbody>
                  {(compound.cells ?? []).map((cc, posIndex) => {
                    const part =
                      compound.parts?.[posIndex] ?? { surface: '', tts: '' }

                    return (
                      <tr key={`${compound.id}-row-${posIndex}`}>
                        <td className="border-b px-2 py-1 text-[11px] text-muted-foreground">
                          {posIndex + 1}
                        </td>
                        <td className="border-b px-2 py-1">
                          <Select
                            value={cc.cellId}
                            onValueChange={(v) =>
                              updateCellInCompound(index, posIndex, v)
                            }
                          >
                            <SelectTrigger className="h-8 w-[220px] text-xs">
                              <SelectValue placeholder="Vali cell" />
                            </SelectTrigger>
                            <SelectContent>
                              {cells.map((cell) => (
                                <SelectItem
                                  key={cell.id}
                                  value={cell.id}
                                  title={cell.id}
                                >
                                  {cell.title}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </td>
                        <td className="border-b px-2 py-1">
                          <Input
                            id={`cmp-surface-${index}-${posIndex}`}
                            className="h-8 w-[220px] text-xs"
                            value={part.surface ?? ''}
                            onChange={(e) =>
                              handlePartChange(
                                index,
                                posIndex,
                                'surface',
                                e.target.value,
                              )
                            }
                            placeholder="nt kaks / kassi"
                          />
                        </td>
                        {showTts && (
                          <td className="border-b px-2 py-1">
                            <Input
                              id={`cmp-tts-${index}-${posIndex}`}
                              className="h-8 w-[220px] text-xs"
                              value={part.tts ?? ''}
                              onChange={(e) =>
                                handlePartChange(
                                  index,
                                  posIndex,
                                  'tts',
                                  e.target.value,
                                )
                              }
                              placeholder="kui tühi, kasutatakse sõna väärtust"
                            />
                          </td>
                        )}
                        <td className="border-b px-2 py-1 text-right">
                          <Button
                            type="button"
                            size="icon"
                            variant="ghost"
                            onClick={() =>
                              removeCellFromCompound(index, posIndex)
                            }
                            aria-label="Eemalda rida"
                          >
                            <Trash className="h-4 w-4 text-red-600" />
                          </Button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between gap-2">
              <Button
                type="button"
                size="xs"
                variant="outline"
                disabled={!cells.length}
                onClick={() => addCellToCompound(index)}
              >
                Lisa rida
              </Button>
              <p className="text-[11px] text-muted-foreground">
                Järjekord on oluline – kombinatsioon matchitakse vasakult
                paremale.
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 flex items-center justify-between gap-4 border-t pt-4">
        <div className="text-xs">
          {status && <span className="text-emerald-700">{status}</span>}
          {error && <span className="text-red-600">{error}</span>}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => setShowTts((v) => !v)}
          >
            {showTts ? 'Peida TTS väljad' : 'Näita TTS välju'}
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={addCompound}
          >
            Lisa sõnaühend
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={handleSaveAll}
            disabled={isPending}
          >
            {isPending ? 'Salvestan…' : 'Salvesta kõik'}
          </Button>
          <Link href={`/app/${appId}`}>
            <Button variant="positive" size="sm">
              <Play className="h-5 w-5" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
