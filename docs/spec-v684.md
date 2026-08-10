# spec-v684.md — Fractional excretion of potassium (FEK)

> Status: **SHIPPED (2026-08-09).** Builds the `fractional-excretion-potassium` tile. Catalog **1514 → 1515**, group G.

## Why

The catalog had the whole fractional-excretion family — FENa, FEurea, FEMg, FE-phosphate,
FE-uric-acid — **except FEK**. FEK distinguishes renal from extrarenal potassium handling in
dyskalemia, completing the family.

## What it does

```
FEK (%) = (urine K × plasma creatinine) / (plasma K × urine creatinine) × 100
```

The concentration units cancel, so only internal consistency is required. Typical diet
averages ~8% (roughly 4–16%).

## Interpretation (context-dependent, advisory)

| Setting | FEK | Suggests |
| --- | --- | --- |
| Hypokalemia | < ~10% (some < 6.5%) | extrarenal loss |
| Hypokalemia | > ~20% | renal potassium wasting |
| Hyperkalemia | low (< ~10%) with preserved renal function | impaired renal excretion |

Because the meaning flips with the serum potassium, the tile reports the value and states the
advisory cut-points rather than asserting one normal/abnormal verdict.

## Posture (spec-v97)

FEK must be read alongside the serum potassium and clinical picture. It supports rather than
replaces clinical judgment.

## Files

- `lib/fractional-excretion-potassium-v684.js` — `fractionalExcretionPotassium()`, `FEK_NOTE`.
- `views/group-v684.js` (RV684) — four number inputs (urine/plasma K and creatinine).
- `mcp/adapters/fractional-excretion-potassium-v684.js` — exposes the tile (clinical disclaimer).
- `lib/meta.js` — citation, example, formula + interpretation bands, related (fena-feurea, ttkg).
- `test/unit/fractional-excretion-potassium.test.js` — 4 tests (worked example 10%, formula,
  renal-wasting range, validation).
- `docs/spec-v684.md` (this file).

## Sourcing (spec-v97)

The formula is standard renal physiology; the interpretive cut-points are from Lin SH, et al.
(Arch Intern Med. 2004;164(14):1561-1566, PMID 15277291) and standard references, cross-checked
against an FPNotebook FEK reference. The tile reports the value with advisory cut-points because
the interpretation is inherently context-dependent (it flips with the serum potassium).
