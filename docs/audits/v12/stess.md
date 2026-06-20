# v12 audit - stess

- Auditor: CG
- Date: 2026-06-19
- Citation re-verified against: Rossetti AO, Logroscino G, Bromfield EB. A clinical score for prognosis of status epilepticus in adults. J Neurol. 2008;255(10):1561-1566 (re-fetched; the derivation paper plus the BMC Neurology / Seizure validation cohorts cross-read).

`lib/neuro-v120.js stess()` sums four items: level of consciousness (alert or
somnolent/confused 0, stuporous or comatose 1), worst seizure type (simple or
complex partial, absence, or myoclonic 0; generalized convulsive 1; nonconvulsive
SE in coma 2), age (under 65 yr 0, 65 or older 2), and history of prior seizures
(yes 0; no or unknown 1), for a total of 0-6. The validated dichotomy is >= 3 =
unfavorable. Class A (fixed point weights; journal+author citation, no
ISSUER_PATTERN trip -- no docs/citation-staleness.md row).

## Boundary worked examples added
- all 0-point levels -> 0/6, favorable.
- comatose + generalized convulsive -> 2/6, below the >= 3 flip.
- comatose + NCSE in coma -> 3/6, crosses the unfavorable threshold.
- age >= 65 alone -> 2/6, then no-prior crosses to 3/6.
- every item at maximum -> 6/6.
- scalar fuzz arg -> valid 0/6, never NaN.

## Cross-implementation differential
- Reference: the point weights are unanimous across the derivation and the
  validation reproductions. The original paper publishes NO per-score mortality
  table -- its strength is the negative predictive value (~0.97) at the 0-2 / >= 3
  split (sensitivity ~0.94, specificity ~0.60), so the tile frames the favorable /
  unfavorable dichotomy and the NPV and invents no per-band mortality percentage.
  Match. PASS.

## Edge-input handling notes
- Two selects (clamped 0-1 and 0-2) and two booleans; total clamped 0-6. A scalar
  fuzz arg yields a valid 0/6, never NaN.

## A11y / keyboard notes
- Two labeled selects, two labeled checkboxes; output aria-live="polite". 320px
  sweep, no hscroll.

## Defects opened
- none

## Status
- PASS
