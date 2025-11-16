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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { ScrollArea } from '@/components/ui/scroll-area'
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
        <div className="flex items-center flex-wrap justify-between gap-4">
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
              <>
                {' · '}filtris{' '}
                <span className="font-medium">{filteredApps.length}</span>
              </>
            )}
          </div>
        </div>

        <ScrollArea className="rounded-xl border bg-background">
          <Table className="min-w-full text-sm">
            <TableHeader className="bg-muted/60">
              <TableRow className="border-b">
                <TableHead className="w-10 px-3 py-2 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  #
                </TableHead>
                <TableHead className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Nimi
                </TableHead>
                {isAdmin && (
                  <TableHead className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Omanik
                  </TableHead>
                )}
                <TableHead className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Desktop
                </TableHead>
                <TableHead className="px-3 py-2 text-right text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Tegevused
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {filteredApps.map((app, index) => {
                const isPinned = !!app.pinned
                const owner =
                  typeof app.owner === 'object' && app.owner
                    ? (app.owner as any)
                    : null

                return (
                  <TableRow
                    key={app.id}
                    className="border-b last:border-b-0 hover:bg-muted/40"
                  >
                    <TableCell className="px-3 py-2 align-middle text-xs text-muted-foreground">
                      {index + 1}
                    </TableCell>

                    <TableCell className="px-3 py-2 align-middle">
                      <div className="flex flex-col gap-0.5">
                        <Link
                          href={`/app/${app.id}`}
                          className="font-medium underline-offset-2 hover:underline"
                        >
                          {app.name || 'Nimetu äpp'}
                        </Link>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Link
                            href={`/app/${app.id}`}
                            className="inline-flex items-center gap-1 underline-offset-2 hover:underline"
                          >
                            <Monitor className="h-3 w-3" />
                            <span>Vaata</span>
                          </Link>
                          <span aria-hidden="true">·</span>
                          <Link
                            href={`/app/${app.id}/edit`}
                            className="inline-flex items-center gap-1 underline-offset-2 hover:underline"
                          >
                            <Edit3 className="h-3 w-3" />
                            <span>Muuda</span>
                          </Link>
                        </div>
                      </div>
                    </TableCell>

                    {isAdmin && (
                      <TableCell className="px-3 py-2 align-middle">
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
                      </TableCell>
                    )}

                    <TableCell className="px-3 py-2 align-middle">
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={isPinned ? 'default' : 'outline'}
                          className="px-2 py-0.5 text-[11px]"
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
                                  <PinOff className="h-4 w-4" />
                                ) : (
                                  <Pin className="h-4 w-4" />
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
                    </TableCell>

                    <TableCell className="px-3 py-2 align-middle text-right">
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
                        <input type="hidden" name="appId" value={app.id} />
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              type="submit"
                              size="icon"
                              variant="ghost"
                              className="h-7 w-7 text-red-600 hover:bg-red-50 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Kustuta äpp</p>
                          </TooltipContent>
                        </Tooltip>
                      </form>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </ScrollArea>
      </div>
    </TooltipProvider>
  )
}
