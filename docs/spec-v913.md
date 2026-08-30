# spec-v913 — Four tiles are the same instrument twice

## What this is

An audit, a finder script, and a recommendation. **No tile is removed here** — retiring a tile
takes four published `/tools/<id>/` pages off the site, which is not a call this change makes on
its own.

## The finding

Four pairs are the same instrument built twice, years apart, by authors who did not see the
first one.

| Keep | Retire | Why |
| --- | --- | --- |
| `forrest-classification` | `forrest` | One instrument, one input, the same six Forrest classes. |
| `glasgow-blatchford` | `gbs` | The same Blatchford 2000 score; the survivor adds a urea unit toggle. |
| `oxygenation-index` | `osi-oxygenation` | The survivor returns the same OSI (10.2) and the same band on the same inputs, and an OI besides. |
| `ut-diabetic-foot` | `university-texas-dfu` | The same grade-by-stage grid; the survivor is much the fuller build. |

Each verdict comes from opening both adapters, not from a score.

## Three pairs that look identical and are not

Worth recording, because each would have been a wrong deletion:

- **`npiap-staging` / `pressure-injury-stage`** — one **derives** the NPIAP stage from
  observations (skin intact, erythema behavior, depth); the other **explains** a stage already
  assigned. That is a deliberate pair, not an accident.
- **`benzo-equiv` / `benzodiazepine-equivalence`** — overlapping, and the newer one covers twelve
  drugs against eight. But the eight are not a subset: **`benzo-equiv` carries midazolam and the
  other does not.**
- **`unit-converter` / `unit-converter-v4`** — overlapping, and v4 has the lab and vital
  conversions. But **v4 has no volume conversion** and the older one does.

## Why detection needed a person

Two automatic signals were tried and both failed:

- **Comparing computed output** over the whole input space is too coarse. Any two tiles returning
  a plain 0–N total match each other; the first cut paired Guy's stone score with an anaphylaxis
  grade.
- **Comparing declared input signatures** is too narrow. The same instrument gets rebuilt with a
  different field count and a different unit toggle, so three of the four real duplicates have
  different signatures and this misses them.

What works is the **tile name** — two authors building the same instrument write nearly the same
name, because the instrument has one. `scripts/find-duplicate-tiles.mjs` reports pairs above a
name-similarity floor and carries a ledger of the pairs already read, so a re-run shows what is
new. It is a finder, not a gate: 93 pairs clear the floor and most are legitimate families
(ICHD-3 has seven, the RADS systems several).

The floor is **0.55, not 0.6**, because one confirmed duplicate sits at 0.57: *"…Diabetic Foot
**Wound** Classification"* against *"…Diabetic Foot **Ulcer** Class"*. One word apart on the thing
they both name, and a 0.6 floor hid it.

## Recommended next step

Retire the four, each via `data/id-aliases.json` — the alias map built for exactly this in
spec-v637, empty until now — so an agent holding a retired id self-heals to the survivor. Move
each retired tile's synonym phrases to its survivor in the same change, and drop the count
surfaces by four.

## Files

New: `scripts/find-duplicate-tiles.mjs`, this file. Nothing else changes.
