# spec-v737.md — Short Michigan Alcoholism Screening Test (SMAST)

> Status: **SHIPPED (2026-08-15).** Builds the `smast` tile. Catalog **1566 → 1567**, group G.

## Why

The alcohol-screening cluster had CAGE, AUDIT-C, and the full AUDIT but no member of the
**MAST** family. The SMAST is the classic 13-item self-administered alcohol-problem screen and
is in the public domain. Domain/companion gap.

## What it does

Thirteen yes/no items, each worth **1** point, summed to **0–13**. Items **1, 4, and 5** are
**reverse-keyed** (a "no" earns the point — e.g. "are you able to stop drinking when you want
to?"); the other ten items score on a "yes". Bands (Selzer 1975):

- **0–1** no problem · **2** borderline · **3–13** probable alcohol problem (positive screen).

Higher = more indication of a drinking problem. A total of **3 or more** screens positive.

## Posture (spec-v97)

A self-report screen for alcohol problems to support evaluation, not a diagnosis. It supports
rather than replaces the clinical evaluation.

## Files

- `lib/smast-v737.js` — `smast()`, `SMAST_NOTE`.
- `views/group-v737.js` (RV737) — thirteen yes/no selects; a11y-checked, no innerHTML.
- `mcp/adapters/smast-v737.js` — exposes the tile (clinical disclaimer).
- `lib/meta.js` — citation, example (total 4 → positive), items + bands, related (auditc, audit-full).
- `test/unit/smast.test.js` — 6 tests (max 13, worked example 4, the 3 cut, all-healthy 0,
  reverse-keying of items 1/4/5, validation).
- `docs/spec-v737.md` (this file).

## Sourcing (spec-v97)

Selzer ML, Vinokur A, van Rooijen L. A self-administered Short Michigan Alcoholism Screening
Test (SMAST). *J Stud Alcohol.* 1975;36(1):117-126 (PMID 238068). The 13 items, the reverse-keyed
set (items 1, 4, 5 score on "no"), the 1-point-per-item unweighted scoring, and the 0–1 / 2 / ≥3
interpretation bands were source-verified against the primary paper and the published instrument.
The SMAST instrument (items + scoring) is in the public domain. Some administrative forms shift
the cutoff bands; the original Selzer three-band scheme (≥3 positive) is implemented as the
authoritative one.
