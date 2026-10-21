# spec-v1656 — Occupational and employee health rules as arithmetic

> Status: **SHIPPED (2026-10-19)**: all six tools.

The build of the [occupational-employee-health](../openspec/changes/occupational-employee-health/proposal.md)
change proposed in [spec-v1654](spec-v1654.md). Every number in these tools was read on the eCFR (titles 29 and 49
current to October 16, 2026) on October 19, 2026.

## What shipped

| Tool | What it answers | Source read |
|---|---|---|
| `osha-noise-dose` | Noise dose and 8-hour TWA from a day of level-and-duration segments, or from a dosimeter dose; the 50% action level and the 100% limit | 29 CFR 1910.95 (c), (d)(2)(i), Table G-16, Appendix A |
| `osha-standard-threshold-shift` | Whether an annual audiogram shows a standard threshold shift, uncorrected and with the Appendix F age correction | 29 CFR 1910.95 (g)(7) to (g)(10), Appendix F, Tables F-1 and F-2 |
| `osha-lead-medical-removal` | When the next blood lead test is due, whether removal is required, and whether return is met | 29 CFR 1910.1025 (j)(2), (k)(1) |
| `fmcsa-bp-certification` | Commercial driver blood pressure stage and the certificate length FMCSA's advisory criteria give | 49 CFR Part 391 Appendix A section E; 391.45(b) |
| `fmcsa-hearing-standard` | Whether a driver meets the forced whisper or the 40 dB audiometric standard, with ISO converted to ANSI | 49 CFR 391.41(b)(11); Appendix A section I |
| `osha-lead-airborne-pel-shift` | The airborne lead limit for a day over 8 hours, 400 ÷ hours, with the action level | 29 CFR 1910.1025 (b), (c)(1), (c)(2) |

Worked examples are the regulations' own where they print one: Appendix F's 32-year-old (4000 Hz shift 20,
age-corrected 17), and Appendix A's dose-to-TWA rows (50% → 85.0, 91% → 89.3, 100% → 90.0, 200% → 95.0, 500% → 101.6)
in the unit tests.

## The gates, as read

| Gate | Answer on the eCFR |
|---|---|
| 1.1 Levels below 80 dBA | §1910.95(d)(2)(i): "All continuous, intermittent and impulsive sound levels from 80 decibels to 130 decibels shall be integrated." A segment below 80 adds nothing; one above 130 is refused. |
| 1.2 The lead averaging window | §1910.1025(k)(1)(i)(B): the last three tests "or the average of all blood sampling tests conducted over the previous six (6) months, whichever is longer"; no removal if the last test is below 40. |
| 1.3 FMCSA limits | §391.41(b)(11): a better-ear average not "greater than 40 decibels" at 500, 1,000 and 2,000 Hz. §391.45(b): examination at least every 24 months. |
| 1.4 µg/100 g and µg/dL | No paragraph states them equal. Results are taken in µg/100 g as entered, and the page says so. |

## What changed from the proposal

- **Stage 3 is written "and".** Appendix A section E gives Stage 3 as "180 (systolic) and 110 (diastolic)", while
  Stages 1 and 2 say "and/or". The design assumed "and/or" throughout. A reading with one value at Stage 3 levels is
  put in Stage 3 (the stricter reading), and the result says the appendix's wording differs.
- **The threshold shift asks for 2000, 3000 and 4000 Hz only.** The shift is defined on those three. Tables F-1 and
  F-2 were diffed in full (41 rows each, five frequencies) against the spec-v1654 transcription and matched; the
  tool carries the three columns it uses.
- **The lead average needs three results.** With fewer, the "whichever is longer" comparison cannot be made, so the
  rule is reported as not evaluated rather than as passed. "Previous six months" is counted back from the last test.
- **Removal moves testing to monthly.** When removal is required, the next test date follows (j)(2)(i)(C).
- **The airborne tool does not apply respirator credit**, which (c)(3) allows for compliance; the page says so.
- **The eCFR watch is the existing one.** `scripts/data/watch-ecfr.mjs` reads each section named in a citation, so
  1910.95, 1910.1025, 391.41 and 391.45 are watched. Part 391 Appendix A has no section number and is not.
- **Search phrases were held off older tools' words.** A first draft took "noise", "lead", "age", "standard" and
  nine other one-word queries from the tools that owned them; the phrases were lengthened until none moved, and
  `test/unit/ambiguous-pick-order.test.js` now pins "noise" and "lead".

## Proof

- `test/unit/occupational-health-v1656.test.js`: Table G-16a from the formula, Table A-1 rows, every Table G-16
  duration making a 100% dose, the Appendix F example, the 10 dB boundary, the lead frequency switch at 40, both
  removal rules and return, each FMCSA stage boundary and interval, the 40 dB boundary with ISO conversion, and
  400 ÷ 10 = 40.
- `test/unit/fuzz-tools.test.js` runs all six modules; `test/mcp/mcp-search-relevance.test.js` has one probe per tool.
