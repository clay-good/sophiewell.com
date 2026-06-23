# v12 audit - schatzker-classification

- Auditor: CG
- Date: 2026-06-23
- Citation re-verified against: Schatzker J, McBroom R, Bruce D. The tibial plateau fracture: the Toronto experience 1968-1975. Clin Orthop Relat Res. 1979;(138):94-104 (cross-verified across LITFL, RadioGraphics, and Orthobullets).

`lib/ortho-v144.js schatzkerClassification()` consumes the tibial-plateau fracture
pattern and computes the type I-VI with the low-energy (I-III) vs high-energy
(IV-VI) framing. Class A.

## Source-governance notes
- I lateral split, II lateral split-depression, III lateral pure (central)
  depression, IV medial plateau, V bicondylar, VI plateau fracture with
  metaphyseal-diaphyseal dissociation.
- I-III low-energy; IV-VI high-energy with the worst prognosis -- IV carries
  peroneal-nerve and popliteal-vessel risk, VI compartment-syndrome risk, and
  V-VI are often staged. Medial involvement -> IV and dissociation -> VI are the
  pattern overrides.

## Boundary worked examples added
- blank -> complete-the-fields fallback.
- lateral split -> Type I; lateral split-depression -> Type II.
- III -> IV low-energy -> high-energy boundary (abnormal flips on).
- bicondylar -> V; dissociation -> VI (both high-energy).

## Edge-input handling notes
- Single required select (blank -> valid:false). Output is a bounded categorical
  type -- no non-finite path. Covered by the spec-v59 fuzz harness.

## A11y / keyboard notes
- One labeled select; output aria-live="polite". 320px sweep, no hscroll.

## Defects opened
- none
