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
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Badge } from '@/components/ui/badge'
import type { Board } from '@/payload-types'

type CellOption = {
  id: string
  title: string
}

type Compound = NonNullable<Board['compounds']>[number]

type CompoundsEditorProps = {
  boardId: string
  initialCompounds: Compound[] | null | undefined
  cells: CellOption[]
  onSave: (boardId: string, compounds: Compound[]) => Promise<void>
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

function isCompoundValid(c: Compound): boolean {
  if (!c.id || !c.id.trim()) return false
  if (!c.cells || c.cells.length === 0) return false
  if (!c.parts || c.parts.length !== c.cells.length) return false
  if (c.parts.some((p) => !p.surface || !p.surface.trim())) return false
  return true
}

function getCompoundPreview(
  c: Compound,
  cellTitleById: Map<string, string>,
): string {
  // 1) kas surface väärtused olemas
  const surfaces =
    c.parts
      ?.map((p) => (p.surface ?? '').trim())
      .filter(Boolean) ?? []

  if (surfaces.length) {
    return surfaces.join(' ')
  }

  // 2) fallback: cellide pealkirjad
  const cellTitles =
    c.cells
      ?.map(({ cellId }) => cellTitleById.get(cellId) ?? cellId)
      .filter(Boolean) ?? []

  if (cellTitles.length) {
    return cellTitles.join(' ')
  }

  // 3) viimane fallback
  return 'Nimetu sõnaühend'
}

export function CompoundsEditor({
  boardId,
  initialCompounds,
  cells,
  onSave,
}: CompoundsEditorProps) {
  const [isPending, startTransition] = useTransition()
  const [status, setStatus] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [showTts, setShowTts] = useState(false)
  const [filter, setFilter] = useState('')

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

    const invalid = compounds.find((c) => !isCompoundValid(c))

    if (invalid) {
      setError(
        'Kõik sõnaühendid vajavad vähemalt ühte celli ja igale positsioonile surface väärtust.',
      )
      return
    }

    startTransition(() => {
      onSave(boardId, compounds)
        .then(() => {
          setStatus('Salvestatud.')
        })
        .catch((err) => {
          console.error(err)
          setError('Salvestamine ebaõnnestus.')
        })
    })
  }

  // Filter: otsi preview ja ID järgi
  const filteredCompounds = useMemo(
    () =>
      compounds
        .map((compound, index) => ({
          compound,
          index, // originaalindeks, et handlerid töötaks
          preview: getCompoundPreview(compound, cellTitleById),
        }))
        .filter(({ compound, preview }) => {
          if (!filter.trim()) return true
          const q = filter.toLowerCase()
          return (
            preview.toLowerCase().includes(q) ||
            (compound.id ?? '').toLowerCase().includes(q)
          )
        }),
    [compounds, filter, cellTitleById],
  )

  return (
    <div className="flex flex-col gap-4">
      {/* Header + filter */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
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
        <div className="flex flex-col gap-2 md:items-end">
          <Input
            placeholder="Otsi sõnaühendit või ID järgi…"
            className="h-8 w-full max-w-xs text-xs"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
          <Button type="button" size="sm" onClick={addCompound}>
            Lisa sõnaühend
          </Button>
        </div>
      </div>

      {!cells.length && (
        <p className="rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-800">
          Sellel tahvlil ei ole ühtegi celli. Lisa kõigepealt cellid, et saaksid
          neist sõnaühendeid koostada.
        </p>
      )}

      {compounds.length === 0 && (
        <p className="text-sm text-muted-foreground">
          Sõnaühendeid pole veel lisatud.
        </p>
      )}

      {/* Accordion list */}
      <Accordion
        type="single"
        collapsible
        className="w-full space-y-2"
      >
        {filteredCompounds.map(({ compound, index, preview }) => {
          const rowCount = compound.cells?.length ?? 0
          const valid = isCompoundValid(compound)

          return (
            <AccordionItem
              key={compound.id || index}
              value={compound.id || String(index)}
              className="rounded-xl border bg-card px-3"
            >
              <div className="">
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
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
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="truncate text-xs md:text-sm">
                        {preview}
                      </span>
                      <Badge
                        variant={valid ? 'outline' : 'destructive'}
                        className="h-5 text-[10px]"
                      >
                        {valid ? 'Valiidne' : 'Puuduvad väljad'}
                      </Badge>
                      <Badge
                        variant="secondary"
                        className="h-5 text-[10px]"
                      >
                        {rowCount} rida
                      </Badge>
                    </div>
                  </div>

                  {/* Delete “nupp” – stiliseeritud span, mitte <button> */}
                  <Button
                    asChild
                    size="xs"
                    variant="destructive"
                    onClick={(e) => {
                      e.stopPropagation()
                      removeCompound(index)
                    }}
                  >
                    <span>Kustuta</span>
                  </Button>
                </AccordionTrigger>
              </div>

              <AccordionContent className="pb-3">
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
                          compound.parts?.[posIndex] ?? {
                            surface: '',
                            tts: '',
                          }

                        return (
                          <tr key={`${compound.id}-row-${posIndex}`}>
                            <td className="border-b px-2 py-1 text-[11px] text-muted-foreground">
                              {posIndex + 1}
                            </td>
                            <td className="border-b px-2 py-1">
                              <Select
                                value={cc.cellId}
                                onValueChange={(v) =>
                                  updateCellInCompound(
                                    index,
                                    posIndex,
                                    v,
                                  )
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
                                  removeCellFromCompound(
                                    index,
                                    posIndex,
                                  )
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

                <div className="mt-2 flex items-center justify-between gap-2">
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
              </AccordionContent>
            </AccordionItem>
          )
        })}
      </Accordion>

      <div className="mt-4 flex items-center justify-between gap-4 border-t pt-4">
        <div className="text-xs">
          {status && <span className="text-emerald-700">{status}</span>}
          {error && <span className="ml-2 text-red-600">{error}</span>}
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
            onClick={addCompound}
          >
            Lisa sõnaühend
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={handleSaveAll}
            disabled={isPending}
            variant="secondary"
          >
            {isPending ? 'Salvestan…' : 'Salvesta kõik'}
          </Button>
          <Link href={`/boards/${boardId}`}>
            <Button variant="positive" size="sm">
              <Play className="h-5 w-5" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
