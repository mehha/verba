// src/components/AppEditor/CellEditModal.tsx
'use client'

import React, { useEffect, useState } from 'react'
import {
  Modal,
  ModalContainer,
  ModalToggler,
  useModal,
} from '@faceless-ui/modal'
import { CircleX } from 'lucide-react'
import { getClientSideURL } from '@/utilities/getURL'

type PexelsPhoto = {
  id: number
  alt?: string
  src?: {
    tiny?: string
    small?: string
    medium?: string
    large?: string
    original?: string
  }
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

  // Pexels-otsing
  const [pexelsTerm, setPexelsTerm] = useState('kass')
  const [pexelsLoading, setPexelsLoading] = useState(false)
  const [pexelsPhotos, setPexelsPhotos] = useState<PexelsPhoto[]>([])
  const [pexelsError, setPexelsError] = useState<string | null>(null)

  // Inits
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

  // Laadi pilt üles (Payload media)
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

        if (cell) {
          // uuenda grid kohe
          onSaveAction(cell.id, {
            image: { id: json.doc.id, url: json.doc.url },
            externalImageURL: '',
          })
        }
      }
    } catch (e) {
      console.error('Üleslaadimine ebaõnnestus', e)
    } finally {
      setUploading(false)
    }
  }

  // Pexels otsing
  const handlePexelsSearch = async () => {
    setPexelsLoading(true)
    setPexelsError(null)
    try {
      const base = getClientSideURL()
      const res = await fetch(
        `${base}/next/pexels?q=${encodeURIComponent(pexelsTerm)}`,
        { credentials: 'include' },
      )
      if (!res.ok) {
        setPexelsError('Pexelsi pilte ei õnnestu laadida')
        setPexelsPhotos([])
      } else {
        const json = await res.json()
        setPexelsPhotos(Array.isArray(json.photos) ? json.photos : [])
      }
    } catch {
      setPexelsError('Võrguviga')
      setPexelsPhotos([])
    } finally {
      setPexelsLoading(false)
    }
  }

  // Pexelsist pildi valimine
  const handlePickPexels = (photo: PexelsPhoto) => {
    const src =
      photo.src?.medium ||
      photo.src?.large ||
      photo.src?.small ||
      photo.src?.original ||
      ''
    if (!src || !cell) return

    const finalTitle = title?.trim()
      ? title
      : pexelsTerm?.trim()
        ? pexelsTerm
        : ''

    setUploadedPreview(src)
    if (!title && pexelsTerm) setTitle(pexelsTerm)

    // uuenda grid kohe (kasuta externalImageURL)
    onSaveAction(cell.id, {
      externalImageURL: src,
      image: null, // eelmine üleslaaditud pilt asendatakse URL-iga
      title: finalTitle,
    })
  }

  return (
    <ModalContainer className="fixed inset-0 bg-black/10 flex items-center justify-center">
      <Modal
        slug={slug}
        className="bg-white p-4 rounded-xl shadow-md w-[580px] max-w-[90vw] relative"
        onClick={(e) => e.stopPropagation()}
        closeOnBlur={true}
      >
        <ModalToggler slug={slug} className="absolute -right-2 -top-2 cursor-pointer">
          <CircleX className="w-5 h-5 text-slate-500 hover:text-slate-900" />
        </ModalToggler>

        <div className="flex flex-col gap-4">
          <h2 className="text-lg font-semibold">Muuda</h2>

          {(uploadedPreview) && (
            <div>
              <img
                src={uploadedPreview}
                alt={title || 'Eelvaade'}
                className="w-full aspect-video object-cover rounded border"
              />
            </div>
          )}

          {/* Pealkiri */}
          <label className="flex flex-col gap-1 text-sm">
            <h2 className="text-xl">Pealkiri</h2>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="border rounded px-2 py-1 text-sm uppercase"
              placeholder="nt. Koer"
            />
          </label>

          {/* Üleslaadimine */}
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
            {uploading && (
              <span className="text-xs text-slate-500">Laen üles…</span>
            )}
          </label>

          {/* Pexels otsing */}
          <div className="flex flex-col gap-2">
            <div className="flex gap-2 items-center">
              <input
                value={pexelsTerm}
                onChange={(e) => setPexelsTerm(e.target.value)}
                className="border rounded px-2 py-1 text-sm flex-1"
                placeholder="Otsi Pexelsist…"
              />
              <button
                type="button"
                onClick={handlePexelsSearch}
                className="px-3 py-1 text-sm rounded bg-slate-200 hover:bg-slate-300"
              >
                Otsi
              </button>
            </div>

            {pexelsError && (
              <p className="text-xs text-red-500">{pexelsError}</p>
            )}

            {pexelsLoading ? (
              <p className="text-xs text-slate-500">Laen…</p>
            ) : pexelsPhotos.length ? (
              <div className="grid grid-cols-4 gap-2 max-h-32 overflow-y-auto">
                {pexelsPhotos.map((photo) => {
                  const thumb =
                    photo.src?.tiny ||
                    photo.src?.small ||
                    photo.src?.medium ||
                    ''
                  if (!thumb) return null
                  return (
                    <button
                      key={photo.id}
                      type="button"
                      onClick={() => handlePickPexels(photo)}
                      className="border rounded overflow-hidden hover:ring-2 hover:ring-blue-500 focus:outline-none"
                    >
                      <img
                        src={thumb}
                        alt={photo.alt ?? ''}
                        className="w-full h-12 object-cover"
                      />
                    </button>
                  )
                })}
              </div>
            ) : null}

            <p className="text-[10px] text-slate-400">
              Pildid on pärit Pexelsist — avaldamisel lisa allikaviide.
            </p>
          </div>

          {/* Jalus */}
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
