# spec-v731.md — Infant Breastfeeding Assessment Tool (IBFAT)

> Status: **SHIPPED (2026-08-13).** Builds the `ibfat` tile. Catalog **1561 → 1562**, group G.

## Why

The catalog had the LATCH breastfeeding tool but not the **IBFAT**, a distinct 4-item
observational measure of infant feeding behavior at a feed. Companion gap.

## What it does

Four items each scored **0–3** (best response = 3), summed to **0–12** (neutral item-topic
labels only; anchor wording is copyrighted):

- readiness to feed (behavioral state) · rooting · fixing (latching on) · sucking pattern.

Higher = more effective feeding. A total of **10–12** indicates effective feeding behavior.

## Posture (spec-v97)

Describes a single observed feed to support breastfeeding assessment and lactation support; it is
not a diagnosis. Only neutral item labels are used. It supports rather than replaces the clinical
and lactation evaluation.

## Files

- `lib/ibfat-v731.js` — `ibfat()`, `IBFAT_NOTE`.
- `views/group-v731.js` (RV731) — four 0–3 selects; a11y-checked, no innerHTML.
- `mcp/adapters/ibfat-v731.js` — exposes the tile (clinical disclaimer).
- `lib/meta.js` — citation, example, items + bands, related (apgar, ballard).
- `test/unit/ibfat.test.js` — 5 tests (max 12, worked example 10, the 10 cut, all-zero,
  validation).
- `docs/spec-v731.md` (this file).

## Sourcing (spec-v97)

Matthews MK. Developing an instrument to assess infant breastfeeding behaviour in the early
neonatal period. *Midwifery.* 1988;4(4):154-165 (PMID 3210979). The four items, 0–3 scoring, 0–12
total, and the 10–12 effective-feeding band were confirmed against the instrument-development
paper and a Japanese-validation reference; only the scoring method is implemented, with neutral
labels.
