# spec-v568.md — Cleveland Clinic (Thakar) score tile

> Status: **SHIPPED (2026-07-28).** Builds the `thakar-aki` tile. Catalog **1417 → 1418**, group G.

## Why

`thakar` was zero-hit, and both `grep -c "id: 'thakar-aki'" app.js` and
`grep -c "id: 'cleveland-clinic-aki'" app.js` returned 0.

## What it does

| Factor | Points |
| --- | --- |
| Female | 1 |
| Congestive heart failure | 1 |
| LVEF <35% | 1 |
| Preoperative IABP | 2 |
| COPD | 1 |
| Diabetes requiring insulin | 1 |
| Previous cardiac surgery | 1 |
| Emergency surgery | 2 |
| Surgery: CABG only / valve only / CABG+valve / **other** | 0 / 1 / 2 / **2** |
| Creatinine <1.2 / 1.2 to <2.1 / ≥2.1 mg/dL | 0 / 2 / 5 |

Maximum **17**. Published categories: **0-2, 3-5, 6-8, 9-13**.

## The four rules a plausible implementation breaks

**1. The outcome is acute renal failure *requiring dialysis*, not KDIGO AKI.** Dialysis-requiring failure is
far rarer and far more severe than any-stage AKI, which is common after cardiac surgery. Studies
revalidating this score against any-stage AKI are measuring something else — this is where most of the
literature confusion comes from. Reporting the output as "risk of AKI" overstates it by a wide margin.

**2. The published categories stop at 13 while the score runs to 17.** Scores of 14-17 are **reachable** and
unclassified. The lib returns `bandAssigned: false` above 13 rather than stretching the top category —
extending a band the source closed would invent a risk estimate for patients the derivation never described.
A test builds a 17 and asserts no band.

**3. The exact risk percentages are deliberately not reported.** Independent secondary sources disagree: one
gives the 6-8 band as a 7.8-9.5% *range* and 9-13 as 21.5%; another gives 9.5 and 21.3; the original
abstract describes the test-set frequency as spanning 0.5-22.1%. These are probably test-set vs
validation-set figures, but the primary table is **paywalled** and could not be fetched to adjudicate — so
no percentage is quoted (spec-v97). The score and the four band **boundaries** are consistent across sources
and are reported. A test asserts no percentage appears in the output.

**4. Surgery type is counter-intuitive and must not be rationalized.** Isolated CABG — the commonest
operation — scores **0**, while "other cardiac surgery" scores **2**, the same as the far more invasive CABG
plus valve. Anyone ordering these by apparent invasiveness gets "other" wrong.

**Creatinine is stepped, never interpolated**, and jumps **2 → 5** across one threshold — a step larger than
any single risk factor, so 0.1 mg/dL of drift near 2.1 mg/dL moves a patient two risk bands.

## Scope (spec-v11 §5.3)

A **preoperative** risk estimate for **one** postoperative complication. It does **not** diagnose kidney
disease, does not measure current kidney function beyond the single creatinine it takes as an input, and
does **not** predict any other outcome — not mortality, not length of stay, not non-dialysis AKI. It is
**not** an indication to cancel or defer an operation, and it does not select perioperative management,
fluid strategy, or nephroprotective measures.

## Files

- `lib/thakar-aki-v568.js` — `thakarAki()`, `THAKAR_FACTORS`, `SURGERY_TYPES`, `CREATININE_BANDS`,
  `THAKAR_MAX`, `HIGHEST_PUBLISHED_SCORE`.
- `views/group-v568.js` (RV568) — factors, surgery type and creatinine under separate **h2** headings.
- `mcp/adapters/thakar-aki-v568.js` — wave 393.
- `test/unit/thakar-aki.test.js` — 16 tests.
- `docs/spec-v568.md` (this file).

## Sourcing (spec-v97)

Two independent secondary reproductions of the derivation table agree on every weight; the maximum was
verified arithmetically. The primary JASN table is paywalled, which is why the risk percentages are
withheld.

- Thakar CV, Arrigain S, Worley S, Yared JP, Paganini EP. A clinical score to predict acute renal failure
  after cardiac surgery. *J Am Soc Nephrol.* 2005;16(1):162-168.
