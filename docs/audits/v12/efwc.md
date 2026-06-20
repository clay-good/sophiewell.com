# v12 audit - efwc

- Auditor: CG
- Date: 2026-06-20
- Citation re-verified against: Rose BD. Am J Med. 1986;81(6):1033-1040 (PMID 3799631; the formula and the sign convention cross-read against the Rondon-Berrios Frontiers in Medicine 2018 review and ScienceDirect "Free Water Clearance" -- all three agree that a POSITIVE EFWC is free-water excretion (raises Na) and a NEGATIVE EFWC is free-water retention (lowers Na)).

`lib/renal-v128.js efwc()` computes EFWC = urine volume x [1 - (urine Na + urine K) /
plasma Na]. Class A (journal+author citation, no ISSUER_PATTERN trip -- no
docs/citation-staleness.md row).

## Boundary worked examples added
- dilute urine (vol 2.0, Na 20, K 15, pNa 140) -> +1.5 L (free-water excretion, raises Na).
- hypertonic urine (vol 1.0, Na 100, K 60, pNa 140) -> -0.14 L (retention, drives hyponatremia).
- sign flips exactly as urine Na + K crosses plasma Na -> 0 L.
- urine Na/K of zero allowed; zero plasma Na -> valid:false; scalar -> valid:false.

## Source-governance / spec-correction note
- The spec-v128 §2.5 prose has the sign INVERTED ("positive EFWC drives hyponatremia").
  Source governs over spec wording (cf. the v104 EGSYS inversion): the implemented sign
  is the cross-verified one -- POSITIVE = net free-water excretion that RAISES plasma
  sodium (toward hypernatremia / corrects hyponatremia); NEGATIVE = net free-water
  retention that LOWERS plasma sodium (drives hyponatremia). The signed result is
  reported with its sign, never capped.

## Edge-input handling notes
- volume and plasma Na use pos() (must be positive); urine Na and K use a non-negative
  guard (zero is a valid hypotonic-urine input). Band classified on the rounded value
  so the shown sign matches the band.

## A11y / keyboard notes
- Four number inputs each labeled; output aria-live="polite". 320px sweep, no hscroll.

## Defects opened
- none
