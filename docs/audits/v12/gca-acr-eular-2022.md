# v12 audit - gca-acr-eular-2022

- Auditor: CG
- Date: 2026-06-23
- Citation re-verified against: Ponte C, Grayson PC, Robson JC, et al. 2022 ACR/EULAR classification criteria for giant cell arteritis. Ann Rheum Dis. 2022;81(12):1647-1653 (cross-verified against the PubMed primary abstract, PMID 36351706, RheumCalc, and RheumNow's verbatim per-item point table).

`lib/rheum-v148.js gcaAcrEular2022()` enforces the age >= 50 entry requirement,
then sums the weighted clinical/lab/imaging/biopsy items 0-25 and applies the
>= 6 classification threshold. Class B (ACR/EULAR society criteria).

## Source-governance notes
- Entry: age >= 50 at diagnosis is an ABSOLUTE requirement; without it the
  criteria do not apply (the renderer returns "not applicable").
- Weighted items: positive biopsy OR halo on US is a SINGLE +5 item (not two);
  ESR >= 50 or CRP >= 10 +3; sudden visual loss +3 (not +2); then +2 each for
  morning stiffness, jaw/tongue claudication, new temporal headache, scalp
  tenderness, abnormal temporal artery on exam, bilateral axillary involvement,
  FDG-PET aorta. Max 5+3+3+(7x2) = 25.
- Threshold >= 6 classifies as GCA (sensitivity 87.0%, specificity 94.8%).
- ACR/EULAR is NOT in the check-citations ISSUER_PATTERN, so the
  docs/citation-staleness.md row is DOCUMENTATION-ONLY, not gate-forced (the
  spec-v147 lesson). It records the 2022 edition and an on-publication review.

## Boundary worked examples added
- entry-not-met -> not applicable; exactly 6 -> classified (flip); 5 -> not
  classified; biopsy/halo as a single +5; maximum 25.

## Edge-input handling notes
- Eleven boolean flags; entry gate first; no division. num() bounds the 0-25
  total. Covered by the spec-v59 fuzz harness, zero leaks.

## A11y / keyboard notes
- One entry checkbox + ten item checkboxes; output aria-live. 320px sweep, no
  hscroll.

## Defects opened
- none

## Status
- PASS
