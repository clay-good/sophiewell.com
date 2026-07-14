# spec-v303.md — Anaphylaxis severity grade (Ring & Messmer) tile

> Status: **SHIPPED (2026-07-14).** Builds the `anaphylaxis-grade` tile — a catalog gap surfaced by
> the SESSION-40 fresh-domain search sweep ("anaphylaxis grading" had no tile). Catalog
> **1154 → 1155**, group G.

## Why

The SESSION-40 sweep found "anaphylaxis grading" routed only to unrelated tiles — no
anaphylaxis-severity tile existed. The Ring & Messmer four-step grade is the most widely used
description of acute reaction severity, especially in emergency and perioperative anaphylaxis.

## What it does

The clinician selects the grade (I–IV); the tile reports the clinical features of that grade and
whether it is life-threatening (grades III–IV, managed as anaphylaxis). It reports the classification
descriptor, not a diagnosis and not a treatment order ([spec-v11](spec-v11.md) §5.3).

- `lib/anaphylaxis-v303.js` — pure grade → (features, life-threatening) lookup.
- `views/group-v303.js` (RV303) — a single grade `<select>`, real `<label for>`, no innerHTML.
- `lib/meta.js` — citation + accessed date + per-grade interpretation bands.
- 6 worked-example unit tests + fuzz registration; synonym entry (v23 → v24); corpus → 1155.

## Sourcing (spec-v97)

The four grades and their features were re-fetched and cross-verified at build against two
independent sources that agree:

- **Citation:** Ring J, Messmer K. Incidence and severity of anaphylactoid reactions to colloid
  volume substitutes. *Lancet.* 1977;1(8009):466-469. doi:10.1016/S0140-6736(77)91953-5.
  Cross-checked against perioperative-anaphylaxis reviews (BJA 2016;117(5):551; BJA Education 2019),
  which reproduce the same I–IV grading. The citation carries no ISSUER_PATTERN uppercase acronym, so
  no citation-staleness ledger row is required.

## Verification

Lint (all catalog-truth surfaces at 1155), unit suite (+6 + fuzz), build — all green. Verified in a
real browser: the grade select renders the features and the life-threatening flag.

## Out of scope

Other severity systems used in different contexts (WAO systemic-reaction grading, Brown 2004,
Sampson food-allergy grading) are separate scales and out of scope; this tile is the Ring & Messmer
grade as published. The MCP adapter + golden-probe promotion follow in a separate wave.
