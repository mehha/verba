// src/components/AppEditor/CellEditModal.tsx
'use client'

import React, { useEffect, useMemo, useState } from 'react'
import {
  Modal,
  ModalContainer,
  ModalToggler,
  useModal,
} from '@faceless-ui/modal'
import { CircleX } from 'lucide-react'
import { getClientSideURL } from '@/utilities/getURL'
import Image from 'next/image'
import { Button } from '@/components/ui/button' // ⬅️ use your Button

type SymbolItem = {
  id: string
  title: string
  preview: string
  source: 'arasaac' | 'openmoji'
  license: string
  attribution?: string
}

type MediaDoc = {
  id: string | number
  url: string
  alt?: string
  filename?: string
  sizes?: Record<string, { url?: string }>
}

type CellEditModalProps = {
  slug: string
  cell:
    | {
        id: string
        title?: string | null
        externalImageURL?: string | null
        h?: number | null
        image?: any
      }
    | null
  onSaveAction: (
    cellId: string,
    patch: {
      title?: string
      externalImageURL?: string
      h?: number
      image?: string | number | { id: string | number; url?: string } | null
    },
  ) => void
}

type TabKey = 'upload' | 'symbols' | 'media'

function prettifyName(raw?: string | null): string {
  if (!raw) return ''
  const last = raw.split('/').pop() || raw
  const noExt = last.replace(/\.[^/.]+$/, '')
  const spaced = noExt.replace(/[-_]+/g, ' ').replace(/\s+/g, ' ').trim()
  return spaced ? spaced.charAt(0).toUpperCase() + spaced.slice(1) : ''
}

export const CellEditModal: React.FC<CellEditModalProps> = ({
  slug,
  cell,
  onSaveAction,
}) => {
  const { toggleModal, modalState } = useModal()
  const isOpen = modalState?.[slug]?.isOpen ?? false

  const [title, setTitle] = useState('')
  const [uploading, setUploading] = useState(false)
  const [uploadedPreview, setUploadedPreview] = useState<string | null>(null)

  const [tab, setTab] = useState<TabKey>('upload')

  // Symbols
  const [symQ, setSymQ] = useState('')
  const [symSource, setSymSource] = useState<'arasaac' | 'openmoji'>('arasaac')
  const [symLocale, setSymLocale] = useState('et')
  const [symLoading, setSymLoading] = useState(false)
  const [symbols, setSymbols] = useState<SymbolItem[]>([])
  const [symError, setSymError] = useState<string | null>(null)

  // Media
  const [mediaQ, setMediaQ] = useState('')
  const [mediaLoading, setMediaLoading] = useState(false)
  const [mediaItems, setMediaItems] = useState<MediaDoc[]>([])
  const [mediaError, setMediaError] = useState<string | null>(null)
  const [mediaPage, setMediaPage] = useState(1)
  const [mediaTotalPages, setMediaTotalPages] = useState(1)

  useEffect(() => {
    if (isOpen && cell) {
      setTitle(cell.title ?? '')
      if (cell.image && typeof cell.image === 'object' && cell.image.url) {
        setUploadedPreview(cell.image.url as string)
      } else if (cell.externalImageURL) {
        setUploadedPreview(cell.externalImageURL)
      } else {
        setUploadedPreview(null)
      }
    }
  }, [isOpen, cell])

  const handleUpload = async (file: File) => {
    setUploading(true)
    try {
      const base = getClientSideURL()
      const formData = new FormData()
      formData.append('file', file)

      const res = await fetch(`${base}/api/media`, {
        method: 'POST',
        credentials: 'include',
        body: formData,
      })
      const json = await res.json()

      if (json?.doc?.id) {
        setUploadedPreview(json.doc.url ?? null)

        const nameCandidate = json?.doc?.alt || json?.doc?.filename || json?.doc?.url
        const nextTitle = prettifyName(nameCandidate) || title
        setTitle(nextTitle)

        if (cell) {
          onSaveAction(cell.id, {
            image: { id: json.doc.id, url: json.doc.url },
            externalImageURL: '',
            title: nextTitle,
          })
        }
      }
    } catch (e) {
      console.error('Upload failed', e)
    } finally {
      setUploading(false)
    }
  }

  const runSymbolsSearch = async () => {
    if (!symQ.trim()) {
      setSymbols([])
      return
    }
    setSymLoading(true)
    setSymError(null)
    try {
      const base = getClientSideURL()
      const res = await fetch(
        `${base}/next/symbols?q=${encodeURIComponent(symQ)}&source=${symSource}&locale=${symLocale}&limit=40`,
        { credentials: 'include' },
      )
      if (!res.ok) throw new Error('Symbols load failed')
      const json = await res.json()
      setSymbols(Array.isArray(json.items) ? json.items : [])
    } catch (e) {
      setSymError('Ei õnnestu sümboleid laadida')
      setSymbols([])
    } finally {
      setSymLoading(false)
    }
  }

  const pickSymbol = (s: SymbolItem) => {
    if (!cell) return
    const nextTitle = prettifyName(s.title || symQ) || title
    setUploadedPreview(s.preview)
    setTitle(nextTitle)
    onSaveAction(cell.id, {
      externalImageURL: s.preview,
      image: null,
      title: nextTitle,
    })
  }

  const mediaQueryURL = useMemo(() => {
    const base = getClientSideURL()
    const q = mediaQ.trim()
    const where = q
      ? `&where[or][0][alt][contains]=${encodeURIComponent(q)}&where[or][1][filename][contains]=${encodeURIComponent(
          q,
        )}`
      : ''
    return `${base}/api/media?limit=24&page=${mediaPage}${where}`
  }, [mediaQ, mediaPage])

  const runMediaSearch = async () => {
    setMediaLoading(true)
    setMediaError(null)
    try {
      const res = await fetch(mediaQueryURL, { credentials: 'include' })
      if (!res.ok) throw new Error('Media load failed')
      const json = await res.json()
      const docs: MediaDoc[] = Array.isArray(json?.docs) ? json.docs : []
      setMediaItems(docs)
      if (typeof json?.totalPages === 'number') setMediaTotalPages(json.totalPages)
    } catch (e) {
      setMediaItems([])
      setMediaError('Ei õnnestu meediumit laadida')
    } finally {
      setMediaLoading(false)
    }
  }

  useEffect(() => {
    if (isOpen && tab === 'media') setMediaPage(1)
  }, [isOpen, tab])

  useEffect(() => {
    if (tab !== 'media') return
    const delay = mediaQ.trim() ? 300 : 0
    const t = setTimeout(() => {
      void runMediaSearch()
    }, delay)
    return () => clearTimeout(t)
  }, [tab, mediaQueryURL, mediaQ])

  const pickMedia = (m: MediaDoc) => {
    if (!cell || !m?.id) return
    const url =
      m.sizes?.thumbnail?.url ||
      m.sizes?.small?.url ||
      m.sizes?.medium?.url ||
      m.url
    if (!url) return

    const nameCandidate = m.alt || m.filename || url
    const nextTitle = prettifyName(nameCandidate) || title

    setUploadedPreview(url)
    setTitle(nextTitle)
    onSaveAction(cell.id, {
      image: { id: m.id, url },
      externalImageURL: '',
      title: nextTitle,
    })
  }

  return (
    <ModalContainer className="fixed inset-0 bg-black/10 flex items-center justify-center">
      <Modal
        slug={slug}
        className="bg-white p-4 rounded-2xl shadow-md w-[680px] max-w-[90vw] relative"
        onClick={(e) => e.stopPropagation()}
        closeOnBlur={true}
      >
        <ModalToggler slug={slug} className="absolute -right-2 -top-2 cursor-pointer">
          <CircleX className="w-5 h-5 text-slate-500 hover:text-slate-900" />
        </ModalToggler>

        <div className="flex flex-col gap-4">
          <h2 className="text-lg font-semibold">Muuda</h2>

          {uploadedPreview && (
            <div className="relative w-full aspect-video max-w-64">
              <Image
                src={uploadedPreview}
                alt={title || 'Eelvaade'}
                fill
                className="object-cover rounded border"
                sizes="(min-width: 1024px) 800px, 100vw"
                priority={false}
                unoptimized
              />
            </div>
          )}

          {/* Title */}
          <label className="flex flex-col gap-1 text-sm uppercase">
            <h2 className="text-xl">Pealkiri</h2>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="border rounded px-2 py-1 text-sm"
              placeholder="nt. Koer"
            />
          </label>

          {/* Tabs */}
          <div className="flex gap-2">
            {(['upload', 'symbols', 'media'] as TabKey[]).map((k) => (
              <Button
                key={k}
                type="button"
                size="sm"
                variant={tab === k ? 'secondary' : 'outline'}
                onClick={() => setTab(k)}
                className="text-sm"
              >
                {k === 'upload' ? 'Lae üles' : k === 'symbols' ? 'Sümbolid' : 'Meedia'}
              </Button>
            ))}
          </div>

          {/* Upload */}
          {tab === 'upload' && (
            <label className="flex flex-col gap-1 text-sm">
              Laadi pilt üles
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) void handleUpload(file)
                }}
                disabled={uploading}
                className="text-sm"
              />
              {uploading && <span className="text-xs text-slate-500">Laen üles…</span>}
            </label>
          )}

          {/* Symbols */}
          {tab === 'symbols' && (
            <div className="flex flex-col gap-2">
              <div className="flex flex-wrap gap-2 items-center">
                <input
                  value={symQ}
                  onChange={(e) => setSymQ(e.target.value)}
                  className="border rounded px-2 py-1 text-sm flex-1"
                  placeholder="Otsi sümboleid… (nt dog, eat, play)"
                />
                <select
                  value={symSource}
                  onChange={(e) => setSymSource(e.target.value as 'arasaac' | 'openmoji')}
                  className="border rounded px-2 py-1 text-sm"
                >
                  <option value="arasaac">ARASAAC</option>
                  <option value="openmoji">OpenMoji</option>
                </select>
                {symSource === 'arasaac' && (
                  <select
                    value={symLocale}
                    onChange={(e) => setSymLocale(e.target.value)}
                    className="border rounded px-2 py-1 text-sm"
                    title="ARASAAC locale"
                  >
                    <option value="et">et</option>
                    <option value="en">en</option>
                    <option value="es">es</option>
                    <option value="fr">fr</option>
                    <option value="de">de</option>
                    <option value="pt">pt</option>
                    <option value="it">it</option>
                  </select>
                )}
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  onClick={runSymbolsSearch}
                >
                  Otsi
                </Button>
              </div>

              {symError && <p className="text-xs text-red-500">{symError}</p>}
              {symLoading ? (
                <p className="text-xs text-slate-500">Laen…</p>
              ) : symbols.length ? (
                <div className="grid grid-cols-6 gap-2 max-h-48 overflow-y-auto">
                  {symbols.map((s) => (
                    <Button
                      key={s.id}
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => pickSymbol(s)}
                      className="block p-0 border rounded overflow-hidden hover:ring-2 hover:ring-blue-500 focus:outline-none bg-white"
                      title={`${s.title} · ${s.source}`}
                    >
                      <Image
                        src={s.preview}
                        alt={s.title}
                        width={64}
                        height={64}
                        className="w-full aspect-video object-contain p-1"
                        loading="lazy"
                        unoptimized
                      />
                      <div className="px-1 pb-1 text-[10px] truncate opacity-70">{s.title}</div>
                    </Button>
                  ))}
                </div>
              ) : null}

              {!!symbols.length && (
                <p className="text-[10px] text-slate-400">
                  ARASAAC: CC BY-NC-SA 4.0 · OpenMoji: CC BY-SA 4.0 — avaldamisel lisa allikaviide.
                </p>
              )}
            </div>
          )}

          {/* Media */}
          {tab === 'media' && (
            <div className="flex flex-col gap-2">
              <div className="flex gap-2 items-center">
                <input
                  value={mediaQ}
                  onChange={(e) => setMediaQ(e.target.value)}
                  className="border rounded px-2 py-1 text-sm flex-1"
                  placeholder="Otsi meediumist… (alt või failinimi) — jäta tühjaks, et näha viimaseid"
                />
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  onClick={() => setMediaPage(1)}
                  title="Otsi"
                >
                  Otsi
                </Button>
              </div>

              {mediaError && <p className="text-xs text-red-500">{mediaError}</p>}
              {mediaLoading ? (
                <p className="text-xs text-slate-500">Laen…</p>
              ) : mediaItems.length ? (
                <>
                  <div className="grid grid-cols-6 gap-2 max-h-64 overflow-y-auto">
                    {mediaItems.map((m) => {
                      const thumb =
                        m.sizes?.thumbnail?.url ||
                        m.sizes?.small?.url ||
                        m.sizes?.medium?.url ||
                        m.url
                      if (!thumb) return null
                      return (
                        <Button
                          key={String(m.id)}
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => pickMedia(m)}
                          className="block p-0 border rounded overflow-hidden hover:ring-2 hover:ring-blue-500 focus:outline-none"
                          title={m.alt || m.filename || ''}
                        >
                          <Image
                            src={thumb}
                            alt={m.alt || ''}
                            width={160}
                            height={80}
                            className="w-full aspect-video object-cover"
                            loading="lazy"
                            unoptimized
                          />
                        </Button>
                      )
                    })}
                  </div>

                  {/* Pagination */}
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-slate-500">
                      Leht {mediaPage} / {mediaTotalPages}
                    </span>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        disabled={mediaPage <= 1}
                        onClick={() => setMediaPage((p) => Math.max(1, p - 1))}
                      >
                        Eelmine
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        disabled={mediaPage >= mediaTotalPages}
                        onClick={() => setMediaPage((p) => p + 1)}
                      >
                        Järgmine
                      </Button>
                    </div>
                  </div>
                </>
              ) : (
                <p className="text-xs text-slate-500">Tulemusi pole.</p>
              )}
            </div>
          )}

          {/* Footer */}
          <div className="flex gap-2 justify-end">
            <Button
              asChild
              size="sm"
              variant="muted"
            >
              <ModalToggler slug={slug} className="inline-flex">
                Tühista
              </ModalToggler>
            </Button>

            <Button
              type="button"
              size="sm"
              variant="positive"
              onClick={() => {
                if (!cell) return
                onSaveAction(cell.id, { title })
                toggleModal(slug)
              }}
            >
              Salvesta
            </Button>
          </div>
        </div>
      </Modal>
    </ModalContainer>
  )
}
