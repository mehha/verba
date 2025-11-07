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
  const [symLocale, setSymLocale] = useState('et') // <- Estonian by default
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

  // Init values when opening
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

  // Upload to Payload Media
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

  // Symbols search
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
    const nextTitle = prettifyName(s.title || symQ) || title // kui tõesti tühi, jäta vana
    setUploadedPreview(s.preview)
    setTitle(nextTitle)
    onSaveAction(cell.id, {
      externalImageURL: s.preview,
      image: null,
      title: nextTitle,
    })
  }

  // Media search/browse URL (search by alt OR filename). If empty, shows latest.
  const mediaQueryURL = useMemo(() => {
    const base = getClientSideURL()
    const q = mediaQ.trim()
    const where = q
      ? `&where[or][0][alt][contains]=${encodeURIComponent(q)}&where[or][1][filename][contains]=${encodeURIComponent(
          q,
        )}`
      : ''
    // 24 per page fits 6-col grid nicely
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

  // Reset to page 1 when opening Media tab
  useEffect(() => {
    if (isOpen && tab === 'media') {
      setMediaPage(1)
    }
  }, [isOpen, tab])

  // Auto-load media:
  // - Debounce when typing (mediaQ non-empty -> 300ms)
  // - No debounce on page changes or when mediaQ empty
  useEffect(() => {
    if (tab !== 'media') return
    const delay = mediaQ.trim() ? 300 : 0
    const t = setTimeout(() => {
      void runMediaSearch()
    }, delay)
    return () => clearTimeout(t)
    // mediaQueryURL changes on mediaQ or mediaPage; tab ensures only when visible
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
        className="bg-white p-4 rounded-lg shadow-md w-[680px] max-w-[90vw] relative"
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
              <button
                key={k}
                type="button"
                onClick={() => setTab(k)}
                className={`px-3 py-1 rounded text-sm border ${
                  tab === k ? 'bg-slate-900 text-white' : 'bg-white hover:bg-slate-100'
                }`}
              >
                {k === 'upload' ? 'Lae üles' : k === 'symbols' ? 'Sümbolid' : 'Meedia'}
              </button>
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
                <button
                  type="button"
                  onClick={runSymbolsSearch}
                  className="px-3 py-1 text-sm rounded bg-slate-200 hover:bg-slate-300"
                >
                  Otsi
                </button>
              </div>

              {symError && <p className="text-xs text-red-500">{symError}</p>}
              {symLoading ? (
                <p className="text-xs text-slate-500">Laen…</p>
              ) : symbols.length ? (
                <div className="grid grid-cols-6 gap-2 max-h-48 overflow-y-auto">
                  {symbols.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => pickSymbol(s)}
                      className="border rounded overflow-hidden hover:ring-2 hover:ring-blue-500 focus:outline-none bg-white"
                      title={`${s.title} · ${s.source}`}
                    >
                      {/* use img here to avoid next/image domain config for thumbs */}
                      <img
                        src={s.preview}
                        alt={s.title}
                        className="w-full h-16 object-contain p-1"
                        loading="lazy"
                      />
                      <div className="px-1 pb-1 text-[10px] truncate opacity-70">{s.title}</div>
                    </button>
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
                <button
                  type="button"
                  onClick={() => setMediaPage(1)}
                  className="px-3 py-1 text-sm rounded bg-slate-200 hover:bg-slate-300"
                  title="Otsi"
                >
                  Otsi
                </button>
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
                        <button
                          key={String(m.id)}
                          type="button"
                          onClick={() => pickMedia(m)}
                          className="border rounded overflow-hidden hover:ring-2 hover:ring-blue-500 focus:outline-none"
                          title={m.alt || m.filename || ''}
                        >
                          <img
                            src={thumb}
                            alt={m.alt || ''}
                            className="w-full h-20 object-cover"
                            loading="lazy"
                          />
                        </button>
                      )
                    })}
                  </div>

                  {/* Pagination */}
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-slate-500">
                      Leht {mediaPage} / {mediaTotalPages}
                    </span>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        disabled={mediaPage <= 1}
                        onClick={() => setMediaPage((p) => Math.max(1, p - 1))}
                        className="px-3 py-1 text-sm rounded border disabled:opacity-50"
                      >
                        Eelmine
                      </button>
                      <button
                        type="button"
                        disabled={mediaPage >= mediaTotalPages}
                        onClick={() => setMediaPage((p) => p + 1)}
                        className="px-3 py-1 text-sm rounded border disabled:opacity-50"
                      >
                        Järgmine
                      </button>
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
            <ModalToggler
              slug={slug}
              className="px-3 py-1 text-sm rounded bg-slate-100 hover:bg-slate-200"
            >
              Tühista
            </ModalToggler>

            <button
              type="button"
              className="px-3 py-1 text-sm rounded bg-blue-600 text-white hover:bg-blue-700"
              onClick={() => {
                if (!cell) return
                onSaveAction(cell.id, { title })
                toggleModal(slug)
              }}
            >
              Salvesta
            </button>
          </div>
        </div>
      </Modal>
    </ModalContainer>
  )
}
