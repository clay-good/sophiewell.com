# v12 audit - vacs-index

- Auditor: CG
- Date: 2026-06-21
- Citation re-verified against: Tate JP, Justice AC, Hughes MD, et al. An internationally generalizable risk index for mortality after one year of antiretroviral therapy. AIDS. 2013;27(4):563-572 (VACS Index 1.0).

`lib/id-v137.js vacsIndex()` returns the 0-164 total and the FIB-4 sub-value. Class A (fixed component points; journal+author citation - no docs/citation-staleness.md row).

## Source-governance / point-table note
- Point table cross-verified across MDCalc (calc 2201), the Justice 2013 CID Table 1, and the PMC4091811 reproduction. Age <50/50-64/>=65 = 0/12/27; CD4 <50/50-99/100-199/200-349/350-499/>=500 = 29/28/10/6/6/0; HIV-1 RNA <500/500-99999/>=100000 = 0/7/14; Hb <10/10-11.9/12-13.9/>=14 = 38/22/10/0; FIB-4 <1.45/1.45-3.25/>3.25 = 0/6/25; eGFR <30/30-44.9/45-59.9/>=60 = 26/8/6/0; HCV +5. Total range 0-164 (verified by summing component maxima: 27+29+14+38+25+26+5 = 164).
- FIB-4 = (age x AST) / (platelets[10^9/L] x sqrt(ALT)) - the standard Sterling form.
- Only two mortality anchors are published (score 0 ~1.8%, score 164 ~>85.8% 5-year all-cause mortality) over a continuous curve; NO per-band lookup exists, so none is fabricated (the gwtg-hf / ROKS precedent). The tile quotes the two anchors and the continuous-curve caveat.

## Boundary worked examples added
- worked total 53 with FIB-4 2.68; HCV +5 delta; every CD4 band edge; FIB-4 band edges <1.45/1.45-3.25/>3.25; min 0 and the 164 ceiling.

## Edge-input handling notes
- Requires all labs plus AST/ALT/platelets for FIB-4 and the HCV flag; zero/blank platelets or ALT surface valid:false (no divide-by-zero / sqrt(0) leak). Joined the spec-v59 fuzz harness (zero non-finite leaks).

## A11y / keyboard notes
- Labeled number inputs + HCV select; output aria-live="polite". 320px sweep, no hscroll; renders the clinical-posture note.

## Defects opened
- none
