import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getCurrentUser } from '@/utilities/getCurrentUser'
import { Heart, MessageCircle, ArrowRight, Sparkles } from 'lucide-react'

const tools = [
  {
    slug: '/feelings',
    title: 'Emotsiooniratas',
    description: 'Vali “Ma tunnen ennast …” ja kuula TTS-ist. Sobib emotsioonide kiireks jagamiseks.',
    icon: Heart,
    badge: 'Tunded',
    color: 'from-rose-200 to-pink-300 text-rose-950',
  },
  {
    slug: '/quick-chat',
    title: 'Kiirsuhtlus',
    description: 'Väga suured nupud: Jah, Ei, Veel, Aita, Lõpeta, WC, Valus. TTS iga nupuga.',
    icon: MessageCircle,
    badge: 'Kiirnupud',
    color: 'from-emerald-200 to-emerald-400 text-emerald-950',
  },
]

export const dynamic = 'force-dynamic'

export default async function ToolsPage() {
  const { user } = await getCurrentUser()
  if (!user) redirect('/login')

  return (
    <main className="container space-y-8 py-6">
      <header className="flex items-start gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-sky-100 text-sky-700">
          <Sparkles className="h-5 w-5" />
        </div>
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold leading-tight">Suhtlusvahendid</h1>
          <p className="text-sm text-muted-foreground">
            Koondvaade kõigist AAC kiirfunktsioonidest. Ava emotsiooniratas või kiirsuhtlus vastavalt lapse vajadusele.
          </p>
        </div>
      </header>

      <div className="grid gap-4 sm:grid-cols-2">
        {tools.map((tool) => {
          const Icon = tool.icon
          return (
            <Link
              key={tool.slug}
              href={tool.slug}
              className="group relative overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary/70"
            >
              <div
                className={`absolute inset-0 bg-gradient-to-br opacity-70 transition group-hover:opacity-100 ${tool.color}`}
              />
              <div className="relative flex h-full flex-col gap-3">
                <div className="flex items-start gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/80 text-foreground shadow-sm">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                      {tool.badge}
                    </p>
                    <h2 className="text-xl font-semibold text-foreground">{tool.title}</h2>
                    <p className="text-sm text-foreground/80">{tool.description}</p>
                  </div>
                  <ArrowRight className="ml-auto h-5 w-5 text-foreground transition group-hover:translate-x-1" />
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    </main>
  )
}
