# spec-v301.md — Diabetic retinopathy severity (ICDR scale) tile

> Status: **SHIPPED (2026-07-14).** Builds the `icdr-retinopathy` tile — a catalog gap surfaced by
> the SESSION-40 fresh-domain search sweep ("diabetic retinopathy severity" had no tile to route to).
> Catalog **1152 → 1153**, group G.

## Why

The SESSION-40 sweep found "diabetic retinopathy severity" routed only to unrelated diabetes-foot /
DKA tiles — no retinopathy-grading tile existed. The ICDR scale is the classification an
ophthalmology / optometry / endocrinology clinician uses at the dilated fundus exam; it is the most
widely used DR severity system worldwide.

## What it does

The clinician checks the dilated-ophthalmoscopy findings; the tile reports the ICDR grade (1–5) as
the highest-severity level whose criteria are met — no apparent retinopathy, mild / moderate / severe
NPDR, or proliferative DR. It reports the ICDR grade, not a diagnosis or a follow-up plan
([spec-v11](spec-v11.md) §5.3).

- `lib/dr-severity-v301.js` — pure findings → grade decision (PDR > severe-NPDR 4-2-1 rule > moderate
  > mild > none).
- `views/group-v301.js` (RV301) — seven finding checkboxes, real `<label for>`, no innerHTML.
- `lib/meta.js` — citation + accessed date + per-grade interpretation bands.
- 8 worked-example unit tests + fuzz registration; synonym entry (v21 → v22); corpus → 1153.

## Sourcing (spec-v97)

The five levels and the severe-NPDR "4-2-1 rule" were re-fetched and cross-verified at build against
two independent sources that agree verbatim: the original ICDR proposal and the ICDR reference table.

- **Citation:** Wilkinson CP, Ferris FL 3rd, Klein RE, et al. Proposed international clinical diabetic
  retinopathy and diabetic macular edema disease severity scales. *Ophthalmology.*
  2003;110(9):1677-1682. doi:10.1016/S0161-6420(03)00475-5. The citation carries no ISSUER_PATTERN
  uppercase acronym, so no citation-staleness ledger row is required.
- **4-2-1 rule:** severe NPDR = any of >20 intraretinal hemorrhages in each of 4 quadrants, definite
  venous beading in ≥2 quadrants, or prominent IRMA in ≥1 quadrant, with no signs of PDR.

## Verification

Lint (all catalog-truth surfaces at 1153), unit suite (+8 + fuzz), build — all green. Verified in a
real browser: checking a finding renders the corresponding ICDR grade; no findings renders grade 1.

## Out of scope

The diabetic macular edema (DME) severity scale (the companion scale in the same paper) and DR
follow-up intervals (AAO Preferred Practice Pattern) are out of scope. The MCP adapter +
golden-probe promotion follow in a separate wave.
