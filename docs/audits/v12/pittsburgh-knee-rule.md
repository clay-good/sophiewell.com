# v12 audit - pittsburgh-knee-rule

- Auditor: CG
- Date: 2026-06-23
- Citation re-verified against: Seaberg DC, Jackson R. Clinical decision rule for knee radiographs. Am J Emerg Med. 1994;12(5):541-543; validated Seaberg DC, et al. Ann Emerg Med. 1998;32(1):8-13 (cross-verified against the Seaberg 1994/1998 PubMed abstracts, Physiopedia, and Wikipedia).

`lib/ortho-v145.js pittsburghKneeRule()` consumes the entry mechanism (blunt
trauma or fall) and the high-risk criteria (age < 12, age > 50, inability to bear
weight) and computes the radiograph-indicated decision. Class A.

## Source-governance notes
- The entry gate is mandatory: without a blunt-trauma or fall mechanism the rule
  does not apply (applies:false) and the renderer states that rather than silently
  returning "not indicated".
- Given the gate, a radiograph is indicated if age < 12 OR age > 50 (strict
  inequalities) OR inability to take 4 weight-bearing steps in the ED.
- Published performance: ~99% sensitive, ~60% specific (Seaberg 1998); applies to
  children, unlike the Ottawa knee rule. Near-neighbor ottawa-knee is cross-linked;
  both kept (different inputs/derivation).

## Boundary worked examples added
- no entry mechanism -> rule does not apply (even with high-risk criteria checked).
- mechanism only, no high-risk criterion -> not indicated.
- mechanism + age > 50 -> indicated (the flip).
- mechanism + age < 12 -> indicated; mechanism + cannot bear weight -> indicated.

## Edge-input handling notes
- Four checkboxes coerced through onFlag(); unrecognized keys ignored. Boolean
  logic only -- no numeric or non-finite path. Covered by the spec-v59 fuzz
  harness.

## A11y / keyboard notes
- Four labeled checkboxes; output aria-live="polite". 320px sweep, no hscroll.

## Defects opened
- none
