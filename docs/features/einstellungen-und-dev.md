# Settings and test tools

Moved verbatim from CLAUDE.md.

- **Setup (Garten):** `/settings` is the garden shed (`setup-main.tsx`: "Wer gießt?", Gießrhythmus, Gießzeit, push
  switch; calendars + "Freie Abende ab"; `flower-card.tsx`: the flower's name and pot – `couple_settings.flower_name`,
  `flower_pot`, pots unlock at 10/25 lived dates, `core/bloom.ts`). `garden-banner.tsx` shows only when something is
  missing (calendar, status – push is only the switch). The page is "einstellungen." (no "gartenschuppen"). "Mehr" (`?t=mehr`) lists the other topics.
- **Testdates (Einstellungen → Mehr → Testdates):** `server/demo-dates.ts` writes `core/demo-dates.ts` (seven past dates
  with both / one / no reviews, notes, "nochmal?", a checklist, drawn photos – `demo/<n>.svg`, the photo route draws
  them – and one round that fell through) as past rounds with `cycles.demo` and a negative seq; switching off deletes
  those rounds (everything on them cascades). The round logic never sees them (`latestCycle`, `cycleAt`,
  `cycleHistory`, the reminders' round filter `demo = false`), and they lie further back than the "wie war's?" window,
  so no reminder or app icon number comes from them. They do count in the Archiv, the story and the stem. e2e: m29.
- **Test-Date (dev tools, Einstellungen → Ihr zwei & Konto, `ENABLE_DEV_TOOLS=1`):** `server/dev-date.ts` puts the
  current round into "Kein Date" / "Ich schlage vor" / "<Partner> schlägt vor" / "Date steht" without planning together –
  the date (an idea from the list, `core/dev-date.ts`: 19:00 inside the round) is written as synced without an event id,
  so nothing goes to Google; "Kein Date" deletes test dates and cancels a real one the normal way. e2e: m34.
- **Demo partner (dev tools, `/pair` "Mit Demo-Partner testen", `ENABLE_DEV_TOOLS=1`):** `server/demo-partner.ts` makes a
  couple with a made-up Sam (`google_sub` `demo:…`, email `@zweisamen.invalid`, never logs in) and writes the Testdates.
  Sam's calendar connection has no calendars (`queryFreeBusy` answers "free" without Google), says yes to every date
  right after `saveDate`, likes every card (`swipe`) and answers every review "nochmal: ja". Dates of a demo couple
  never go to Google (`syncDate`). e2e: m35.
