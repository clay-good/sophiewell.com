# v12 audit - garden-classification

- Auditor: CG
- Date: 2026-06-23
- Citation re-verified against: Garden RS. Low-angle fixation in fractures of the femoral neck. J Bone Joint Surg Br. 1961;43-B(4):647-663 (cross-verified against Kazley et al, Classifications in Brief, Clin Orthop Relat Res 2018 and Orthobullets/Radiopaedia).

`lib/ortho-v144.js gardenClassification()` consumes the femoral-neck displacement
pattern and computes the grade I / II / III / IV with the stable I-II vs unstable
III-IV grouping. Class A.

## Source-governance notes
- I incomplete/valgus-impacted (nondisplaced), II complete nondisplaced, III
  complete partially displaced (trabecular angle altered), IV complete fully
  displaced (trabeculae realign parallel).
- I-II stable/nondisplaced vs III-IV unstable/displaced is the management split
  (internal fixation vs arthroplasty); the displaced-vs-nondisplaced two-way read
  is the more reliable one and is surfaced in the band text.

## Boundary worked examples added
- blank -> complete-the-fields fallback.
- incomplete -> Grade I (stable); complete nondisplaced -> Grade II (stable).
- II -> III stable -> unstable boundary (abnormal flips on).
- fully displaced -> Grade IV (unstable).

## Edge-input handling notes
- Single required select (blank -> valid:false). Output is a bounded categorical
  grade -- no non-finite path. Covered by the spec-v59 fuzz harness.

## A11y / keyboard notes
- One labeled select; output aria-live="polite". 320px sweep, no hscroll.

## Defects opened
- none
