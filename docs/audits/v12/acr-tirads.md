# v12 audit - acr-tirads

- Auditor: CG
- Date: 2026-06-26
- Citation re-verified against: Tessler FN, Middleton WD, Grant EG, et al. J Am Coll Radiol. 2017;14(5):587-595 (point table, TR bands, and FNA/follow size rules cross-verified against the Radiology Assistant TI-RADS guide and the RSNA User’s Guide; ≥ 2 sources, spec-v97).

`lib/radiology-v165.js acrTirads()` computes the ACR TI-RADS. Group G, Class A.

## Source-governance notes
- composition 0–2 + echogenicity 0–3 + shape 0/3 + margin 0/2/3 + echogenic foci (ADDITIVE: macro 1, rim 2, punctate 3).
- Total → TR1 0, TR2 1–2, TR3 3, TR4 4–6, TR5 ≥7; FNA/follow by diameter TR3 ≥2.5/≥1.5, TR4 ≥1.5/≥1.0, TR5 ≥1.0/≥0.5 cm.
- Echogenic foci are summed (not max) — confirmed; solid composition = 2 points (one source mis-reported 0).

## Boundary worked examples added
- solid+very-hypo+punctate (8 pts) → TR5, diameter 1.5 cm → FNA; foci additive (macro+rim+punctate = 6); TR1 benign; missing category → valid:false.

## Edge-input handling notes
- every categorical select required; diameter optional (size rule only applies when present); every combination resolves to one TR level. Blank/non-finite inputs surface a complete-the-fields fallback; covered by the spec-v59 fuzz harness with zero non-finite leaks.

## A11y / keyboard notes
- Four selects + three checkboxes + one number input, each labelled; output aria-live. 320px sweep, no horizontal scroll.

## Defects opened
- none

## Status
- PASS
