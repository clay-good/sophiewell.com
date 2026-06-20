# v12 audit - bfcrs

- Auditor: CG
- Date: 2026-06-20
- Citation re-verified against: Bush G, Fink M, Petrides G, Dowling F, Francis A. Catatonia. I. Rating scale and standardized examination. Acta Psychiatr Scand. 1996;93(2):129-136 (re-fetched; the verbatim 23-item scale and the 14-item screen divider cross-read from the University of Washington PCL reproduction and the URMC / PMC8607401 sources).

`lib/psych-v123.js bfcrs()` scores the 23-item severity scale (each 0-3, six items --
12, 17-21 -- published 0/3 only), maximum 69, and counts the first 14 items as the
Bush-Francis Catatonia Screening Instrument; 2 or more positive screen items suggest
catatonia. Class A (fixed ordinal scale; journal+author citation, no ISSUER_PATTERN
trip -- no docs/citation-staleness.md row).

## Boundary worked examples added
- no signs -> 0 screen / 0 severity, below threshold.
- one screen item present -> 1/14, below the >= 2 screen threshold.
- >= 2 screen items -> catatonia suggested; severity total reported.
- severity-only items (15-23) do not count toward the 14-item screen.
- all 23 items at max -> severity 69/69.
- scalar fuzz arg -> valid 0s, never NaN.

## Cross-implementation differential
- Reference: SOURCE-ORDER CORRECTION captured -- Immobility/stupor is item 1 and
  Excitement is item 14 (the last screen item), not the reverse; the six 0/3-binary
  items are 12, 17, 18, 19, 20, 21 (verbatim from the UW PDF; the URMC paraphrase that
  listed 13 instead of 12 is a renumbering artifact and is NOT followed). Screen counts
  the first 14 items present (>0); severity sums all 23. Match. PASS.

## Edge-input handling notes
- 23 selects (six rendered 0/3, seventeen 0-3); severity clamped 0-69; screen counts
  the first 14 with a positive value. A scalar fuzz arg yields valid 0s, never NaN.

## A11y / keyboard notes
- 23 labeled selects; output aria-live="polite". 320px sweep, no hscroll.

## Defects opened
- none
