# v12 audit - salter-harris

- Auditor: CG
- Date: 2026-06-23
- Citation re-verified against: Salter RB, Harris WR. Injuries involving the epiphyseal plate. J Bone Joint Surg Am. 1963;45(3):587-622 (cross-verified across Orthobullets, Radiopaedia, and StatPearls).

`lib/ortho-v144.js salterHarris()` consumes the physeal-fracture pattern and
computes the type I-V via the SALTR mnemonic with the growth-disturbance prognosis
framing. Class A.

## Source-governance notes
- SALTR: I Slipped (through the physis only), II Above (physis + metaphysis,
  Thurston-Holland fragment; the most common at ~75%), III Lower (physis +
  epiphysis, intra-articular), IV Through (metaphysis + physis + epiphysis,
  intra-articular), V cRush (physeal compression, often radiographically occult).
- Growth-disturbance risk rises ascending I -> V; III and IV are intra-articular
  and usually need anatomic reduction. Types VI-IX (Rang/Ogden extensions) are
  non-standard and deliberately not encoded.

## Boundary worked examples added
- blank -> complete-the-fields fallback.
- through the physis only -> Type I; physis + metaphysis -> Type II (most common).
- II -> III boundary (intra-articular, abnormal flips on).
- through all three -> IV; crush -> V.

## Edge-input handling notes
- Single required select (blank -> valid:false). Output is a bounded categorical
  type -- no non-finite path. Covered by the spec-v59 fuzz harness.

## A11y / keyboard notes
- One labeled select; output aria-live="polite". 320px sweep, no hscroll.

## Defects opened
- none
