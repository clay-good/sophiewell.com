# v11 audit - HIPAA Breach 60-Day Clock (`breach-clock`)

- Auditor: CG
- Date: 2026-05-18
- Citation re-verified against: HIPAA Breach Notification Rule, 45 CFR §§164.404 (individual notice; 60-day deadline), 164.406 (media notice; >=500 in a state/jurisdiction), 164.408 ((b) HHS contemporaneous for >=500, (c) HHS annual log for <500 due 60 days after end of calendar year of discovery). Pinned to the current eCFR text as of 2026-05-18; the 60-day language is unchanged since the 2013 Omnibus Rule.

## Boundary examples added
- META example: discovery 2026-03-15, n=600 -> 600 >= 500 (large breach). Individual + media + HHS notice all due 2026-03-15 + 60 days = 2026-05-14. PASS.
- low (sub-500): discovery 2026-01-15, n=10 -> individual notice 2026-03-16; HHS annual log due 2027-03-01 (60 days after 2026-12-31).
- high (year boundary): discovery 2026-12-15, n=10 -> individual notice 2027-02-13 (61st day; 60-day window crosses year boundary); HHS annual log due 2027-03-01.
- threshold edge: n=499 vs n=500 -> 499 falls under <500 rule (annual log), 500 triggers contemporaneous HHS + media notice. Confirmed in `breachNotificationDeadlines` via `isLarge = affectedIndividuals >= 500`.

## Cross-implementation differential
- Reference implementation: hand calculation against the eCFR text. 60 calendar days from a UTC midnight discovery date yields `discovery + 60 days` exactly; HHS annual log = `(Dec 31 of discovery year) + 60 days`.
- Test case: 2026-03-15, n=600 -> 2026-05-14 (60 days). Hand: March 31 - 15 = 16 + April 30 + May 14 = 60. PASS.
- Sophie result and reference result match to 0 days across all four boundary examples. PASS.

## Edge-input handling notes
- `parseIsoDateUtc` rejects malformed strings (`RangeError`) and date components that do not form a real date (e.g., 2026-02-30).
- `affectedIndividuals` must be a non-negative integer; non-integers, negatives, NaN, and Infinity all throw `TypeError`. The renderer floors the input before passing to the function so `0.5` becomes `0` rather than throwing.
- UTC anchoring (per source comment) prevents DST / locale drift in the day arithmetic.
- Citation passes spec-v11 §3.5 no-bare-URL guard.

## A11y / keyboard notes
- Two labelled inputs; result list is a semantic `<ul>` with a clear "Recipients" subheading and a muted footer note linking back to "without unreasonable delay" language. `npm run test:a11y` clean.

## Defects opened
- none

## Status
- PASS
