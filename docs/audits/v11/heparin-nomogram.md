# v11 audit - heparin-nomogram

- Auditor: CG
- Date: 2026-06-06 (spec-v56).
- Citation re-verified against: Raschke RA, et al. Ann Intern Med 1993;119(9):874-881 (weight-based heparin nomogram).

lib/medication-v5.js heparinNomogram() computes the initial bolus/rate by indication (VTE 80 u/kg + 18 u/kg/h; ACS 60 u/kg max 4000 + 12 u/kg/h max 1000) and the Raschke nomogram titration step for the entered aPTT. Weight capped at 150 kg for unit math.

## Boundary examples added
- VTE 80 kg: bolus 6400 u, rate 1440 u/h.
- ACS 120 kg: bolus capped 4000 u, rate capped 1000 u/h.
- aPTT 40 s: rebolus 3200 u, +160 u/h; aPTT >90 s: hold + decrease 240 u/h.

## Cross-implementation differential
- Hand-calc 80x80=6400, 80x18=1440. Sophie matches. PASS.

## Edge-input handling notes
- weightKg min 1 (throws on 0/NaN); aPTT optional (no titration block when blank). Caps surfaced as warn lines, never silent.

## A11y / keyboard notes
- Labeled inputs (label for=), aria-live results, select/checkbox where applicable. test:a11y clean.

## Defects opened

- none

## Status
- PASS
