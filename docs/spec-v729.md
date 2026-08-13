# spec-v729.md — Activities-specific Balance Confidence (ABC) Scale

> Status: **SHIPPED (2026-08-13).** Builds the `abc-scale` tile. Catalog **1559 → 1560**, group G.

## Why

The catalog had performance-based balance tools (Berg, Tinetti, TUG) but not the **ABC Scale**,
the standard self-report of balance *confidence* and a strong fall-risk indicator. Gap.

## What it does

The person rates their confidence (**0–100%**) of not losing balance during each of **16**
everyday activities. The ABC score is the **mean** of the 16 ratings (0–100).

- **< 67%** = increased risk of falling (community-dwelling older adults).
- Functioning bands: **< 50** low, **50–80** moderate, **> 80** high.

## Posture (spec-v97)

Measures balance confidence to gauge fall risk and track change; it is not a performance test or
a diagnosis. It supports rather than replaces the physical and fall-risk assessment.

## Files

- `lib/abc-scale-v729.js` — `abcScale()`, `ABC_NOTE`.
- `views/group-v729.js` (RV729) — sixteen 0–100% number inputs; a11y-checked.
- `mcp/adapters/abc-scale-v729.js` — exposes the tile (clinical disclaimer).
- `lib/meta.js` — citation, example, score + cutoffs, related (tug, berg-balance, tinetti-poma).
- `test/unit/abc-scale.test.js` — 5 tests (mean 60, weighted mean, the 67% cutoff, functioning
  bands, all-required validation).
- `docs/spec-v729.md` (this file). This is catalog tile 1560.

## Sourcing (spec-v97)

Powell LE, Myers AM. The Activities-specific Balance Confidence (ABC) Scale. *J Gerontol A Biol
Sci Med Sci.* 1995;50A(1):M28-M34 (PMID 7814786). The 16-activity mean scoring, the < 67%
fall-risk cutoff, and the Myers < 50 / 50–80 / > 80 functioning bands were confirmed across a
Physiopedia reference and a Mobile Measures summary, which agree.
