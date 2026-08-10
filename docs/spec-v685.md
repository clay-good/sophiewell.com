# spec-v685.md — Free Androgen Index (FAI)

> Status: **SHIPPED (2026-08-09).** Builds the `free-androgen-index` tile. Catalog **1515 → 1516**, group G.

## Why

The catalog had PCOS/androgen-excess tiles (Rotterdam criteria, Ferriman-Gallwey) but not the
**Free Androgen Index**, the simplest lab index of biologically available testosterone and a
standard part of the hirsutism/PCOS workup. Cluster gap.

## What it does

```
FAI = 100 × (total testosterone / SHBG)      both in nmol/L
```

The index is unitless and requires both values in **nmol/L**. US total testosterone is often
reported in ng/dL; divide by 28.84 to get nmol/L. Interpretation is sex-specific (advisory,
lab-range-dependent):

| Sex | FAI | Reading |
| --- | --- | --- |
| Women | ≤ ~5 | normal |
| Women | > ~5 | supports androgen excess (PCOS, hirsutism) |
| Men | ~30–150 | typical |

## Posture (spec-v97)

FAI is unreliable when SHBG is very low or very high and is **not** a stand-alone measure of
free testosterone in men (a calculated or equilibrium-dialysis free testosterone is preferred
there). Reference ranges are assay- and lab-dependent. It supports rather than replaces clinical
judgment.

## Files

- `lib/free-androgen-index-v685.js` — `freeAndrogenIndex()`, `FAI_NOTE`.
- `views/group-v685.js` (RV685) — a sex select and two nmol/L number inputs; a11y-checked.
- `mcp/adapters/free-androgen-index-v685.js` — exposes the tile (clinical disclaimer).
- `lib/meta.js` — citation, example, formula + sex-specific bands, related (rotterdam-pcos,
  ferriman-gallwey).
- `test/unit/free-androgen-index.test.js` — 5 tests (worked example 8.3, formula, female band
  edge, male bands, validation).
- `docs/spec-v685.md` (this file).

## Sourcing (spec-v97)

Formula and interpretation per standard endocrinology (Wilke TJ, Utley DJ. Clin Chem.
1987;33(8):1372-1375, PMID 3608153) and widely reproduced calculators (cross-checked against the
mdapp FAI calculator and the Wikipedia/ScienceDirect FAI entries), which give
FAI = 100 × testosterone/SHBG (nmol/L) and the women ≤ 5 cut-point identically.
