# v11 audit - cthr

- Auditor: CG
- Date: 2026-05-18
- Citation re-verified against: Stiell IG, Wells GA, Vandemheen K, et al. *The Canadian CT Head Rule for patients with minor head injury.* Lancet. 2001;357(9266):1391-1396. Figure 2 algorithm and §Methods inclusion / exclusion criteria.

`lib/scoring-v4.js cthr()` implements the Stiell 2001 binary decision: CT recommended when any of the five high-risk criteria (GCS<15 at 2h, suspected open/depressed skull fx, sign of basal skull fx, vomiting >=2, age >=65) or any of the two medium-risk criteria (retrograde amnesia >=30 min, dangerous mechanism) are present. The renderer surfaces the Stiell 2001 §Methods inclusion criteria (GCS 13-15 blunt head injury with witnessed LOC, definite amnesia, or witnessed disorientation) before scoring.

## Boundary examples added
- low: no criteria met -> CT not required by Canadian CT Head Rule per Stiell 2001. Tile empty-state example.
- mid (medium-only): retrograde amnesia >= 30 min -> CT recommended (medium-risk criterion present).
- high: age >= 65 (high-risk criterion) -> CT recommended (neurosurgical-intervention concern).

## Cross-implementation differential
- Reference implementation: Stiell IG, et al. Lancet. 2001;357(9266):1391-1396 Figure 2 algorithm (hand walk-through).
- Test case: age 70, no other criteria.
- Sophie result: ctRecommended = true, high-risk band.
- Reference result: age >= 65 is a high-risk criterion -> CT recommended. PASS.

## Edge-input handling notes
- Boolean inputs only; no numeric edge cases. The renderer collapses the five high-risk and two medium-risk criteria into two `anyHigh` / `anyMedium` flags so the binary decision matches the Stiell 2001 Figure 2 algorithm exactly.
- Rule applicability (GCS 13-15 blunt head injury with witnessed LOC, definite amnesia, or witnessed disorientation) is surfaced before scoring per Stiell 2001 §Methods.

## A11y / keyboard notes
- Seven labeled checkboxes grouped under two `<h3>` section headers (high-risk and medium-risk); all Tab-reachable in source order; output region `aria-live="polite"`. `npm run test:a11y` clean after the tile was added.

## Defects opened
- none

## Status
- PASS
