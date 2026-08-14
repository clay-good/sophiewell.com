# spec-v735.md — Kessler K6 Psychological Distress Scale

> Status: **SHIPPED (2026-08-13).** Builds the `k6` tile. Catalog **1565 → 1566**, group G.

## Why

The catalog had PHQ-9, GAD-7, and other mood screens but not the **K6**, the short
nonspecific-distress screen used in national health surveys. Domain gap; the K6 is public domain.

## What it does

Six distress items over the past 30 days (nervous, hopeless, restless, so depressed nothing
could cheer you up, everything an effort, worthless), each rated **0** (none of the time) to
**4** (all of the time), summed to **0–24**. Bands:

- **0–4** low · **5–12** mild-to-moderate · **13–24** probable serious mental illness.

Higher = more distress. A total of **13 or more** screens positive for probable serious mental
illness (SMI).

## Posture (spec-v97)

A self-report screen of psychological distress to support evaluation, not a diagnosis. It
supports rather than replaces the clinical evaluation.

## Files

- `lib/k6-v735.js` — `k6()`, `K6_NOTE`.
- `views/group-v735.js` (RV735) — six 0–4 selects; a11y-checked, no innerHTML.
- `mcp/adapters/k6-v735.js` — exposes the tile (clinical disclaimer).
- `lib/meta.js` — citation, example, items + bands, related (phq9, gad7).
- `test/unit/k6.test.js` — 6 tests (max 24, worked example 13, the 13 cut, the 5 cut,
  all-zero, validation).
- `docs/spec-v735.md` (this file).

## Sourcing (spec-v97)

Kessler RC, Barker PR, Colpe LJ, et al. Screening for serious mental illness in the general
population. *Arch Gen Psychiatry.* 2003;60(2):184-189 (PMID 12578436). The 6 items, 0–4 rating,
0–24 total, and the ≥ 13 serious-mental-illness threshold were confirmed against the validation
paper. The K6 is in the public domain; neutral item labels are used.
