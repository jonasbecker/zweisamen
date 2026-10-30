# Archiv "unser beet."

Moved verbatim from CLAUDE.md.

- **Archiv "unser beet." (`docs/design/garten/archiv/`):** `/dates` – every date a leaf, every round that fell through a
  wilted one (`cycles` skipped, with its called-off date), newest on top, Nº from the oldest (`core/archive.ts`,
  `server/archive.ts`): Stiel (Archiv.html's geometry 1:1 – month marks on the stem, the bud for the next date, leaves
  left/right, `stemLayout`) or Raster by month; the toggle switches at once and is remembered (cookie `dom-archiv`,
  `?ansicht=` wins). "♥ n× nochmal" = both said unbedingt (what the viewer may see). A leaf is the first photo (thumb)
  or the idea's banner. `/dates/<id>` (done date) is the leaf (variante A, `leaf-detail.tsx`): the photo big
  (scroll-snap, dots, "1 / n"), the small ones + "+", both "nochmal?" and notes (the other one's only after your own),
  "Nochmal pflanzen" (the idea back on the wishlist or made from the date → `/plan?idea=`) and "Teilen" (Web Share,
  the photo where the phone can). `/dates/<id>/wie-wars`: photos, nö / vielleicht / unbedingt as plant tiles, the
  flower reacting (`againReaction`), a sentence (≤ 120), the real cost for the budget, "Blatt anheften" once there is an
  answer → the leaf. It opens by itself once per date and phone when the Beet comes up with the app
  (`open-review-once.tsx` – not after an action on the Beet); the Beet keeps the hint. Hearts are gone from new reviews
  (`date_reviews.rating` nullable, old ones stay for the story). `/dates/runde/<id>`: "fiel aus.", reason chips +
  note (`cycles.wilt_reason` / `wilt_note`), "Neuen Termin finden", "Zurück ins Regal legen", "Blatt entfernen" (after
  a question, `leaf_removed_at`). No tab bar on `/dates/<anything>` (`bottom-nav.tsx`). Photos: ≤ 10 per date, long edge
  2000, thumbs 480 (`PHOTO_LIMITS`, shrunk in the browser – `dates/photo-upload.tsx`). e2e: m33 (both sizes, long title,
  0 / 10 photos, a month with one leaf, wilted, once through: date ends → wie war's → stem → leaf), m8.
