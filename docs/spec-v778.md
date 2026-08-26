# spec-v778.md — 6CIT (Six-item Cognitive Impairment Test)

> Status: **SHIPPED (2026-08-26).** Builds the `sixcit` tile. Catalog **1569 → 1570**, group G.

## Why

The brief-cognitive-screen family had `mini-cog`, `ad8` (informant) and `slums`, but not the
6CIT — the screen most used in UK primary care, and the one that is explicitly free to use
where MMSE and MoCA are not. It is also the only member of the family that is **inverse
scored**, which is exactly the kind of direction a calculator should get right for you.

## What it does

Six weighted tasks. Points are earned for **errors**, so higher is worse; maximum 28.

| Task | Points |
| --- | --- |
| Year named incorrectly | 4 |
| Month named incorrectly | 3 |
| Time wrong by more than an hour | 3 |
| Counting backward 20 → 1 | 0 correct / 2 one error / 4 more than one |
| Months of the year in reverse | 0 correct / 2 one error / 4 more than one |
| Five-part address recall | 2 per component missed, up to 10 |

**Bands:** 0–7 normal; 8–9 significant, consider referral; 10–28 significant, refer.

**Worked example:** year wrong (4) + one counting error (2) + one address part missed (2)
= **8 of 28**, the first significant score.

Address recall is genuinely per-component, not a flat weight — a test pins 1 → 2, 3 → 6,
5 → 10 so that never quietly collapses.

## Posture (spec-v97)

A screening test that flags the need for a fuller assessment. It does not diagnose dementia
or any of its causes. Only neutral task labels ship: the Kingshill Research Centre owns the
copyright to the Kingshill Version 2000 wording and permits free use by healthcare
professionals.

## Files

- `lib/sixcit-v778.js` — `sixcit()`, `SIXCIT_NOTE`.
- `views/group-v778.js` (RV778) — three checkboxes and three error-count selects; a11y-checked.
- `mcp/adapters/sixcit-v778.js` — exposes the tile (clinical disclaimer).
- `lib/meta.js` — citation, example, weights + bands, related (ad8, mini-cog, slums).
- `test/unit/sixcit.test.js` — 7 tests (0, the 28 maximum, the 8-point worked example, the 7/8 boundary, the 10 boundary, per-component address recall, invalid counts).
- `docs/spec-v778.md` (this file).

## Sourcing (spec-v97)

Brooke P, Bullock R. *Int J Geriatr Psychiatry.* 1999;14(11):936-940 (PMID 10556864);
Kingshill Version 2000. All six item weights, the 28 maximum, and the 0–7 / 8+ threshold were
confirmed item-for-item against the Kingshill Version 2000 form as published by NHS Right
Decisions and an independent calculator reproduction. The two sources agree on every weight;
the 8–9 / 10–28 split within the significant range comes from the second and is presented as
the usual practice, not as the primary source's own rule.
