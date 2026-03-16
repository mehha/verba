import type { Metadata } from 'next'
import { getServerSideURL } from './getURL'
import { DEFAULT_META_DESCRIPTION, SITE_NAME } from './seo'

const defaultOpenGraph: Metadata['openGraph'] = {
  type: 'website',
  description: DEFAULT_META_DESCRIPTION,
  images: [
    {
      url: `${getServerSideURL()}/website-template-OG.webp`,
    },
  ],
  locale: 'et_EE',
  siteName: SITE_NAME,
  title: SITE_NAME,
  url: '/',
}

export const mergeOpenGraph = (og?: Metadata['openGraph']): Metadata['openGraph'] => {
  return {
    ...defaultOpenGraph,
    ...og,
    images: og?.images ? og.images : defaultOpenGraph.images,
  }
}
