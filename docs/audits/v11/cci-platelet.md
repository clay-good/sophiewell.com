# v11 audit - cci-platelet

- Auditor: CG
- Date: 2026-06-06 (spec-v55)
- Citation re-verified against: AABB Technical Manual, 20th ed., 2020. CCI = (post - pre platelet, x10^9/L) x 1000 x BSA (m^2) / dose (x10^11). The x1000 converts the x10^9/L increment to per-uL so the conventional CCI scale (good >7500) holds.

`lib/clinical-v6.js cciPlatelet()` computes CCI and flags refractory (<7500). The HLA-matched-platelet note fires for a low CCI; clinical refractoriness needs two sequential low CCIs.

## Boundary examples added
- adequate: 10->40, BSA 1.8, dose 3.0 -> 30*1000*1.8/3.0 = 18000.
- refractory: 10->15, BSA 1.7, dose 3.5 -> 5*1000*1.7/3.5 = 2429.
- boundary: 20->40, BSA 1.5, dose 4.0 -> 20*1000*1.5/4.0 = 7500 (adequate; <7500 is strict).
- no rise: post == pre -> 0 (refractory).

## Cross-implementation differential
- Hand-calc (40-10)*1000*1.8/3.0 = 18000. Sophie 18000. PASS.

## Edge-input handling notes
- dose floor 0.1 (num min) prevents divide-by-zero; negative increment (post<pre) yields a negative CCI flagged refractory.

## A11y / keyboard notes
- Four labeled inputs, aria-live results. test:a11y clean.

## Defects opened

- none

## Status
- PASS
