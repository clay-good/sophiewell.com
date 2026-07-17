# spec-v386.md — Pirani score (clubfoot severity) tile

> Status: **SHIPPED (2026-07-17).** Builds the `pirani-clubfoot` tile — the Pirani score for clubfoot
> severity (six signs, total 0-6). Catalog **1237 → 1238**, group G.

## Why

The catalog carries many pediatric-ortho classifications but not the Pirani score — the globally standard
scoring system for grading and tracking a congenital clubfoot during Ponseti casting. `pirani` /
`clubfoot severity score` routed to nothing. It is the first **scored** (multi-item sum) tile of this
loop's fracture/classification streak, which had been single-enum tiles.

## What it does

The clinician scores the six signs (each 0/0.5/1); the tile reports the total (0-6) and the midfoot /
hindfoot contracture subscores.

- `lib/pirani-clubfoot-v386.js` — pure six-sign sum. **Midfoot Contracture Score (0-3):** curved lateral
  border, medial crease, position of the lateral head of the talus. **Hindfoot Contracture Score (0-3):**
  posterior crease, empty heel, rigid equinus. Each sign is validated to be exactly 0, 0.5, or 1; the
  total is MFCS + HFCS (0-6). Higher = more severe.
- `views/group-v386.js` (RV386) — six selects (dom `pir-clb/mc/lht/pc/eh/re`), each with a real
  `<label for>`; surfaces the total plus the midfoot/hindfoot subscores.
- `lib/meta.js` — Dyer 2006 (JBJS Br) citation + accessed date + grouped bands. No citation-staleness row
  (the citation carries no guideline-issuer acronym). The example (1/1/0.5/1/1/1 → 5.5) round-trips its
  numbers through the band.
- 6 worked-example unit tests + fuzz registration; synonym entry (v107 → v108); corpus → 1238.

**HIGH-STAKES:** it reports the Pirani score from the six signs the clinician has assessed, never a
diagnosis, a treatment decision, or a prognosis ([spec-v11](spec-v11.md) §5.3). The midfoot/hindfoot
split classically informs Ponseti casting and the timing of a tenotomy, but that decision stays with the
treating orthopedic team (surfaced in the tile note).

## Sourcing (spec-v97)

- **Citation:** Dyer PJ, Davis N. The role of the Pirani scoring system in the management of club foot by
  the Ponseti method. *J Bone Joint Surg Br.* 2006;88(8):1082-1084 (six signs, each 0/0.5/1; midfoot +
  hindfoot contracture scores, total 0-6).
- Cross-verified against the Pirani scoring references (Pirani, Outerbridge, Sawatsky, Stothers)
  reproducing the same six signs and the midfoot/hindfoot split.

## Verification

Lint (all catalog-truth surfaces at 1238), unit suite (+6 + fuzz), build — all green. Verified in a real
browser: the six selects sum to the total and the midfoot/hindfoot subscores update, the 0.5 increments
sum correctly, and the tile does not scroll horizontally at 320px.

## Out of scope

The tile echoes the six signs the clinician scores; it does not read the foot, recommend casting or a
tenotomy, or track change over the treatment course. The MCP adapter + golden-probe promotion follow in a
separate wave.
