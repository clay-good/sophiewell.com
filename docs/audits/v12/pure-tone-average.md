# v12 audit - pure-tone-average

- Auditor: CG
- Date: 2026-06-26
- Citation re-verified against: Standard four-frequency pure-tone average (AAO-HNS / ASHA hearing-loss grading; severity bands cross-verified across audiometric references; ≥ 2 sources, spec-v97).

`lib/oneformula-v167.js pureToneAverage()` computes the Pure Tone Average. Group E, Class A.

## Source-governance notes
- 3FA = mean(500,1000,2000 Hz); 4FA adds 4000 Hz; severity normal ≤25, mild 26–40, moderate 41–55, moderately severe 56–70, severe 71–90, profound >90 dB HL.
- Thresholds accept negative values (−10 to 130 dB HL); the 3FA-vs-4FA selection is explicit.
- The headline band uses the 4FA when 4000 Hz is supplied, else the 3FA.

## Boundary worked examples added
- 40/45/50/65 → 4FA 50 (moderate), 3FA 45; 3FA-only when 4000 Hz omitted; band boundaries 25/26/90/91; missing required frequency → valid:false.

## Edge-input handling notes
- 4000 Hz optional; severity bands unit-tested at the boundaries. Blank/non-finite inputs surface a complete-the-fields fallback; covered by the spec-v59 fuzz harness with zero non-finite leaks.

## A11y / keyboard notes
- Four labelled number inputs (4000 Hz optional); output aria-live. 320px sweep, no horizontal scroll.

## Defects opened
- none

## Status
- PASS
