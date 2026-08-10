# spec-v697.md — King's Score (liver fibrosis, chronic HCV)

> Status: **SHIPPED (2026-08-10).** Builds the `kings-score` tile. Catalog **1527 → 1528**, group G.

## Why

The catalog had FIB-4, APRI, Forns, and other noninvasive fibrosis indices, but not the
**King's Score**, a distinct simple index derived and validated for cirrhosis in chronic
hepatitis C. Cluster gap.

## What it does

```
King's Score = (age [years] × AST [U/L] × INR) / platelet count [×10⁹/L]
```

Interpretation (chronic-HCV derivation, Ishak staging):

| Score | Reading |
| --- | --- |
| < 12.3 | low probability of significant fibrosis |
| ≥ 12.3 | significant fibrosis likely (Ishak F3–F6), AUROC ~0.79 |
| ≥ 16.7 | cirrhosis likely (~86% sens / ~80% spec, NPV ~96%, AUROC ~0.91) |

## Posture (spec-v97)

The cut-points are the **chronic-HCV** derivation; other liver diseases (e.g. chronic
hepatitis B) report different thresholds, so the tile labels the population. It is a noninvasive
estimate that supports rather than replaces biopsy, elastography, and clinical judgment.

## Files

- `lib/kings-score-v697.js` — `kingsScore()`, `KINGS_SCORE_NOTE`.
- `views/group-v697.js` (RV697) — four number inputs (age, AST, INR, platelets); a11y-checked.
- `mcp/adapters/kings-score-v697.js` — exposes the tile (clinical disclaimer).
- `lib/meta.js` — citation, example, formula + cut-points, related (fib4, apri, meld-childpugh).
- `test/unit/kings-score.test.js` — 5 tests (worked example 14.9, formula, bands, exact 12.3/16.7
  boundaries, validation).
- `docs/spec-v697.md` (this file).

## Sourcing (spec-v97)

Cross TJS, Rizzi P, Berry PA, Bruce M, Portmann B, Harrison PM. King's Score: an accurate marker
of cirrhosis in chronic hepatitis C. *Eur J Gastroenterol Hepatol.* 2009;21(7):730-738 (PMID
19430302). The formula and both cut-points (12.3 significant fibrosis, 16.7 cirrhosis) were
confirmed against the derivation and independent HCV-validation reproductions, which agree; the
tile anchors the thresholds to chronic HCV because other populations differ.
