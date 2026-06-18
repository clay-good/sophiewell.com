# v12 audit - macocha

- Auditor: CG
- Date: 2026-06-18
- Citation re-verified against: De Jong A, Molinari N, Terzi N, et al. Am J Respir Crit Care Med. 2013;187(8):832-839.

`lib/eddecision-v107.js macocha()` sums the 7 weighted factors (Mallampati III/IV +5,
OSA +2, reduced cervical mobility +1, mouth opening < 3 cm +1, coma +1, severe
hypoxemia +1, non-anesthesiologist +1) to a total clamped 0-12 and flags elevated
difficult-intubation risk at >= 3. Class A.

## Boundary worked examples added
- no factors -> 0, lower risk.
- band flip: total 2 (lower) -> 3 (elevated) on adding reduced cervical mobility.
- Mallampati III/IV alone (5) -> elevated.
- tile example: Mallampati + OSA -> 7, elevated.
- all factors clamp to the published 0-12 maximum.

## Cross-implementation differential
- Reference: the 7 point weights and the 0-12 range cross-verified against MDCalc,
  the AJRCCM full text, and the Critical Care (BMC) commentary -- all identical.
  The >= 3 threshold (sensitivity 73%, NPV 98% in validation) comes from the
  original paper/validation, not MDCalc's UI text, which only says risk rises with
  the score. We implement >= 3 as the elevated-risk flag. Match. PASS.

## Edge-input handling notes
- the score's strength is its high NPV (rule-out value); the note states the airway
  decision stays with the clinician.

## A11y / keyboard notes
- Labeled checkboxes; output aria-live="polite". 320px sweep passes with no
  horizontal scroll.

## Defects opened
- none

## Status
- PASS
