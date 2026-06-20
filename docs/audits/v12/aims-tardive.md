# v12 audit - aims-tardive

- Auditor: CG
- Date: 2026-06-20
- Citation re-verified against: Guy W. ECDEU Assessment Manual for Psychopharmacology (DHEW Publication No. ADM 76-338), Abnormal Involuntary Movement Scale (AIMS). NIMH; 1976 (re-fetched; the verbatim item list and groupings cross-read from the official AACAP-hosted NIMH form -- whose footer states "available in the public domain" -- and the CamCOPS public-domain documentation).

`lib/psych-v123.js aimsTardive()` sums the seven movement items (facial/oral 1-4,
extremity 5-6, trunk 7), each 0-4, for a movement-severity total 0-28, plus a global
severity 0-4. It flags the commonly cited probable-tardive-dyskinesia threshold
(>= 2 in two or more areas, or >= 3 in one). PROVENANCE: a US-government NIMH/ECDEU
public-domain instrument, free to reproduce interactively (spec-v100 §8 cleared).
Class A (fixed ordinal scale; manual+author citation, no ISSUER_PATTERN trip -- no
docs/citation-staleness.md row).

## Boundary worked examples added
- no movements -> 0/28, below threshold.
- one mild item -> 1/28, below threshold.
- >= 2 in two areas (face + jaw) -> 4/28, meets the probable-TD threshold.
- >= 3 in a single area -> 3/28, meets the threshold.
- all seven items at max -> 28/28.
- scalar fuzz arg -> valid 0/28, never NaN.

## Cross-implementation differential
- Reference: the seven movement items and 0-28 range match the official NIMH/AACAP
  form. GOVERNANCE: the tile reports the "sum of the seven movement items", not "the
  AIMS total" (sources define the total inconsistently as 1-7, 1-10, or no sum); the
  probable-TD threshold is the commonly cited Schooler-Kane research convention, named
  generically. Match. PASS.

## Edge-input handling notes
- Seven movement selects (0-4) plus a global select (0-4); total clamped 0-28. A
  scalar fuzz arg yields a valid 0/28, never NaN.

## A11y / keyboard notes
- Eight labeled selects; output aria-live="polite". 320px sweep, no hscroll.

## Defects opened
- none
