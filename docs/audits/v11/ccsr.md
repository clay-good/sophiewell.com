# v11 audit - ccsr

- Auditor: CG
- Date: 2026-05-18
- Citation re-verified against: Stiell IG, Wells GA, Vandemheen KL, et al. *The Canadian C-Spine Rule for radiography in alert and stable trauma patients.* JAMA. 2001;286(15):1841-1848. Figure 1 three-step algorithm and §Methods inclusion criteria.

`lib/scoring-v4.js ccsr()` implements the Stiell 2001 three-step algorithm: (1) any high-risk factor present -> image; (2) no low-risk factor that permits safe range-of-motion testing -> image; (3) unable to actively rotate neck 45 degrees left and right -> image; otherwise image not required. Ships side by side with the existing `nexus-cspine` tile so both rules are visible on the same screen.

## Boundary examples added
- low (rule out): simple rear-end MVC (low-risk factor) + able to rotate 45 degrees -> imaging not required. Tile empty-state example.
- mid (step 2 fails): no low-risk factor -> imaging recommended.
- high (step 1): age >= 65 -> imaging recommended (high-risk criterion).
- step 3 boundary: low-risk present but unable to rotate -> imaging recommended.

## Cross-implementation differential
- Reference implementation: Stiell IG, et al. JAMA. 2001;286(15):1841-1848 Figure 1 algorithm (hand walk-through).
- Test case: age 70, no other findings.
- Sophie result: imagingRecommended = true, step 1 band.
- Reference result: age >= 65 is a high-risk factor in step 1 -> imaging recommended. PASS.

## Edge-input handling notes
- Boolean inputs only. The renderer reduces three high-risk and five low-risk checkboxes to two `anyHigh` / `anyLow` flags plus a single `canRotate45` flag so the three-step algorithm matches Stiell 2001 Figure 1 exactly.
- Rule applicability (alert GCS 15 stable trauma patient with neck pain or visible injury above the clavicles, non-ambulatory, or with dangerous mechanism) is surfaced before scoring per Stiell 2001 §Methods.

## A11y / keyboard notes
- Nine labeled checkboxes grouped under three `<h3>` section headers (step 1, step 2, step 3); all Tab-reachable in source order; output region `aria-live="polite"`. `npm run test:a11y` clean after the tile was added.

## Defects opened
- none

## Status
- PASS
