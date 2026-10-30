# Swipen and the banner library

Moved verbatim from CLAUDE.md.

- **Swipen (V2 "Kacheln", `docs/design/garten/swipe-karte-v2/`):** `swipe-deck.tsx` / `swipe-card.tsx` – the light card: the idea's
  banner on top (Kategorie pill, "Nº n / N" = this visit's swipes + what is left), title (2 lines) and description (2 lines,
  a combo names its event first), three tiles WO · DAUER · KOSTEN (a place up to its comma, else drinnen/draußen/egal;
  cost "offen" when unknown; long single words get smaller) and the dark day strip (the event's day, else the next free
  evening / half day from one FreeBusy query per page, `core/card-when.ts`; "✓ beide frei", or brown "kein Slot frei" /
  "kalender fehlt" – never a made-up date). The deck only holds what fits both calendars (`deckFor`, `bothFree === false`).
  Texts never change the card's height: the banner takes what is left (more on a tall phone, it gives way first on a
  short one, min 72 px), then `fitCard()` measures where the strip ends – geometry, not scrollHeight, Safari differs – and
  sets the steps `data-d1…4` (globals.css `.swipe-card`: smaller tiles, 1 / 0 lines of description, 1 line of title; m24
  checks five heights, a hidden tab, no measuring). A tap (not a drag) opens the full screen (`Card full`): banner with ✕
  ("Schließen"), the day big, the time + "✓ ihr habt beide Zeit", title, 3 lines of description ("ganzer Text"), chips, the
  event, the real Google map (124 px, `components/map-embed.tsx`) + "In Google Maps öffnen" – both only with a place – and
  the bar at the bottom "Kompost" / "Einpflanzen" (`data-card-bar`, they swipe like the gesture); the banner fills
  what the content leaves, so no empty card. "swipen." folds away up, the flower down, ↺ comes up into the header's top
  right (globals.css `data-deck-fold` / `data-deck-head`); swiping works there too, a tap (or Escape) makes it small
  again – the content scrolls, and a scroll container starts a new touch-action, so it carries `touch-pan-y` itself
  (else the browser takes a sideways swipe). The pointer is captured only once a drag starts, so buttons inside the
  card stay buttons. Its map is only a picture (a tap makes the card small). Behind the top card waits the real next
  card (`data-next-card`, inert, small or full like the top one) – it peeks out at the bottom and comes forward with the
  swipe (`behindTransform`, written per frame with the drag); top and next are one keyed list.
  e2e: m17, m30 (real touch events: small, full, shaky swipes, mid-swipe peek, scrolling, map tap), m32 (V2 at both sizes,
  five scenes, long / short texts, no place, no slot, full screen bar, /dev/motive). Swiping only,
  with the EINPFLANZEN / KOMPOST stamp; the flower (a new quip every 10 s; tap = "sam hat n geswipt." + "deine likes ›" for 5 s – no line under the title) reacts happy / sad and also says what a swipe
  changed or what went wrong – no small text under the card. ⓘ next to the Matchlinge (how it works, "n geswipt · n
  übrig", Mehr Ideen, Euer Ding) and ↺ next to the filter live in `deck-chrome.tsx`. For keyboard / screen readers the
  two choices are sr-only buttons on the card ("Einpflanzen", "Auf den Kompost" – e2e presses them with
  `dispatchEvent("click")`). Look and quips are stored on `deck_cards` and `ideas`
  (`motif`, `quips`): Claude writes them in the batch call, `server/card-art.ts` in one small call
  after an idea is created (kind `art`); empty → `core/card-art.ts` (category + cost/place/size). e2e fakes answer
  that call via `e2e/claude-art.mjs` (outside their call counts). "keimt!" for a match.
- **Banner library (`core/banners.ts`, `banners.json`, `components/banner.tsx`):** 76 scenes as plain shapes on a 350 × 110
  stage, scaled `max(h/110, w/350)`, anchored bottom center (sides cut), `aria-hidden`; unknown → `herz`. Ideas and deck
  cards store `motif` (the pastel is the scene's `bg`; the old `color` / `illustrations` columns are no longer written).
  Claude picks it in the batch / art call (`motifInstruction()`); empty → `suggestMotif()` (keywords in title and note,
  nothing clear → herz). The editor has a row of small banners ("Bild auf der Karte", ✨ Auto). `/dev/motive` shows
  every idea's banner (stored or suggested), changes one, takes the rest over; `/dev/banner` shows all 76. The
  category view's tiles use it too.
