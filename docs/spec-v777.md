# spec-v777.md — AWOL score (delirium risk at admission)

> Status: **SHIPPED (2026-08-26).** Builds the `awol` tile. Catalog **1568 → 1569**, group G.

## Why

The catalog had five delirium tiles — `4at`, `icdsc`, `nu-desc`, `doss`, `capd` — and every
one of them **screens** for delirium that is already there. None **predicts** it. AWOL is the
admission-time risk-stratification rule that closes that axis, and it is the trigger for a
prevention bundle rather than a diagnosis.

## What it does

Four findings at admission, one point each (0–4):

| Letter | Finding | Points |
| --- | --- | --- |
| **A** | Age ≥ 80 years | 1 |
| **W** | cannot spell "world" backward correctly | 1 |
| **O** | not Oriented to city, state, county, hospital name and floor | 1 |
| **L** | nurse-rated iLlness severity moderately ill or worse | 1 |

Illness severity is a five-level select — not ill, mildly ill, moderately ill, severely ill,
moribund — where only the last three score.

**Observed delirium during the stay** (combined derivation + validation cohorts):

| Score | 0 | 1 | 2 | 3 | 4 |
| --- | --- | --- | --- | --- | --- |
| Delirium | ~2% | ~4% | ~14% | ~20% | ~64% |

**Worked example:** age 80 and disoriented, not ill → **2 of 4**, delirium in ~14%.

## Posture (spec-v97)

AWOL predicts delirium that has **not happened yet**. Patients already delirious at admission
were excluded from the derivation cohort, so this is not a delirium screen and does not
replace one. It points toward prevention measures rather than ordering any of them.

## Files

- `lib/awol-v777.js` — `awol()`, `AWOL_NOTE`.
- `views/group-v777.js` (RV777) — three checkboxes and one severity select; a11y-checked.
- `mcp/adapters/awol-v777.js` — exposes the tile (clinical disclaimer).
- `lib/meta.js` — citation, example, items + observed incidence, related (4at, icdsc, nu-desc).
- `test/unit/awol.test.js` — 5 tests (0, the severity threshold, the 2-of-4 worked example, 4 of 4, invalid severity).
- `docs/spec-v777.md` (this file).

## Sourcing (spec-v97)

Douglas VC, Hessler CS, Dhaliwal G, et al. *J Hosp Med.* 2013;8(9):493-499 (PMID 23922253).
The four items and their one-point weighting were confirmed against two independent
reproductions; the incidence figures come from the original report of the combined cohorts.
The severity threshold — moderately ill and worse score, mildly ill does not — was checked
explicitly, because it is the one place this rule is easy to get backwards.
