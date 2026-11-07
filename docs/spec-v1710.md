# spec-v1710 — NHSN's interval on the device-associated infection rate

> Status: **SHIPPED (2026-11-07)**: an enhancement to `device-infection-rate`; the catalog stays 2,386. It follows
> [spec-v1709](spec-v1709.md), which ported and checked NHSN's interval macro for the SIR.

## Why

NHSN's `rateCIcomp.sas` says in its header that NHSN's rate tables call it (`StandardRateTable.sas`). NHSN's macro
guide (May 2021) offers it for "a single incidence density rate (such as a CLABSI rate, SIR)". So a facility's NHSN
rate table carries a 95% interval that this tool did not show.

## What changed

- `lib/device-infection-rate-v1655.js` reuses `nhsnMidPLimits` from `lib/nhsn-sir-v1655.js`, the literal port
  checked in spec-v1709. It scales the limits per 1,000 device days and rounds them to three decimals, as the macro
  does. With no events there is no lower limit. The result gains `lower` and `upper` and an interval note. The band
  and the worked example are unchanged.
- Tested against the macro guide's printed example: 12 events over 35 device-days gives 185.767 to 582.877 per
  1,000. The zero-event case is tested too.
- The per-100-episodes VAE rate gets no interval; the macro is stated for rates per device-day.
- META cites the macro (`citationUrls`). The staleness row, CHANGELOG and README are updated to match.
