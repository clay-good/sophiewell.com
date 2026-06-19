# v12 audit - nexus-chest-ct

- Auditor: CG
- Date: 2026-06-18
- Citation re-verified against: Rodriguez RM, Langdorf MI, Nishijima D, et al. PLoS Med. 2015;12(10):e1001883.

`lib/trauma-v108.js nexusChestCt()` applies the 7-criterion any-positive rule: if
all are negative, chest CT can be deferred; any positive criterion means chest CT
may be indicated, naming which criteria flagged. Class A.

## Boundary worked examples added
- all negative -> chest CT can be deferred.
- band flip: one positive criterion flips defer -> CT.
- multiple positives are named.
- all seven positive.

## Cross-implementation differential
- Reference: the 7 criteria (abnormal CXR, distracting injury, chest-wall/sternum/
  thoracic-spine/scapular tenderness, rapid deceleration, age > 60, intoxication,
  abnormal alertness) and the all-negative-rule-out logic cross-verified against the
  PLoS Med derivation/validation and MDCalc. >= 99 percent sensitive for major
  injury. Match. PASS.

## Edge-input handling notes
- applies to blunt thoracic trauma (stated as the entry condition); a rule-out aid,
  not an imaging order.

## A11y / keyboard notes
- Labeled checkboxes; output aria-live="polite". 320px sweep, no hscroll.

## Defects opened
- none

## Status
- PASS
