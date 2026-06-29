# v12 audit - doloplus-2

- Auditor: CG
- Date: 2026-06-29
- Citation re-verified against: Wary B, Doloplus collective; Lefebvre-Chapiro S. The Doloplus-2 scale — evaluating pain in the elderly. Eur J Palliat Care. 2001;8(5):191-194. Ten items, the 5 somatic / 2 psychomotor / 3 psychosocial domain split, 0-3 per-item scoring, 0-30 range, and the >= 5 pain threshold cross-verified against doloplus.fr and the BMC Geriatrics systematic review (>= 2 sources, spec-v97).

`lib/ltcga-v175.js doloplus2()` sums 10 items to 0-30 across three domain subtotals. Group G, Class A.

## Source-governance notes
- Ten items: somatic (5: complaints, protective posture at rest, protection of sore areas, facial expression, sleep pattern), psychomotor (2: washing/dressing, mobility), psychosocial (3: communication, social life, behavioural problems), each 0-3.
- Total 0-30 (somatic 0-15, psychomotor 0-6, psychosocial 0-9); a score of 5 or more indicates the presence of pain.
- Journal issuer; doloplus.fr is the maintaining collective's reference site, not an uppercase society acronym, so does not trip ISSUER_PATTERN; no citation-staleness row.

## Boundary worked examples added
- 0/30 below threshold; the 4->5 pain-threshold boundary; domain subtotals add to the total; 30/30 ceiling with subscale ceilings (15/6/9); out-of-range (4) and blank -> valid:false.

## Edge-input handling notes
- Each item validated to 0-3; any null/blank/out-of-range -> valid:false; never NaN (spec-v59 fuzz pass).
