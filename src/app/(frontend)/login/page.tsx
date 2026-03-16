import type { Metadata } from 'next'
import { LoginForm } from '@/components/Auth/login-form'

export const metadata: Metadata = {
  description: 'Logi Suhtlejasse sisse, et kasutada oma AAC tahvleid ja tööriistu.',
  robots: {
    follow: false,
    index: false,
  },
  title: 'Logi sisse',
}

export default function Page() {
  return (
    <div className="flex w-full items-center justify-center">
      <div className="w-full max-w-sm">
        <LoginForm />
      </div>
    </div>
  )
}
