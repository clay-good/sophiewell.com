# v12 audit - ces-d

- Auditor: CG
- Date: 2026-06-20
- Citation re-verified against: Radloff LS. The CES-D Scale: a self-report depression scale for research in the general population. Appl Psychol Meas. 1977;1(3):385-401 (re-fetched; the 20 verbatim item stems, the reverse-scoring key, and the >= 16 cutoff cross-read from the AHRQ Academy and NIDA federal reproductions).

`lib/psych-v123.js cesD()` sums the 20 items (each 0-3 over the past week), total
0-60, with the four positively-worded items (4, 8, 12, 16) reverse-scored (3-value)
per the published key; a total of 16 or more commonly flags clinically significant
depressive symptoms. PROVENANCE: a NIMH public-domain instrument, free to reproduce
interactively (spec-v100 §8 cleared). Class A (fixed ordinal scale; journal+author
citation, no ISSUER_PATTERN trip -- no docs/citation-staleness.md row).

## Boundary worked examples added
- all items explicitly 0 -> the four positive items reverse to 3 each = 12 (genuine
  CES-D behavior, not a bug: answering "rarely happy/hopeful/good/enjoyed life" scores).
- reverse-scoring key: the positive items at "most of the time" (3) -> 0 points each.
- negative items raise the score across the >= 16 band-flip (baseline 12 + 4 = 16).
- worked depressed profile -> 24/60.
- maximum: all negative items 3 with positive items 0 -> 60/60.
- scalar fuzz arg -> valid finite total, never NaN.

## Cross-implementation differential
- Reference: the reverse-scored items (4, 8, 12, 16) and the >= 16 cutoff match the
  AHRQ/NIDA reproductions. GOVERNANCE: the adult CES-D >= 16 cutoff and the
  frequency-of-days response labels are used -- NOT the child CES-DC's >= 15 cutoff or
  its different labels (a documented Wikipedia conflation, deliberately avoided). The
  all-zero default scoring 12 is correct instrument behavior (reverse items). Match. PASS.

## Edge-input handling notes
- 20 selects (0-3); total clamped 0-60 with the reverse key applied in-compute. A
  scalar fuzz arg yields a valid finite total, never NaN.

## A11y / keyboard notes
- 20 labeled selects; output aria-live="polite". 320px sweep, no hscroll.

## Defects opened
- none
