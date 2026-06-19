# v12 audit - snakebite-severity

- Auditor: CG
- Date: 2026-06-19
- Citation re-verified against: Dart RC, Hurlbut KM, Garcia R, Boren J. Ann Emerg Med. 1996;27(3):321-326 (re-fetched, anchors cross-read with the verbatim Dart-1996-sourced scoring sheet).

`lib/enviro-v111.js snakebiteSeverity()` sums six body-system subscores --
pulmonary (0-3), cardiovascular (0-3), local wound (0-4), gastrointestinal (0-3),
hematologic (0-4), CNS (0-3) -- to a total of 0-20, each subscore clamped to its
published maximum. Class A.

## Boundary worked examples added
- sums the six subscores (3+3+4+2+1+1 = 14 of 20).
- band flip: total crossing 14 enters the relative severe tier (12 vs 14).
- each subscore clamps to its published maximum; the max total is 20 (local wound
  and hematologic cap at 4; the other four at 3).
- total 0 reports no envenomation findings.

## Cross-implementation differential
- Reference: the six-system structure and the per-system maxes (sum = 20)
  cross-verified against the primary paper and the verbatim scoring sheet.
- SOURCE-GOVERNANCE: Dart 1996 validated the SSS as a CONTINUOUS severity index
  and does NOT define minimal/moderate/severe total-score cutoffs. The 0-3 / 4-7 /
  >=8 cutoffs circulated online belong to a different modified 7-system (max 23)
  instrument and were deliberately NOT adopted. The tile reports the continuous
  total and labels its descriptor as a relative reading of the 0-20 range, not a
  Dart-defined threshold. PASS.

## Edge-input handling notes
- a severity / trend index carrying the spec-v50 §3 posture note; a blank input
  returns a complete-the-fields fallback. Subscores clamp rather than throw on
  out-of-range entries.

## A11y / keyboard notes
- Six labeled bounded selects (0-3 / 0-4); output aria-live="polite". 320px
  sweep, no hscroll.

## Defects opened
- none

## Status
- PASS
