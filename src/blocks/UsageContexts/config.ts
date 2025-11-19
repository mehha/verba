// src/blocks/UsageContexts/config.ts
import type { Block } from 'payload'

export const UsageContextsBlock: Block = {
  slug: 'usageContexts',
  labels: {
    singular: 'Kasutuskonteksti kaardid',
    plural: 'Kasutuskonteksti kaardid',
  },
  fields: [
    {
      name: 'heading',
      label: 'Bloki pealkiri',
      type: 'text',
      required: false,
    },
    {
      name: 'items',
      label: 'Kaardid',
      type: 'array',
      minRows: 1,
      required: true,
      fields: [
        {
          name: 'title',
          label: 'Kaardi pealkiri',
          type: 'text',
          required: true,
        },
        {
          name: 'description',
          label: 'Kirjeldus',
          type: 'textarea',
          required: true,
        },
        {
          name: 'image',
          label: 'Pilt',
          type: 'relationship',
          relationTo: 'media',
          required: false,
        },
        {
          name: 'button',
          label: 'Nupp',
          type: 'group',
          fields: [
            {
              name: 'label',
              label: 'Nupu tekst',
              type: 'text',
              defaultValue: 'Loe lähemalt',
            },
            {
              name: 'href',
              label: 'Siht (URL või slug)',
              type: 'text',
            },
          ],
        },
      ],
    },
  ],
}
