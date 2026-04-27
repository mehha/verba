---
title: UI Components Rules
description: Prefer shared shadcn/ui components before building new primitives
tags: [suhtleja, ui, shadcn]
---

# UI Components

## Primary Rule
- Prefer existing shadcn/ui components from `@/components/ui/*` whenever possible.

## Before Creating a New UI Primitive
- Check whether the component already exists under `src/components/ui`.
- Check the shadcn component catalog: `https://ui.shadcn.com/docs/components`.
- If it does not exist locally but exists in shadcn, install/add that component first.

## Avoid
- Duplicating primitives already covered by shadcn/ui (buttons, dialogs, tabs, selects, etc.).
- Creating one-off variants that should be shared under `src/components/ui`.

## Viewport-Sized Overlays
- For shared sheets, drawers, and mobile menus, prefer stable viewport height units (`svh`) over dynamic viewport height (`dvh`) so Safari on iPad/iOS does not jump when browser chrome changes.
- For mobile menu widths, keep a normal `vw` fallback and use `dvw` only as a supported enhancement.
