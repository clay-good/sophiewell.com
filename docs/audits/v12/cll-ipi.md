# v12 audit - cll-ipi

- Auditor: CG
- Date: 2026-06-20
- Citation re-verified against: International CLL-IPI Working Group. An international prognostic index for patients with chronic lymphocytic leukaemia (CLL-IPI). Lancet Oncol. 2016;17(6):779-790.

`lib/lymphoma-v135.js cllIpi()` returns the weighted total (0-10) and the four-group risk band. Class A (fixed point weights; journal+author citation - no docs/citation-staleness.md row).

## Source-governance / weight note
- Weighted: TP53 del(17p)/mutation = 4; IGHV unmutated = 2; serum beta2-microglobulin > 3.5 mg/L = 2; advanced clinical stage (Rai I-IV / Binet B-C) = 1; age > 65 = 1.
- Total 0-10 -> low (0-1), intermediate (2-3), high (4-6), very high (7-10). 5-yr OS ~93 / 79 / 63 / 23%.

## Boundary worked examples added
- 0 -> Low; each of the 4/2/2/1/1 weights individually; the 1/2, 3/4, 6/7 group flips (the worked example pins the 6 (high) vs 7 (very high) boundary); the 10-point maximum.

## Edge-input handling notes
- Any unanswered factor surfaces valid:false. Joined the spec-v59 fuzz harness (zero non-finite leaks).

## A11y / keyboard notes
- Five labeled yes/no selects with a blank leading option; output aria-live="polite". 320px sweep, no hscroll; renders the clinical-posture note.

## Defects opened
- none
