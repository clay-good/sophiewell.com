# spec-v1668 — Independent review of the medication-safety, controlled-substance and Part D tools (v1634, v1637, v1638)

> Status: **SHIPPED (2026-10-20)**: hardening, no new tool (catalog stays 2,362). Follows [spec-v1667](spec-v1667.md).

Two reviewers ran the 29 libs in `lib/*-v1634.js` and the 46 in `lib/*-v1637.js` and `lib/*-v1638.js` on edge inputs.
The check digits (DEA, NDC to GTIN, GS1) agreed with their published examples. Thirteen defects are fixed.

| Tool | Input | Was | Now |
|---|---|---|---|
| `stopp-start-v3` | diabetes with proteinuria, eGFR 30 | START J1 (ACE-I or ARB) dropped: coded "eGFR > 30" | listed: the criterion reads "unless ... eGFR < 30", so 30 qualifies |
| `stopp-start-v3` | no eGFR entered | J1 and B7 listed with no word that their kidney condition was not tested | a "not checked" note names them |
| `disproportionality-2x2` | a = 8, b = 1,000, c = 77, d = 20,000 | "the lower bound of the ROR interval is 1, above 1" | 1.001 |
| `ade-cost-avoidance` | "high, $1,500" | a cost of 1 and a count of 500 | refused: a thousands separator is asked about |
| `fda-adverse-event-report-clock` | received 2099-01-01 | "due January 16, 2099, 26,386 days from today" | refused: after today |
| `icer-dominance` | A 100/1, B 100/2 | "B does more and costs more than A, at 0 per unit" | B dominates A at the same cost |
| `peds-heparin-nomogram` | aPTT 49.5 or 120.5 seconds | "between two rows" | the "<50" and ">120" rows |
| `partd-prompt-pay-clock` | deficiency notice before receipt; paid before sent | "not deemed clean" | refused |
| `otp-take-home-limit` | treatment day 10 with dates that give day 293 | the typed day silently won (7-day ceiling) | refused: the two disagree |
| `gs1-drug-barcode-parser` | expiration (17)270200 | "flagged" in a note, but `problems` empty and not abnormal | a problem, flagged |
| `ltc-mrr-tracker` | a review or report after the as-of date | "-42 days since the last review" | the row is not read, and says why |
| `ltc-mrr-tracker` | admitted on September 30, checked October 1 | September counted as a missed month, unexplained | still counted (the tool's calendar-month reading), with a note that the stay began partway through it |
| `mtm-service-clock` | opt-out before enrollment | 0 days enrolled, "no TMR in Q1" | refused |
| `pharmacy-effective-rate` | paid 120 on an AWP of 100 | "AWP - -20%" | "AWP + 20%" |

## Proof

`test/unit/review-fixes-v1634-v1638.test.js` holds each reviewer input. One older test ran a 2028 receipt date against a
2026 today; it now runs on a 2028 today.
