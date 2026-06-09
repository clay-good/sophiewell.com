# v11 audit - Anticoagulation Reversal Dose (`anticoag-reversal`)

- Auditor: CG
- Date: 2026-06-09
- Citation re-verified against: Frontera JA, et al. Guideline for Reversal of Antithrombotics in Intracranial Hemorrhage (Neurocritical Care Society / SCCM). Neurocrit Care. 2016;24(1):6-46; Kcentra (4F-PCC) US label INR-band dosing; REVERSE-AD (idarucizumab); ANNEXA-4 (andexanet alfa); protamine labeling. spec-v62 §4.1 converts this tile from a static reference table to a weight/INR-driven calculator; it now passes the spec-v29 §3 one-line test.

## Boundary examples added
- warfarin, 80 kg, INR 5 (band 4-6): 4F-PCC 35 units/kg x 80 = 2800 units (max 3500) + Vitamin K 10 mg IV.
- warfarin, 120 kg, INR 8 (band >6): dosing weight capped at 100 kg, 50 units/kg x 100 = 5000 units (label max 5000) -> `capped` flag set.
- dabigatran: idarucizumab fixed 5 g; UFH protamine 4000 units / 100 = 40 mg (max 50 mg); unknown agent -> null (guidance note).

## Cross-implementation differential
- Reference: Kcentra US label INR-band table (2-<4 = 25 u/kg max 2500; 4-6 = 35 u/kg max 3500; >6 = 50 u/kg max 5000; dosing weight capped at 100 kg) and protamine 1 mg/100 units (max 50 mg). 80 kg x 35 = 2800; 6000 units / 100 = 60 -> capped 50 mg. Sophie matches exactly. Delta 0%. PASS.

## Edge-input handling notes
- `weightKg` bounded `[0.3, 500]`, `inr` `[0, 30]`; out-of-range throws RangeError, non-finite throws TypeError, both caught by `safe()`. INR <2 returns a non-numeric note (band not defined by the label). Unrecognized agent returns null -> guidance note (no NaN). The "planning estimate, not an order; reversal decisions belong to the treating team and pharmacy" notice renders above the result. PASS.

## A11y / keyboard notes
- One labeled agent `<select>` plus three labeled numeric inputs, `aria-live="polite"` output; Tab order = source order. `npm run test:a11y` clean. PASS.

## Defects opened
- none

## Status
- PASS
