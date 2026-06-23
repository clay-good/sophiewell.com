# v12 audit - frykman-classification

- Auditor: CG
- Date: 2026-06-23
- Citation re-verified against: Frykman G. Fracture of the distal radius including sequelae. Acta Orthop Scand. 1967;Suppl 108:3-153 (cross-verified against Wheeless' Textbook of Orthopaedics, UW Emergency Radiology, and the JODT classification review).

`lib/ortho-v145.js frykmanClassification()` consumes the joint-involvement axis
(extra-articular / radiocarpal / distal radioulnar / both joints) and whether an
associated distal-ulna (ulnar styloid) fracture is present, and computes the
Type I–VIII class. Class A.

## Source-governance notes
- Two axes: joint involvement sets the base (extra-articular 1, radiocarpal 3,
  radioulnar 5, both 7) and an associated ulnar-styloid fracture adds 1, so odd
  types have no ulnar fracture and even types add one. I/II extra-articular,
  III/IV radiocarpal, V/VI radioulnar, VII/VIII both joints.
- Higher type = more articular involvement and a generally worse prognosis; the
  system omits displacement, dorsal comminution, and shortening (noted in the
  interpretation, not encoded as inputs).
- A missing joint axis renders the complete-the-fields fallback, never a class.

## Boundary worked examples added
- extra-articular, no ulnar -> Type I (not abnormal).
- extra-articular + ulnar -> Type II; radiocarpal + ulnar -> Type IV (abnormal).
- radioulnar without/with ulnar -> V / VI.
- both joints + ulnar -> Type VIII (ceiling).

## Edge-input handling notes
- One required select + one checkbox coerced through onFlag(); unrecognized keys
  ignored. Type is a bounded integer 1-8 -- no non-finite path. Covered by the
  spec-v59 fuzz harness.

## A11y / keyboard notes
- One labeled select (leading blank placeholder) + one labeled checkbox; output
  aria-live="polite". 320px sweep, no hscroll.

## Defects opened
- none
