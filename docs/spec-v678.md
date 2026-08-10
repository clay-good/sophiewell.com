# spec-v678.md — MELD 3.0 (Model for End-Stage Liver Disease, updated form)

> Status: **SHIPPED (2026-08-09).** Builds the `meld3` tile. Catalog **1508 → 1509**, group G.

## Why

MELD-Na (the `meld-na` tile) is superseded: OPTN adopted **MELD 3.0** as the operational
liver-allocation score in 2023. MELD 3.0 adds female sex and serum albumin and re-fits every
coefficient, correcting the documented survival disadvantage women faced under MELD-Na. The
catalog had every MELD variant except the current one — a clear predecessor/successor gap.

## What it does

A fitted linear score on log-transformed labs:

```
MELD 3.0 = 1.33*(female)
         + 4.56*ln(bilirubin)   + 0.82*(137 - Na)   - 0.24*(137 - Na)*ln(bilirubin)
         + 9.09*ln(INR)         + 11.14*ln(creatinine)
         + 1.85*(3.5 - albumin) - 1.83*(3.5 - albumin)*ln(creatinine)
         + 6
```

**Pre-calculation bounds (OPTN):** bilirubin, INR, creatinine floored at 1.0; creatinine capped
at 3.0 (>= 2 dialysis sessions in the prior week, or 24h CVVHD, set creatinine to 3.0); sodium
bounded 125–137 mEq/L; albumin bounded 1.5–3.5 g/dL. The result is rounded and bounded to **6–40**.
A score >= 15 is the conventional transplant-benefit threshold; a higher score predicts higher
90-day waitlist mortality.

## Posture (spec-v97)

For candidates aged 12 and older with chronic liver disease. It estimates waitlist mortality for
the transplant team; listing and organ allocation stay with the transplant center.

## Files

- `lib/meld3-v678.js` — `meld3()`, `MELD3_NOTE`.
- `views/group-v678.js` (RV678) — sex select, five lab number inputs, dialysis checkbox; a11y-checked.
- `mcp/adapters/meld3-v678.js` — exposes the tile (clinical disclaimer).
- `lib/meta.js` — citation, example, formula/bounds bands, specialties, related.
- `test/unit/meld3.test.js` — 7 tests (worked example 32, female/male delta, score floor 6, max cap
  40, bound clamps, dialysis rule, input validation).
- `docs/spec-v678.md` (this file).

## Sourcing (spec-v97)

Kim WR, Mannalithara A, Heimbach JK, et al. MELD 3.0: The Model for End-Stage Liver Disease Updated
for the Modern Era. *Gastroenterology.* 2021;161(6):1887-1895 (PMID 34481845). Coefficients and the
OPTN operational bounds (labs floored at 1.0, creatinine cap 3.0 and the dialysis rule, sodium
125–137, albumin 1.5–3.5, score range 6–40) were cross-checked across three independent
reproductions (the University of Washington Hepatitis B Online calculator, an OPTN-implementation
reference, and a clinical calculator), which agree exactly.
