# v11 audit - Burn Surface Area Calculator (`bsa_burn`)

- Auditor: CG
- Date: 2026-05-18
- Citation re-verified against: Lund CC, Browder NC. The estimation of areas of burns. Surg Gynecol Obstet. 1944;79:352-358 (Lund-Browder chart). Rule of Nines (standard adult body-region distribution): head 9%, each arm 9%, each leg 18%, anterior trunk 18%, posterior trunk 18%, perineum 1% (totals 100%).

## Boundary examples added
`ruleOfNines(selected)` and `lundBrowder(percents)` in [lib/field.js:151](../../../lib/field.js#L151).
- low (no regions selected): TBSA 0%. PASS.
- META example (anterior trunk only): 18%. PASS (matches META expected).
- mid (head + one arm): 9 + 9 = 18%. PASS.
- high (all regions): 9+9+9+18+18+18+18+1 = 100% (cap-bound at 100). PASS.
- both legs + perineum: 18+18+1 = 37%. PASS.
- Lund-Browder mid: head 7% + thigh-left 4.5% + thigh-right 4.5% = 16% (audit confirms summation only; the chart's age-adjusted regional percentages are the caller's responsibility per the renderer's "age-adjust per chart" label). PASS.

## Cross-implementation differential
- Reference implementation: Rule-of-Nines table from current ATLS Student Manual (10th ed.).
- Test case: META example.
- Sophie result: 18%.
- Reference result: anterior trunk = 18% per Rule of Nines.
- Delta: 0%. PASS.

## Edge-input handling notes
- Rule of Nines totals are clamped to <= 100% (defensive, since the standard adult distribution already sums to 100).
- Lund-Browder percent inputs are silently coerced to 0 if non-numeric; renderer requires the user to type per-region percents per the age-adjusted chart, with an explicit "% affected; age-adjust per chart" label on each input.
- Method selector defaults to Rule of Nines; switching to Lund-Browder rebuilds the dynamic input region cleanly.
- Citation passes spec-v11 §3.5 no-bare-URL guard.

## A11y / keyboard notes
- Method select + labelled checkboxes (nines) or labelled number fields (lund); output is class="notice", `aria-live="polite"`. `npm run test:a11y` clean.

## Defects opened
- none

## Status
- PASS
