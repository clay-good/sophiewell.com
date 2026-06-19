# v12 audit - hat-score

- Auditor: CG
- Date: 2026-06-19
- Citation re-verified against: Lou M, Safdar A, Mehdiratta M, et al. The HAT Score: a simple grading scale for predicting hemorrhage after thrombolysis. Neurology. 2008;71(18):1417-1423 (open-access full text PMC2676961, Table 1; symptomatic-ICH series cross-verified against the PubMed abstract 18955684).

`lib/neuro-v117.js hatScore()` sums the three HAT items to 0-5: NIHSS
(<15=0/15-20=+1/>20=+2), CT hypodensity (none=0/<=1/3 MCA=+1/>1/3=+2), and
diabetes or glucose > 200 mg/dL (+1). The symptomatic-ICH series is verbatim
from the paper: 2% / 5% / 10% / 15% / 44% at 0 / 1 / 2 / 3 / >3. Class A.

## Boundary worked examples added
- NIHSS 22, >1/3 MCA hypodensity, diabetes -> 5/5, sICH ~44%.
- NIHSS 10, no hypodensity, no diabetes -> 0/5, sICH ~2%.
- NIHSS 18 (+1), <=1/3 MCA (+1) -> 2/5, sICH ~10%.
- NIHSS band boundaries: 15 -> +1, 20 -> +1, 21 -> +2.
- missing NIHSS renders a complete-the-fields fallback.

## Cross-implementation differential
- Reference: the point table and the symptomatic-ICH series (2/5/10/15/44%)
  match the paper verbatim. NO-FABRICATION: the paper's per-score "any ICH"
  series is figure-locked and was not recoverable from accessible text, so the
  tile reports the verbatim symptomatic-ICH series ONLY and does not invent an
  any-ICH series. One aggregator (Evidencio) duplicated the sICH numbers into an
  "any ICH" column -- rejected as an extraction artifact. Match. PASS.

## Edge-input handling notes
- NIHSS is the only required number; hypodensity is a select, diabetes a boolean.
  The sICH lookup index is clamped 0-5. A scalar fuzz arg yields a valid:false
  fallback.

## A11y / keyboard notes
- One labeled number input, one select, one checkbox; output aria-live="polite".
  320px sweep, no hscroll.

## Defects opened
- none

## Status
- PASS
