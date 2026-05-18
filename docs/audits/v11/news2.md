# v11 audit - news2

- Auditor: CG
- Date: 2026-05-18
- Citation re-verified against: Royal College of Physicians. *National Early Warning Score (NEWS) 2: Standardising the assessment of acute-illness severity in the NHS - Updated report of a working party.* London: RCP, 2017. Table 1 (parameter scoring) and Table 2 (clinical-response trigger thresholds).

Aggregate score 0-20 over respiratory rate, SpO2 (Scale 1 or Scale 2 hypercapnic), supplemental-oxygen flag, systolic BP, pulse, ACVPU consciousness, and temperature. RCP 2017 §3.4 documents the Scale 2 target range 88-92% and the on-air vs on-supplemental-O2 columns for SpO2 93-94, 95-96, and >=97. `lib/scoring-v4.js news2()` implements the eight-parameter sum and the four-band trigger (Low / Low-medium / Medium / High); a single parameter scoring 3 flips Low-medium aggregates to Medium per RCP 2017 Table 2. New-confusion (C in ACVPU) is treated equal to V/P/U as the source instructs.

## Boundary examples added
- low: rr 14, spo2 98, scale1, room air, sbp 124, pulse 78, A, t 37.0 -> 0 (Low; routine 12-hourly monitoring).
- mid: rr 22, spo2 95, scale1, room air, sbp 108, pulse 102, A, t 37.8 -> 5 (Medium; urgent review). Matches the spec-v12 §3.1.1 worked example arithmetic (RR 2 + SpO2 1 + air 0 + SBP 1 + HR 1 + A 0 + T 0 = 5).
- high: rr 30, spo2 88, scale1, on O2, sbp 80, pulse 140, U, t 34.5 -> >=7 (High; continuous monitoring + emergency assessment).

Band-edge / Scale 2 cases:
- single-parameter 3 trigger: rr 14, spo2 91, scale1, room air, sbp 124, pulse 78, A, t 37.0 -> total 3 with SpO2 = 3 -> Medium per RCP 2017 Table 2 even though aggregate is below 5.
- Scale 2 on air: spo2 90 with `scale2: true` and no supplemental O2 -> SpO2 component is 0 (target band 88-92% per RCP 2017 §3.4).
- Scale 2 on supplemental O2: spo2 97 with `scale2: true` and `onO2: true` -> SpO2 component is 3 (over-oxygenation column of RCP 2017 Table 1).

## Cross-implementation differential
- Reference implementation: RCP 2017 NEWS2 published worked example (RCP 2017 §4.1, Box 1) and the parameter weights in Table 1.
- Test case: rr 22, spo2 95 (Scale 1), room air, sbp 108, pulse 102, A, t 37.8.
- Sophie result: 5; Medium band; per-parameter [2, 1, 0, 1, 1, 0, 0].
- Reference result: 5; Medium clinical-response per RCP 2017 Table 2.
- Delta: 0 / one ordinal category. PASS.

## Edge-input handling notes
- Inputs are typed `number` and validated by the renderer's `safe()` wrapper; non-numeric or empty fields short-circuit with the standard error block.
- Scale 2 vs Scale 1 selection is a single toggle; the renderer label quotes RCP 2017 §3.4 verbatim so a clinician can confirm hypercapnic-respiratory-failure applicability before choosing.
- The "On supplemental oxygen" flag only contributes 2 points when checked and additionally re-maps the Scale 2 SpO2 bands for 93-94, 95-96, and >=97 per Table 1.
- Consciousness select includes A / C / V / P / U; C scores 3 (equal to V/P/U) per RCP 2017 §3.6 "new confusion".

## A11y / keyboard notes
- Five labeled `number` inputs, two labeled checkboxes, one labeled select. All Tab-reachable in source order; output region `aria-live="polite"`. `npm run test:a11y` clean after the tile was added.

## Defects opened
- none

## Status
- PASS
