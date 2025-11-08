// payload/blocks/HeroPaws.ts
import type { Block } from 'payload'

export const HeroPaws: Block = {
  slug: 'heroPaws',
  labels: { singular: 'Hero (Paws)', plural: 'Hero (Paws)' },
  fields: [
    { name: 'eyebrow', type: 'text' },
    { name: 'title', type: 'text' },
    { name: 'description', type: 'textarea' },
    {
      name: 'ctas',
      type: 'array',
      maxRows: 2,
      fields: [
        { name: 'label', type: 'text', required: true },
        { name: 'href', type: 'text', required: true },
        {
          name: 'variant',
          type: 'select',
          options: [
            { label: 'Primary', value: 'primary' },
            { label: 'Secondary', value: 'secondary' },
          ],
          defaultValue: 'primary',
        },
      ],
    },

    // Cards
    {
      name: 'cards',
      type: 'array',
      required: true,
      minRows: 1,
      maxRows: 6,
      labels: { singular: 'Card', plural: 'Cards' },
      fields: [
        { name: 'title', type: 'text', required: false },

        // NEW: choose image or icon (image wins if provided)
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          admin: {
            description: 'Optional. If set, this image is shown instead of the icon.',
          },
        },
        {
          name: 'icon',
          type: 'select',
          defaultValue: 'PawPrint',
          options: ['Cat','Dog','PawPrint','HeartPulse','Syringe','Stethoscope'],
          admin: { description: 'Used when no image is selected.' },
        },

        { name: 'gradientFrom', type: 'text', defaultValue: 'from-slate-100' },
        { name: 'gradientTo', type: 'text', defaultValue: 'to-slate-200' },
        { name: 'labelBg', type: 'text', defaultValue: 'bg-slate-800' },
        {
          name: 'badges',
          type: 'array',
          maxRows: 4,
          fields: [
            { name: 'label', type: 'text', required: true },
            { name: 'icon', type: 'select', defaultValue: 'Stethoscope', options: ['Stethoscope','Syringe','PawPrint','HeartPulse'] },
          ],
        },
      ],
    },
  ],
}
