# spec-v309.md — Acute GVHD grade (modified Glucksberg) tile

> Status: **SHIPPED (2026-07-14).** Builds the `gvhd-grade` tile — a catalog gap surfaced by the
> SESSION-40 final probe ("graft versus host disease grading" had no tile). Catalog **1160 → 1161**,
> group G.

## Why

The final probe found "graft versus host disease grading" / "gvhd severity grade" routed only to
unrelated tiles — no acute-GVHD-grading tile existed. Acute GVHD grading is used constantly on
allogeneic-transplant units, in the same toxicity cluster as the spec-v305/v306 CRS/ICANS tiles.

## What it does

The clinician picks the skin, liver, and gastrointestinal organ stages (0–4 each); the tile reports
the overall acute GVHD grade (0–IV) by the modified Glucksberg grouping, flagging grades III–IV as
severe. It reports the classification grade, not a treatment order ([spec-v11](spec-v11.md) §5.3).

- `lib/gvhd-v309.js` — pure organ-stages → overall grade (IV if any organ stage 4; III if liver/GI
  stage 2-3; II if skin 3 or liver/GI 1; I if skin 1-2).
- `views/group-v309.js` (RV309) — three organ-stage `<select>`s with the staging thresholds in the
  labels, real `<label for>`, no innerHTML.
- `lib/meta.js` — citation + accessed date + per-grade interpretation bands.
- 8 worked-example unit tests + fuzz registration; synonym entry (v30 → v31); corpus → 1161.

## Sourcing (spec-v97)

The organ staging (skin BSA, liver bilirubin, GI diarrhea) and the modified Glucksberg overall-grade
grouping were re-fetched and cross-verified at build against two independent sources that agree:

- **Citation:** Przepiorka D, Weisdorf D, Martin P, et al. 1994 Consensus Conference on Acute GVHD
  Grading. *Bone Marrow Transplant.* 1995;15(6):825-828 (modified Glucksberg). Cross-checked against
  StatPearls (Graft Versus Host Disease, NBK538235). Neither carries an ISSUER_PATTERN uppercase
  acronym, so no citation-staleness ledger row is required.
- **System note:** other systems (MAGIC/Mount Sinai 2016, IBMTR) stage similarly with minor wording
  differences; this tile uses the modified Glucksberg overall grade and says so in the note.

## Verification

Lint (all catalog-truth surfaces at 1161), unit suite (+8 + fuzz), build — all green. Verified in a
real browser: picking organ stages renders the overall grade and the severe flag.

## Out of scope

Chronic GVHD (NIH consensus) is a separate scoring system and out of scope. The tile takes the organ
stages the clinician has determined; the exact staging thresholds are in the note. The MCP adapter +
golden-probe promotion follow in a separate wave.
