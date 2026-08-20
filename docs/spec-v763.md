# spec-v763.md — Two kinds of label noise that were not noise

> Status: **SHIPPED (2026-08-20).** Extraction only. No tile added, no compute changed.
> Catalog stays **1564**.

## Why

[spec-v753](spec-v753.md) normalizes a field label before deriving the words that identify it:
parentheticals dropped, digits dropped, generic words dropped. That is there for a good reason —
labels double as guidance and are full of the *source's* thresholds (*"Above 2 adds 1 point"*).

Measuring which fields fail to fill, and why, showed the same normalization destroying the thing
that identifies a field.

**Qualifiers.** AKIN compares **current** creatinine against **baseline** creatinine. Both reduce
to `creatinine`, become indistinguishable, veto each other, and **neither fills** — on the
calculator whose entire point is the comparison. **280 field pairs across the catalog collide this
way**: `Quadrant 1/2/3/4 pocket depth`, `Level1/2/3 Count`, `Total` vs `Free` vs `Direct`.

**Bracketed glossaries.** An adapter documents an enum for an agent by listing it in the label:

```
Cellularity, operator-dependent [low = under 2 per field; moderate = 2 to 5; high = over 5]
```

Every option word in that glossary is a word the field must **not** be identified by. Left in, the
extractor reads `low` out of the documentation and fills it instead of the `moderate` it was given.

## What it does

| | |
|---|---|
| **Qualifiers** | Stripped by default, **kept when they discriminate**. If two fields on a tile produce identical terms, both are recomputed with qualifiers and digits intact. Self-correcting: it needs no list of which tiles care. |
| **Never on a boolean** | Criteria already use these words for corroboration. Stripping them there cost the Wells tiebreak — *"previous DVT"* lost the very word separating *Prior PE or DVT* from *Clinical signs of DVT*. |
| **Glossaries** | `[...]` dropped from a label before terms are derived, for the same reason `(mg/dL)` is. |

## Measured

Probes phrased the way a person says it — the label lead, glossaries and option enumerations
dropped, digits dropped:

**One field per query** (the shape a real question has), 4878 fields:

| | before | after |
|---|---|---|
| Correct | 3902 (80.0%) | **3949 (81.0%)** |
| **Wrong value** | **15** | **0** |

**Whole tile per query**, 1329 tiles:

| | before | after |
|---|---|---|
| Every value recovered | 942 (70.5%) | **1008 (75.8%)** |
| Recovered nothing | 137 | **99** |
| Fields recovered | 3707 (74.8%) | **3962 (81.2%)** |

## A measurement note worth keeping

The first version of this measurement built its probe from `fieldTerms` — the extractor's own
preferred wording — and reported 90.1% of fields. Phrasing probes the way a **person** would report
81.2%. The lower number is the honest one; the higher one was the extractor grading its own
homework.

It also reported 31 "wrong values" that were entirely an artifact of pasting label text containing
its own option list (`frequency: 0, 1, 2, 3, 4`) in front of the value. Chasing those as defects
would have been chasing the probe.

## Where it lives

- `lib/query-fill.js` — `QUALIFIERS`, `fieldTerms(field, { strict })`, the collision detection in
  `queryFill`, and the `[...]` strip.

## Proof

- `test/unit/query-fill.test.js` — 3 new: a discriminating qualifier is kept, a non-discriminating
  one is still dropped, and an enum is not identified by its own glossary.
- 21 query-fill unit tests, 11460 unit, 399 mcp, lint, a11y, 62 e2e: green.
