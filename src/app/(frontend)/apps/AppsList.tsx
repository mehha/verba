'use client'

import React, { useMemo, useState } from 'react'
import Link from 'next/link'
import type { App } from '@/payload-types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  Edit3,
  Monitor,
  Pin,
  PinOff,
  Trash2,
} from 'lucide-react'

type AppsListProps = {
  apps: App[]
  isAdmin: boolean
  togglePinned: (formData: FormData) => Promise<void> // server action (/apps/page.tsx)
  deleteApp: (formData: FormData) => Promise<void> // server action (/apps/page.tsx)
}

export function AppsList({
  apps,
  isAdmin,
  togglePinned,
  deleteApp,
}: AppsListProps) {
  const [query, setQuery] = useState('')

  const filteredApps = useMemo(() => {
    const q = query.toLowerCase().trim()
    if (!q) return apps

    return apps.filter((app) => {
      const name = app.name?.toLowerCase() ?? ''
      const ownerName =
        typeof app.owner === 'object' && app.owner
          ? ((app.owner as any).name || (app.owner as any).email || '').toLowerCase()
          : ''
      return name.includes(q) || ownerName.includes(q)
    })
  }, [apps, query])

  if (!apps.length) {
    return (
      <p className="text-sm text-muted-foreground">
        Sul pole veel ühtegi äppi. Lisa ülal paremal nupust “Lisa uus äpp”.
      </p>
    )
  }

  return (
    <TooltipProvider>
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1">
            <Input
              type="search"
              placeholder="Otsi äppe nime või omaniku järgi…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="max-w-xs"
            />
          </div>

          <div className="text-xs text-muted-foreground">
            Kokku <span className="font-medium">{apps.length}</span> äppi
            {filteredApps.length !== apps.length && (
              <> · filtris <span className="font-medium">{filteredApps.length}</span></>
            )}
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl border bg-background">
          <table className="min-w-full text-sm">
            <thead className="bg-muted/60">
              <tr className="border-b">
                <th className="px-3 py-2 text-left font-medium text-xs uppercase tracking-wide text-muted-foreground w-10">
                  #
                </th>
                <th className="px-3 py-2 text-left font-medium text-xs uppercase tracking-wide text-muted-foreground">
                  Nimi
                </th>
                {isAdmin && (
                  <th className="px-3 py-2 text-left font-medium text-xs uppercase tracking-wide text-muted-foreground">
                    Omanik
                  </th>
                )}
                <th className="px-3 py-2 text-left font-medium text-xs uppercase tracking-wide text-muted-foreground">
                  Desktop
                </th>
                <th className="px-3 py-2 text-right font-medium text-xs uppercase tracking-wide text-muted-foreground">
                  Tegevused
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredApps.map((app, index) => {
                const isPinned = !!app.pinned
                const owner =
                  typeof app.owner === 'object' && app.owner
                    ? (app.owner as any)
                    : null

                return (
                  <tr
                    key={app.id}
                    className="border-b last:border-b-0 hover:bg-muted/40"
                  >
                    <td className="px-3 py-2 align-middle text-xs text-muted-foreground">
                      {index + 1}
                    </td>

                    <td className="px-3 py-2 align-middle">
                      <div className="flex flex-col gap-0.5">
                        <Link
                          href={`/app/${app.id}`}
                          className="font-medium hover:underline underline-offset-2"
                        >
                          {app.name || 'Nimetu äpp'}
                        </Link>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Link
                            href={`/app/${app.id}`}
                            className="inline-flex items-center gap-1 hover:underline underline-offset-2"
                          >
                            <Monitor className="w-3 h-3" />
                            <span>Vaata</span>
                          </Link>
                          <Link
                            href={`/app/${app.id}/edit`}
                            className="inline-flex items-center gap-1 hover:underline underline-offset-2"
                          >
                            <Edit3 className="w-3 h-3" />
                            <span>Muuda</span>
                          </Link>
                        </div>
                      </div>
                    </td>

                    {isAdmin && (
                      <td className="px-3 py-2 align-middle">
                        {owner ? (
                          <div className="flex flex-col">
                            {owner.name && (
                              <span className="text-xs font-medium">
                                {owner.name}
                              </span>
                            )}
                            {owner.email && (
                              <span className="text-xs text-muted-foreground">
                                {owner.email}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">
                            –
                          </span>
                        )}
                      </td>
                    )}

                    <td className="px-3 py-2 align-middle">
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={isPinned ? 'default' : 'outline'}
                          className="text-[11px] px-2 py-0.5"
                        >
                          {isPinned ? 'Desktopil' : 'Peidetud'}
                        </Badge>

                        <form action={togglePinned}>
                          <input type="hidden" name="appId" value={app.id as string} />
                          <input
                            type="hidden"
                            name="pinned"
                            value={(!isPinned).toString()}
                          />
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                type="submit"
                                size="icon"
                                variant="ghost"
                                className="h-7 w-7"
                              >
                                {isPinned ? (
                                  <PinOff className="w-4 h-4" />
                                ) : (
                                  <Pin className="w-4 h-4" />
                                )}
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>
                                {isPinned
                                  ? 'Eemalda desktopilt'
                                  : 'Lisa desktopile'}
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        </form>
                      </div>
                    </td>

                    <td className="px-3 py-2 align-middle text-right">
                      <form
                        action={deleteApp}
                        onSubmit={(e) => {
                          if (
                            !window.confirm(
                              `Kas soovid kindlasti kustutada äpi “${app.name || 'Nimetu äpp'}”?`,
                            )
                          ) {
                            e.preventDefault()
                          }
                        }}
                        className="inline-flex"
                      >
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              type="submit"
                              size="icon"
                              variant="ghost"
                              className="h-7 w-7 text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Kustuta äpp</p>
                          </TooltipContent>
                        </Tooltip>
                      </form>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </TooltipProvider>
  )
}
