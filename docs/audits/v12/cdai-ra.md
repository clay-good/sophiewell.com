# v12 audit - cdai-ra

- Auditor: CG
- Date: 2026-06-24
- Citation re-verified against: Aletaha D, Nell VPK, Stamm T, et al. Acute phase reactants add little to composite disease activity indices for rheumatoid arthritis. Arthritis Res Ther. 2005;7(4):R796-R806 (cross-verified against MDCalc and the openaccessjournals CDAI review and clinicaltoolslibrary).

`lib/rheum-v147.js cdaiRa()` consumes the swollen-joint count, tender-joint count,
patient global, and physician global and computes the lab-free total 0-76 with the
published activity band. Class A.

## Source-governance notes
- CDAI = SJC28 + TJC28 + patient global (0-10 cm) + physician global (0-10 cm),
  a plain linear sum with no acute-phase reactant. Total 0-76.
- Bands: remission <= 2.8, low <= 10, moderate <= 22, high > 22 (lower band edges
  are strict >). Cutoffs identical across sources.
- A blank required input renders the complete-the-fields fallback, never a partial
  total scored as if a missing input were zero.

## Boundary worked examples added
- 2.8 remission / 2.9 low; 10 low / 10.1 moderate; 22 moderate / 22.1 high.
- tile example 6+8+3+2 = 19 -> moderate; ceiling 76.

## Edge-input handling notes
- Four required numerics via num() bounds; non-finite throws TypeError caught by
  the renderer safe(). Covered by the spec-v59 fuzz harness, zero leaks.

## A11y / keyboard notes
- Four labeled number inputs (inputmode numeric/decimal); output aria-live.
  320px sweep, no hscroll.

## Defects opened
- none
