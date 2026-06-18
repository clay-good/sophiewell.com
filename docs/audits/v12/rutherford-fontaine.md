# v12 audit - rutherford-fontaine

- Auditor: CG
- Date: 2026-06-18
- Citation re-verified against: Rutherford RB, Baker JD, Ernst C, et al. J Vasc Surg. 1997;26(3):517-538.

`lib/vascular-v105.js rutherfordFontaine()` maps one clinical picture to its
Rutherford category (0-6) and the corresponding Fontaine stage (I-IV), and names
the chronic-limb-ischemia interpretation. Class B (revisable society reporting
standards -> docs/citation-staleness.md row, on-publication cadence).

## Boundary worked examples added
- severe claudication -> Rutherford 3 / Fontaine IIb (the spec acceptance anchor).
- asymptomatic -> 0 / I; mild -> IIa vs moderate/severe -> IIb (Fontaine collapses
  moderate and severe claudication to IIb).
- rest pain -> III and tissue loss (5/6) -> IV are flagged chronic limb-threatening.
- unrecognized / blank picture -> valid:false surfaced fallback.
- fuzz: select-keyed lookup, no non-finite leak.

## Cross-implementation differential
- Reference: the Rutherford 1997 revised reporting standards and the standard
  Rutherford<->Fontaine crosswalk, cross-checked against MDCalc and Radiopaedia.
  Match (Rutherford 1=IIa, 2-3=IIb, 4=III, 5-6=IV). PASS.

## Edge-input handling notes
- A select key drives a compiled lookup; an out-of-set key returns a surfaced
  fallback rather than reading an undefined stage.

## A11y / keyboard notes
- Labeled select; output aria-live="polite". 320px sweep passes with no horizontal
  scroll. Severity classification, not a revascularization order.

## Defects opened
- none

## Status
- PASS
