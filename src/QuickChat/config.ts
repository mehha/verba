import type { GlobalConfig } from 'payload'
import { isAdmin } from '@/access/IsAdmin'

const defaultButtons = [
  { label: 'Jah', phrase: 'Jah', enabled: true, color: 'emerald' },
  { label: 'Ei', phrase: 'Ei', enabled: true, color: 'rose' },
  { label: 'Veel', phrase: 'Veel', enabled: true, color: 'sky' },
  { label: 'Aita', phrase: 'Palun aita mind', enabled: true, color: 'amber' },
  { label: 'Lõpeta', phrase: 'Palun lõpeta', enabled: true, color: 'indigo' },
  { label: 'Kus on WC?', phrase: 'Kus on WC?', enabled: true, color: 'purple' },
  { label: 'Valus', phrase: 'Mul on valus', enabled: true, color: 'slate' },
]

export const QuickChat: GlobalConfig = {
  slug: 'quick-chat',
  label: 'Quick Chat / Kiirsuhtlus',
  access: {
    read: () => true,
    update: isAdmin,
  },
  admin: {
    description: 'Vali, millised kiirsuhtluse nupud on nähtavad ja mida TTS lausub.',
  },
  fields: [
    {
      name: 'buttons',
      type: 'array',
      label: 'Nupud',
      minRows: 1,
      defaultValue: defaultButtons,
      labels: {
        singular: 'Nupp',
        plural: 'Nupud',
      },
      fields: [
        {
          name: 'label',
          type: 'text',
          required: true,
          label: 'Nupu tekst',
        },
        {
          name: 'phrase',
          type: 'text',
          required: true,
          label: 'TTS lause',
          admin: {
            description: 'Täislause, mida TTS ette loeb.',
          },
        },
        {
          name: 'enabled',
          type: 'checkbox',
          label: 'Aktiivne',
          defaultValue: true,
        },
        {
          name: 'color',
          type: 'select',
          defaultValue: 'emerald',
          options: [
            { label: 'Roheline', value: 'emerald' },
            { label: 'Roosa', value: 'rose' },
            { label: 'Sinine', value: 'sky' },
            { label: 'Kollane', value: 'amber' },
            { label: 'Lilla', value: 'purple' },
            { label: 'Indigo', value: 'indigo' },
            { label: 'Hall', value: 'slate' },
          ],
          admin: {
            description: 'Tausta aktsent lapsele eristatavaks.',
            width: '50%',
          },
        },
      ],
    },
  ],
}
