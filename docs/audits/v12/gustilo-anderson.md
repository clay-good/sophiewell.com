# v12 audit - gustilo-anderson

- Auditor: CG
- Date: 2026-06-23
- Citation re-verified against: Gustilo RB, Anderson JT. Prevention of infection in the treatment of one thousand and twenty-five open fractures of long bones. J Bone Joint Surg Am. 1976;58(4):453-458; Type III A/B/C subtypes Gustilo, Mendoza, Williams. J Trauma. 1984;24(8):742-746. Categories and the III-subtype precedence were cross-verified across 2+ independent sources (AO Foundation, Orthobullets, Radiopaedia/StatPearls).

`lib/ortho-v144.js gustiloAnderson()` consumes the clinician's read of the open
fracture (wound size band, an extensive-soft-tissue/high-energy qualifier,
inadequate coverage requiring a flap, and an arterial injury requiring repair)
and computes the class I / II / IIIA / IIIB / IIIC. Class A.

## Source-governance notes
- The Type III subtype is set by COVERAGE and PERFUSION, not wound size: an
  arterial injury requiring repair forces IIIC irrespective of wound size; an
  inadequate-coverage/flap finding forces IIIB; a high-energy/extensive-soft-
  tissue qualifier (segmental, traumatic amputation, gunshot, farm injury) or a
  wound over 10 cm forces at least Type III (IIIA when coverage is adequate).
- The unverifiable mnemonic triggers (">8 h old", "war/combat", "mass casualty")
  are deliberately NOT encoded -- they could not be confirmed in any authoritative
  source and are absent from the canonical definition.
- The definitive grade is often set intra-operatively after debridement; the tile
  reports the class and the source's coverage/infection framing only.

## Boundary worked examples added
- blank wound -> complete-the-fields fallback.
- small clean wound -> Type I; 1-10 cm -> Type II; > 10 cm -> at least IIIA.
- IIIA -> IIIB -> IIIC distinction (coverage/vascular precedence).
- arterial repair overrides flap-coverage (IIIC wins).

## Edge-input handling notes
- Wound is a required select (blank -> valid:false). The override findings are
  checkboxes coerced through onFlag(); unrecognized keys are ignored. Output is a
  bounded categorical class -- no non-finite path. Covered by the spec-v59 fuzz
  harness (lib/ortho-v144.js added to MODULES).

## A11y / keyboard notes
- One labeled select + three labeled checkboxes; output aria-live="polite".
  320px sweep, no hscroll.

## Defects opened
- none
