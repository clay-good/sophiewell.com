# spec-v738.md — CAGE-AID (CAGE Adapted to Include Drugs)

> Status: **SHIPPED (2026-08-16).** Builds the `cage-aid` tile. Catalog **1567 → 1568**, group G.

## Why

The catalog had CAGE (alcohol only), AUDIT-C, the full AUDIT, and now SMAST, but not the
**CAGE-AID** — the CAGE questions broadened to cover drug use as well as alcohol. Companion gap
in the substance-screening cluster; the CAGE-AID is in the public domain.

## What it does

Four yes/no items — **Cut down, Annoyed, Guilty, Eye-opener** — about drinking *or drug use*,
each worth **1** point on a "yes", summed to **0–4**. Bands:

- **0–1** negative · **2–4** positive screen (further assessment warranted).

Higher = more concern. A total of **2 or more** is the standard positive screen; a single
affirmative answer may still merit inquiry.

## Posture (spec-v97)

A self-report screen for alcohol and drug problems to support evaluation, not a diagnosis. It
supports rather than replaces the clinical evaluation.

## Files

- `lib/cage-aid-v738.js` — `cageAid()`, `CAGE_AID_NOTE`.
- `views/group-v738.js` (RV738) — four yes/no selects; a11y-checked, no innerHTML.
- `mcp/adapters/cage-aid-v738.js` — exposes the tile (clinical disclaimer).
- `lib/meta.js` — citation, example (total 2 → positive), items + bands, related (cage, auditc).
- `test/unit/cage-aid.test.js` — 4 tests (all-yes 4, all-no 0, the 2 cut, validation).
- `docs/spec-v738.md` (this file).

## Sourcing (spec-v97)

Brown RL, Rounds LA. Conjoint screening questionnaires for alcohol and other drug abuse:
criterion validity in a primary care practice. *Wis Med J.* 1995;94(3):135-140 (PMID 7778330).
The four items, the 1-point-per-"yes" scoring, and the ≥2 positive-screen cutoff were confirmed
against the primary source. The CAGE-AID is in the public domain.
