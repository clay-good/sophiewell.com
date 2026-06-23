# v12 audit - weber-ankle

- Auditor: CG
- Date: 2026-06-23
- Citation re-verified against: Weber BG. Die Verletzungen des oberen Sprunggelenkes. Bern: Hans Huber; 1972 (Danis-Weber classification; pathologic-anatomic basis Danis 1949; adopted by the AO Foundation as 44-A/B/C). Cross-verified across AO Foundation, LITFL, and Radiopaedia.

`lib/ortho-v144.js weberAnkle()` consumes the distal-fibula fracture level
relative to the syndesmosis and computes the type A / B / C with the syndesmotic-
stability framing. Class B (textbook/monograph source, AO-adopted) -- carries an
`accessed` date and a `docs/citation-staleness.md` row.

## Source-governance notes
- Defined SOLELY by fibular fracture level: A below (infrasyndesmotic, intact,
  stable), B at the level (transsyndesmotic, variably injured -- a medial/stress
  check is needed before declaring stability), C above (suprasyndesmotic,
  disrupted, unstable).
- The source date is 1972 (the original monograph), NOT 1966 -- 1966 is a common
  reproduction error; Danis (1949) provided the pathologic-anatomic basis. Triple-
  verified at implementation.
- Weber<->Lauge-Hansen mapping is approximate and deliberately not encoded.

## Boundary worked examples added
- blank -> complete-the-fields fallback.
- below -> Type A (stable); at the level -> Type B (assess medial side).
- B -> C suprasyndesmotic flip to unstable.

## Edge-input handling notes
- Single required select (blank -> valid:false). Output is a bounded categorical
  type -- no non-finite path. Covered by the spec-v59 fuzz harness.

## A11y / keyboard notes
- One labeled select; output aria-live="polite". 320px sweep, no hscroll.

## Defects opened
- none
