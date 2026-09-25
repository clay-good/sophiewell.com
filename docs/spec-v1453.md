# spec-v1453 — max-ICH score for intracerebral hemorrhage

The catalog had the original ICH score (`ich-score`, Hemphill 2001) and the ABC/2 volume
(`ich-volume-abc2`), but not the max-ICH score, which replaces the Glasgow Coma Scale with NIHSS
bands, splits age into four bands, sets the volume threshold by location and adds oral
anticoagulation.

## Sources

- Sembill JA et al, *Neurology* 2017;89:423-431 (DOI confirmed via Crossref): the derivation. Not
  open access.
- Schmidt FA et al, *Neurology* 2018;91:e939-e946 (open access, PMC6139815), read 2026-09-24. Its
  Table 1 gives the items and points this tool applies:

| item | 0 | 1 | 2 | 3 |
|---|---|---|---|---|
| NIHSS | 0-6 | 7-13 | 14-20 | 21 or more |
| age, years | 69 or less | 70-74 | 75-79 | 80 or more |
| hematoma volume | lobar under 30 mL, nonlobar under 10 mL | lobar 30 mL or more, nonlobar 10 mL or more | | |
| intraventricular hemorrhage | no | yes | | |
| oral anticoagulation | no | yes | | |

- Mrochen A et al, *Ann Clin Transl Neurol* 2025;12:1144-1150 (open access, PMC12172108), read
  2026-09-24: 5-year survival by score in 1022 maximally treated patients at one center (0: 85%,
  1: 91%, 2: 69%, 3: 59%, 4: 47%, 5: 32%, 6: 29%, 7: 18%, 8 or more: 0%). It names 9 as the top
  of the scale.

## Behavior

All six inputs are required. A blank field is asked for ("Enter ..." or "Choose ..."), never read as
0 or "no". NIHSS must be a whole number from 0 to 42. Age uses the `ageYears` envelope from
`lib/bounds.js` and is read in completed years. Volume must be from 0 to 2000 mL, since anything
larger is more than the whole adult intracranial volume. Range checks go through `inputFault` in
`lib/num.js`. The hematoma is lobar or nonlobar, and only that location's threshold applies, so
the total runs 0 to 9. The band gives Mrochen's 5-year survival for that score, and says it comes
from maximally treated patients. The notes list the points for each item, say that the high
categories held few patients, and give Schmidt's external validation result (AUC 0.80 to 0.86,
no better than the ICH score). `abnormal` is set from 2 up, where Mrochen's hazard of death first
differed from a score of 0. The score does not choose to limit care or any treatment.

## Tests

`test/unit/max-ich.test.js`: every band edge for NIHSS and age; the volume threshold by location;
the one-point items; totals of 0, 5 and 9 with their survival figures; the breakdown and caveat
notes; every blank field asked for; impossible values refused.
