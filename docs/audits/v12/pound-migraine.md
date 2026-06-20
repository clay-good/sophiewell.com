# v12 audit - pound-migraine

- Auditor: CG
- Date: 2026-06-19
- Citation re-verified against: Detsky ME, McDonald DR, Baerlocher MO, Tomlinson GA, McCrory DC, Booth CM. Does this patient with headache have a migraine or need neuroimaging? JAMA. 2006;296(10):1274-1283 (re-fetched; the JAMA abstract plus AAFP/GrepMed reproductions cross-read on the likelihood ratios).

`lib/neuro-v120.js poundMigraine()` counts five features -- Pulsatile/throbbing,
hOurs duration (4-72 h), Unilateral, Nausea/vomiting, Disabling -- for a count of
0-5. The published likelihood ratios for definite or possible migraine are ~24
(>= 4 features), ~3.5 (exactly 3), and ~0.41 (<= 2). Class A (fixed mnemonic).

## Boundary worked examples added
- no features -> 0/5, unlikely (LR ~0.41).
- two features -> 2/5, still the <= 2 unlikely band.
- exactly three -> 3/5, intermediate (LR ~3.5).
- four features -> 4/5, migraine likely (LR ~24).
- all five -> 5/5 (max).
- scalar fuzz arg -> valid 0/5, never NaN.

## Cross-implementation differential
- Reference: LR 24 / 3.5 / 0.41 verbatim from the JAMA abstract. A secondary
  source drifted the N feature toward ICHD phrasing and labeled features
  "mandatory"; that is NOT the POUND/JAMA definition, so the tile uses "nausea or
  vomiting" with a plain additive count. Match. PASS.

## Edge-input handling notes
- Five booleans; count clamped 0-5. A scalar fuzz arg yields a valid 0/5, never
  NaN.

## A11y / keyboard notes
- Five labeled checkboxes; output aria-live="polite". 320px sweep, no hscroll.

## Defects opened
- none

## Status
- PASS
