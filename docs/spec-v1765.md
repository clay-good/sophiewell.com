# spec-v1765 — Eight more envelopes widened to recorded survivals

> Status: **SHIPPED (2026-11-21)**. The catalog stays 2,387.

A second audit (method as spec-v1763: each value read in a PubMed or PMC abstract or full text, survival stated
there) covered the envelopes spec-v1763 left out. Eight refused a value measured in a living patient:

| Quantity | Was | Now | Verified extreme | Source |
|---|---|---|---|---|
| INR | ≤ 20 | ≤ 200 | 189 after brodifacoum, doing well at 5 months | PMID 14524650 |
| chloride | 50-160 mmol/L | 45-180 | 48; 175 measured (bromide interference) | PMID 34912633; PMID 37069868 |
| hematocrit | ≤ 75 % | ≤ 90 | 88% in a recipient twin, good outcome | PMID 19372698 |
| hemoglobin | ≤ 25 g/dL | ≤ 26 | 25.3 | PMID 31568062 |
| BUN | ≤ 300 mg/dL | ≤ 310 | 306.7, survived on dialysis | PMID 28979444 |
| phosphate | ≤ 20 mg/dL | ≤ 60 | 55 (17.75 mmol/L), survived without sequelae | PMID 18408952 |
| triglycerides | ≤ 30,000 mg/dL | ≤ 35,000 | 33,727, discharged | PMID 33879184 |
| bicarbonate | ≥ 2 mmol/L | ≥ 1 | 1.5, recovered | PMID 41584389 |

Kept: albumin ≤ 7 g/dL (nothing verified above 6.5) and BMI 5-200 (stated values 7.7 and 187.3 fit; a computed 224
from one admission weight was not counted). The page's HTML limits that equaled the old bounds moved with them (17
fields), and tools with their own narrower cap on these quantities now read the envelope.
