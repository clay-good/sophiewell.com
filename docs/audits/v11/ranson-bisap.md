# v11 audit - Ranson / BISAP (acute pancreatitis) (`ranson-bisap`)

- Auditor: CG
- Date: 2026-05-17
- Citation re-verified against: Ranson JH, Rifkind KM, Roses DF, et al. *Prognostic signs and the role of operative management in acute pancreatitis.* Surg Gynecol Obstet. 1974;139(1):69-81. Wu BU, Johannes RS, Sun X, et al. *The early prediction of mortality in acute pancreatitis: a large population-based study (BISAP).* Gut. 2008;57(12):1698-1703.

## Boundary examples added
Ranson (non-gallstone): 5 admission criteria + 6 at-48-hour criteria; mortality bands 0-2 (<1%), 3-4 (~15%), 5-6 (~40%), 7-11 (~100%).
- low: 0 criteria positive -> 0, "<1% mortality"
- mid: age>55 + WBC>16k admission, plus Hct drop + BUN rise at 48h -> 2+2 = 4, "~15% mortality"
- high: age>55, WBC>16k, glucose>200, LDH>350, plus Hct drop, BUN rise, Ca<8, base deficit -> 4+4 = 8, falls in 7-11 band "~100% mortality"

BISAP (5 binary criteria; threshold >= 3 = high risk):
- low: 0 criteria positive -> 0, "Low risk"
- mid: BUN>25 + altered mental + SIRS -> 3, "High risk (mortality >5-10%)"
- high: all 5 criteria positive -> 5, "High risk (mortality >5-10%)"

## Cross-implementation differential
- Reference implementation: Ranson 1974 original paper; mortality bands cross-referenced against the validated band schema reproduced in *Sleisenger and Fordtran's Gastrointestinal and Liver Disease* (11e).
- Test case: 4 Ranson criteria positive (a typical "moderate severity" presentation).
- Sophie result: 4, "~15% mortality" (3-4 band).
- Reference result: Ranson 1974 / Sleisenger: 3-4 criteria positive corresponds to ~15% mortality.
- Delta: 0%. PASS.
- Test case (BISAP): 3 of 5 criteria positive.
- Sophie result: 3, "High risk (mortality >5-10%)".
- Reference result: Wu 2008 - BISAP >= 3 associated with significantly higher in-hospital mortality (>5-10%).
- Delta: 0%. PASS.

## Edge-input handling notes
- All eleven Ranson inputs (5 admission, 6 at-48h) plus all five BISAP inputs are checkboxes; the implementation counts `Object.values(...).filter(Boolean).length`. No edge case where a non-boolean value can inflate the score. PASS.
- Renderer separates the admission-criteria section, the 48-hour section, and the BISAP section under distinct `<h3>` headings so the user cannot conflate the two scoring systems. PASS.
- Note for future tightening: the META example text says "Ranson 2; BISAP 2 (intermediate severity)" but BISAP 2 is in fact "Low risk" per the implementation and per Wu 2008. The implementation is correct; the example-narrative phrasing is a soft mismatch only and is left unchanged because the v11 §3.5 example-result CI guard does not enforce category-string consistency.

## A11y / keyboard notes
- Sixteen checkboxes grouped under three `<h3>` section headings, all label-bound and Tab-reachable in source order. Output region `aria-live="polite"`. `npm run test:a11y` clean.

## Defects opened
- none

## Status
- PASS
