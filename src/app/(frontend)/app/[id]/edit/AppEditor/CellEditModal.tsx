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
  const [imageUrl, setImageUrl] = useState('')
  const [heightRows, setHeightRows] = useState(1)
  const [uploading, setUploading] = useState(false)
  const [uploadedPreview, setUploadedPreview] = useState<string | null>(null)

  // pexels state
  const [pexelsTerm, setPexelsTerm] = useState('cat')
  const [pexelsLoading, setPexelsLoading] = useState(false)
  const [pexelsPhotos, setPexelsPhotos] = useState<PexelsPhoto[]>([])
  const [pexelsError, setPexelsError] = useState<string | null>(null)

  // init modal fields
  useEffect(() => {
    if (isOpen && cell) {
      setTitle(cell.title ?? '')
      setImageUrl(cell.externalImageURL ?? '')
      setHeightRows(cell.h ?? 1)

      if (cell.image && typeof cell.image === 'object' && cell.image.url) {
        setUploadedPreview(cell.image.url as string)
      } else {
        setUploadedPreview(null)
      }
    }
  }, [isOpen, cell])

  const handleImageUrlBlur = () => {
    if (!title && imageUrl) {
      try {
        const u = new URL(imageUrl)
        const last = u.pathname.split('/').pop() || ''
        const withoutExt = last.replace(/\.[a-z0-9]+$/i, '')
        if (withoutExt) {
          setTitle(withoutExt.replace(/[-_]+/g, ' '))
        }
      } catch {
        // ignore
      }
    }
  }

  // upload to Payload media
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
        setImageUrl('') // prefer uploaded

        if (cell) {
          // update local grid right away
          onSaveAction(cell.id, {
            image: {
              id: json.doc.id,
              url: json.doc.url,
            },
            externalImageURL: '',
          })
        }
      }
    } catch (e) {
      console.error('Upload failed', e)
    } finally {
      setUploading(false)
    }
  }

  // pexels search
  const handlePexelsSearch = async () => {
    setPexelsLoading(true)
    setPexelsError(null)
    try {
      const base = getClientSideURL()
      const res = await fetch(
        `${base}/next/pexels?q=${encodeURIComponent(pexelsTerm)}`,
        {
          credentials: 'include',
        },
      )
      if (!res.ok) {
        setPexelsError('Can’t load images from Pexels')
        setPexelsPhotos([])
      } else {
        const json = await res.json()
        // expect { photos: [...] }
        setPexelsPhotos(Array.isArray(json.photos) ? json.photos : [])
      }
    } catch (err) {
      setPexelsError('Network error')
      setPexelsPhotos([])
    } finally {
      setPexelsLoading(false)
    }
  }

  // when user picks a Pexels photo
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

    // set local fields
    setImageUrl(src)
    setUploadedPreview(null) // URL wins

    if (!title && pexelsTerm) {
      setTitle(pexelsTerm)
    }

    // update grid right away
    onSaveAction(cell.id, {
      externalImageURL: src,
      title: finalTitle,
    })
  }

  return (
    <ModalContainer className="fixed inset-0 bg-black/10 flex items-center justify-center">
      <Modal
        slug={slug}
        className="bg-white p-4 rounded-md shadow-md w-[380px] max-w-[90vw] relative"
        onClick={(e) => e.stopPropagation()}
        closeOnBlur={true}
      >
        <ModalToggler
          slug={slug}
          className="absolute -right-2 -top-2 cursor-pointer"
        >
          <CircleX className="w-5 h-5 text-slate-500 hover:text-slate-900" />
        </ModalToggler>

        <div className="flex flex-col gap-4">
          <h2 className="text-lg font-semibold">Edit cell</h2>

          {(uploadedPreview || imageUrl) && (
            <div>
              <p className="text-xs mb-1 text-slate-500">Preview</p>
              <img
                src={uploadedPreview || imageUrl}
                alt={title || 'Preview'}
                className="w-full h-28 object-cover rounded border"
              />
            </div>
          )}

          {/* title */}
          <label className="flex flex-col gap-1 text-sm">
            Title
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="border rounded px-2 py-1 text-sm"
              placeholder="e.g. Koer"
            />
          </label>

          {/* external URL */}
          <label className="flex flex-col gap-1 text-sm">
            Image URL
            <input
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              onBlur={handleImageUrlBlur}
              className="border rounded px-2 py-1 text-sm"
              placeholder="https://..."
              disabled={uploading}
            />
            <span className="text-[11px] text-slate-400">
              URL overrides uploaded image.
            </span>
          </label>

          {/* upload */}
          <label className="flex flex-col gap-1 text-sm">
            Or upload image
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) {
                  void handleUpload(file)
                }
              }}
              disabled={uploading}
              className="text-sm"
            />
            {uploading && (
              <span className="text-xs text-slate-500">Uploading…</span>
            )}
          </label>

          {/* Pexels search */}
          <div className="flex flex-col gap-2">
            <div className="flex gap-2 items-center">
              <input
                value={pexelsTerm}
                onChange={(e) => setPexelsTerm(e.target.value)}
                className="border rounded px-2 py-1 text-sm flex-1"
                placeholder="Search Pexels…"
              />
              <button
                type="button"
                onClick={handlePexelsSearch}
                className="px-3 py-1 text-sm rounded bg-slate-200 hover:bg-slate-300"
              >
                Search
              </button>
            </div>
            {pexelsError && (
              <p className="text-xs text-red-500">{pexelsError}</p>
            )}
            {pexelsLoading ? (
              <p className="text-xs text-slate-500">Loading…</p>
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
              Photos from Pexels — please credit in UI if you publish.
            </p>
          </div>

          {/* height */}
          <label className="flex flex-col gap-1 text-sm">
            Height (rows)
            <input
              type="number"
              min={1}
              value={heightRows}
              onChange={(e) => setHeightRows(Number(e.target.value) || 1)}
              className="border rounded px-2 py-1 text-sm w-24"
            />
          </label>

          {/* footer buttons */}
          <div className="flex gap-2 justify-end">
            <ModalToggler
              slug={slug}
              className="px-3 py-1 text-sm rounded bg-slate-100 hover:bg-slate-200"
            >
              Cancel
            </ModalToggler>

            <button
              type="button"
              className="px-3 py-1 text-sm rounded bg-blue-600 text-white hover:bg-blue-700"
              onClick={() => {
                if (!cell) return

                // if user typed URL → we tell grid to drop upload
                const patch: {
                  title?: string
                  externalImageURL?: string
                  h?: number
                  image?: null
                } = {
                  title,
                  externalImageURL: imageUrl,
                  h: heightRows,
                }

                if (imageUrl) {
                  patch.image = null
                }

                onSaveAction(cell.id, patch)
                toggleModal(slug)
              }}
            >
              Save
            </button>
          </div>
        </div>
      </Modal>
    </ModalContainer>
  )
}
