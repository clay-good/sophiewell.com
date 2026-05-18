# v11 audit - Pregnancy Dating (LMP / CRL / EDD) (`preg-dating`)

- Auditor: CG
- Date: 2026-05-17
- Citation re-verified against: Naegele rule (LMP + 280 days); Robinson HP, Fleming JEE. *A critical evaluation of sonar crown-rump length measurements.* Br J Obstet Gynaecol. 1975;82(9):702-710 (Robinson-Fleming CRL-to-GA regression); ACOG Committee Opinion 700 / ACOG Practice Bulletin 175 redating thresholds: trimester 1 (<=13w6d) - redate if discordance > 7 days; trimester 2 (14w0d - 27w6d) - > 14 days; trimester 3 (>=28w0d) - > 21 days.

`lib/clinical-v4.js`:
- `eddFromLmp()` uses Naegele (LMP + 280 days).
- `gaFromCrl()` uses Robinson-Fleming variant: `GA_days = 8.052 * sqrt(CRL_mm * 1.037) + 23.73`, rounded to nearest day.
- `pregnancyDiscordance()` returns absolute difference, trimester (by LMP-derived GA), the threshold, and a boolean `discordant`.

## Boundary examples added
- low: LMP only, no CRL — EDD = LMP + 280; no discordance reported (single source). E.g. LMP 2025-01-01 -> EDD 2025-10-08.
- mid (META example after fix): LMP 2025-12-23, CRL 50 mm at US 2026-03-12.
  - LMP-derived GA at US: 79 days = 11w 2d; LMP EDD = 2026-09-29.
  - CRL-derived GA at US: round(8.052 * sqrt(50 * 1.037) + 23.73) = round(81.71) = 82 days = 11w 5d; implied EDD = 2026-09-26.
  - Discordance: 3 days, trimester 1 (LMP-derived 79d <= 84d), threshold 7d -> NOT discordant; "within accepted limit".
- high: LMP 2024-09-01, CRL 65 mm at US 2024-12-08.
  - LMP GA at US: 98 days = 14w 0d (trimester 2).
  - CRL GA: round(8.052 * sqrt(65 * 1.037) + 23.73) = round(89.85) = 90 days = 12w 6d.
  - Discordance: 8 days, T2 threshold 14d -> NOT discordant.
- discordant boundary: LMP 2026-01-08, CRL 50 mm at US 2026-03-12.
  - LMP GA: 63 days (T1); CRL GA: 82 days. Discordance: 19 days, T1 threshold 7d -> DISCORDANT, "consider redating to ultrasound". This is the case the prior META example used by mistake (see Defects).

## Cross-implementation differential
- Reference implementation: Robinson-Fleming 1975 published regression (formula form repeated verbatim in ACOG Practice Bulletin 175 and reproduced by the publicly-documented MDCalc OB dating calculator).
- Test case: CRL 50 mm -> GA.
- Sophie result: 82 days (11w 5d), per `8.052 * sqrt(50 * 1.037) + 23.73 = 81.71 -> round 82`.
- Reference result: 11w 5d (82 days) per Robinson-Fleming nomogram; published CRL=50 mm cross-checks to 11w 4-5d (rounding range).
- Delta: 0 days (within nomogram rounding). PASS.

ACOG redating threshold rows hand-verified against ACOG Practice Bulletin 175 (7/14/21 days for T1/T2/T3).

## Edge-input handling notes
- All three inputs (LMP, CRL, US date) are optional individually; the renderer skips any computation whose required input is missing instead of throwing. This intentionally supports the three workflows the tile exists to serve: "Naegele-only", "CRL-only", and "combined with discordance".
- LMP and US-date inputs use ISO `YYYY-MM-DD` strings parsed via `parseISO()` (local-date construction, no TZ drift).
- CRL is gated by `crlMm > 0`; zero or negative raises RangeError. The view treats `num('pd-crl') <= 0` as "not supplied" instead of surfacing the error, matching the "all inputs optional" UX contract.
- The discordance trimester is keyed off the LMP-derived GA (per ACOG's instruction to use the gestational age that the redating decision is being applied to), not the CRL-derived GA. This matches the source.
- **Defect found (META example)**: prior META example used LMP 2026-01-08 with CRL 50 mm at US 2026-03-12, producing a 19-day T1 discordance that *did* exceed the 7-day redating threshold — but the example's expected text claimed "small T1 discordance, within accepted limit", which contradicted the actual output. Fixed in this PR by changing LMP to 2025-12-23, which yields a real 3-day within-limit discordance that matches the expected text. The renderer was always correctly computing and labelling discordance — only the documented example was contradictory.

## A11y / keyboard notes
- Three labelled inputs, Tab-reachable in source order. Each label states "(optional)" so it is clear no single field is required. Output region announces both EDDs and the discordance verdict. `npm run test:a11y` clean.

## Defects opened
- **META `preg-dating` example had LMP/CRL pair that produced a 19-day T1 discordance, while the expected text claimed "within accepted limit".** Live tile rendering was correct (it would say "discordant; consider redating"); only the documented example text was inconsistent with its own input set. Fixed in this PR per spec-v11 §3.6 #3 by adjusting LMP to 2025-12-23 (3-day discordance, genuinely within limit).

## Status
- PASS-WITH-FIXES
