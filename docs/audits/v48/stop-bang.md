# v48 derivation provenance — STOP-BANG (`stop-bang`)

- Auditor: CG
- Date: 2026-05-26
- Wave: 48-4d
- Citation re-verified against: Chung F, Yegneswaran B, Liao P, et al. *STOP questionnaire: a tool to screen patients for obstructive sleep apnea.* Anesthesiology. 2008;108(5):812-821. BANG extension: Chung F, Subramanyam R, Liao P, Sasaki E, Shapiro C, Sun Y. *High STOP-Bang score indicates a high probability of obstructive sleep apnoea.* Br J Anaesth. 2012;108(5):768-775.

## Components — verbatim source mapping

Eight yes/no items each contributing +1; total 0-8 per Chung 2008/2012.

| Letter | Item | Points |
|---|---|---|
| S | Snoring loudly (louder than talking, or heard through closed doors) | +1 |
| T | Tiredness / daytime sleepiness | +1 |
| O | Observed apnea during sleep | +1 |
| P | High blood Pressure (treated or untreated) | +1 |
| B | BMI > 35 kg/m² | +1 |
| A | Age > 50 years | +1 |
| N | Neck circumference > 40 cm | +1 |
| G | Male sex / Gender | +1 |

## Bands — source mapping (Chung 2012 Table 3)

| Range | Source label |
|---|---|
| 0-2 | low risk for OSA |
| 3-4 | intermediate risk for OSA |
| ≥ 5 | high risk for moderate-to-severe OSA |

## Population

Chung 2008 derivation: 2467 surgical patients at a preoperative clinic in Toronto, with polysomnography in 211. Chung 2012 high-score validation: 6369 surgical patients across 13 hospitals; high-risk cutoff (≥5) shown to have higher specificity for moderate-to-severe OSA than original STOP cutoff (≥2).

## Validity

Adult preoperative / surgical patients. STOP-BANG is a screening instrument; a positive screen warrants further evaluation (e.g., polysomnography), not a diagnosis. Not validated as a stand-alone diagnostic in pediatrics, pregnancy, or in patients with prior OSA diagnosis.

## Source quote

"A STOP-Bang score of 5-8 identified patients with high probability of moderate-to-severe OSA." — Chung 2012 §Results, supporting Table 3.

## Renderer assertions

Verified locally:
- `META['stop-bang'].derivation` has every required field per `lib/derivation.js validate()` and exactly 8 components.
- Components sum equals `stopBang().score` at four boundary points (0, 3, 5, 8).

## Defects opened
None.
