# v11 audit - ottawa-sah

- Auditor: CG
- Date: 2026-05-18
- Citation re-verified against: Perry JJ, Stiell IG, Sivilotti MLA, et al. *Clinical decision rules to rule out subarachnoid hemorrhage for acute headache.* JAMA. 2013;310(12):1248-1255. Figure 2 algorithm and §Methods inclusion / exclusion criteria.

`lib/scoring-v4.js ottawaSah()` implements the Perry 2013 six-criterion decision: rule out SAH only when all six criteria (age >=40, neck pain or stiffness, witnessed LOC, onset during exertion, thunderclap headache peaking within 1 second, limited neck flexion) are negative. The renderer surfaces the Perry 2013 §Methods exclusion criteria (new neurologic deficit, prior aneurysm / SAH / brain tumor, recurrent identical-pattern headaches, age <15) before scoring; when any exclusion is present the function returns `applicable: false`.

## Boundary examples added
- low (rule out): all six criteria negative, no exclusion -> rule out SAH by Ottawa SAH Rule per Perry 2013 (100% sensitivity in the derivation cohort). Tile empty-state example.
- mid (cannot rule out): age >= 40 alone -> cannot rule out SAH.
- high (cannot rule out): all six criteria positive -> cannot rule out SAH.
- exclusion: exclusionCriteriaPresent = true -> rule does not apply.

## Cross-implementation differential
- Reference implementation: Perry JJ, et al. JAMA. 2013;310(12):1248-1255 Figure 2 algorithm (hand walk-through).
- Test case: age >= 40, all five others negative, no exclusion.
- Sophie result: applicable = true, cannotRuleOut = true.
- Reference result: any positive criterion -> cannot rule out SAH. PASS.

## Edge-input handling notes
- Boolean inputs only. Exclusion pre-screen is a single checkbox that collapses the four Perry 2013 §Methods exclusion classes.
- Rule applies to alert patients >= 15 with new severe non-traumatic headache peaking within 1 hour. Inclusion criteria are surfaced in the renderer's intro paragraph per Perry 2013 §Methods.

## A11y / keyboard notes
- Seven labeled checkboxes grouped under exclusion-check and six-criteria section headers; all Tab-reachable in source order; output region `aria-live="polite"`. `npm run test:a11y` clean after the tile was added.

## Defects opened
- none

## Status
- PASS
