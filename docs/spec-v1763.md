# spec-v1763 — Envelopes widened to recorded survivals

> Status: **SHIPPED (2026-11-21)**. The catalog stays 2,387.

`lib/bounds.js` refuses a value outside each quantity's envelope on the claim that it is not survivable or beyond
recorded extremes. spec-v1762 found two envelopes wrong (weight, potassium). An audit of the rest against primary
case reports found 16 more that would refuse a value from a patient who survived (or, for blood pressure, a living
person measured intra-arterially). Each bound now sits just past the most extreme verified value; the source is in a
`spec-v1763` comment beside it.

| Quantity | Was | Now | Verified extreme | Source |
|---|---|---|---|---|
| core temperature | 25-45 C | 13-47 C | 13.7 C; 46.5 C | PMID 10665559; PMID 7073052 |
| glucose | ≤ 2,000 mg/dL | ≤ 3,000 | 2,700 mg/dL, discharged on foot | PMID 21084169 |
| arterial pH | ≥ 6.5 | ≥ 6.3 | 6.33 after near drowning | PMID 9267961 |
| PaCO2 | ≤ 200 mmHg | ≤ 250 | 213.3 mmHg, discharged | PMID 42424244 |
| sodium | 90-200 mmol/L | 85-210 | 87; 208 | PMID 11099688; PMID 26031517 |
| creatinine | ≤ 25 mg/dL | ≤ 75 | 73.8 mg/dL | doi 10.1155/2021/6048919 |
| heart rate | ≤ 300 bpm | ≤ 600 | about 600; pre-excited AF above 300 without severe symptoms | PMID 22368381; PMID 4015920 |
| systolic / diastolic BP | ≤ 300 / 200 | ≤ 500 / 400 | above 480/350, intra-arterial | PMID 3980383 |
| bicarbonate | ≤ 60 mmol/L | ≤ 75 | 72.7 | doi 10.3390/diagnostics16030443 |
| calcium | ≤ 20 mg/dL | ≤ 25 | 23 mg/dL | PMID 42323684 |
| lactate | ≤ 40 mmol/L | ≤ 50 | 47.6, recovered | PMID 27974893 |
| WBC | ≤ 200 x10^3/uL | ≤ 2,000 | 1,755, recovered | PMID 39717192 |
| platelets | ≤ 2,000 x10^3/uL | ≤ 4,000 | 3,602 | PMID 32595470 |
| bilirubin | ≤ 60 mg/dL | ≤ 75 | 70.47 mg/dL | PMID 35383780 |
| magnesium | ≤ 10 mg/dL | ≤ 25 | 21.2 mg/dL (8.71 mmol/L), discharged | PMID 39021819 |

Kept: bicarbonate floor 2, hemoglobin ceiling 25, BUN ceiling 300 (no verified survivor past them). Each new bound sits
past the most extreme value verified here, not a proven world record; a later report past one is a reason to move it.

Tests that pinned the old bounds were updated to the new ones; none was weakened.
