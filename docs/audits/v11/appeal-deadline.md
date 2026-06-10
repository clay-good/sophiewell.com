# v11 audit - Medicare Appeal-Level Deadline (`appeal-deadline`)

- Auditor: CG
- Date: 2026-06-10
- Citation re-verified against: 42 CFR Part 405, Subpart I (redetermination 120 d / 405.942; QIC reconsideration 180 d / 405.962; OMHA/ALJ 60 d / 405.1014; Council 60 d / 405.1102; federal court 60 d). CY2026 AIC per Federal Register 2025-21879 (ALJ $200, court $1,960). spec-v63 §3.1.

## Boundary examples added
- initial determination, decision 2026-01-15 -> redetermination by 2026-05-15 (120-day window), no AIC.
- reconsideration (QIC), decision 2026-05-01 -> ALJ by 2026-06-30 (60 d), AIC gate $200 (CY2026).
- council -> federal court AIC $1,960; unknown level -> null; malformed date throws RangeError.

## Cross-implementation differential
- Deadlines computed through lib/deadline.js (calendar basis). 2026-01-15 + 120 d = 2026-05-15; 2026-05-01 + 60 d = 2026-06-30. Hand-checked against a date calculator. PASS.

## Edge-input handling notes
- Each step's window is a named constant; an unrecognized level returns null (renderer prompts to select). Invalid/empty date throws RangeError via the strict parser (caught by safe()). days-remaining/past-due use the live clock and are not asserted in the deterministic example. AIC thresholds are annually indexed; the tile states CY2026 and notes "confirm the current-year amount." PASS.

## A11y / keyboard notes
- A labeled level <select> + a native date input, Tab order = source order; aria-live output, past-due flagged via the `warn`/`flag` class. test:a11y clean; 320px no-hscroll sweep clean. PASS.

## Defects opened
- none

## Status
- PASS
