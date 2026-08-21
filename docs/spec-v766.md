# spec-v766.md — A question reaches the calculator it names

> Status: **SHIPPED (2026-08-20).** Search ranking + a new gate. No tile added, no compute changed.
> Catalog stays **1564**.

## Why

Every measurement before this ran the ranker **directly**. The app does more: `searchUtilities`
ranks names and ids, `resolvePrompt` consults the synonym table, an inline-compute hit is promoted,
and an audience hint filters. A query can rank correctly in isolation and land somewhere else in
the app.

Driving the real app with value-bearing queries — the shape the one-box design asks for — missed 3
of 60 sampled tiles:

| named | reached |
|---|---|
| `TyG-BMI (Triglyceride-Glucose-BMI Index)` | `bmi` |
| `Modified Glasgow (Imrie) Pancreatitis Severity` | `ranson-bisap` |
| `Modified EHRA Symptom Scale (Atrial Fibrillation)` | `chads` |

Token overlap lets a **shorter name beat a longer one that contains it**. This is the same defect
[spec-v762](spec-v762.md) fixed for the MCP, which the website never got.

## What it does

`lib/name-match.js` — the MCP's name scoring, moved somewhere both surfaces can use it so they
cannot drift apart. Summed rarity of matched name words, scaled by how much of the name they cover.

Two things the naive version gets wrong, both learned the hard way:

- **Lookup, not filtering.** Promotion can only reorder what the ranker returned, and the ranker
  sometimes returns *one row*: the EHRA query came back as CHA2DS2-VASc alone, with the named tile
  nowhere in the list. `buildNameIndex` inverts name words to ids, so the search costs the length
  of the query rather than the size of the catalog — this runs on every keystroke.
- **Two matched words, on the website.** One is not enough: `therapy` appears in a single
  calculator name, which makes it *rare*, and it still promoted Therapy Units over CHA2DS2-VASc for
  "antithrombotic therapy not recommended". Rarity among names is not meaningfulness in language.

## What protects the curated routes

The first attempt skipped promotion whenever `resolvePrompt` returned a synonym hit. That was the
wrong instrument and it broke PEWS: the curated table maps the generic phrase *"early warning
score"* to NEWS2, and a query naming **PEWS** says that phrase on its way to naming a different
tile.

`minHits: 2` protects them properly. *"they denied it"* and *"kidney function"* name no tile with
two distinctive words, so nothing is promoted over `appeal-letter` or `egfr`. The guard came out.

## The whole catalog

`ROUTING_SAMPLE=all` runs every tile that has documented values — 1337 of them:

| | |
|---|---|
| Reach the tile they name | **1332 (99.6%)** |
| Miss | 5 |

All five are **bidirectional sibling pairs**, each naming the other:

```
palliative-prognostic-index  <->  palliative-prognostic-score
iadpsg                       <->  carpenter-coustan
kdigo-aki                    <->  ckd-staging
timi                         <->  timi-risk-index
gir                          <->  conc-rate
```

`Palliative Prognostic Index` and `Palliative Prognostic Score` differ by one word. A reader typing
either could reasonably mean either, and there is no signal in the query to prefer one — the same
irreducible class as the 47 identical labels in [spec-v764](spec-v764.md). Left alone.

## Proof

- `test/integration/query-routing.spec.js` — **new.** 200 tiles, deterministically sampled across
  the catalog, each asked with its own documented values appended. This is the gate that did not
  exist: nothing drove the app with values in the query, which is why spec-v765's defect and this
  one both reached production. ~19s.
- The synonym and corpus-prose smoke tests still pass, which is what the `minHits` rule exists for.
- 11470 unit, 399 mcp, lint, a11y, 47 e2e: green.
