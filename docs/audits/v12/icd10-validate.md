# v12 audit - icd10-validate

- Auditor: CG
- Date: 2026-06-15
- Citation re-verified against: ICD-10-CM Official Guidelines for Coding and Reporting and the code-set conventions: the category/etiology/site/laterality structure, the placeholder X, and the required 7th character for certain chapters.

`lib/billing-v83.js icd10Validate()` uppercases and strips whitespace, removes the single decimal, and checks the structural grammar: 3-7 characters; character 1 a letter, character 2 a digit, character 3 alphanumeric, characters 4-7 alphanumeric (or the placeholder X). When the caller marks a 7th character as required, a code shorter than 7 is flagged INCOMPLETE (it would deny for lack of specificity) with the placeholder-padding guidance. Validates structure & specificity only -- not the clinically correct diagnosis. The renderer adds a best-effort existence note against the bundled `data/icd10cm` sample shards; the structural verdict stands regardless.

## Boundary examples added
- M54.5 (no 7th char required): structurally valid.
- S52.5 with a required 7th character: INCOMPLETE (needs the 7th char + placeholder X padding).
- S52.521A: valid, 7th character present.
- 5A4.5: invalid -- character 1 must be a letter.

## Cross-implementation differential
- Reference: the ICD-10-CM grammar applied by hand; M54.5 valid, S52.5 requires a 7th character.
- Test case: as above; Sophie identical. PASS.

## Edge-input handling notes
- Empty -> TypeError; < 3 or > 7 characters, a second decimal, or a bad character class return an invalid verdict naming the rule. No NaN/Infinity path; the shard load degrades silently to structural-only.

## A11y / keyboard notes
- A text input + a labeled "7th character required" checkbox, each with a real `<label for>`; output aria-live="polite". 320px sweep passes with no horizontal scroll.

## Defects opened
- none

## Status
- PASS
