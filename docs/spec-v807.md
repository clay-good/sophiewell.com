# spec-v807.md — Chicago Classification (achalasia subtype)

> Status: **SHIPPED (2026-08-26).** Builds the `chicago-achalasia` tile. Catalog
> **1598 → 1599**, group G.

## Why

The catalog had `eckardt`, which scores achalasia **symptoms**, and nothing for the
**manometric subtype** — the axis gap pattern again. The subtype is not cosmetic: it is the
main thing separating who tends to do well with pneumatic dilation from who is usually
offered a myotomy.

## What it does

**Two requirements gate all three subtypes, and neither is optional:**

- an abnormal median integrated relaxation pressure, and
- **100% absent peristalsis** — every swallow either failed or premature.

With both met, the esophageal body picks the subtype:

| Subtype | Body finding |
| --- | --- |
| **III** | ≥ 20% premature/spastic swallows — distal latency < 4.5 s with DCI > 450 |
| **II** | panesophageal pressurization in ≥ 20% of swallows |
| **I** | neither — failed peristalsis with a quiet esophageal body |

Two behaviours are pinned because they are the ways this goes wrong:

- **The body findings mean nothing without the gates.** Ticking both spasm and pressurization
  with no IRP and no absent peristalsis returns *not established*, not a subtype.
- **Spasm decides over pressurization**, because spasm is what *defines* type III. When both
  are present the tile returns type III and says why, rather than silently preferring one.

Type I is reported as the quiet case, not as a fallback for missing data.

**Worked example:** abnormal IRP + 100% absent peristalsis + pressurization → **type II**.

## Posture (spec-v97)

Reads a study already performed and reported. It does not interpret tracings and it does not
choose a treatment. When the gates are unmet the tile says so plainly and notes that an
isolated abnormal relaxation pressure is its own finding — the classification points toward
esophagogastric junction outflow obstruction there, not achalasia.

## Files

- `lib/chicago-achalasia-v807.js` — `chicagoAchalasia()`, `CHICAGO_NOTE`.
- `views/group-v807.js` (RV807) — the two gates under one heading, the two body findings under another; a11y-checked.
- `mcp/adapters/chicago-achalasia-v807.js` — exposes the tile (clinical disclaimer).
- `lib/meta.js` — citation, example, the gates, all three subtypes, why the subtype matters, related (eckardt, prague-barrett).
- `test/unit/chicago-achalasia.test.js` — 6 tests (both gates required and named, body findings inert without gates, all three subtypes, spasm winning over pressurization, type I as a positive finding, the isolated-IRP message).
- `docs/spec-v807.md` (this file).

## Sourcing (spec-v97)

Yadlapati R, Kahrilas PJ, Fox MR, et al. *Neurogastroenterol Motil.* 2021;33(1):e14058
(PMID 33373111), with the achalasia criteria in the accompanying technical review by Khan MA,
et al. Both gates, all three subtype rules and the 20% thresholds were confirmed against two
independent sources; the second supplied the precise definition of a premature contraction
(distal latency < 4.5 s where DCI exceeds 450), which the first states only as "premature".
