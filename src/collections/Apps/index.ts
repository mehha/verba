import type { CollectionConfig } from 'payload'
import { authenticated } from '@/access/authenticated'
import { isAdminOrOwner } from '@/access/isAdminOrOwner'

export const Apps: CollectionConfig = {
  slug: 'apps',
  admin: { useAsTitle: 'name' },
  access: {
    read: isAdminOrOwner,
    create: authenticated,
    update: isAdminOrOwner,
    delete: isAdminOrOwner,
  },
  fields: [
    { name: 'name', type: 'text', required: true },
    {
      name: 'owner',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      admin: { readOnly: true },
      defaultValue: ({ user }) => user?.id, // auto-assign
    },
    { name: 'thumbnail', type: 'upload', relationTo: 'media' },
    {
      name: 'actionBar',
      type: 'group',
      admin: { description: 'Ülemine “valitud” riba / fraasid' },
      fields: [
        {
          name: 'enabled',
          type: 'checkbox',
          defaultValue: false,
          label: 'Display action bar',
        },
        {
          name: 'title',
          type: 'text',
          label: 'Title',
          defaultValue: '',
        },
      ],
    },
    {
      name: 'grid',
      type: 'group',
      fields: [
        { name: 'cols', type: 'number', defaultValue: 12, min: 1 },
        { name: 'rows', type: 'number', defaultValue: 8, min: 1 }, // optional, used for editor canvas height
        {
          name: 'cells',
          type: 'array',
          fields: [
            { name: 'id', type: 'text', required: true },
            { name: 'x', type: 'number', required: true },
            { name: 'y', type: 'number', required: true },
            { name: 'w', type: 'number', required: true },
            { name: 'h', type: 'number', required: true },

            { name: 'title', type: 'text' },
            // Either upload to Media or keep a remote URL (and optionally “ingest” later)
            { name: 'image', type: 'upload', relationTo: 'media', required: false },
            { name: 'externalImageURL', type: 'text' }, // if not uploaded (optional)

            // Optional pre-generated audio (server TTS). If absent, use Web Speech API in the browser.
            { name: 'audio', type: 'upload', relationTo: 'media', required: false },
            { name: 'locked', type: 'checkbox', defaultValue: false }, // action cell = true
          ],
        },
      ],
    },
  ],
}
