---
title: Homepage Rules
description: Rules for the editable Suhtleja homepage block and media slots
tags: [suhtleja, homepage, payload, media]
---

# Homepage

## Scope

- Block config: `src/blocks/SuhtlejaHomepage/config.ts`
- Block component: `src/blocks/SuhtlejaHomepage/Component.tsx`
- Page registration: `src/collections/Pages/index.ts`
- Renderer registration: `src/blocks/RenderBlocks.tsx`

## Rules

- The homepage content should stay editable in Payload through the `suhtlejaHomepage` block.
- Each main section should have an `enabled` toggle so editors can hide it without deleting content.
- Default content should explain Suhtleja through four main moments:
  - child home view / hero product image
  - video poster or uploaded/embed video
  - communication board feature
  - connect-dots puzzle feature
  - home, kindergarten, school, and therapy usage context
- Media fields are optional. When missing, the component must render a polished product-style mockup instead of an empty frame.
- The video section should show a poster/placeholder with a play button and open the uploaded video or embed URL inside a Dialog.
- Feature media under “Suhtlustahvlid ja harjutused samas kohas” must support editable aspect ratios, with `16/9` as the default and `9/16` available for phone portrait mockups.
- Visual direction should follow the current logo: warm orange, red, blue, rounded tiles, white surfaces, and calm child-friendly spacing.
- Keep copy in Estonian and avoid overclaiming clinical outcomes.

## Change Checklist

- If block fields change, run `pnpm generate:types`.
- Re-check the hero on mobile and desktop if layout, copy length, or media aspect ratios change.
- Keep video replaceable through either uploaded media or an external embed URL.
