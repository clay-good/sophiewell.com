# spec-v1408 — one field, one range, and the range a model was fitted on

`test/integration/two-ranges-one-field.spec.js` (spec-v1208) reads the two sentences a page can
print about one field: the browser's warning, built from the input's own `min`/`max`, and the
envelope sentence from `lib/bounds.js`. It was at zero. The envelope waves
([spec-v1404](spec-v1404.md)–[spec-v1406](spec-v1406.md)) put it at **14 rows**, because a field
that never refused never had a second sentence to disagree with.

## The clamp behind three of them

Chasing the rows found something worse than a wording mismatch. SCORE2 is fitted on ages 40 to 69
and **clamped** anything outside that range into it, then answered:

> SCORE2 (low-risk region): 10-year CVD risk 7.6% — high category.

for a 95-year-old, computed from a 69-year-old's coefficients. Framingham did the same above 74.
This is [spec-v1224](spec-v1224.md)'s finding — "a clamp standing in for a guard" — which that wave
fixed for systolic pressure and not for age. Both now refuse, naming the range and saying the model
is not extrapolated. The ranges are the ones each tile already states from its own source (SCORE2's
note: *"ages 40-69"*; Framingham's: *"ages 30-74"*), exported as `SCORE2_AGES` and
`FRAMINGHAM_AGES` and read by the view that draws the field, so the page and the library cannot
drift apart.

## The other rows

Eight fields published a range narrower than the envelope with nothing behind it (age 0–120 against
0–130, Katch-McArdle's weight 0–400 against 0.3–500, SAPS II's BUN floor 0 against 1). Under
[spec-v1198](spec-v1198.md)'s rule — a view's ceilings *are* `lib/bounds.js`'s — the view moves.

Four are left standing and recorded here rather than guessed at: `score2-op` (70–100), `mesa-chd`
(45–85), `reynolds-risk` (30–100), and `pospom` (18 and up) publish a cohort age range on the field
that no source in this repo states. Each needs its derivation paper read before the library can
enforce it; until then the field keeps the narrower hint and the library refuses on the physiologic
envelope only.

One ordering detail matters for the two that *are* enforced: the fitted-range check runs **before**
the envelope check. Any age outside the envelope is also outside the fitted range, so the stricter,
better-sourced sentence is the one the reader gets, and the field never prints two ranges.
