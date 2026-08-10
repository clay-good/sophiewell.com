# spec-v693.md — INTERCHEST clinical prediction rule (chest pain, CAD)

> Status: **SHIPPED (2026-08-10).** Builds the `interchest` tile. Catalog **1523 → 1524**, group G.

## Why

The catalog had emergency-department chest-pain tools (HEART, EDACS) and the Marburg Heart
Score, but not **INTERCHEST**, the pooled 5-country primary-care rule for coronary artery
disease as the cause of chest pain. Axis gap (primary-care CAD probability).

## What it does

Six items summed, range **−1 to +5**:

| Item | Points |
| --- | --- |
| Age/sex: female ≥ 65 or male ≥ 55 | +1 |
| History of coronary artery disease | +1 |
| Pain brought on by exertion | +1 |
| Pain feels like "pressure" | +1 |
| Physician initially suspected a serious / cardiac cause | +1 |
| Pain reproducible by palpation | **−1** |

**< 2 → CAD unlikely** (probability ~2.1%, NPV ~98%). **≥ 2 → CAD not excluded** (~43%);
expedite cardiac testing.

## Posture (spec-v97)

Derived in **primary care**; not for acute-coronary-syndrome triage in the emergency
department. It supports rather than replaces clinical judgment.

## Files

- `lib/interchest-v693.js` — `interchest()`, `INTERCHEST_NOTE`.
- `views/group-v693.js` (RV693) — age number + sex select + five checkboxes (one −1); a11y-checked.
- `mcp/adapters/interchest-v693.js` — exposes the tile (clinical disclaimer).
- `lib/meta.js` — citation, example, point table + bands, related (heart, marburg-heart-score, edacs).
- `test/unit/interchest.test.js` — 6 tests (baseline 0, age/sex threshold, palpation −1, worked
  example 2, ≥ 2 cutoff, validation).
- `docs/spec-v693.md` (this file).

## Sourcing (spec-v97)

Aerts M, Minalu G, Bosner S, et al. Pooled individual patient data from five countries were used
to derive a clinical prediction rule for coronary artery disease in primary care. *J Clin
Epidemiol.* 2017;81:120-128 (PMID 27773828). The six items (including the −1 palpation item), the
−1 to +5 range, and the < 2 vs ≥ 2 probabilities (2.1% vs 43%) were confirmed against the
derivation and an independent calculator reproduction, which agree exactly.
