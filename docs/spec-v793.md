# spec-v793.md — Simple Shoulder Test (SST)

> Status: **SHIPPED (2026-08-26).** Builds the `simple-shoulder-test` tile. Catalog
> **1584 → 1585**, group G.

## Why

The shoulder cluster had `spadi` (pain and disability), `quickdash` (upper-limb disability)
and `isis-shoulder` (instability) — all of them scored on rating scales. The SST is the one
that asks **plain yes-or-no questions about what the shoulder can actually do**: can you
sleep on it, can you lift a gallon of milk, can you do your job. It is free, it takes a
minute, and it is the one a patient can answer without a rating scale in front of them.

## What it does

Twelve yes-or-no questions. **Each yes scores 1**, giving **0 to 12**, and **higher is
better**.

| | |
| --- | --- |
| 1–2 | comfort at rest and in bed |
| 3–5 | reaching behind the back, behind the head, and to a shelf |
| 6–8 | lifting one pound, eight pounds, and carrying twenty |
| 9–11 | throwing underhand, throwing overhand, washing the opposite shoulder |
| 12 | working full-time at the regular job |

**There are no subscales and no weights** — comfort at rest counts exactly as much as
carrying twenty pounds. That evenness is the design, and a test walks all twelve questions
confirming each is worth exactly one point.

Percentage = total ÷ 12 × 100. Published descriptions divide either by 12 or by the number of
questions answered; the tile asks all twelve, so the two rules give the same number and the
ambiguity cannot bite.

**Worked example:** yes to eight of the twelve → **8 of 12, 66.7%**.

## Posture (spec-v97)

Records what the patient reports they can do. Not an examination, a diagnosis, or a decision
about surgery, and most useful compared against the same shoulder over time.

## Files

- `lib/simple-shoulder-test-v793.js` — `simpleShoulderTest()`, `SST_NOTE`, `QUESTIONS`.
- `views/group-v793.js` (RV793) — twelve checkboxes, where ticked is yes; a11y-checked.
- `mcp/adapters/simple-shoulder-test-v793.js` — exposes the tile (clinical disclaimer).
- `lib/meta.js` — citation, example, scoring, direction, the no-weights note, related (quickdash, spadi).
- `test/unit/simple-shoulder-test.test.js` — 6 tests (twelve questions exist, both extremes, every question weighs one, the worked example, percentage tracking).
- `docs/spec-v793.md` (this file).

## Sourcing (spec-v97)

Lippitt SB, Harryman DT, Matsen FA, in *The Shoulder: A Balance of Mobility and Stability*,
AAOS 1993. The scoring rule — yes = 1, no = 0, total 0–12, percentage out of 12 — was
confirmed against two independent sources. The twelve questions were taken from the
developers' own institution, the University of Washington shoulder service, which publishes
them in full; that is the primary source for the item text rather than a secondary rendering
of it.

## Gate note

`data/synonyms.json` phrases must be unique **across the whole table**, enforced by
`test/unit/synonyms-catalog.test.js` and not by `npm run lint`. My first draft claimed
"shoulder function questionnaire", which `spadi` already owns — a collision that only shows
up once two tiles are in the same clinical neighbourhood. It became "yes no shoulder function
test", which is also the more distinctive phrase for this instrument.
