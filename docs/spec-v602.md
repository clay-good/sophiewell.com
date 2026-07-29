# spec-v602 — Virginia Radiosurgery AVM Scale (VRAS)

## What this gives you

A 0–4 ordinal score for radiosurgical outcome — and an explicit account of where it collides with itself and
where it diverges from the continuous score beside it.

## Why it exists

A **companion with a different construction** to `pollock-flickinger` (spec-v601). Same question, same
disease, incompatible outputs: **ordinal points here, a continuous formula there.**

## The scale

| Item | Points |
|---|---|
| Volume < 2 cm³ / 2–4 cm³ / > 4 cm³ | 0 / 1 / 2 |
| Eloquent location | 1 |
| Prior hemorrhage | 1 |

| Score | Favorable outcome |
|---|---|
| 0–1 | **80%** |
| 2 | **70%** |
| 3–4 | **45%** |

## Three things worth knowing

**Five values, three bands.** A 0 and a 1 share a figure; so do a 3 and a 4. The scale is *finer than the
evidence behind it* — no per-score rate is invented.

**Volume carries half the scale, and that causes a collision.** A 5 cm³ AVM with no eloquence and no
hemorrhage scores **2** — exactly like a 1 cm³ eloquent AVM that has bled. Different patients, same score.

**The volume item saturates at 4 cm³; the companion's does not.**

| | VRAS | Pollock-Flickinger volume term |
|---|---|---|
| 5 cm³ | 2 points | 0.5 |
| 40 cm³ | 2 points | 4.0 |

Identical here, **3.5 apart** there. A test imports the companion's coefficient so the comparison can't drift.

**The two scales share only volume** — eloquence and prior hemorrhage here, age and a location tier there —
so they can rank patients in opposite orders, and neither converts into the other.

## "Favorable outcome" is a composite

Obliteration **and** no post-treatment hemorrhage **and** no permanent symptomatic radiation-induced
complication. All three must hold — so a rate against it is **not** the obliteration rate.

## Scope (spec-v11 §5.3)

Predicts a **radiosurgical** outcome at a group level for a patient in whom radiosurgery is already being
considered. It does not choose between radiosurgery, microsurgery, embolization and **observation** —
observation is a real option, since ARUBA found medical management superior to intervention for *unruptured*
malformations over its follow-up. It does not plan a dose or target volume, and a favourable score is not by
itself an indication to treat.

## Source

- Starke RM, Yen CP, Ding D, Sheehan JP. *J Neurosurg.* 2013;119(4):981-987.

## Files

`lib/vras-v602.js`, `views/group-v602.js`, `mcp/adapters/vras-v602.js` (wave 427),
`test/unit/vras.test.js`. Catalog 1451 → 1452; MCP 1388 → 1389.
