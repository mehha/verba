export type QuickChatButton = {
  label: string
  phrase: string
  enabled?: boolean
  color?: 'emerald' | 'rose' | 'sky' | 'amber' | 'purple' | 'indigo' | 'slate'
}

export const DEFAULT_QUICK_CHAT_BUTTONS: QuickChatButton[] = [
  { label: 'Jah', phrase: 'Jah', enabled: true, color: 'emerald' },
  { label: 'Ei', phrase: 'Ei', enabled: true, color: 'rose' },
  { label: 'Veel', phrase: 'Veel', enabled: true, color: 'sky' },
  { label: 'Aita', phrase: 'Palun aita mind', enabled: true, color: 'amber' },
  { label: 'Lõpeta', phrase: 'Palun lõpeta', enabled: true, color: 'indigo' },
  { label: 'Kus on WC?', phrase: 'Kus on WC?', enabled: true, color: 'purple' },
  { label: 'Valus', phrase: 'Mul on valus', enabled: true, color: 'slate' },
]
