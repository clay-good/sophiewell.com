# spec-v304.md — Dexamethasone suppression test (1-mg overnight) tile

> Status: **SHIPPED (2026-07-14).** Builds the `dexamethasone-suppression` tile — a catalog gap
> surfaced by the SESSION-40 second fresh-domain search sweep ("cushing screening" had no tile).
> Catalog **1155 → 1156**, group G.

## Why

The second sweep found "cushing screening" routed only to unrelated tiles — no
dexamethasone-suppression-test tile existed. The 1-mg overnight DST is the standard first-line screen
for Cushing syndrome and for autonomous cortisol secretion in adrenal incidentalomas.

## What it does

The clinician enters the 8 am serum cortisol drawn after 1 mg dexamethasone at ~11 pm and its unit
(µg/dL or nmol/L); the tile compares it with the suppression cutoff — 1.8 µg/dL (50 nmol/L) — and
reports normal suppression (below cutoff) or a failure to suppress (at or above), with an explicit
false-positive caveat. It reports the cited threshold's interpretation, not a diagnosis
([spec-v11](spec-v11.md) §5.3); a positive screen must be confirmed.

- `lib/dst-v304.js` — pure cortisol → cutoff comparison with the unit-specific value (1.8 µg/dL /
  50 nmol/L) and the suppress/fail flag.
- `views/group-v304.js` (RV304) — a cortisol number input + a unit `<select>`, real `<label for>`,
  no innerHTML.
- `lib/meta.js` — citation + accessed date + normal-suppression / failure-to-suppress bands.
- 7 worked-example unit tests + fuzz registration; synonym entry (v25 → v26); corpus → 1156.

## Sourcing (spec-v97)

The <1.8 µg/dL (50 nmol/L) suppression cutoff was re-fetched and cross-verified at build against
independent sources that agree:

- **Citation:** Nieman LK, Biller BMK, Findling JW, et al. The diagnosis of Cushing's syndrome: an
  Endocrine Society Clinical Practice Guideline. *J Clin Endocrinol Metab.* 2008;93(5):1526-1540.
  doi:10.1210/jc.2008-0125. Cross-checked against current reviews of the 1-mg overnight DST. The
  citation carries no ISSUER_PATTERN uppercase acronym, so no citation-staleness ledger row is
  required.
- **False-positive caveat:** the note flags the common causes of a falsely non-suppressed result
  (estrogen/oral contraceptives, CYP3A4 inducers or poor dexamethasone absorption, acute illness,
  depression) so a positive screen is confirmed rather than over-diagnosed.

## Verification

Lint (all catalog-truth surfaces at 1156), unit suite (+7 + fuzz), build — all green. Verified in a
real browser: the cortisol input and unit toggle render the suppression comparison and the band.

## Out of scope

The low-dose 2-day (2 mg/day) and high-dose 8-mg DSTs are separate protocols with their own cutoffs
and are out of scope (this tile is the 1-mg overnight screen). The MCP adapter + golden-probe
promotion follow in a separate wave.
