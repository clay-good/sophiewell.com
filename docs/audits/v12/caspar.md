# v12 audit - caspar

- Auditor: CG
- Date: 2026-06-24
- Citation re-verified against: Taylor W, Gladman D, Helliwell P, et al. Classification criteria for psoriatic arthritis. Arthritis Rheum. 2006;54(8):2665-2670 (cross-verified against StatPearls NBK547710 Table 3 and the mdapp CASPAR calculator; mutual-exclusivity of the psoriasis sub-levels confirmed against the primary paper and StatPearls).

`lib/rheum-v147.js caspar()` enforces the inflammatory-articular-disease entry
condition, then sums the weighted items to a maximum 6 and applies the >=3
classification threshold. Class B (documentation-only staleness row).

## Source-governance notes
- Entry condition: established inflammatory articular disease (joint, spine, or
  entheseal). Enforced first.
- Items: psoriasis (current 2, OR personal history 1, OR family history 1 -- the
  single highest applies, NOT summed / none 0), psoriatic nail dystrophy 1, negative
  RF 1, dactylitis (current or rheumatologist-recorded history) 1, juxta-articular
  new bone formation 1. Max 6.
- Current psoriasis (2) is the ONLY 2-point item; every other feature is 1 point.
- Threshold: entry condition AND >= 3 points classifies as psoriatic arthritis
  (sensitivity 0.91, specificity 0.99).

## Boundary worked examples added
- entry not met -> not applicable.
- tile example current psoriasis (2) + nail (1) = 3 -> CASPAR-positive.
- family history (1) + nail (1) = 2 -> not classified (history is 1, not 2).
- threshold flip 2 / 3; ceiling 6.

## Edge-input handling notes
- One required psoriasis select after the entry gate (blank -> complete-the-fields);
  four boolean items via onFlag. Bounded integer total 0-6. Covered by the spec-v59
  fuzz harness, zero leaks.

## A11y / keyboard notes
- One labeled checkbox (entry) + one select + four checkboxes; output aria-live.
  320px sweep, no hscroll.

## Defects opened
- none
