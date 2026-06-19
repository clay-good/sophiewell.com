# v12 audit - elapss

- Auditor: CG
- Date: 2026-06-19
- Citation re-verified against: Backes D, Rinkel GJE, Greving JP, et al. ELAPSS score for prediction of risk of growth of unruptured intracranial aneurysms. Neurology. 2017;88(17):1600-1606 (re-fetched; the point table read from the J Stroke 2019 external-validation paper's verbatim "reprinted with permission from Neurology" reproduction, cross-checked with the SVIN review reproducing Backes Table 3 and PMC corroboration).

`lib/neuro-v118.js elapss()` sums Earlier SAH (no +1, yes 0), Location
(ICA/ACA/ACOM 0, MCA +3, PCOM/posterior +5), Age (<= 60 = 0, then +1 per 5-year
band up to +8), Population (NA/China/Europe 0, Japan +1, Finland +7), Size
(1.0-2.9 mm 0, 3.0-4.9 +4, 5.0-6.9 +10, 7.0-9.9 +13, >= 10 +22), and Shape
(regular 0, irregular +4), then maps the total to the published 3- and 5-year
cumulative growth risk. Class A (fixed point weights; journal+author citation,
no ISSUER_PATTERN trip -- no docs/citation-staleness.md row).

## Boundary worked examples added
- missing age/size -> complete-the-fields fallback.
- lowest-risk profile -> 0/40, ~5.0%/8.4%.
- no earlier SAH adds +1 (the inverted direction).
- age banding 60 -> 0, 61 -> +1, 66 -> +2, 96 -> +8 (capped).
- size banding 3 -> +4, 5 -> +10, 7 -> +13, 10 -> +22.
- high-risk band-flip -> clamped to 40/40, ~42.7%/60.8%.
- an intermediate total lands in the right band (10-14 -> 11.7%/19.3%).

## Cross-implementation differential
- Reference: the earlier-SAH direction is intentionally inverted (No = +1 -- a
  prior treated SAH associates with LOWER growth risk of the remaining
  aneurysm), age is banded by 5-year steps (NOT decades), and size tops out at a
  single >= 10 mm = +22 band (no 10-19.9 / >= 20 split). The literal row maxima
  sum to 47 but every source states the score range as 0-40, so the total is
  clamped to the published 40 ceiling; the risk lookup tops at >= 25 so the clamp
  never changes the clinical band. The 3-/5-year risk lookup endpoints (< 5 ->
  5.0%/8.4%, >= 25 -> 42.7%/60.8%) are multiply confirmed; the four middle rows
  are single-sourced from a verbatim reproduction of Backes Table 3, documented
  in the module header. Match. PASS.

## Edge-input handling notes
- Age and size require non-negative numbers (else a complete-the-fields / reject
  fallback); the total is clamped 0-40. A scalar / non-object fuzz arg yields the
  invalid-input fallback, never a NaN.

## A11y / keyboard notes
- Two labeled number inputs, three labeled selects, one labeled checkbox; output
  aria-live="polite". 320px sweep, no hscroll.

## Defects opened
- none

## Status
- PASS
