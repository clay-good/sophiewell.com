# spec-v307.md — Diabetic macular edema (DME) severity tile

> Status: **SHIPPED (2026-07-14).** Builds the `dme-severity` tile — the companion to the spec-v301
> ICDR retinopathy tile (retinopathy and macular edema are graded together at every diabetic eye
> exam; DME had no tile and routed only to noise). Catalog **1158 → 1159**, group G.

## Why

Shipping the ICDR retinopathy tile (spec-v301) left its companion — the DME severity scale from the
same Wilkinson 2003 paper — unbuilt. "diabetic macular edema severity" / "macular edema grading"
routed only to unrelated tiles. The two scales are used together to grade diabetic eye disease.

## What it does

The clinician marks whether retinal thickening or hard exudates are present in the posterior pole and
picks their location relative to the center of the macula; the tile reports the DME level — absent,
mild (distant from the center), moderate (approaching but not involving), or severe (involving the
center = center-involving, vision-threatening). It reports the DME level, not a diagnosis or a
treatment decision ([spec-v11](spec-v11.md) §5.3).

- `lib/dme-v307.js` — pure presence + location → DME level with the center-involving flag.
- `views/group-v307.js` (RV307) — a presence checkbox + a location `<select>`, real `<label for>`,
  no innerHTML.
- `lib/meta.js` — citation + accessed date + per-level interpretation bands.
- 7 worked-example unit tests + fuzz registration; synonym entry (v28 → v29); corpus → 1159.

## Sourcing (spec-v97)

The location-based grading was re-fetched and cross-verified at build against two independent sources
that agree: the original Wilkinson 2003 proposal (same paper as the ICDR scale) and the DME reference
table.

- **Citation:** Wilkinson CP, Ferris FL 3rd, Klein RE, et al. Proposed international clinical diabetic
  retinopathy and diabetic macular edema disease severity scales. *Ophthalmology.*
  2003;110(9):1677-1682. doi:10.1016/S0161-6420(03)00475-5. The citation carries no ISSUER_PATTERN
  uppercase acronym, so no citation-staleness ledger row is required.
- **Levels:** absent (no thickening/exudates in the posterior pole); mild (distant from the center);
  moderate (approaching but not involving the center); severe (involving the center = center-involving
  DME, the vision-threatening form).

## Verification

Lint (all catalog-truth surfaces at 1159), unit suite (+7 + fuzz), build — all green. Verified in a
real browser: marking presence and picking a location renders the DME level and the center-involving
flag.

## Out of scope

Retinal thickening is a dilated-exam / OCT judgment the clinician enters; the tile does not interpret
imaging. The MCP adapter + golden-probe promotion follow in a separate wave.
