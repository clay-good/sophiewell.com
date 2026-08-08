# spec-v670.md — Ottawa Bowel Preparation Scale (OBPS)

> Status: **SHIPPED (2026-08-08).** Builds the `ottawa-bowel-prep` tile. Catalog **1500 → 1501**, group G.

## Why

The catalog ships the Boston Bowel Preparation Scale (`bbps-boston`) but not the other validated colonoscopy
prep-quality instrument. The Ottawa scale is still widely used in trials and reporting; unlike Boston
(higher = cleaner), Ottawa runs the opposite direction (lower = cleaner) and adds an explicit fluid-volume
term, so having both removes a common scoring-direction error.

## What it does

Sums three segment-cleanliness scores plus one overall fluid-quantity score, total **0–14, lower is better**:

| Component | Scale |
| --- | --- |
| Right / ascending colon | 0 excellent · 1 good · 2 fair · 3 poor · 4 inadequate |
| Mid colon (transverse + descending) | 0–4 (same anchors) |
| Rectosigmoid | 0–4 (same anchors) |
| Overall fluid quantity (whole colon) | 0 small · 1 moderate · 2 large |

Total = three segments (0–12) + fluid (0–2). A `0` is a perfect prep; `14` is solid stool obscuring every
segment with a large fluid volume.

## Posture (spec-v97)

The 2004 validation paper presents the total as a **continuous quality measure and defines no single
adequate-versus-inadequate cutoff**; later trials use study-specific thresholds. The tile reports the total
and flags only the objective, anchor-defined fact that a segment scored 3–4 has obscured mucosa (that part of
the exam may need repeat washing or a repeat colonoscopy). It grades quality; it is not itself an order.

## Files

- `lib/ottawa-bowel-prep-v670.js` — `ottawaBowelPrep()`, `OBPS_NOTE`.
- `views/group-v670.js` (RV670) — three 0–4 segment selects + one 0–2 fluid select; a11y-checked, no
  innerHTML, no network.
- `mcp/adapters/ottawa-bowel-prep-v670.js` — exposes the tile (clinical disclaimer).
- `lib/meta.js` — citation, example, interpretation bands, specialties, related (`bbps-boston`).
- `test/unit/ottawa-bowel-prep.test.js` — 6 tests (perfect = 0, worst = 14, sum = segments + fluid, poor/
  inadequate flag, worked example = 5/14, required in-range integers).
- `docs/spec-v670.md` (this file).

## Sourcing (spec-v97)

Rostom A, Jolicoeur E. Validation of a new scale for the assessment of bowel preparation quality.
*Gastrointest Endosc.* 2004;59(4):482-486 (PMID 15044882). A source-verification subagent confirmed the three
segments, the five-level 0–4 cleanliness anchors, the single whole-colon 0–2 fluid score, the 0–14 total with
lower = better, and that the original paper sets no fixed adequate/inadequate cutoff (cross-checked against a
peer-reviewed review reproducing the scale, PMC6048432).
