# spec-v1667 — Independent review of the compounding and counter tools (v1629, v1639)

> Status: **SHIPPED (2026-10-20)**: hardening, no new tool (catalog stays 2,362). Follows [spec-v1666](spec-v1666.md).

Two reviewers ran the 24 libs in `lib/*-v1629.js` and the 14 in `lib/*-v1639.js` on edge inputs. No figure disagreed
with its quoted source. Thirteen defects are fixed.

| Tool | Input | Was | Now |
|---|---|---|---|
| `contraceptive-missed-pill` | due 08:00, now 07:57 next day; progestin-only 3 h 2 min late | "24 hours" beside "less than 24 hours"; "3 hours" beside "more than 3 hours" (which starts 2 days of back-up) | 23.95 hours; 3.03 hours |
| `emergency-contraception-window` | 72 h 2 min after | "72 hours: past the Plan B label's 72 hours", "closed 0 hours ago" | 72.03 hours, 0.03 hours ago |
| `missed-dose-label-rule` | tirzepatide 71 h 57 min apart | "72 hours between doses is less than 72" | 71.95 hours |
| `epinephrine-device-weight-band` | 66.13 lb | "30 kg" beside the under-30 kg Auvi-Q and neffy rows | 29.996 kg |
| `oral-suspension-course` | 11 days, discard after 10 | "ends on or before the discard date", with day 11 on the discard date | a dose on the discard date needs a second bottle; the days after it are counted from the discard date itself |
| `compound-copy-check` | 12.5 mg against a marketed 25 mg | "Not essentially a copy ... the strength is not the same, similar or easily substitutable" | not settled: the guidance's "fractional or multiple doses" test has no number, so a strength that is not the same, within 10% or a whole multiple leaves the verdict open when nothing else decides it |
| `ethanol-proof` | 100 gallons at 100.04 proof | 100.04 proof gallons | 100 proof gallons: 27 CFR 30.31(a) takes proof to the nearest tenth degree |
| `formula-scale` | master yield 100 with no unit | dropped, with "no master yield was entered" | the unit is asked for |
| `tablet-powder-source` | 100.0004 mg from 10 mg tablets | 10 tablets and a negative leftover | 11 tablets |
| `aliquot-method` | 0.9999996 mg against a 1 mg minimum | "at or above" (rounded before comparing) | compared unrounded |
| `isotonicity-e-value` (White-Vincent) | every E-value 0 | "make 0 mL" | refused |
| `percent-ionized` | acid pKa −5 at pH 14 | "∞ to 1", "100% ionized and 1e-17% un-ionized" | "nearly 100%", and a ratio written as a power of ten |
| `dilution-c1v1` | a 1:0.5 ratio stock | accepted (200% w/v) | refused, like a percent over 100 |
| `dropper-calibration` | 20.5 drops | accepted | a whole number of drops |

## Proof

`test/unit/review-fixes-v1629-v1639.test.js` holds each reviewer input. Two older tests that encoded a defect (44.95
against 50 mg as a definite "not a copy"; 3 days after discard where the doses fall on 4) are updated.
