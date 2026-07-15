# spec-v323.md — Siewert classification of GEJ adenocarcinoma tile

> Status: **SHIPPED (2026-07-15).** Builds the `siewert` tile — the Siewert classification of
> esophagogastric-junction (GEJ) adenocarcinoma (types I–III). Catalog **1174 → 1175**, group G.

## Why

The catalog had no Siewert tile ("siewert" had zero corpus hits) — yet it is the most frequently used
classification for GEJ adenocarcinoma and directly informs the surgical approach. `siewert` /
`esophagogastric junction adenocarcinoma type` routed to nothing.

## What it does

The clinician picks the type (I–III) from where the tumor center sits relative to the anatomic GEJ; the
tile reports the type and its standard definition.

- `lib/siewert-v323.js` — pure type → definition. **I:** center 1–5 cm above the GEJ (distal esophageal
  adenocarcinoma). **II:** center 1 cm above to 2 cm below the GEJ (true cardia carcinoma). **III:** center
  2–5 cm below the GEJ (subcardial gastric carcinoma infiltrating the cardia). Accepts roman I–III or
  arabic 1–3.
- `views/group-v323.js` (RV323) — one select, real `<label for>`; concise options (no long unbreakable
  tokens, per the spec-v320 320px-hscroll fix).
- `lib/meta.js` — Siewert & Stein 1998 citation + accessed date + per-type bands. No citation-staleness row
  (the Br J Surg citation carries no guideline-issuer acronym).
- 5 worked-example unit tests + fuzz registration; synonym entry (v44 → v45); corpus → 1175.

**HIGH-STAKES:** it reports the anatomic classification the clinician has determined, never a stage or a
treatment order ([spec-v11](spec-v11.md) §5.3); the staging and treatment stay with the clinician.

## Sourcing (spec-v97)

- **Citation:** Siewert JR, Stein HJ. Classification of adenocarcinoma of the oesophagogastric junction.
  *Br J Surg.* 1998;85(11):1457-1459. Cross-verified across reviews reproducing the same GEJ-distance
  definitions (approved at the 1997 Munich IGCC).
- The three types are defined by the tumor-center distance from the GEJ (1–5 cm above / 1 above to 2 below
  / 2–5 cm below) as above; these bounds are stable and universally used.

## Verification

Lint (all catalog-truth surfaces at 1175), unit suite (+5 + fuzz), build — all green. Verified in a real
browser: the example (type II) renders the "1 cm above to 2 cm below the GEJ … true carcinoma of the
cardia" definition, and the tile does not scroll horizontally at 320px.

## Out of scope

The tile echoes the type the clinician selects; it does not measure the tumor location, stage the tumor
(TNM), or choose the operation. The MCP adapter + golden-probe promotion follow in a separate wave.
