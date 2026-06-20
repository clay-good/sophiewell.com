# v12 audit - dipss-plus-mf

- Auditor: CG
- Date: 2026-06-20
- Citation re-verified against: Gangat N, Caramazza D, Vaidya R, et al. DIPSS Plus: a refined Dynamic International Prognostic Scoring System for primary myelofibrosis. J Clin Oncol. 2011;29(4):392-397.

`lib/onc-v134.js dipssPlusMf()` returns the DIPSS-Plus total (0-6) and risk group, carrying the DIPSS group forward. Class A (fixed derivation paper; journal+author citation - no docs/citation-staleness.md row).

## Source-governance / weight note
- DIPSS group carried forward: int-1 = 1, int-2 = 2, high = 3 (low = 0). Then platelet < 100 x10^9/L = 1, red-cell transfusion need = 1, unfavorable karyotype = 1.
- Total 0-6 -> low (0) / int-1 (1) / int-2 (2-3) / high (4-6). Median survival 15.4 / 6.5 / 2.9 / 1.3 years.
- DIPSS-Plus consumes the clinician-selected DIPSS group (it does not recompute DIPSS); the dipss-mf tile computes that group.

## Boundary worked examples added
- DIPSS low + nothing -> 0 (Low); the 0/1/2/3 group carry-forward points; the int-1 (1) / int-2 (2-3) / high (4) boundaries; the strict platelet < 100 edge; a high group + all features -> 6 maximum.

## Edge-input handling notes
- An unselected DIPSS group or any blank flag surfaces valid:false. Joined the spec-v59 fuzz harness (zero non-finite leaks).

## A11y / keyboard notes
- One labeled DIPSS-group select + one labeled number input + two labeled yes/no selects; output aria-live="polite". 320px sweep, no hscroll; renders the clinical-posture note.

## Defects opened
- none
