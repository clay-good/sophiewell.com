# v11 audit - acid-base-deficit

- Auditor: CG
- Date: 2026-06-06 (spec-v55)
- Citation re-verified against: Adrogue HJ, Madias NE. NEJM. 2000;342(20):1493-1499 (sodium). HCO3 deficit = 0.5 x weight x (target - measured HCO3); Na deficit = TBW x (target - measured Na), TBW = weight x (0.6 male / 0.5 female).

`lib/clinical-v6.js acidBaseDeficit()` returns TBW, the bicarbonate deficit, and the sodium deficit, labeled as deficit *estimates* (not infusion rates; the corrected-sodium / Adrogue-Madias rate planner owns rate). Fires an over-rapid-correction warning when correcting a hyponatremic patient by >8 mEq/L.

## Boundary examples added
- male: wt 70, HCO3 14->24, Na 120->135 -> TBW 42, HCO3 deficit 350, Na deficit 630, warn.
- female: wt 60, HCO3 18->24, Na 125->135 -> TBW 30, HCO3 deficit 180, Na deficit 300.
- no warn: wt 80 M, Na 138->140 (delta 2, not hyponatremic) -> warn null.

## Cross-implementation differential
- Hand-calc HCO3 deficit 0.5*70*(24-14) = 350; Na deficit 42*(135-120) = 630. Sophie 350 / 630. PASS.

## Edge-input handling notes
- weight/HCO3/Na validated in physiologic ranges; deficits are signed (negative if measured > target).

## A11y / keyboard notes
- One select + five labeled inputs, aria-live results. test:a11y clean.

## Defects opened

- none

## Status
- PASS
