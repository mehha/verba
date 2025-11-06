// src/app/(frontend)/app/[id]/page.tsx
import { notFound, redirect } from 'next/navigation'
import type { App } from '@/payload-types'
import { getCurrentUser } from '@/utilities/getCurrentUser'
import Runner from '@/app/(frontend)/app/[id]/Runner'
import PageClient from './page.client'
import React from 'react'

type Args = {
  params: Promise<{
    id: string
  }>
}

export default async function AppRunPage({ params: paramsPromise }: Args) {
  const { id } = await paramsPromise

  const { payload, user } = await getCurrentUser()

  if (!user) {
    redirect('/admin') // or your route
  }

  // will be filtered by access rules in Payload anyway
  const doc = await payload.findByID({
    collection: 'apps',
    id,
    depth: 2,
  }).catch(() => null)

  if (!doc) {
    notFound()
  }

  const app = doc as App

  return (
    <>
      <PageClient />
      <Runner app={app} />
    </>
  )
}
