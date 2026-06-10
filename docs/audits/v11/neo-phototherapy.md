# v11 audit - Neonatal Phototherapy Threshold (`neo-phototherapy`)

- Auditor: CG
- Date: 2026-06-10
- Citation re-verified against: Kemper AR, et al. Clinical Practice Guideline Revision: Management of Hyperbilirubinemia in the Newborn Infant 35 or More Weeks of Gestation. Pediatrics. 2022;150(3):e2022058859. spec-v62 §3.3.

## Source-curve pinning (the wave-1 deferral reason)
- The wave-1 note deferred this tile because the AAP-2022 treatment thresholds are continuous risk-stratified nomograms. The phototherapy curve was already encoded and validated for `bhutani-bilirubin` (`aapPhotoThreshold`, lib/scoring-v6.js); wave 2 adds the exchange-transfusion curve (`aapExchangeThreshold`) read from the published AAP-2022 Figure 6 (no-risk) at the same 0/24/48/72/96h+ anchors, by gestational-age band (>=38, 37, 36, 35 wk — the exchange figure's bands). The "1 or more risk factors" curve sits ~3.5 mg/dL lower (Fig 6b), applied as an offset.
- AAP "escalation of care" is defined as TSB within 2 mg/dL of the exchange threshold (NICU admission, q2h rechecks); encoded as `escalationThreshold = exchange - 2`.
- Threshold flattens to the 96h anchor after 96h (the published curve rises only ~0.5-1 mg/dL further by 14d) — this keeps the threshold on the conservative (lower) side for a decision-support flag.

## Boundary examples added
- example: 38 wk, 48 h, TSB 18, no risk -> photo 16, exchange 25, escalate 23; TSB 2 mg/dL above the phototherapy line.
- below-line: 40 wk, 24 h, TSB 8 -> below the phototherapy threshold (margin negative).
- exchange-crossed: 35 wk, 96 h, TSB 26 with risk factors -> at/above the exchange line (emergent band).
- risk-lowers-both: 38 wk, 96 h with risk factors -> both photo and exchange thresholds drop vs no-risk.

## Cross-implementation differential
- Phototherapy line cross-checks against `bhutani-bilirubin` (same `aapPhotoThreshold`): 38 wk / 48 h -> 16 mg/dL in both tiles. PASS.
- Exchange anchors cross-checked against the AAP-2022 Figure 6 curves (no-risk and 1+-risk). Decision-support framing; the tile note directs the user to confirm against the AAP chart / BiliTool. PASS.

## Edge-input handling notes
- `gaWeeks` bounded [35,44], `ageHours` [0,336], `tsb` [0,50]. A 30-wk GA or NaN TSB throws RangeError/TypeError, caught by `safe()`. No non-finite leak. PASS.

## A11y / keyboard notes
- Three labeled numeric inputs plus a labeled risk-factor checkbox, Tab order = source order; `aria-live="polite"` output, band coloring via the `warn` class. `npm run test:a11y` clean. PASS.

## Defects opened
- none

## Status
- PASS
