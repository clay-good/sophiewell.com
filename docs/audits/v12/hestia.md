# v12 audit - hestia

- Auditor: CG
- Date: 2026-06-18
- Citation re-verified against: Zondag W, Mos ICM, Creemers-Schild D, et al. J Thromb Haemost. 2011;9(8):1500-1507.

`lib/vte-v106.js hestia()` evaluates the 11 yes/no exclusion items; any single
positive item means the patient is not a home-treatment candidate, all-negative is
eligible per the rule. Class A.

## Boundary worked examples added
- all 11 negative -> eligible.
- band flip: one positive item (pregnancy) flips eligible -> ineligible.
- multiple positives -> plural grammar ("criteria") and the full flagged list.
- any single exclusion (hemodynamic instability, PE on anticoagulation) gates
  eligibility.

## Cross-implementation differential
- Reference: the 11-item canonical Hestia checklist per MDCalc, cross-checked against
  the Zondag 2011 study and the ACC/HOME-PE summary. Renal (CrCl < 30) and severe
  liver impairment are distinct items; pregnancy and HIT history are distinct items
  (some condensed summaries collapse to 9 -- we keep the canonical 11). Match. PASS.

## Edge-input handling notes
- the grammar is "criterion" for one positive and "criteria" for more than one.

## A11y / keyboard notes
- 11 labeled checkboxes; output aria-live="polite". 320px sweep passes with no
  horizontal scroll. A triage checklist, not a disposition order.

## Defects opened
- none

## Status
- PASS
