# v12 audit - split-shared

- Auditor: CG
- Date: 2026-06-15
- Citation re-verified against: CMS Pub. 100-04 Ch. 12 30.6.18 split (or shared) visit policy (the 2024 PFS rule): in a facility setting, when a physician and an NPP each perform part of an E/M, the visit is billed by whoever performs the substantive portion -- more than half of the total time, OR a substantive part of the MDM. Modifier FS identifies the split/shared service. NPP billing pays at 85% of the physician fee schedule.

`lib/billing-v80.js splitShared()` selects the billing provider from the chosen basis (time: more-than-half; MDM: who performed it), always sets the FS modifier, and reports the payment percentage (physician 100%, NPP 85%).

## Boundary examples added
- Time basis, physician 20 of 35 -> physician bills, 100%.
- Time basis, NPP 25 of 35 -> NPP bills, 85%.
- MDM basis, NPP -> NPP bills, 85%.
- Exact time tie (15/15) -> flagged (neither exceeds half), not silently resolved.

## Cross-implementation differential
- Reference: the policy's "more than half of total time" rule and the 85% NPP percentage.
- Test case: physician 10 / NPP 25 -> NPP bills at 85%. Sophie result identical. PASS.

## Edge-input handling notes
- Time basis requires positive total time (RangeError otherwise); the MDM basis requires mdmBy in {physician, npp}. An unknown basis throws TypeError. No money is computed (a percentage, not a dollar figure), so no cents path.

## A11y / keyboard notes
- Basis + provider selects, two numeric time inputs; output aria-live="polite". 320px sweep passes.

## Defects opened
- none

## Status
- PASS
