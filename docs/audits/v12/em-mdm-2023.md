# v12 audit - em-mdm-2023

- Auditor: CG
- Date: 2026-06-15
- Citation re-verified against: AMA CPT 2023 Evaluation and Management Guidelines. The 2021 office 2-of-3 MDM grid (number/complexity of problems addressed; amount/complexity of data reviewed; risk of complications) was extended to inpatient/observation (99221-99233), emergency department (99281-99285), nursing facility (99304-99310), and home/residence (99341-99350; 99343 deleted in 2023). The level is the highest met or exceeded by at least 2 of the 3 elements.

`lib/billing-v80.js emMdm2023()` reuses the office 2-of-3 leveling (level = highest L met by >=2 of 3) and maps the level to the setting-specific code. Inpatient initial/subsequent and nursing-facility initial collapse straightforward and low into one code; ED begins at 99282 (99281 does not require physician presence); SNF subsequent and the home families do not collapse. The office setting defers to the existing em-mdm output shape (both new and established codes), pinned byte-identical.

## Boundary examples added
- ED, Moderate (problems 4 / data 4 / risk 2) -> 99284; limiting element = risk.
- Inpatient initial, High (5/5/5) -> 99223; Moderate (4/4/2) -> 99222.
- SNF subsequent, Moderate -> 99309; High -> 99310; straightforward -> 99307; low -> 99308 (no collapse).
- Home new, Moderate -> 99344; High -> 99345.
- Office defers: Moderate -> new 99204 / established 99214 (matches ops-v63 emMdm).

## Cross-implementation differential
- Reference: the AMA 2023 setting code tables, leveled by hand on the 2-of-3 rule.
- Test case: ED problems 5 / data 5 / risk 2 -> High -> 99285. Sophie result identical. PASS.
- The office fork is regression-pinned against ops-v63 emMdm (99204/99214 for Moderate), so the office tile's output is unchanged.

## Edge-input handling notes
- Each element validates in [2,5] (num()); an out-of-range or non-numeric element throws RangeError/TypeError caught by safe(). An unknown setting throws TypeError.
- No money, no dates; the only outputs are a code string, the MDM label, and the limiting-element list, all built from validated values.

## A11y / keyboard notes
- Setting + three MDM elements are labeled <select>s; output aria-live="polite". 320px no-horizontal-scroll sweep passes.

## Defects opened
- none

## Status
- PASS
