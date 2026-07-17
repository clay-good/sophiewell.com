# spec-v380.md — Young-Burgess classification (pelvic ring injury) tile

> Status: **SHIPPED (2026-07-17).** Builds the `young-burgess` tile — the Young-Burgess mechanism-based
> classification of a pelvic ring injury (LC I-III, APC I-III, VS, CM). Catalog **1231 → 1232**, group G.

## Why

The catalog just gained the Tile (AO/Tile) **stability-based** grouping of a pelvic ring injury
([spec-v379](spec-v379.md)); its companion is the Young-Burgess **mechanism-based** grouping — the other
standard system, keyed to the force vector. `young burgess` / `pelvic ring injury mechanism` routed to
nothing. This is the Tile↔Young-Burgess companion-gap pair.

## What it does

The clinician picks the pattern; the tile reports the pattern, its mechanism/stability description, and
whether it is one of the typically-unstable patterns.

- `lib/young-burgess-v380.js` — pure pattern → description over 8 patterns. **LC-I/II/III:** lateral
  compression (sacral compression → crescent fracture → windswept). **APC-I/II/III:** anteroposterior
  compression (progressive symphysis/SI disruption; III complete). **VS:** vertical shear. **CM:**
  combined mechanism. The typically-unstable patterns (APC-II, APC-III, LC-III, VS, CM) are flagged.
  Accepts the `LC-I`/`APC-III` forms and the `LC1`/`APC3` shorthands, case-insensitive.
- `views/group-v380.js` (RV380) — one select (dom `yb-pattern`), real `<label for>`.
- `lib/meta.js` — Young 1986 (Radiology) citation + accessed date + grouped bands. No citation-staleness
  row (the citation carries no guideline-issuer acronym).
- 6 worked-example unit tests + fuzz registration; synonym entry (v101 → v102); corpus → 1232.

**HIGH-STAKES:** it reports the Young-Burgess pattern the clinician has determined, never a diagnosis, a
treatment decision, or a prognosis ([spec-v11](spec-v11.md) §5.3). The stability associations are the
classically taught pattern, not an order; the management decision stays with the orthopedic / trauma team
(surfaced in the tile note).

## Sourcing (spec-v97)

- **Citation:** Young JW, Burgess AR, Brumback RJ, Poka A. Pelvic fractures: value of plain radiography in
  early assessment and management. *Radiology.* 1986;160(2):445-451 (the mechanism-based patterns).
- Cross-verified against Manson et al. "Classifications in Brief" (*Clin Orthop Relat Res* 2014) and
  trauma references reproducing the same LC I-III / APC I-III / VS / CM sub-patterns and their stability.

## Verification

Lint (all catalog-truth surfaces at 1232), unit suite (+6 + fuzz), build — all green. Verified in a real
browser: APC-III renders the flagged "complete SI disruption / unstable" description, LC-I flips to the
stable "sacral compression" description, and the tile does not scroll horizontally at 320px.

## Out of scope

The tile echoes the pattern the clinician selects; it does not read imaging, infer the mechanism, or
recommend fixation. The MCP adapter + golden-probe promotion follow in a separate wave.
