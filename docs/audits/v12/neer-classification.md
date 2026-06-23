# v12 audit - neer-classification

- Auditor: CG
- Date: 2026-06-23
- Citation re-verified against: Neer CS 2nd. Displaced proximal humeral fractures. I. Classification and evaluation. J Bone Joint Surg Am. 1970;52(6):1077-1089 (cross-verified against the CORR Classifications in Brief reproduction and Orthobullets).

`lib/ortho-v144.js neerClassification()` consumes which of the four segments
(articular surface/anatomic neck, greater tuberosity, lesser tuberosity, surgical
neck/shaft) are displaced and whether a fracture-dislocation is present, and
computes the one- / two- / three- / four-part class. Class A.

## Source-governance notes
- A segment is displaced when separated > 1 cm OR angulated > 45 deg; the part
  count is 1 + the number of displaced segments, so an undisplaced fracture is
  one-part regardless of the number of fracture lines.
- The part count is clamped to the published 1-4 range (spec-v144 §3 fixed-integer
  guard): the articular/head segment is the anchor, so four-part is the ceiling
  even if all four selects are checked. A contradictory selection (zero displaced)
  renders one-part, never an out-of-range class.
- Fracture-dislocation is reported as a modifier (and flips the abnormal flag).

## Boundary worked examples added
- no displaced segments -> one-part (regardless of fracture lines).
- one displaced -> two-part; two displaced -> three-part (abnormal).
- all four displaced -> four-part (clamped ceiling).
- fracture-dislocation flips abnormal even at one-part.

## Edge-input handling notes
- Five checkboxes coerced through onFlag(); unrecognized keys ignored. Part count
  is a clamped integer 1-4 -- no non-finite path. Covered by the spec-v59 fuzz
  harness.

## A11y / keyboard notes
- Five labeled checkboxes; output aria-live="polite". 320px sweep, no hscroll.

## Defects opened
- none
