# spec-v1711 — NHSN's p-value and interval on the SAAR

> Status: **SHIPPED (2026-11-07)**: an enhancement to `au-rate-saar`; the catalog stays 2,386. Third use of the NHSN
> macro port from [spec-v1709](spec-v1709.md).

## Source

NHSN's *Using the Statistics Calculator* guide (cdc.gov/nhsn/pdfs/ps-analysis-resources/StatsCalc.pdf) has an option
called "Compare Single Standardized Ratio (for example, SIR) to 1". Its ratio types are the SIR, SUR, SAAR, pSIR and
SRIR. It reports a p-value and a 95% interval for any of them. Those figures are the macros ported and checked in
spec-v1709: the mid-P exact p-value (Byar's approximation above 100 observed) and the mid-P exact interval.

## What changed

- `lib/au-rate-saar-v1636.js`: when a SAAR is shown, the result adds `saarP`, `saarLower` and `saarUpper`, plus a note
  that reads them the way the NHSN guide does.
- **When there is no p-value or interval**, and the note says which reason applies:
  - fewer than 1 predicted day (the macro returns nothing there);
  - a fractional count of observed days;
  - more than 1,000,000 observed days (the interval's summation grows with the count, and this keeps the page fast).
- The band and the worked example are unchanged.
- Tests in `test/unit/review-fixes-v1631-v1636.test.js`:
  - the SIR guide's printed case read as a SAAR (p 0.1251, 0.775 to 4.686);
  - the Byar branch;
  - zero observed days;
  - the predicted-below-1 refusal;
  - no predicted days at all.
- META also cites the Statistics Calculator guide, and the staleness row, CHANGELOG and README are updated.
