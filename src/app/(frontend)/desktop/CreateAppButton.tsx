'use client'

import { useModal, Modal, ModalContainer, ModalToggler } from '@faceless-ui/modal'
import { useState } from 'react'
import { CircleX } from 'lucide-react'

type Props = {
  // server action from page.tsx
  createApp: (formData: FormData) => Promise<void>
}

const CREATE_APP_MODAL = 'create-app-modal'

export function CreateAppButton({ createApp }: Props) {
  const { toggleModal } = useModal()
  const [name, setName] = useState('')

  return (
    <>
      {/* trigger */}
      <button
        type="button"
        onClick={() => toggleModal(CREATE_APP_MODAL)}
        className="rounded bg-blue-600 px-4 py-2 text-white text-sm"
      >
        + Uus äpp
      </button>

      {/* modal */}
      <ModalContainer className="fixed inset-0 bg-black/10 flex items-center justify-center">
        <Modal
          slug={CREATE_APP_MODAL}
          className="bg-white rounded-md p-4 w-[360px] max-w-[90vw] relative"
          onClick={(e) => e.stopPropagation()}
          closeOnBlur={false}
        >
          <ModalToggler
            slug={CREATE_APP_MODAL}
            className="absolute -right-2 -top-2 cursor-pointer"
          >
            <CircleX className="w-5 h-5 text-slate-500 hover:text-slate-900" />
          </ModalToggler>

          <h2 className="text-lg font-semibold mb-3">Uus äpp</h2>

          <form
            action={async (formData) => {
              toggleModal(CREATE_APP_MODAL)
              setName('')
              await createApp(formData)
            }}
            className="space-y-3"
          >
            <label className="flex flex-col gap-1 text-sm">
              Nimi
              <input
                name="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="border rounded px-2 py-1 text-sm"
                placeholder="nt. “Köögis”, “Kool”, “Päevik”"
                required
              />
            </label>

            <div className="flex justify-end gap-2">
              <ModalToggler
                slug={CREATE_APP_MODAL}
                className="px-3 py-1 text-sm rounded bg-slate-100 hover:bg-slate-200"
                type="button"
              >
                Loobu
              </ModalToggler>
              <button
                type="submit"
                className="px-3 py-1 text-sm rounded bg-blue-600 text-white hover:bg-blue-700"
              >
                Loo
              </button>
            </div>
          </form>
        </Modal>
      </ModalContainer>
    </>
  )
}
