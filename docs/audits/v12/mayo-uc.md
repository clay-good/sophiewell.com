# v12 audit - mayo-uc

- Auditor: CG
- Date: 2026-06-16
- Citation re-verified against: Schroeder KW, Tremaine WJ, Ilstrup DM. Coated oral 5-aminosalicylic acid therapy for mildly to moderately active ulcerative colitis. N Engl J Med. 1987;317(26):1625-1629.

`lib/hepgi-v93.js mayoUc()` computes the full Mayo (0-12) when all four subscores are present and the partial Mayo (0-9) when endoscopy is omitted, labeling which form produced the number.

## Boundary worked examples added
- stool 2, bleeding 2, PGA 2, endoscopy 2 -> full Mayo 8, moderate.
- stool 2, bleeding 2, PGA 2 (endoscopy omitted) -> partial Mayo 6, moderate.
- a score of 5 reads mild under the full bands and moderate under the partial bands (the label states which form).
- endoscopy 0 still computes the full form.

## Cross-implementation differential
- Reference: Schroeder 1987 Mayo subscores; full bands remission 0-2, mild 3-5, moderate 6-10, severe 11-12; partial bands remission 0-2, mild 3-4, moderate 5-6, severe 7-9. Match. PASS.

## Edge-input handling notes
- Each subscore is clamped to [0, 3]; the partial-vs-full branch keys on whether the endoscopy subscore is present. Fuzz harness covers the module, zero non-finite leaks.

## A11y / keyboard notes
- Four labeled <select>s (endoscopy has an explicit omit option); output aria-live="polite". 320px sweep passes with no horizontal scroll.

## Defects opened
- none

## Status
- PASS
