# v12 audit - sarc-calf

- Auditor: CG
- Date: 2026-06-29
- Citation re-verified against: Barbosa-Silva TG, Menezes AMB, Bielemann RM, et al. Enhancing SARC-F: improving sarcopenia screening in the clinical practice. J Am Med Dir Assoc. 2016;17(12):1136-1141. The +10 calf add-on, the sex-specific cutoffs (< 34 cm men, < 33 cm women), 0-20 total, and the >= 11 cutoff cross-verified (>= 2 sources, spec-v97).

`lib/ltcga-v177.js sarcCalf()` adds 0 or 10 to the SARC-F total. Group G, Class A.

## Source-governance notes
- SARC-F total (0-10) + 10 when calf < cutoff (34 cm men, 33 cm women), else 0; total 0-20; >= 11 positive. Journal issuer; does not trip ISSUER_PATTERN; no citation-staleness row.

## Boundary worked examples added
- calf below cutoff fires +10 (women 33, men 34 boundary); 10 negative vs 11 positive boundary; blank/zero calf or sex -> valid:false.

## Edge-input handling notes
- SARC-F items 0-2, calf finite > 0, sex required; otherwise valid:false; the add-on is a discrete +10/0 step, never NaN (spec-v59 fuzz pass).
