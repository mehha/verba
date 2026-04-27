'use client'

import { Smile, UserLock } from 'lucide-react'
import * as React from 'react'

import { Button } from '@/components/ui/button'
import { switchToChildModeAction } from '@/app/(frontend)/kodu/modeActions'
import { ParentUnlockDialog } from '@/app/(frontend)/kodu/ParentUnlockDialog'
import { ButtonGroup } from '@/components/ui/button-group'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { usePathname } from 'next/navigation'

type ParentModeToggleProps = {
  isParentMode?: boolean
  hasPin: boolean
}

export function ParentModeToggle({ isParentMode, hasPin }: ParentModeToggleProps) {
  const inParentMode = Boolean(isParentMode)
  const pathname = usePathname()
  const triggerClassName =
    'h-9 w-9 p-0 rounded-full border-none [&_svg]:h-[18px] [&_svg]:w-[18px]'

  return (
    <TooltipProvider>
      <ButtonGroup className="inline-flex rounded-full border border-slate-300 bg-white p-0.5 shadow-sm">
        {/* Lapse vaade */}
        {inParentMode ? (
          // vanema vaates -> Lapse nupp on klikitav (switchToChildModeAction)
          <form action={switchToChildModeAction} data-navigation-form>
            <input name="returnTo" type="hidden" value={pathname} />
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="submit"
                  size="icon"
                  variant="ghost"
                  aria-label="Laps"
                  className={`${triggerClassName} rounded-r-none text-slate-800 hover:bg-accent hover:text-accent-foreground`}
                >
                  <Smile aria-hidden="true" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Laps</TooltipContent>
            </Tooltip>
          </form>
        ) : (
          // lapse vaates -> Lapse nupp on aktiivne (accent, disabled)
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="inline-flex">
                <Button
                  type="button"
                  variant="default"
                  size="icon"
                  disabled
                  aria-label="Laps"
                  className={`${triggerClassName} rounded-r-none bg-accent text-accent-foreground hover:bg-accent disabled:opacity-100`}
                >
                  <Smile aria-hidden="true" />
                </Button>
              </span>
            </TooltipTrigger>
            <TooltipContent>Laps</TooltipContent>
          </Tooltip>
        )}

        {/* Vanema vaade */}
        {inParentMode ? (
          // vanema vaates -> Vanema nupp on aktiivne (accent, disabled)
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="inline-flex">
                <Button
                  type="button"
                  variant="default"
                  disabled
                  size="icon"
                  aria-label="Vanem"
                  className={`${triggerClassName} rounded-l-none bg-accent text-accent-foreground hover:bg-accent disabled:opacity-100`}
                >
                  <UserLock aria-hidden="true" />
                </Button>
              </span>
            </TooltipTrigger>
            <TooltipContent>Vanem</TooltipContent>
          </Tooltip>
        ) : (
          // lapse vaates -> Vanema nupp on klikitav (avatakse PIN dialog)
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="inline-flex">
                <ParentUnlockDialog
                  hasPin={hasPin}
                  className={`${triggerClassName} rounded-l-none text-slate-800 hover:bg-accent hover:text-accent-foreground`}
                >
                  <UserLock aria-hidden="true" />
                  <span className="sr-only">Vanem</span>
                </ParentUnlockDialog>
              </span>
            </TooltipTrigger>
            <TooltipContent>Vanem</TooltipContent>
          </Tooltip>
        )}
      </ButtonGroup>
    </TooltipProvider>
  )
}
