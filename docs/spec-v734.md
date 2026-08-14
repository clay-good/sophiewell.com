# spec-v734.md — PHQ-15 (Somatic Symptom Severity)

> Status: **SHIPPED (2026-08-13).** Builds the `phq15` tile. Catalog **1564 → 1565**, group G.

## Why

The catalog had `phq9` and the `phq2-gad2` ultra-brief screeners but not the **PHQ-15**, the
PHQ-family measure of **somatic** symptom burden. Companion gap; the PHQ instruments are free to
use without permission.

## What it does

Fifteen somatic symptoms, each rated **0** (not bothered at all), **1** (bothered a little),
**2** (bothered a lot) over the past 4 weeks, summed to **0–30**. Severity bands:

- **0–4** minimal · **5–9** low · **10–14** medium · **15–30** high somatic symptom severity.

Higher = greater burden. A total of **10 or more** is flagged as the clinically meaningful state.

## Posture (spec-v97)

A self-report screen of somatic symptoms to support evaluation, not a diagnosis. It supports
rather than replaces the clinical evaluation.

## Files

- `lib/phq15-v734.js` — `phq15()`, `PHQ15_NOTE`.
- `views/group-v734.js` (RV734) — fifteen 0–2 selects; a11y-checked, no innerHTML.
- `mcp/adapters/phq15-v734.js` — exposes the tile (clinical disclaimer).
- `lib/meta.js` — citation, example, items + bands, related (phq9, phq2-gad2).
- `test/unit/phq15.test.js` — 5 tests (max 30, worked example 12, band edges, all-zero,
  validation).
- `docs/spec-v734.md` (this file).

## Sourcing (spec-v97)

Kroenke K, Spitzer RL, Williams JB. The PHQ-15: validity of a new measure for evaluating the
severity of somatic symptoms. *Psychosom Med.* 2002;64(2):258-266 (PMID 11914441). The 15 items,
0–2 rating, 0–30 total, and the 5/10/15 severity-band cutoffs were confirmed against the
validation paper. The PHQ instruments are free to use without permission; neutral symptom labels
are used.
