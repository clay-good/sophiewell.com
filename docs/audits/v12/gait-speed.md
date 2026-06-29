# v12 audit - gait-speed

- Auditor: CG
- Date: 2026-06-29
- Citation re-verified against: Studenski S, Perera S, Patel K, et al. Gait speed and survival in older adults. JAMA. 2011;305(1):50-58; Fritz S, Lusardi M. Walking speed: the sixth vital sign. J Geriatr Phys Ther. 2009;32(2):46-49. The m/s cut-points (< 0.6 high risk, < 0.8 limited community ambulation, >= 1.0 healthy) cross-verified (>= 2 sources, spec-v97).

`lib/ltcga-v176.js gaitSpeed()` returns distance / time in m/s with a guarded denominator. Group E (returns a value), Class A.

## Source-governance notes
- speed = distance / time; the time denominator is finite/positive-guarded -> a zero/blank/non-finite time returns valid:false, never Infinity/NaN (spec-v59 division path explicitly fuzzed).
- Cut-points: < 0.6 high risk of adverse outcomes; < 0.8 limited community ambulation; 0.8-0.99 reduced; >= 1.0 healthy. Journal issuer; does not trip ISSUER_PATTERN; no citation-staleness row.

## Boundary worked examples added
- 4 m / 5 s = 0.8 m/s; the 0.8 limited-community-ambulation cut (0.74 limited vs 0.80 reduced); < 0.6 high and >= 1.0 healthy; zero/blank/negative time and zero distance -> valid:false.

## Edge-input handling notes
- distance > 0 and time > 0 enforced; otherwise valid:false; never Infinity/NaN (spec-v59 fuzz pass, division path).
