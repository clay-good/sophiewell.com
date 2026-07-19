# spec-v437.md — Goutallier grade (rotator cuff fatty infiltration) tile

> Status: **SHIPPED (2026-07-19).** Builds the `goutallier` tile — the Goutallier classification of rotator
> cuff muscle fatty infiltration, grades 0/1/2/3/4. Catalog **1288 → 1289**, group G.

## Why

The catalog had no grading for rotator cuff fatty infiltration — the standard Goutallier descriptor in
shoulder imaging and cuff-repair planning. `goutallier` / `fatty infiltration grade` routed to nothing. This
fills that radiology / orthopedics gap.

## What it does

The radiologist picks the grade; the tile reports the grade and its fat-vs-muscle description.

- `lib/goutallier-v437.js` — pure grade → description, by the amount of fat relative to muscle in the cuff
  belly. **0:** normal, no fatty streaks. **1:** some fatty streaks. **2:** less fat than muscle. **3:** fat
  equals muscle. **4:** more fat than muscle. Accepts 0-4.
- `views/group-v437.js` (RV437) — one select (dom `goutallier-grade`), real `<label for>`.
- `lib/meta.js` — Goutallier 1994 (Clin Orthop Relat Res) citation + accessed date + grouped bands. No
  citation-staleness row (the citation carries no guideline-issuer acronym).
- 6 worked-example unit tests + fuzz registration; synonym entry (v158 → v159); corpus → 1289.

**HIGH-STAKES:** it reports the imaging grade the radiologist has determined, never a diagnosis, a reparability
or treatment decision, or a prognosis ([spec-v11](spec-v11.md) §5.3); the management decision stays with the
orthopedic / shoulder team.

## Sourcing (spec-v97)

- **Citation:** Goutallier D, Postel JM, Bernageau J, Lavau L, Voisin MC. Fatty muscle degeneration in cuff
  ruptures. Pre- and postoperative evaluation by CT scan. *Clin Orthop Relat Res.* 1994;(304):78-83.
- Cross-verified against radiology / orthopedic references reproducing the same normal (0) to
  more-fat-than-muscle (4) grading (Fuchs later adapted the same grades to MRI).

## Verification

Lint (all catalog-truth surfaces at 1289), unit suite (+6 + fuzz), build — all green. Verified in a real
browser: grade 2 renders "less fat than muscle," the other grades flip to their descriptions; the tile does
not scroll horizontally at 320px.

## Out of scope

The tile echoes the grade the radiologist selects; it does not read the MRI/CT, assess cuff reparability, or
recommend surgery. The MCP adapter + golden-probe promotion follow in a separate wave.
