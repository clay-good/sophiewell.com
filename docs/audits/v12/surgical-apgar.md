# v12 audit - surgical-apgar

- Auditor: CG
- Date: 2026-06-16
- Citation re-verified against: Gawande AA, et al. An Apgar score for surgery. J Am Coll Surg. 2007;204(2):201-208; Regenbogen SE, et al. Arch Surg. 2009;144(1):30-36 (validation).

`lib/rheum-periop-v89.js surgicalApgar()` sums the three intraoperative point bands of the Surgical Apgar Score: estimated blood loss (≤100 mL=3, 101–600=2, 601–1000=1, >1000=0), lowest mean arterial pressure (≥70=3, 55–69=2, 40–54=1, <40=0), and lowest heart rate (≤55=4, 56–65=3, 66–75=2, 76–85=1, >85=0). The 0–10 sum carries the major-complication/death risk band; ≤ 4 flags high risk. This is the surgical score, distinct from the neonatal `apgar` tile (same name lineage, different instrument). A partial input renders a partial score without a risk band.

## Boundary worked examples added
- EBL 200, MAP 60, HR 80 -> 2 + 2 + 1 = 5, intermediate risk.
- EBL 50, MAP 80, HR 50 -> 3 + 3 + 4 = 10, low risk; EBL 2000, MAP 30, HR 120 -> 0, high risk.
- Band edges: EBL 100/101, 600, 1000/1001; MAP 70/69/54/39; HR 55/56/65/85/86.
- EBL 700, MAP 50, HR 70 -> 1 + 1 + 2 = 4, high risk.
- Partial (EBL + MAP only) -> partial score 4, no risk band.

## Cross-implementation differential
- Reference: Gawande 2007 Table 1 point bands, hand-summed for each example. Sophie matches. PASS.

## Edge-input handling notes
- Each input clamps to its band; a missing input contributes 0 points and suppresses the risk band (the score is labeled "partial"). No non-finite value reaches a returned string (spec-v59 fuzz harness covers the module, zero leaks).

## A11y / keyboard notes
- Three labeled numeric inputs; output aria-live="polite". 320px sweep passes with no horizontal scroll.

## Defects opened
- none

## Status
- PASS
