# v12 audit - rosendaal-ttr

- Auditor: CG
- Date: 2026-06-30
- Citation re-verified against: Rosendaal FR, et al. Thromb Haemost 1993;69(3):236-239 (linear-interpolation method cross-verified against the TTR quality-metric literature; good-control >= 65% cross-verified; >= 2 sources, spec-v97).

`lib/gaps-v185.js rosendaalTtr()` is a deterministic, finite-guarded compute per the spec-v100 §2
doctrine; the renderer states it is decision support and defers the decision to
the clinician (spec-v11 §5.3).

## Source-governance notes
- an INR is linearly interpolated across the days between measurements; TTR = days-in-range/total-days.

## Boundary worked examples added
- out-of-range opening interval 80% (16/20); all-in-range 100%; poor control 0%; < 2 rows / bad target / same-day span -> valid:false.

## Edge-input handling notes
- the total-days divisor is guarded > 0; malformed / non-date lines are skipped; a bad target range surfaces a fallback. Covered by the spec-v59 fuzz harness, zero non-finite leaks.

## A11y / keyboard notes
- Labelled inputs (`<label for>`), output aria-live. 320px sweep, no horizontal
  scroll; touch targets meet the minimum.

## Defects opened
- none

## Status
- PASS
