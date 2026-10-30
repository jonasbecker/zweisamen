# The Beet

Moved verbatim from CLAUDE.md.

- **The Beet (start, Main B – `docs/design/main-b/`):** `src/app/(app)/beet.tsx` – headline per step ("du bist dran.",
  "sam ist dran." – always the same size –, "wartet auf sam." after watering, "date steht." …) at up to 70 px, the time left big on the right (`TimeLeft`, `--accent-time`), the round as its weekdays
  (`WeekBar`: today lit, the bar filled up to today – no deadline marker, it looked like a slider handle), the flower (`components/bloom.tsx`, geometry and mood in `core/bloom.ts`: `bloomGeometry`
  is renderVals() of Bloom.html 1:1, `bloomStimmung` = §3, `bloomLeaves` = the last 5 rounds from `server/plant.ts`)
  with its thought bubble in Caveat (`font-hand`; `components/flower-voice.tsx` – it is also the one reminder hint:
  "mein wecker ist aus – tipp mich an." turns push on, no row of its own), and one action ("Date planen" + the round hand-over button,
  "Anstupsen", "Zusagen"). The pot has no face. All moods side by side: `/dev/blume` (seven: the round's five +
  `genervt` / `autsch` for the date sheet).
  **"date steht."** (`docs/design/garten/date-steht/`, `date-sheet.tsx`, geometry `core/date-sheet.ts`): no "Details ›" – the
  card is a sheet (bottom edge fixed, only its top moves) with three stops (`data-date-sheet`): `zu` (only title and
  when · where – the closed card is as high as that text; the flower fills the room between the text and the card), `mitte` (the reference's open card, the rest cut off with a
  fade; if the browser scrolls it – focus, a link further down – it goes to voll) and `voll` (covers the screen under
  the header, all without scrolling, the handle becomes the header's step bar, the flower flies off the top and comes
  back down with the card). Everything between follows the card's top (`position()` 0…2). One number drives it all: the card's top –
  the finger sets it 1:1 (`follow()`, only below zu it gives way), letting go a spring (`springStep()`, `SPRING`) takes
  it to the stop nearest to where it would be a moment later (`release()` – also after holding still), starting at the
  finger's speed; every frame `paint()` draws card, flower (leaning around its pot with the card's speed, `leaned()`),
  bubbles, dots, handle and details from it straight into the DOM (React only hears the stop). Faster than 0.8 px/ms
  is a "schubs" (the next stop in that direction; zu → mitte: `autsch`, the spring swings past, motion lines), else
  "sanft" (`genervt`). Grabbed while it moves, it stops under the finger (let go: nearest stop). It can be pulled anywhere on the Beet, not only by its head (flower, headline, empty room – up at zu, both ways once it is up; a pull down at zu stays the page refresh, `data-no-pull` while it is up); the listeners sit on the sheet's root and call the newest handlers through a ref, so a re-render mid-gesture cannot drop it. Tap: zu ↔ mitte, voll → mitte ("Weniger
  Details"). Closed, the flower's bubble sits by its head; pulled up, the header's step bar grows into the bubble at
  mitte (`morphAt` / `morphTransform`: the bar's place and size → the bubble's, words fade in at the end) and shrinks
  back into it on the way to voll. Dots come out of the mouth, nothing covers text, card, name or avatars; back gesture closes it. e2e: m25 (both sizes, slow/fast, under the finger, flower in time, held still, caught, anywhere – mouse and touch, voll, back, reduced motion). The old `Plant`
  (components/plant.tsx) is only the small mark (logo, mascot, empty states).
