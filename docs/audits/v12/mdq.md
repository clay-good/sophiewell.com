# v12 audit - mdq

- Auditor: CG
- Date: 2026-06-17
- Citation re-verified against: Hirschfeld RM, Williams JB, Spitzer RL, et al. Development and validation of a screening instrument for bipolar spectrum disorder: the Mood Disorder Questionnaire. Am J Psychiatry. 2000;157(11):1873-1875.

`lib/psych-v96.js mdq()` applies the fixed three-gate boolean rule: a positive screen requires >= 7 of 13 symptom items YES AND co-occurrence YES AND moderate/serious impairment. The result names the failing gate(s) when negative.

## Boundary worked examples added
- positive: 7 symptoms YES + co-occurrence YES + moderate impairment -> positive (all three gates).
- serious impairment also satisfies the impairment gate.
- single-gate misses: 6 symptoms -> "below the 7-item threshold"; co-occurrence NO -> "did not co-occur"; impairment minor -> "below moderate". Each negative, each named.
- empty input is a safe negative (0 of 13).

## Cross-implementation differential
- Reference: Hirschfeld 2000 MDQ three-gate positive rule. Match. PASS.

## Edge-input handling notes
- A non-array symptoms input is treated as 0 endorsed; an unrecognized impairment level fails the gate and is reported as "functional impairment not rated". No arithmetic; no non-finite path. Fuzz harness covers the module; zero leaks.

## A11y / keyboard notes
- Thirteen labeled yes/no symptom selects + co-occurrence + impairment selects; output aria-live="polite". 320px sweep passes with no horizontal scroll. Screen, not a diagnosis.

## Defects opened
- none

## Status
- PASS
