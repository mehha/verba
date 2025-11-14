// src/blocks/AacFeatures/config.ts
import type { Block } from 'payload'

export const AacFeatures: Block = {
  slug: 'aac-features',
  labels: {
    singular: 'AAC: omadused',
    plural: 'AAC: omadused',
  },
  interfaceName: 'AacFeaturesBlock',
  fields: [
    {
      name: 'eyebrow',
      type: 'text',
      label: 'Ülemine label (nt “Eelised”)',
    },
    {
      name: 'title',
      type: 'text',
      label: 'Pealkiri',
      required: true,
    },
    {
      name: 'subtitle',
      type: 'textarea',
      label: 'Lühike selgitus pealkirja alla',
    },
    {
      name: 'items',
      type: 'array',
      label: 'Kaardid',
      minRows: 1,
      required: true,
      fields: [
        {
          name: 'icon',
          type: 'select',
          label: 'Ikoon (Lucide)',
          required: true,
          defaultValue: 'message-circle',
          options: [
            { label: 'Suhtlus (MessageCircle)', value: 'message-circle' },
            { label: 'Ruudustik (Grid3x3)', value: 'grid-3x3' },
            { label: 'Pildid (Images)', value: 'images' },
            { label: 'Kõne (Volume2)', value: 'volume-2' },
            { label: 'Jagamine (Share2)', value: 'share-2' },
            { label: 'Offline (WifiOff)', value: 'wifi-off' },
            { label: 'Kiire algus (Rocket)', value: 'rocket' },
            { label: 'Ligipääsetavus (Accessibility)', value: 'accessibility' },
          ],
        },
        {
          name: 'title',
          type: 'text',
          label: 'Kaardi pealkiri',
          required: true,
        },
        {
          name: 'description',
          type: 'textarea',
          label: 'Kaardi kirjeldus',
          required: true,
        },
        {
          name: 'variant',
          type: 'select',
          label: 'Stiil',
          defaultValue: 'default',
          options: [
            { label: 'Tavaline kaart', value: 'default' },
            { label: 'Rõhutatud (sinine CTA-kaart)', value: 'accent' },
          ],
        },
        {
          name: 'ctaLabel',
          type: 'text',
          label: 'Nupu tekst (valikuline)',
        },
        {
          name: 'ctaHref',
          type: 'text',
          label: 'Nupu link (valikuline)',
        },
      ],
    },
  ],
}
