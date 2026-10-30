@AGENTS.md

# Zweisamen – project notes

Date planner PWA for exactly one couple. Plan and decisions: `docs/PLAN.md`. Setup: `docs/SETUP.md`.

## Conventions

- UI copy is **German**; code, identifiers, comments and commit messages are **English**.
- Time zone is always `Europe/Berlin` (`APP_TIMEZONE` in `src/lib/domain.ts`); use Luxon for date math.
- Pure logic (no DB, no `next/*`) lives in `src/lib` (later `src/core`) and gets Vitest tests next to it.
- Server-only code lives in `src/server` and imports `server-only`.
- Every page/action gets the user via `requireUser()`/`requireCouple()` (`src/server/auth/dal.ts`).
- Cache Components is on: anything reading cookies or the DB must render inside `<Suspense>`. Signed-in pages have
  ONE boundary, in the `(app)` layout (fallback `BeetSkeleton`) – no `<Suspense>` around a whole page: it would flash
  its skeleton on every tab switch. A slow part inside a page may have its own.
- Status-like columns are `text` with TS enums from `src/lib/domain.ts` – never Postgres enums.
- Schema change → `npm run db:generate` → commit the SQL in `drizzle/`.
- Mutations are server actions that call `refresh()`; pages that show shared data render `<AutoRefresh />`.
- Google Calendar calls go through `calendarRequest()` (`src/server/google/calendar-api.ts`), which awaits `connection()` first so prefetch/prerender never hits Google. Call `connection()` before any try/catch around live Google data.
- "Now" for a couple is `coupleNow(settings)` (`src/server/clock.ts`), never `new Date()` in round/slot logic – the dev clock shifts it.
- Pages that use time or write round state call `await connection()` right after `requireCouple()`.
  While the dev clock is moved (`ENABLE_DEV_TOOLS=1`), the Beet says so (`data-dev-clock`, reset in `?t=konto`).
- Wer Design, Tabs/AutoRefresh, Fehlerberichte, App-Badge, Karten, Gesten/Offline, Datenbank-Abfragen, Navigation, Runden/Dates oder das Next.js-Update anfasst, liest zuerst `docs/ARCHITECTURE.md`.
- Wer Einstellungen, Testdates oder das Test-Date (Dev-Tools) anfasst, liest zuerst `docs/features/einstellungen-und-dev.md`.
- Wer den Swipe-Stapel, die Swipe-Karte oder die Banner anfasst, liest zuerst `docs/features/swipen.md`.
- Wer die Ideen-Seiten, Kacheln oder die Kategorie-Ansicht anfasst, liest zuerst `docs/features/ideen.md`.
- Wer das Archiv, ein Blatt oder „wie war's?“ anfasst, liest zuerst `docs/features/archiv.md`.
- Wer das Beet, das Date-Sheet („date steht.“) oder die Beet-Schritte anfasst, liest zuerst `docs/features/beet.md`.
- Slot ranking stays pure: `scoreSlot`/`findSlots` get daylight and the hourly forecast as
  parameters (`core/outdoor.ts`, `core/sun.ts`); the one forecast request per search lives in
  `server/weather.ts`. Outdoor ideas (`ideas.setting`) use the outdoor ranking, see `core/slot-modes.ts`.
- Lists of ideas/events filter with the one shared filter (`useIdeaFilter()`, `matchesIdeaFilter()`),
  never with their own chips – one exception: a tile's view on `/ideas` (Ideen-Kategorie) has its own chips (by the
  design), which do not touch the shared filter (which ideas a view holds: `idea-board.tsx` `inView`). Ideas without
  `ideas.category` use `categoryOf()`.
  New extras go behind `extraOn(settings, …)` and show up only when they fit.

## Checks before pushing

`npm run check && npm run build` – and the affected e2e suites (`npm run e2e -- m12 m17`).

## Working routine

- **e2e:** `npm run e2e [-- m5 m9]` needs no env vars: it reads `E2E_DATABASE_URL` (environment or
  `.env.local`), finds the container's Chromium, checks Postgres and rebuilds when `src/`,
  `drizzle/` or `public/` changed. While iterating run only the suites that touch the change; run
  the full suite once before the push. CI runs it in four jobs (`--shard=k/4`, each on its own machine and database –
  the suites share ports, so not side by side locally); a new suite goes into `ALL` and `WEIGHT` in `e2e/run.mjs`.
- **UI changes:** grep `e2e/*.mjs` for the labels/headings you rename or move before running –
  every renamed button breaks a locator somewhere. Look at the screenshots in `e2e/shots/`
  (light and dark) instead of trusting green checks alone.
- **Weekday/date-sensitive tests:** the suites run on any day. Round logic → pin the dev clock with
  `tuesdayMorningOffset()` (`e2e/clock.mjs`); slot lists late in the week → `/plan?later=1`;
  decks/lists that a test empties → seed spare rows. A test that only fails on some days is a test bug.
- **No scrolling (M27):** every screen fits 390×844 – only lists scroll (wishlist, events, sheets,
  long settings topics). Long content becomes steps, pages or tabs (`Tabs`, `?t=` topics, paging);
  check new screens with `fitsScreen(page)` from `e2e/flow.mjs`. Small phones (360×640) may scroll, but nothing
  may overlap or be cut off: m24 runs `layoutAudit()` (`e2e/layout-audit.mjs`) on every page at both sizes. Settings links are `/settings?t=<topic>`.
- **Planning in e2e:** `/plan` is the start (the Beet); "Date planen" opens the one planning
  flow at `/plan?pick=1`: "was?" (tap an idea, "Weiter") then "wann?" (the send button is `SEND` in
  `flow.mjs`; `backToIdeas()` is the arrow at the top). Use `e2e/flow.mjs` (`openFlow`, `pickIdea`, `openTimes`,
  `customIdea`, `backAtStart`) instead of expecting the wishlist or the times (`ol li button`) right away.
  The next date sits on the Beet (`[data-next-step] [data-date-card]`); its checklist,
  "Zeit ändern" and "Absagen" are in the date sheet ("Details öffnen") and on `/dates/<id>`.
- **Hidden pages in e2e:** Next keeps the last visited pages mounted but hidden, so `getByText` can match
  twice – prefer `getByRole` (ignores hidden elements) or `{ exact: true }` / `.filter({ visible: true })`.
- **Timing in e2e:** CI is slower than the container. Wait for the UI that proves a state (e.g. the
  filter button showing the stored filter after hydration) instead of checking right after a load.
- **After every push:** check the CI run (GitHub MCP `actions_list` → `list_workflow_runs`) until
  it is green; a red run is fixed before the next task, never left for later.
- Never run prettier (the repo has no config; it rewrites whole files).
