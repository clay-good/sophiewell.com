# v12 audit - cvt-risk

- Auditor: CG
- Date: 2026-06-19
- Citation re-verified against: Ferro JM, Bacelar-Nicolau H, Rodrigues T, et al. Risk score to predict the outcome of patients with cerebral vein and dural sinus thrombosis. Cerebrovasc Dis. 2009;28(1):39-44 (re-fetched; the PubMed abstract giving the hazard ratios plus two independent reproductions, all agreeing on the integer weights).

`lib/neuro-v119.js cvtRisk()` sums six items derived from the ISCVT cohort:
Malignancy (+2), Coma / GCS < 9 (+2), Deep venous system thrombosis (+2),
Mental-status disturbance (+1), Male sex (+1), and Intracranial hemorrhage (+1),
for a total of 0-9. The outcome is a poor result -- modified Rankin Scale > 2
(dependency or death). The validated dichotomy is >= 3 predicts a poor outcome
(combined sensitivity ~0.96, specificity ~0.14 -- a high-sensitivity screen).
Class A (fixed point weights; journal+author citation, no ISSUER_PATTERN trip --
no docs/citation-staleness.md row).

## Boundary worked examples added
- no items -> 0/9, below threshold.
- male + ICH -> 2/9, below the >= 3 band-flip.
- malignancy alone -> 2/9, below threshold.
- malignancy + coma -> 4/9, crosses the poor-outcome threshold.
- one 2-point item + one 1-point item -> 3/9, the threshold itself.
- all six items -> 9/9 (max).
- scalar fuzz arg -> valid 0/9, never NaN.

## Cross-implementation differential
- Reference: the {2,2,2,1,1,1} weights reflect the published hazard ranking
  (malignancy, coma, and deep venous thrombosis carry the three highest hazard
  ratios -> 2 points each; the lower trio -> 1 point each) and are unanimous
  across the accessible reproductions. NOTE: a stray "coma 5 points" reading
  circulates and is WRONG -- coma is 2 points. The paper publishes NO per-score
  probability-of-poor-outcome table, so the tile frames risk via the >= 3
  threshold and the cited operating characteristics only -- it invents no
  continuous probability. Match. PASS.

## Edge-input handling notes
- All six inputs are booleans; the total is clamped 0-9. A scalar / non-object
  fuzz arg yields a valid 0/9, never a NaN.

## A11y / keyboard notes
- Six labeled checkboxes; output aria-live="polite". 320px sweep, no hscroll.

## Defects opened
- none

## Status
- PASS
