# spec-v792.md — RUDAS (Rowland Universal Dementia Assessment Scale)

> Status: **SHIPPED (2026-08-26).** Builds the `rudas` tile. Catalog **1583 → 1584**, group G.

## Why

spec-v778 added the 6CIT and noted that the brief-cognitive-screen family was thin. RUDAS is
the member of that family that exists for a specific reason: it was **built to be minimally
affected by culture, language and education**, which is exactly where MMSE and MoCA lose
accuracy — and it is free to use, where those two are not.

## What it does

Six items, each with its **own different maximum**, adding to exactly 30:

| Item | Max |
| --- | --- |
| Memory | 8 |
| Body orientation | 5 |
| Praxis | 2 |
| Drawing | 3 |
| Judgement | 4 |
| Language | 8 |

**Higher is better** — the opposite direction from the 6CIT shipped in spec-v778, which is
worth stating plainly for anyone using both.

**A total of 22 or less is possible cognitive impairment** and should prompt further
investigation. At that 22/23 cut point the original multi-ethnic validation reported about
**89% sensitivity and 98% specificity**.

**Worked example:** memory 6, body 4, praxis 2, drawing 2, judgement 3, language 5 → **22 of
30**, possible cognitive impairment.

The differing maxima are the thing to get wrong, so a test walks **every** item and checks
that its own maximum is accepted and its maximum-plus-one is rejected. Another pins the 22/23
boundary from both sides.

## Posture (spec-v97)

A screening test that flags the need for a fuller assessment. It does not diagnose dementia
or identify its cause.

## Files

- `lib/rudas-v792.js` — `rudas()`, `RUDAS_NOTE`, `MAX_TOTAL`.
- `views/group-v792.js` (RV792) — six number inputs, each carrying its own maximum on the label and in its `max` attribute; a11y-checked.
- `mcp/adapters/rudas-v792.js` — exposes the tile (clinical disclaimer).
- `lib/meta.js` — citation, example, item maxima, direction, cut point, related (sixcit, mini-cog, ad8).
- `test/unit/rudas.test.js` — 5 tests (maxima sum to 30, both extremes, the 22/23 boundary, every per-item cap, every item required).
- `docs/spec-v792.md` (this file).

## Sourcing (spec-v97)

Storey JE, Rowland JTJ, Basic D, Conforti DA, Dickson HG. *Int Psychogeriatr.*
2004;16(1):13-31 (PMID 15190994). All six item maxima and the 22 cut point were confirmed
against two independent measure references that agreed item-for-item. The maxima also **sum
to exactly 30**, the published total, which independently rules out a transcription error in
any one of them.
