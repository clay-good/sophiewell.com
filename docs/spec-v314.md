# spec-v314.md — Deauville 5-point score (PET response, lymphoma) tile

> Status: **SHIPPED (2026-07-15).** Builds the `deauville-score` tile — the FDG-PET metabolic-response
> companion to the existing Ann Arbor / Lugano anatomic staging tile. The lymphoma cluster had anatomic
> staging but no metabolic-response scale. Catalog **1165 → 1166**, group G.

## Why

The catalog stages lymphoma anatomically (`ann-arbor`, Lugano) but had no Deauville score — the
standard 5-point FDG-PET response scale used at interim and end-of-treatment assessment. `deauville
score` / `pet response lymphoma` routed only to unrelated tiles.

## What it does

The clinician picks the 5-point uptake score (1–5); the tile reports the score, its uptake description,
and the standard Lugano interpretation (1–2 negative, 4–5 positive, 3 by clinical context).

- `lib/deauville-v314.js` — pure score → description + interpretation + positive (4–5) flag. Out-of-
  range scores throw.
- `views/group-v314.js` (RV314) — a single 5-point `<select>` with the uptake thresholds in the
  labels, real `<label for>`.
- `lib/meta.js` — citation + accessed date + interpretation bands.
- 6 worked-example unit tests + fuzz registration; synonym entry (v35 → v36); corpus → 1166.

It reports the score and its interpretation, not a treatment decision ([spec-v11](spec-v11.md) §5.3);
score 3 in particular is read in the clinical context.

## Sourcing (spec-v97)

The scale was re-fetched and cross-verified at build against the Lugano classification and independent
references that agree:

- **Citation:** Barrington SF, Mikhaeel NG, Kostakoglu L, et al. Role of imaging in the staging and
  response assessment of lymphoma: consensus of the ICML Imaging Working Group. *J Clin Oncol.*
  2014;32(27):3048-3058 (the Deauville 5-point scale within the Lugano classification), cross-checked
  against Radiopaedia (Deauville five-point scale).
- **Scale:** 1 = no uptake above background; 2 = uptake ≤ mediastinum; 3 = uptake > mediastinum but ≤
  liver; 4 = uptake moderately > liver; 5 = uptake markedly > liver and/or new lesions.
- **Interpretation:** 1–2 negative (complete metabolic response); 4–5 positive; 3 by clinical context.
- The citation carries no ISSUER_PATTERN uppercase society acronym that requires a staleness row.

## Verification

Lint (all catalog-truth surfaces at 1166), unit suite (+6 + fuzz), build — all green. Verified in a
real browser: picking score 4 renders the positive-scan interpretation.

## Out of scope

The tile takes the score the clinician has read off the PET/CT; it does not interpret the images. The
X category (new uptake unlikely related to lymphoma) is described in the note but not a selectable
score. The MCP adapter + golden-probe promotion follow in a separate wave.
