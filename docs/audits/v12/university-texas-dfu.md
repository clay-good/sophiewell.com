# v12 audit - university-texas-dfu

- Auditor: CG
- Date: 2026-06-26
- Citation re-verified against: Lavery LA, Armstrong DG, Harkless LB. Classification of diabetic foot wounds. J Foot Ankle Surg. 1996;35(6):528-531; validation Armstrong DG, Lavery LA, Harkless LB. Diabetes Care. 1998;21(5):855-859 (cross-verified against the PubMed 9589255 abstract and the University of Arizona record; ≥ 2 sources, spec-v97).

`lib/suites-v155.js universityTexasDfu()` maps the wound depth (grade 0–3) and
the complication (stage A–D) to the UT grade × stage cell. A two-axis
classification grid where every one of the 16 combinations resolves to a defined
cell (spec-v100 §2 classification clarification). Group G, Class A.

## Source-governance notes
- Grade (depth): 0 epithelialized pre/post-ulcerative lesion, 1 superficial
  (not to tendon/capsule/bone), 2 to tendon or capsule, 3 to bone or joint.
- Stage (complication): A clean, B infection, C ischemia, D infection + ischemia.
- The cell renders with the roman-numeral grade (0/I/II/III) and the stage
  letter (e.g. IIB). Outcomes worsen with increasing grade AND stage: in the
  1998 validation, infected + ischemic Stage D had ~76.5% midfoot-or-higher
  amputation vs ~3.5% in less advanced stages; probe-to-bone wounds 18.3% vs
  2.0%. No discrepancy between sources.
- The tile flags (warn) a deep wound (grade ≥ 2) or any complication beyond clean
  (stage other than A), with a Stage-D-specific highest-amputation-risk note.

## Boundary worked examples added
- tile example grade 2 / stage B → IIB; the roman-numeral mapping (0A / IA /
  IIID); the clean-shallow vs ischemia/infection/deep flag flips; every grade ×
  stage cell (16) resolves; lowercase stage accepted; missing/invalid axis →
  valid:false.

## Edge-input handling notes
- Grade must be an integer 0–3 and stage one of A–D (case-insensitive); anything
  else surfaces a complete-the-fields fallback; covered by the spec-v59 fuzz
  harness, zero non-finite leaks.

## A11y / keyboard notes
- Two labelled selects (grade, stage); output aria-live. 320px sweep, no
  horizontal scroll.

## Defects opened
- none

## Status
- PASS
