# v12 audit - fleischner-2017

- Auditor: CG
- Date: 2026-06-19
- Citation re-verified against: MacMahon H, Naidich DP, Goo JM, et al. Guidelines for management of incidental pulmonary nodules detected on CT images: from the Fleischner Society 2017. Radiology. 2017;284(1):228-243 (re-fetched; cross-read with the RSNA full text, Radiology Assistant, the Radiology Universe Institute summary, and MDCalc calc/10062).

`lib/pulmnod-v115.js fleischner2017()` returns the recommended CT-surveillance
interval for an incidental pulmonary nodule, keyed on type (solid / part-solid /
pure ground-glass), size, single vs multiple, and patient risk (which changes
only the solid cells). Class B (revisable Fleischner Society guidance;
docs/citation-staleness.md row).

## Boundary worked examples added
- single solid > 8 mm -> consider CT at 3 months, PET/CT, or tissue sampling.
- single solid < 6 mm low risk -> no routine follow-up.
- single solid 6-8 mm: risk changes the second scan ("then consider CT" vs
  "then CT").
- single pure ground-glass >= 6 mm -> CT 6-12 months then every 2 years to 5 yr.
- single part-solid >= 6 mm -> CT 3-6 months to confirm persistence.
- a blank size renders a complete-the-fields fallback (no default cell selected).

## Cross-implementation differential
- Reference: all matrix cells were transcribed verbatim from Table 1 of the
  guideline and cross-checked against the Radiology Assistant reproduction. Two
  paraphrase-level divergences were noted and resolved to the source: (1) the
  multiple-solid 6-8 mm and > 8 mm cells share the same "CT at 3-6 months, then
  consider CT at 18-24 months" wording; (2) the single-solid 6-8 mm second scan
  is "consider" at low risk and definite at high risk per the guideline text.
  Match. PASS.

## Edge-input handling notes
- size is the only required number; type/multiplicity/risk are selects with
  defaults (solid / single / low). size > 0 guarded. A scalar fuzz arg yields a
  valid:false fallback.

## A11y / keyboard notes
- One labeled number input + three labeled selects; output aria-live="polite".
  320px sweep, no hscroll (the long recommendation strings wrap).

## Defects opened
- none

## Status
- PASS
