import { RegisterForm } from '@/components/Auth/register-form'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  description: 'Loo Suhtleja konto, et alustada eestikeelsete AAC tööriistade kasutamist.',
  robots: {
    follow: false,
    index: false,
  },
  title: 'Loo konto',
}

export default function RegisterPage() {
  return (
    <div className="flex w-full items-center justify-center">
      <div className="w-full max-w-sm">
        <RegisterForm />
      </div>
    </div>
  )
}
