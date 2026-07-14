# spec-v302.md — Instability Severity Index Score (ISIS) tile

> Status: **SHIPPED (2026-07-14).** Builds the `isis-shoulder` tile — a catalog gap surfaced by the
> SESSION-40 fresh-domain search sweep ("shoulder dislocation/instability" had no tile). Catalog
> **1153 → 1154**, group G.

## Why

The SESSION-40 sweep found "shoulder dislocation risk" routed only to alphabetical noise — no
shoulder-instability tile existed. The ISIS is the standard preoperative score an orthopedic /
sports-medicine surgeon uses to choose between an arthroscopic Bankart repair and an open procedure.

## What it does

The clinician checks the six preoperative factors; the tile sums them (0–10) and flags a score above
6 (high recurrence risk after an arthroscopic Bankart repair, for whom an open procedure — Latarjet
or open Bankart — is favored). It reports the cited score and its published threshold, not a surgical
decision ([spec-v11](spec-v11.md) §5.3).

- `lib/isis-v302.js` — pure factor booleans → 0–10 total with the >6 high-risk flag.
- `views/group-v302.js` (RV302) — six weighted-factor checkboxes, real `<label for>`, no innerHTML.
- `lib/meta.js` — citation + accessed date + low- / high-risk interpretation bands.
- 6 worked-example unit tests + fuzz registration; synonym entry (v22 → v23); corpus → 1154.

## Sourcing (spec-v97)

The six factors, their weights (2/2/1/1/2/2, max 10), and the >6 cutoff were re-fetched and
cross-verified at build against two independent sources that agree:

- **Citation:** Balg F, Boileau P. The instability severity index score. A simple pre-operative score
  to select patients for arthroscopic or open shoulder stabilisation. *J Bone Joint Surg Br.*
  2007;89(11):1470-1477. doi:10.1302/0301-620X.89B11.18962. Cross-checked against the reliability
  study (Clin Orthop Surg 2019;11(4):445), which reproduces the same Table 1. The citation carries no
  ISSUER_PATTERN uppercase acronym, so no citation-staleness ledger row is required.

## Verification

Lint (all catalog-truth surfaces at 1154), unit suite (+6 + fuzz), build — all green. Verified in a
real browser: checking factors sums the score and flags the >6 high-risk band.

## Out of scope

The score's known limitations (later studies question its predictive value in some cohorts) and
alternative bone-loss thresholds (glenoid loss >14.5%, Hill-Sachs volume) are noted in the source but
out of scope; the tile reports the original ISIS as published. The MCP adapter + golden-probe
promotion follow in a separate wave.
