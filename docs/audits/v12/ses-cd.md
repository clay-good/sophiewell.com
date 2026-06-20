# v12 audit - ses-cd

- Auditor: CG
- Date: 2026-06-20
- Citation re-verified against: Daperno M, D'Haens G, Van Assche G, et al. Gastrointest Endosc. 2004;60(4):505-512 (re-fetched; the 56-vs-60 maximum resolved via Vuitton/PMC4898086, which states the stenosis sub-total is 0-11 yielding a 0-56 total).

`lib/gi-v126.js sesCd()` sums four variables (ulcer size, ulcerated surface, affected
surface, stenosis), each 0-3 across 5 segments. The stenosis sub-total is CAPPED at 11
(a non-passable stenosis ends the exam), so the maximum total is 56, not 60. Bands 0-2
/ 3-6 / 7-15 / > 15. Class A (journal+author citation, no ISSUER_PATTERN trip -- no
docs/citation-staleness.md row).

## Boundary worked examples added
- worked example -> 12, moderate.
- stenosis sub-total capped at 11 (5x3=15 -> 11).
- true maximum 56 (all variables at 3 across all segments).
- remission band 0-2.
- scalar / empty fuzz arg -> 0.

## Cross-implementation differential
- Reference: SOURCE GOVERNANCE -- the true maximum is 56 (stenosis capped at 11), NOT
  the naive 60 that ECCO's own widget and some tables show; the cap is implemented as
  min(sum-of-stenosis, 11). Bands are a later consensus addition (documented). Match.
  PASS.

## Edge-input handling notes
- 20 segment selects assembled into four arrays; each value clamped 0-3; stenosis
  sub-total capped at 11. A scalar/empty fuzz arg -> 0.

## A11y / keyboard notes
- 20 labeled selects; output aria-live="polite". 320px sweep, no hscroll.

## Defects opened
- none
