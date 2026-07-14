# spec-v306.md — ICANS neurotoxicity grade (ASTCT) tile

> Status: **SHIPPED (2026-07-14).** Builds the `icans-grade` tile — the neurotoxicity companion to
> the spec-v305 CRS tile (a CAR-T unit grades both CRS and ICANS at every assessment; ICANS had no
> tile and routed only to noise). Catalog **1157 → 1158**, group G.

## Why

Shipping the CRS tile (spec-v305) left its ASTCT companion — ICANS — unbuilt. "icans grade" / "car t
neurotoxicity" routed only to unrelated tiles. ICANS grading is used alongside CRS on every
cellular-therapy neurotoxicity assessment.

## What it does

The clinician enters the ICE score (0–10, scored with the official ICE tool) and picks the level of
consciousness, seizure, and raised-ICP findings plus the deep-focal-motor-weakness flag; the tile
reports the ASTCT ICANS grade (1–4) as the most severe of the five domains, and flags grades ≥3 as
severe. It reports the ASTCT grade, not a treatment order ([spec-v11](spec-v11.md) §5.3).

- `lib/icans-v306.js` — pure ICE / consciousness / seizure / motor / ICP → grade (the max of the five
  domains; 0 if none). The ICE score is entered as a sub-score; the module does not reproduce the ICE
  assessment items.
- `views/group-v306.js` (RV306) — an ICE number input + consciousness / seizure / ICP `<select>`s + a
  motor checkbox, real `<label for>`, no innerHTML.
- `lib/meta.js` — citation + accessed date + per-grade interpretation bands.
- 8 worked-example unit tests + fuzz registration; synonym entry (v27 → v28); corpus → 1158.

## Sourcing (spec-v97)

The five domains and their grade thresholds were re-fetched and cross-verified at build against two
independent sources that agree:

- **Citation:** Lee DW, Santomasso BD, Locke FL, et al. ASTCT consensus grading for cytokine release
  syndrome and neurologic toxicity associated with immune effector cells. *Biol Blood Marrow
  Transplant.* 2019;25(4):625-638. doi:10.1016/j.bbmt.2018.12.758. Cross-checked against the
  NCBI/PDQ and NHS-Wales reproductions of the ASTCT ICANS grading. The citation carries no
  ISSUER_PATTERN uppercase acronym, so no citation-staleness ledger row is required.
- **Rule:** the grade is the most severe of the ICE-score, consciousness, seizure, motor, and
  raised-ICP domains. The ICE score maps 10 → normal, 7-9 → grade 1, 3-6 → grade 2, 0-2 → grade 3;
  grade 4 for the ICE axis is captured via the consciousness domain (unarousable).

## Verification

Lint (all catalog-truth surfaces at 1158), unit suite (+8 + fuzz), build — all green. Verified in a
real browser: entering an ICE score / picking a domain renders the ASTCT grade and the severe flag.

## Out of scope

The ICE assessment items themselves (the 10-point encephalopathy screen) are entered as a sub-score,
not reproduced. The MCP adapter + golden-probe promotion follow in a separate wave.
