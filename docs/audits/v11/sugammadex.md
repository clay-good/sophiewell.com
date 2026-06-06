# v11 audit - sugammadex

- Auditor: CG
- Date: 2026-06-06 (spec-v56).
- Citation re-verified against: Bridion (sugammadex) U.S. prescribing information (per FDA label).

lib/medication-v5.js sugammadex() returns the dose (mg) by depth of block on ACTUAL body weight and the volume at 100 mg/mL.

## Boundary examples added
- T2, 70 kg: 140 mg (2 mg/kg) = 1.4 mL.
- 1-2 PTC, 80 kg: 320 mg = 3.2 mL.
- immediate, 70 kg: 1120 mg = 11.2 mL.

## Cross-implementation differential
- Hand-calc 70x2=140, /100 = 1.4 mL. Sophie 1.4. PASS.

## Edge-input handling notes
- depth must be t2/ptc/immediate (throws otherwise); weight bounded. Re-curarization + contraception notes surfaced.

## A11y / keyboard notes
- Labeled inputs (label for=), aria-live results, select/checkbox where applicable. test:a11y clean.

## Defects opened

- none

## Status
- PASS
