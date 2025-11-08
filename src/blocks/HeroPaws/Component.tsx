import * as React from 'react'
import { HeroPawsClient, type HeroPawsClientProps } from './Component.client'

// Block props shaped like your other blocks, incl. blockType.
export type HeroPawsBlockProps = {
  blockType: 'heroPaws'
  className?: string

  eyebrow?: string
  title: string
  description?: string
  ctas?: { label: string; href: string; variant?: 'primary' | 'secondary' }[]
  cards: HeroPawsClientProps['cards']
}

export const HeroPawsBlock: React.FC<HeroPawsBlockProps> = ({
  className,
  ...props
}) => {
  return (
    <div className={[className, 'not-prose'].filter(Boolean).join(' ')}>
      <HeroPawsClient {...props} />
    </div>
  )
}
