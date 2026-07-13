# spec-v296.md — Benzodiazepine dose-equivalence converter

> Status: **SHIPPED (2026-07-13).** Builds the `benzodiazepine-equivalence` tile — a catalog gap
> the [spec-v293](spec-v293.md) search sweep noted (no benzo-conversion tile existed). Catalog
> **1147 → 1148**, group F (medication/pharmacy tools, with `opioid-conversion` and `steroid-equiv`).

## Why

The v14 synonym sweep surfaced "benzo conversion" / "diazepam equivalent" as a real gap: the
catalog had opioid and steroid equivalence converters but no benzodiazepine one, the conversion a
clinician needs when transitioning one BZD to another for tapering.

## What it does

Given a source benzodiazepine and daily dose (mg) and an optional target benzodiazepine, the tile
reports the approximate oral-diazepam equivalent and the target-drug equivalent under BOTH
published systems — the VA/DoD 2021 SUD guideline and the Ashton Manual 2002. Benzodiazepine
equivalence carries real cross-source variance, so the tile shows both side by side (exactly as
the ASAM 2025 guideline does) rather than picking one silently; the clinician individualizes. It
is a tapering planning estimate, not a prescription or an order ([spec-v11](spec-v11.md) §5.3).

- `lib/benzo-equiv-v296.js` — pure compute: source dose → diazepam equivalent → target, per system.
- `views/group-v296.js` (RV296) — source/target selects + a dose number field, real `<label for>`.
- `lib/meta.js` — citation + accessed date + interpretation bands (both factor tables verbatim).
- 7 worked-example unit tests + fuzz registration; synonym entry (v16 → v17); corpus → 1148.

## Sourcing (spec-v97)

Factors re-fetched from the single authoritative source, the ASAM 2025 Joint Clinical Practice
Guideline on Benzodiazepine Tapering, whose "Benzodiazepine Dose Equivalents" table presents the
VA/DoD 2021 and Ashton 2002 systems side by side (built-in cross-verification). All factors are
"mg of the drug ≈ 10 mg oral diazepam." Ashton lists ranges for estazolam (1–2) and flurazepam
(15–30), which the tile carries through as an equivalent range.

- **Citation:** American Society of Addiction Medicine. Joint Clinical Practice Guideline on
  Benzodiazepine Tapering. 2025. (Tabulating VA/DoD SUD CPG 2021 and Ashton CH, The Ashton Manual,
  Newcastle University, 2002.) The named issuers are not ISSUER_PATTERN uppercase acronyms in the
  citation text, so no citation-staleness ledger row is required.
- **Safety posture:** estimates only, individualize to patient response; long half-life agents
  (diazepam, chlordiazepoxide) accumulate; confirm against protocol and an independent check.

## Verification

Lint (all catalog-truth surfaces at 1148), unit suite (+7 + fuzz), build — all green. Verified in
a real browser: the converter renders both systems, and the source→target round trip works.

## Out of scope

Methadone/barbiturate cross-class conversion is excluded (out of the guideline table's scope). The
MCP adapter + golden-probe promotion follow in a separate wave.
