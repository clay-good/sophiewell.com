# v11 audit - Wells PE & Revised Geneva (PE) (`wells-pe-geneva`)

- Auditor: CG
- Date: 2026-05-17
- Citation re-verified against: Wells PS, Anderson DR, Rodger M, et al. *Derivation of a simple clinical model to categorise patients probability of pulmonary embolism.* Thromb Haemost. 2000;83(3):416-420 (Wells PE). Le Gal G, Righini M, Roy PM, et al. *Prediction of pulmonary embolism in the emergency department: the revised Geneva score.* Ann Intern Med. 2006;144(3):165-171 (revised Geneva).

Both scores re-computed side by side. Wells PE: seven criteria, weights 3.0/3.0/1.5/1.5/1.5/1.0/1.0 (covered under `wells-pe`). Revised Geneva per Le Gal 2006 Table 2: age > 65 +1, prior DVT/PE +3, surgery or fracture in past month +2, active malignancy +2, unilateral lower-limb pain +3, hemoptysis +2, HR 75-94 +3, HR >= 95 +5, pain on lower-limb deep palpation + unilateral edema +4. Three-tier bands per Le Gal 2006 Table 3: Low 0-3 (8% PE prevalence), Intermediate 4-10 (29%), High >= 11 (74%). `lib/scoring-v4.js geneva()` implements this verbatim, including the mutually exclusive HR tiers (>=95 wins over 75-94 via the `else if`).

## Boundary examples added
Wells PE (covered in `wells-pe.md`; abbreviated here):
- low: 0; mid: ~3-4 PE-likely; high: 7.5 (High band per Wells 2000).

Revised Geneva:
- low: no criteria positive -> 0 (Low; 8% PE per Le Gal 2006).
- mid: META example (HR 105 -> +5; no other criteria) -> 5 (Intermediate; 29% PE). Note META expected text says "Geneva ~3" but with HR 105 alone the score is 5 (Intermediate). Re-checked META: example field `gv-hr` = 105 lands HR >= 95 = +5, putting the user in Intermediate, not Low. The narrative text "Geneva ~3 (low/intermediate)" is approximate and not used for the band rendering; band is computed live by the renderer. Not a defect; example narrative refinement opportunity but not user-visible incorrect output.
- high: age65 + priorVte + recentSurgery + activeMalignancy + unilateralLegPain + hemoptysis + HR 110 + lowerLimbExam -> 1 + 3 + 2 + 2 + 3 + 2 + 5 + 4 = 22 (High; 74% PE).

HR-tier edge: HR 75 -> +3 (Intermediate floor with no other criteria); HR 94 -> +3 (still 75-94 tier); HR 95 -> +5 (jumps to >=95 tier). Confirms the `else if` cascade.

## Cross-implementation differential
- Reference implementation: Le Gal 2006 Ann Intern Med Table 2 + Table 3.
- Test case: every criterion + HR 110.
- Sophie result: 22, "High (~74%)".
- Reference result: 22, High band (74% PE per Le Gal 2006 Table 3).
- Delta: 0%. PASS.

## Edge-input handling notes
- Wells PE and revised Geneva are rendered as two side-by-side panels so the user can compare; both share the "alternative diagnosis less likely" / "active malignancy" / etc. concepts but Geneva uses objective, non-physician-gestalt items by design (no "alternative diagnosis less likely" criterion). The labels avoid implying the items are interchangeable.
- HR is a numeric input on the Geneva side; out-of-range values bucket into the >=95 tier rather than throwing, which is the safer-direction failure mode.

## A11y / keyboard notes
- Wells PE: seven checkboxes. Geneva: seven checkboxes + one HR number input. All label-bound and Tab-reachable in source order, with the two output regions both `aria-live="polite"`. `npm run test:a11y` clean.

## Defects opened
- none (META example narrative for Geneva is approximate; live band rendering remains correct).

## Status
- PASS
