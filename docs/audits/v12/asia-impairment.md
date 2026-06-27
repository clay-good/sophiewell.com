# v12 audit - asia-impairment

- Auditor: CG
- Date: 2026-06-26
- Citation re-verified against: Kirshblum SC, Burns SP, Biering-Sørensen F, et al. International Standards for Neurological Classification of Spinal Cord Injury (revised 2011). J Spinal Cord Med. 2011;34(6):535-546 (cross-verified against the PMC5384910 "Classifications in Brief" review and the SCIRE Project AIS reference; ≥ 2 sources, spec-v97).

`lib/neuro-disability-v159.js asiaImpairment()` returns the AIS grade A–E from
the clinician's exam findings. Group G, Class A.

## Source-governance notes
- A complete (no sensory/motor at S4–S5); B sensory incomplete (sacral sparing,
  no motor below the level); C motor incomplete, < half of the key muscles below
  the single NLI grade ≥ 3; D ≥ half grade ≥ 3; E normal in a patient with a
  prior documented deficit.
- Sacral sparing at S4–S5 is the complete-vs-incomplete gate; the proportion of
  key muscles ≥ 3 is the C-vs-D gate. The tile reports the AIS grade; it does not
  re-derive the full dermatome/myotome ISNCSCI worksheet.

## Boundary worked examples added
- no sacral sparing → A; sparing + no motor below → B; the C/D proportion flip;
  E override; an incomplete exam → valid:false at each decision point.

## Edge-input handling notes
- Each decision gate that is unanswered surfaces a specific complete-the-fields
  message rather than guessing a grade. Covered by the spec-v59 fuzz harness.

## A11y / keyboard notes
- Four labelled yes/no selects; output aria-live. 320px sweep, no horizontal scroll.

## Defects opened
- none

## Status
- PASS
