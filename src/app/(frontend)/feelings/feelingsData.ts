export type FeelingValue = 'rõõmus' | 'kurb' | 'pahane' | 'hirmul' | 'elevil' | 'väsinud'

export type FeelingOption = {
  value: FeelingValue
  label: string
  emoji: string
  accent: string
  helper: string
}

export const FEELINGS: FeelingOption[] = [
  {
    value: 'rõõmus',
    label: 'Rõõmus',
    emoji: '😊',
    accent: 'from-amber-200 to-yellow-400 text-amber-900',
    helper: 'Ma tunnen ennast rõõmsalt.',
  },
  {
    value: 'kurb',
    label: 'Kurb',
    emoji: '😢',
    accent: 'from-sky-100 to-blue-300 text-slate-900',
    helper: 'Ma tunnen ennast kurvalt.',
  },
  {
    value: 'pahane',
    label: 'Pahane',
    emoji: '😠',
    accent: 'from-orange-200 to-red-300 text-orange-950',
    helper: 'Ma tunnen ennast pahaselt.',
  },
  {
    value: 'hirmul',
    label: 'Hirmul',
    emoji: '😨',
    accent: 'from-indigo-100 to-purple-300 text-indigo-950',
    helper: 'Ma tunnen ennast hirmul.',
  },
  {
    value: 'elevil',
    label: 'Elevil',
    emoji: '🤩',
    accent: 'from-pink-200 to-fuchsia-300 text-fuchsia-950',
    helper: 'Ma tunnen ennast elevil.',
  },
  {
    value: 'väsinud',
    label: 'Väsinud',
    emoji: '🥱',
    accent: 'from-slate-100 to-slate-300 text-slate-900',
    helper: 'Ma tunnen ennast väsinult.',
  },
]
