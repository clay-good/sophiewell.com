# spec-v645.md — CHEOPS (Children's Hospital of Eastern Ontario Pain Scale)

> Status: **SHIPPED (2026-08-03).** Builds the `cheops` tile. Catalog **1475 → 1476**, group G.

## Why

A **companion gap** in a rich pediatric-pain cluster. FLACC, NIPS, N-PASS, CRIES, COMFORT-B and PIPP were all
in the catalog, but CHEOPS — one of the oldest and most-cited observational postoperative pain scales for
children (~1–7 years) — was missing.

## What it does

Six observed behaviors are rated, with **non-uniform** points, and summed to a total of **4–13**.

| Item | Range | Item | Range |
| --- | --- | --- | --- |
| Cry | 1–3 | Torso | 1–2 |
| Facial | 0–2 | Touch (wound) | 1–2 |
| Verbal | 0–2 | Legs | 1–2 |

The floor is **4, not 3** — Cry has no zero option while four of the six items floor at 1. A test builds the
minimum and asserts 4.

## The threshold is deliberately not a single verdict

The original 1985 scale is a validated research instrument and prescribes **no single treatment cutoff**.
Later adopters disagree: **≥ 6** is the most commonly cited analgesia threshold, but two-tier schemes (**≥ 5**
"give an analgesic", **≥ 8** "analgesic required") also circulate. Per spec-v97, when sources disagree the tile
does not assert one: it reports the **total (4–13) as the primary output** and names the thresholds as
advisory. (One secondary page's summary mis-stated the range as "6–13"; the arithmetic minimum is 4, confirmed
by every other source.)

## Scope (spec-v11 §5.3)

A bedside pain-behavior rating, not a diagnosis; the analgesia decision stays with the clinician.

## Files

- `lib/cheops-v645.js` — `cheops()`, `CHEOPS_ITEMS`, `CHEOPS_NOTE`.
- `views/group-v645.js` (RV645) — six behavior selects; a11y-checked, no innerHTML, no network.
- `mcp/adapters/cheops-v645.js` — exposes the tile (clinical disclaimer).
- `lib/meta.js` — citation, example, interpretation, specialties, related.
- `test/unit/cheops.test.js` — 7 tests (floor 4, ceiling 13, example, non-uniform points, verbal collapse,
  required items, unknown behavior).
- `docs/spec-v645.md` (this file).

## Sourcing (spec-v97)

McGrath PJ, Johnson G, Goodman JT, Schillinger J, Dunn J, Chapman JA. CHEOPS: a behavioral scale for rating
postoperative pain in children. In: Fields HL, Dubner R, Cervero F, eds. *Advances in Pain Research and
Therapy*, Vol 9. New York: Raven Press; 1985:395-402. Every per-behavior point value and the 4–13 range were
confirmed consistent across MDCalc and four independent references; only the intervention threshold varies,
and it is handled as advisory.
