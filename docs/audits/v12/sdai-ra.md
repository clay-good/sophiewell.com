# v12 audit - sdai-ra

- Auditor: CG
- Date: 2026-06-24
- Citation re-verified against: Smolen JS, Breedveld FC, Schiff MH, et al. A simplified disease activity index for rheumatoid arthritis for use in clinical practice. Rheumatology (Oxford). 2003;42(2):244-257 (cross-verified against MDCalc, clinicaltoolslibrary, and the openaccessjournals review).

`lib/rheum-v147.js sdaiRa()` consumes the CDAI inputs plus CRP in mg/dL and computes
the total 0-86 with the published activity band. Class A.

## Source-governance notes
- SDAI = SJC28 + TJC28 + patient global + physician global + CRP (mg/dL). Total 0-86.
- Bands: remission <= 3.3, low <= 11, moderate <= 26, high > 26.
- CRP UNIT TRAP: the addend is mg/dL, not mg/L (a lab value in mg/L is ten times
  larger). The renderer labels mg/dL and the compute guards CRP finite/non-negative.
- A blank required input (including CRP) renders the complete-the-fields fallback.

## Boundary worked examples added
- 3.3 remission / 3.4 low; 11 low / 11.1 moderate; 26 moderate / 26.1 high.
- tile example 6+8+3+2+1.5 = 20.5 -> moderate; zero CRP equals the CDAI sum.

## Edge-input handling notes
- Five required numerics via num() bounds (CRP capped 0-50). Non-finite throws
  TypeError caught by safe(). Covered by the spec-v59 fuzz harness, zero leaks.

## A11y / keyboard notes
- Five labeled number inputs; output aria-live. 320px sweep, no hscroll.

## Defects opened
- none
