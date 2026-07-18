# spec-v417.md — Wassel classification (thumb polydactyly) tile

> Status: **SHIPPED (2026-07-18).** Builds the `wassel-thumb` tile — the Wassel classification of thumb
> polydactyly (radial / preaxial thumb duplication) by the level of skeletal duplication, types I-VII.
> Catalog **1268 → 1269**, group G.

## Why

The catalog had no classification for thumb polydactyly, the most common congenital thumb anomaly. `wassel` /
`thumb polydactyly` / `thumb duplication` routed to nothing. This fills that hand gap.

## What it does

The clinician picks the type; the tile reports the type and its duplication-level description.

- `lib/wassel-thumb-v417.js` — pure type → description. Odd numerals are a bifid bone (a shared base /
  epiphysis); even numerals are a complete duplication; the numbers ascend proximally. **I:** bifid distal
  phalanx. **II:** duplicated distal phalanx. **III:** bifid proximal phalanx. **IV:** duplicated proximal
  phalanx (the most common type). **V:** bifid metacarpal. **VI:** duplicated metacarpal. **VII:**
  triphalangeal thumb. Accepts I-VII and 1-7.
- `views/group-v417.js` (RV417) — one select (dom `wa-type`), real `<label for>`.
- `lib/meta.js` — Wassel 1969 (Clin Orthop Relat Res) citation + accessed date + grouped bands. No
  citation-staleness row (the citation carries no guideline-issuer acronym).
- 6 worked-example unit tests + fuzz registration; synonym entry (v138 → v139); corpus → 1269.

**HIGH-STAKES:** it reports the duplication level the clinician has determined, never a diagnosis, a
treatment decision, or a prognosis ([spec-v11](spec-v11.md) §5.3). The reconstruction decision stays with the
hand / plastic-surgery team.

## Sourcing (spec-v97)

- **Citation:** Wassel HD. The results of surgery for polydactyly of the thumb: a review. *Clin Orthop Relat
  Res.* 1969;64:175-193.
- Cross-verified against hand-surgery / radiology references reproducing the same distal-phalanx (I/II) /
  proximal-phalanx (III/IV) / metacarpal (V/VI) / triphalangeal (VII) grouping, with odd = bifid and
  even = duplicated.

## Verification

Lint (all catalog-truth surfaces at 1269), unit suite (+6 + fuzz), build — all green. Verified in a real
browser: type IV renders "duplicated proximal phalanx (the most common type)," the other types flip to their
descriptions; the tile does not scroll horizontally at 320px.

## Out of scope

The tile echoes the type the clinician selects; it does not read the imaging or recommend which thumb to
retain / reconstruct. The MCP adapter + golden-probe promotion follow in a separate wave.
