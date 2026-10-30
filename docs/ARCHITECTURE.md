# Architecture notes

Moved verbatim from CLAUDE.md.

- **Design ("Garten", dark only):** spec and mockups in `docs/design/garten/` (DESIGN-GARTEN.md + `screens/*.html`,
  `components/Bloom.html`) – it replaces the older DESIGN.md / main-b for these pages. The whole app is dark:
  `<html data-theme="dark">` is fixed in `layout.tsx`, one token set in `globals.css` (`bg`, `surface`, `ink`, `muted`,
  `track` + Garten: `butter`, `green`, `like`, `divider`, `text-soft`, `muted-2`, `cta`, `soil`, `seed`, `tile-*`).
  Fonts Bricolage Grotesque, DM Mono (`meta`), Caveat (`font-hand`, only the flower's voice). Person colors
  (`PERSON_HEX`: himmel = #4D63E8, mandarine = rosé) are accents only. Primary pill = `bg-cta text-bg`. Light fills
  (`bg-tile-*`, `bg-rose`, `bg-zitrone-soft` …) reset the tokens to light values, so `text-ink` on them stays readable
  – `bg-cta`/`bg-butter` are NOT in that list (their text is dark by design). Garden words: Ideen = Samen, Like =
  einpflanzen, Nein = Kompost, Match = keimt / Matchlinge, Frist = Gießzeit, Rhythmus = Gießrhythmus, Planen = gießen.
- **Tabs feel like an app:** `staleTimes.dynamic` (next.config) keeps visited pages for 5 minutes – a tab comes back
  at once. A `router.refresh()` drops all those copies, so `AutoRefresh` (a server component: it renders the couple's
  fingerprint, `server/stamp.ts` – row counts + `xmin` per table, bookkeeping columns left out – plus a 5-minute
  bucket) only refreshes when `stampAction()` returns a different one (on show, foreground, every 15 s). A new table goes
  into `core/stamp-tables.ts` (or `NOT_STAMPED` with a reason) – `stamp-tables.test.ts` fails otherwise. Actions that `redirect()` call `refresh()` first. No page fade-in (no `template.tsx`).
  Because the loading boundary sits in the layout, a first visit keeps the old page until the new one is there (the
  tab lights up at once via `useLinkStatus`, `nav-pending.tsx` shows a thin bar after 150 ms). e2e: m26 (first visits
  too).
- **Server errors:** `src/instrumentation.ts` (`onRequestError`) → `server/server-errors.ts`: counted in `app_status`
  (`errors`, left out of the stamp so a failing page cannot refresh itself in a loop), shown as "Fehler" under
  Einstellungen → Status, push type `errors` (off by default, `NOTIFICATIONS_OFF_BY_DEFAULT`) at most once a day.
  Errors in the app on a phone the same way: `components/error-reporter.tsx` (window errors, rejections, `error.tsx`
  without digest; network trouble skipped, ≤ 5 per load, each message once per session) → `reportClientErrorAction`
  → `app_status` `client_errors` with the device (`core/device.ts`), row "Fehler im Handy". e2e: m15.
- **App icon number:** `waitingForMe()` (`core/next-step.ts`) counts what I have to do (calendar, answer a plan,
  "habt ihr's gemacht?", my turn, "wie war's?"); `AppBadge` (client, (app) layout) asks `badgeAction()` after the page is
  there (open, foreground, each navigation – never while a page renders) and sets it (`data-app-badge`); it is read
  only (`currentCycleReadOnly`), and every push carries it (`badge`, `server/badge.ts`, set in sw.js). e2e: m6.
- **Maps:** `components/map-embed.tsx` is Google's embed (`mapEmbedUrl()`, no key; places in Köln unless they name a
  city, `placeQuery()`) – it loads only once it is on screen (a closed date card or a compact swipe card never fetches
  it), takes no fingers (a drag over it still moves the card) and with `href` a tap opens Maps (without, it is
  only a picture – the full swipe card, where a tap means smaller). e2e answers `maps.google.com` with a
  stand-in page (m17, m25).
- **Gestures and offline:** `components/gestures.tsx` – from the left edge = back where the page has a back arrow
  (mark it `data-back`; installed app only, `localStorage["dom-gestures"]="1"` elsewhere), pull down at the top =
  `router.refresh()` (not on `[data-sheet-card]`, the swipe card, dialogs, fields, `[data-no-pull]`). `public/sw.js`
  keeps the pages you opened (network first; offline: their last state, `/` → the Beet, else `offline.html`) and the
  `/_next/static` files; the login page forgets the pages (`forget-pages.tsx`). Swiping offline keeps the swipe on the
  phone (`ideas/entdecken/swipe-queue.ts`, localStorage) and `SwipeQueueFlusher` (layout) sends it once there is network
  (start, foreground, `online`, and again after 2 s, 5 s, 15 s, 30 s … while some wait); the card stays off the deck meanwhile, ↺ takes a kept one back. `offline-note.tsx` says so (it asks the server – `navigator.onLine` can lie). e2e: m27
  (Playwright's `setOffline` does not reach the service worker – cut the network with `context.route` and
  `PW_EXPERIMENTAL_SERVICE_WORKER_NETWORK_EVENTS=1`, see m7/m27).
- **Database round trips:** every page is measured (m28: statements per page, with budgets – a page that suddenly needs
  twice as many is a slowdown on phones). Reads that do not depend on each other go in one `Promise.all`; a function
  that needs the couple's settings takes them as an optional parameter (`ensureCurrentCycle`, `budgetState`) instead of
  reading them again.
- **Big files:** the swipe deck's server side is `server/deck.ts` (reading, swiping, undo, "Vielleicht"), `deck-open.ts` (which cards
  one person can still swipe), `deck-refill.ts` (Claude / Köln batches) and `deck-notify.ts` (match, nudges, expiry) – `deck.ts`
  re-exports their public parts, callers keep importing `@/server/deck`. The swipe card itself is `swipe-card.tsx`.
- **Next.js updates:** `npm audit` must stay at 0; `next build` itself warns about known vulnerabilities (and once stopped with a
  fatal error) – `next` and `eslint-config-next` are pinned to the same exact version.
- **Smooth on phones:** what follows a finger moves with `transform` only and renders at most once per frame – the swipe
  card is moved straight in the DOM (React hears only the stamp), the date sheet's frame moves around content of one
  fixed size (never re-wrapped) and everything on it is drawn per frame from the card's top (no CSS transitions that
  could drift apart), bubble and dots are translated; `Bloom` and the swipe `Card` are memoized.
- **Navigation (M40):** `BottomNav` in the `(app)` layout: Archiv (`/dates`) · Swipen (`/ideas/entdecken`) · **Beet** (`/plan`,
  the big green circle, always on top – the bar is `z-30`) · Ideen · Einstellungen. `AppHeader` is the small name plus the page's
  own thing on the right (avatars, "36 Ideen", matches pill). The four dots are one path: the Beet is dot 1, the
  planning flow's filter / "was?" / "wann?" are dots 2–4 (`flowTop` in `plan-form.tsx`); once a date is proposed
  the Beet shows them as one lit bar (`StepDots all`). `/ideas` shows tiles; a tile opens `/ideas?ansicht=<kind>` (URL-driven, so the
  Ideen tab brings you back); there the view's own chips filter (see Ideen-Kategorie), elsewhere the one Filter button.
- **Rounds and dates:** a date lives in the round it happens in (`cycleForDate()` creates later rounds when a date is
  planned ahead; the current round is the one containing now, never just the newest row). A planned date nobody
  confirmed does not turn "done" by itself: the Beet asks "habt ihr's gemacht?" (step `did_it`, `markHappened` /
  `markNotHappened`). "Zusagen" carries the time that was shown (`confirmDateAction(id, startIso)`).
