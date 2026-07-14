# spec-v299.md — Cosyntropin (ACTH) stimulation test interpretation tile

> Status: **SHIPPED (2026-07-13).** Builds the `cosyntropin-stim` tile — a catalog gap the
> [spec-v293](spec-v293.md) search sweep noted ("cosyntropin interpretation"). Catalog **1150 → 1151**,
> group G.

## Why

The v14 synonym sweep listed "cosyntropin interpretation" among the genuine catalog gaps (no tile
existed). Interpreting the peak stimulated cortisol against the standard threshold is a bedside step
an endocrinology / internal-medicine / critical-care clinician takes when working up adrenal
insufficiency.

## What it does

The clinician enters the peak stimulated serum cortisol (30 or 60 min after 250 µg cosyntropin) and
its unit (µg/dL or nmol/L); the tile compares it with the standard-immunoassay threshold — 18 µg/dL
(500 nmol/L) — and reports a normal adrenal response or a value below threshold suggestive of adrenal
insufficiency, with an explicit caveat that newer, more specific assays (LC-MS/MS) use lower cutoffs.
It reports the cited threshold's interpretation, not a diagnosis ([spec-v11](spec-v11.md) §5.3).

- `lib/cosyntropin-v299.js` — pure peak-cortisol → threshold comparison with the unit-specific
  cutoff (18 µg/dL / 500 nmol/L) and normal/abnormal flag.
- `views/group-v299.js` (RV299) — a peak-cortisol number input + a unit `<select>`, real
  `<label for>`, no innerHTML.
- `lib/meta.js` — citation + accessed date + normal / below-threshold interpretation bands.
- 7 worked-example unit tests + fuzz registration; synonym entry (v19 → v20); corpus → 1151.

## Sourcing (spec-v97)

The threshold was re-fetched and cross-verified at build against two independent sources that agree
on the ≥18 µg/dL (500 nmol/L) peak-cortisol cutoff at 30 or 60 minutes for the standard high-dose
(250 µg) test, and on the lower LC-MS/MS cutoffs:

- **Citation:** Bornstein SR, Allolio B, Arlt W, et al. Diagnosis and Treatment of Primary Adrenal
  Insufficiency: An Endocrine Society Clinical Practice Guideline. *J Clin Endocrinol Metab.*
  2016;101(2):364-389. doi:10.1210/jc.2015-1710. Cross-checked against StatPearls (Cosyntropin
  Stimulation Test, NBK555940). "Endocrine Society" carries no ISSUER_PATTERN uppercase acronym, so
  no citation-staleness ledger row is required.
- **Assay caveat:** newer, more specific cortisol assays (LC-MS/MS, monoclonal immunoassays) run
  lower — approximately 412 nmol/L at 30 min and 485 nmol/L at 60 min — so the tile's note directs
  the user to their laboratory's assay-specific cutoff rather than asserting a single number.

## Verification

Lint (all catalog-truth surfaces at 1151), unit suite (+7 + fuzz), build — all green. Verified in a
real browser: the cortisol input and unit toggle render the threshold comparison and normal /
below-threshold band.

## Out of scope

The low-dose (1 µg) cosyntropin test and the baseline / morning-cortisol screen are separate tests
with their own thresholds and are out of scope here (this tile is the standard high-dose peak
comparison). The MCP adapter + golden-probe promotion follow in a separate wave.
