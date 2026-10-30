# Ideen

Moved verbatim from CLAUDE.md.

- **Ideen-Kategorie (`docs/design/garten/ideen-kategorie/`, variante "e"):** `/ideas?ansicht=<kind>` is one component for
  every tile, "alle.", the Matchlinge and "meine likes." (`ideas/category-view.tsx`; words, chips, tip order and groups
  in `core/idea-category.ts`): its own head (back, title – long ones smaller, then an ellipsis –, subtitle, the flower
  with a quip, tap = the next one; the bubble sits beside the flower for a short title on a wide screen, else up next to
  the back button, never on the title), chips with counts (alle · gratis · ein Abend · drinnen · draußen; the view's
  own dimension and empty ones left out), the flower's tip (what fits a free time in the next 7 days first, then what
  the other one liked, never planned / planned longest ago, oldest; "anderer ↻" goes round; "Ins Beet pflanzen" =
  `/plan?idea=…&start=…`, the plan flow picks that time when it is among its own) and the rest in "✓ passt diese
  Woche" / "irgendwann" with like badges (a deck idea: who swiped it; a match: both). The free times come from
  `server/idea-times.ts` (one FreeBusy per person via busy-cache, one slot search per length × ranking, daylight but
  no weather) as a promise the view streams in (`<Suspense>` around tip and list – head and chips do not wait). New
  ideas are added on the shelf (the field), not in a view. e2e: m31 (both sizes, every kind and chip).
- **Ideen (Garten):** the seed shelf (`idea-tiles.tsx`, Matchlinge in pots; "Meine Likes" = `?ansicht=geswipt`
  shows only my likes + matches).
