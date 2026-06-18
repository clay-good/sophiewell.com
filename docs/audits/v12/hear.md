# v12 audit - hear

- Auditor: CG
- Date: 2026-06-18
- Citation re-verified against: Moumneh T, Sun BC, Baecker A, et al. Eur J Emerg Med. 2021;28(4):292-298 (HEART subset, Six 2008).

`lib/eddecision-v107.js hear()` sums the four HEART domains minus troponin --
History, ECG, Age, Risk factors, each 0/1/2 -- to a total clamped 0-8 and flags
the very-low-risk band (HEAR <= 1). Class A.

## Boundary worked examples added
- all-zero domains -> 0, very low risk.
- band flip: HEAR 1 (very low) -> 2 (not very low) on adding a non-specific ECG.
- tile example: moderate history + non-specific ECG + age 58 + 1-2 RF -> 4.
- all-max domains clamp to 8.
- missing age -> complete-the-fields fallback.
- unknown select keys default to the 0 option.

## Cross-implementation differential
- Reference: domains/points cross-verified against MDCalc's HEART calculator (the
  HEAR domains are identical) and the Moumneh 2021 validation. The very-low-risk
  rule-out cutoff is HEAR < 2 (i.e. 0 or 1), ~0.4% 30-day MACE; not the ad hoc
  "<= 2 + one troponin" pathway (Mahler), which is a different rule. We implement
  HEAR <= 1. Match. PASS.

## Edge-input handling notes
- atherosclerotic disease auto-scores the full 2 in the risk-factor domain (the OR
  branch); the r2 option text states this.

## A11y / keyboard notes
- Labeled selects + one number field; output aria-live="polite". 320px sweep
  passes with no horizontal scroll. A pre-troponin gate, not an ACS rule-out.

## Defects opened
- none

## Status
- PASS
