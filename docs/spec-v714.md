# spec-v714.md — Prostate Health Index (phi)

> Status: **SHIPPED (2026-08-10).** Builds the `prostate-health-index` tile. Catalog **1544 → 1545**, group G.

## Why

The catalog had PSA density, velocity, and doubling-time tools but not the **Prostate Health
Index (phi)** — the FDA-cleared [-2]proPSA-based index that refines the biopsy decision in the
2–10 ng/mL PSA range. Cluster gap.

## What it does

```
phi = (p2PSA / free PSA) × √(total PSA)
  p2PSA ([-2]proPSA) in pg/mL; free PSA and total PSA in ng/mL
```

Reference probability of prostate cancer on biopsy (total PSA 2–10 ng/mL, normal DRE):

| phi | Probability |
| --- | --- |
| 0–26.9 | ~11% |
| 27.0–35.9 | ~21% |
| 36.0–54.9 | ~33% |
| ≥ 55.0 | ~50% |

## Posture (spec-v97)

Refines the biopsy decision within the 2–10 ng/mL total-PSA range; it does not diagnose cancer,
and the probabilities are **approximate reference figures**. It supports rather than replaces
urologic assessment and shared decision-making.

## Files

- `lib/prostate-health-index-v714.js` — `prostateHealthIndex()`, `PHI_NOTE`.
- `views/group-v714.js` (RV714) — three number inputs (total PSA, free PSA, p2PSA); a11y-checked.
- `mcp/adapters/prostate-health-index-v714.js` — exposes the tile (clinical disclaimer).
- `lib/meta.js` — citation, example, formula + reference bands, related (psa-density, psa-velocity).
- `test/unit/prostate-health-index.test.js` — 5 tests (worked example phi 48, formula, bands, ≥ 36
  flag, validation incl. free > total).
- `docs/spec-v714.md` (this file).

## Sourcing (spec-v97)

Catalona WJ, Partin AW, Sanda MG, et al. *J Urol.* 2011;185(5):1650-1655 (PMID 21419439). The
formula and the band cut-points (26.9 / 35.9 / 54.9 / ≥ 55) were confirmed across the Mayo Clinic
Labs phi overview and a phi-density study; the two anchor probabilities (~11% at < 27, ~50% at
≥ 55) were directly confirmed, and the two intermediate probabilities (~21%, ~33%) are the
Beckman Coulter/Catalona reference figures, presented as approximate rather than as a second
computation.
