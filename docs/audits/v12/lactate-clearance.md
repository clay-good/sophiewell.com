# v12 audit - lactate-clearance

- Auditor: CG
- Date: 2026-06-19
- Citation re-verified against: Nguyen HB, Rivers EP, Knoblich BP, Jacobsen G, Muzzin A, Ressler JA, Tomlanovich MC. Crit Care Med. 2004;32(8):1637-1642.

`lib/critcare-v112.js lactateClearance()` computes (initial - repeat) / initial
x 100. A clearance of >= 10% over the early hours is the cited favorable range; a
negative value means the lactate rose. Class A.

## Boundary worked examples added
- 4.0 -> 2.0 mmol/L is 50% clearance, favorable.
- a clearance just under 10% (8%) is below the favorable range.
- a rising lactate (2.0 -> 3.0) yields a correctly-signed -50%, flagged in words.
- division by zero is guarded: an initial of 0 returns a fallback, never NaN or
  Infinity.
- partial input -> complete-the-fields fallback.

## Cross-implementation differential
- Reference: the percentage-fall arithmetic and the >= 10% favorable endpoint are
  the Nguyen 2004 early-goal-directed definition. Match. PASS.

## Edge-input handling notes
- the denominator guard requires initial > 0 before dividing; a repeat above the
  initial is reported as a correctly-signed negative clearance, not clamped.

## A11y / keyboard notes
- Three labeled number inputs (initial, repeat, optional interval); output
  aria-live="polite". 320px sweep, no hscroll.

## Defects opened
- none

## Status
- PASS
