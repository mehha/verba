# Repository Guidelines

Use this guide when contributing to keep the Next.js + Payload stack consistent and reliable.

## Project Structure & Module Organization
- `src/app/(frontend)` contains App Router routes (`home`, `[slug]`, `posts`, `search`, etc.) and shared layout files. `src/app/(payload)` wraps the Payload admin and API surface.
- Domain config lives in `src/collections`, `src/blocks`, `src/fields`, and `payload.config.ts`; reusable UI and logic sit in `src/components`, `src/hooks`, `src/providers`, and `src/utilities`.
- Styling is centralized in `src/app/(frontend)/globals.css`, `tailwind.config.mjs`, and `postcss.config.js`; design tokens live in `src/cssVariables.js`.
- Tests reside in `tests/int/*.int.spec.ts` (Vitest) and `tests/e2e/*.e2e.spec.ts` (Playwright). Assets live in `public/`.

## Blocks Setup & Extension
- Blocks live in `src/blocks/<BlockName>` with `config.ts` (Payload block config defining `slug`/`interfaceName`/fields) and `Component.tsx` (frontend render).
- `src/collections/Pages/index.ts` registers allowed layout blocks; import your new `config` there and add it to the `layout.blocks` array.
- `src/blocks/RenderBlocks.tsx` maps `blockType` → component; add your block keyed by the `slug` used in `config.ts`. Keep slugs stable—renames require content migration.
- Example flow: copy an existing block (e.g., `Content`), adjust fields, create the matching component, wire it into `Pages` and `RenderBlocks`, then run `pnpm generate:types` to refresh `payload-types.ts`. Prefer shared fields from `src/fields` to stay consistent.

## Collections Setup & Extension
- Collections live in `src/collections/<Name>/index.ts` (hooks in `hooks/` where needed). Each export is a Payload `CollectionConfig` with a unique `slug`, access rules, and admin settings.
- Register collections in `src/payload.config.ts` under the `collections` array; missing registration means the admin UI and API will not expose them.
- Use shared access helpers (`src/access/*.ts`), common SEO fields, and `slugField()` for URL-safe IDs. Keep `defaultPopulate` and `admin.preview` in sync with front-end needs (see `Pages` and `Posts` for patterns).
- When adding relationships, reference existing slugs (`users`, `media`, `categories`, etc.) and consider `filterOptions`/`defaultPopulate` to avoid over-fetching. Run `pnpm generate:types` after schema changes.

## Project-Specific Flows
- Boards feature: UI lives under `src/app/(frontend)/boards`; collection config at `src/collections/Boards`. Access rules restrict reads/updates to admins or board owners. Server actions on `/boards/page.tsx` handle create/pin/delete—keep them in sync with `BoardsList`.
- Parent/Child mode: PIN-based toggle (`ParentUnlockDialog` in `src/app/(frontend)/home/ParentUnlockDialog.tsx`, actions in `modeActions.ts`, helpers in `src/utilities/uiMode.ts`). PIN hashes live on users (`parentPinHash`, default from `DEFAULT_PARENT_PIN` env or `0000`). `requireParentMode()` guards routes like `/boards`; set the `uiMode` cookie to switch modes. When adjusting PIN flows, preserve the auto-submit/validation UX and cookie attributes.
- Quick Chat: admin-configurable buttons live in the `quick-chat` global (`src/QuickChat/config.ts`, registered in `payload.config.ts`). Frontend lives at `/quick-chat` with TTS playback per button (`src/app/(frontend)/quick-chat`). Use the global to toggle which buttons are visible and adjust phrases/colors; defaults cover “Jah/ Ei/ Veel/ Aita/ Lõpeta/ Kus on WC?/ Valus.”

## Build, Test, and Development Commands
- `pnpm install` with Node 18.20+ or 20+ (pnpm 9+) to set up dependencies.
- `pnpm dev` runs Next.js and Payload locally at `http://localhost:3000`.
- `pnpm build` creates the production bundle; `pnpm start` serves it. `pnpm postbuild` generates sitemaps.
- `pnpm lint` / `pnpm lint:fix` runs ESLint (Next/TypeScript config).
- `pnpm test:int` for Vitest integration/unit coverage; `pnpm test:e2e` for Playwright UI flows; `pnpm test` runs both.
- Payload helpers: `pnpm generate:types`, `pnpm generate:importmap`, and `pnpm payload <command>`.

## Coding Style & Naming Conventions
- TypeScript-first, App Router friendly. Prefer ES modules and `PascalCase` component files, `camelCase` utilities/hooks, and `SCREAMING_SNAKE_CASE` env keys.
- 2-space indentation; keep Tailwind classes ordered logically (layout → spacing → color → state). Avoid unused exports and `any`; ESLint warns on these.
- Use Prettier for formatting before committing; keep generated `payload-types.ts` in sync via `pnpm generate:types` when schema changes.

## Testing Guidelines
- Integration specs live in `tests/int` (`*.int.spec.ts`) using Vitest + jsdom; collocate new cases near relevant modules.
- E2E specs live in `tests/e2e` (`*.e2e.spec.ts`) using Playwright; ensure `pnpm dev` (or a running build) is active before running them.
- Aim to cover data-access and UI regressions with focused tests before broad flows; prefer deterministic fixtures seeded from the repo defaults.

## Commit & Pull Request Guidelines
- Follow Conventional Commits as in history (`feat:`, `fix:`, `refactor:`, etc.), using concise, imperative scopes.
- PRs should explain intent, list key changes, and call out schema/env updates or manual steps (migrations, revalidation, seeds).
- Include test evidence (`pnpm test`, `pnpm test:int`, or `pnpm test:e2e` as appropriate) and UI screenshots/GIFs for visible changes.
- Keep diffs scoped; note any breaking changes or ops impacts (cache invalidation, search index rebuilds, Payload admin tweaks).
