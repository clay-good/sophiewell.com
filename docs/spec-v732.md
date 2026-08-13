# spec-v732.md — Fatigue Severity Scale (FSS)

> Status: **SHIPPED (2026-08-13).** Builds the `fss` tile. Catalog **1562 → 1563**, group G.

## Why

The catalog had no fatigue-impact instrument at all. The **FSS** is the most widely used
self-report measure of how much fatigue affects daily functioning — a clean domain gap.

## What it does

Nine statements, each rated **1** (strongly disagree) to **7** (strongly agree). The score is
the **mean** of the nine ratings (range **1–7**); the item sum (9–63) is also reported.

Higher = greater fatigue impact. A mean of **4 or greater** is commonly used as the threshold
for clinically significant fatigue. Only neutral item-topic labels are used (statement wording
is copyrighted).

## Posture (spec-v97)

A self-report screen of fatigue impact to support evaluation, not a diagnosis. Only neutral item
labels are used. It supports rather than replaces the clinical evaluation.

## Files

- `lib/fss-v732.js` — `fss()`, `FSS_NOTE`.
- `views/group-v732.js` (RV732) — nine 1–7 selects; a11y-checked, no innerHTML.
- `mcp/adapters/fss-v732.js` — exposes the tile (clinical disclaimer).
- `lib/meta.js` — citation, example, items + bands, related (epworth, phq-9).
- `test/unit/fss.test.js` — 5 tests (mean 7, worked example mean 5, the mean-4 cut,
  all-ones, validation).
- `docs/spec-v732.md` (this file).

## Sourcing (spec-v97)

Krupp LB, LaRocca NG, Muir-Nash J, Steinberg AD. The fatigue severity scale. Application to
patients with multiple sclerosis and systemic lupus erythematosus. *Arch Neurol.*
1989;46(10):1121-1123 (PMID 2803071). The nine items, 1–7 rating, mean-of-nine scoring, and the
mean ≥ 4 clinically-significant threshold were confirmed against the scale-development paper;
only the scoring method is implemented, with neutral labels.
