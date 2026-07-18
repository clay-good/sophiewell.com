# spec-v414.md — Mayfield classification (perilunate instability) tile

> Status: **SHIPPED (2026-07-18).** Builds the `mayfield-perilunate` tile — the Mayfield classification of
> progressive perilunar (perilunate) instability, stages I/II/III/IV. Catalog **1265 → 1266**, group G.

## Why

The catalog had no staging for progressive perilunar instability, the mechanism behind perilunate and lunate
dislocations. `mayfield` / `perilunate instability` / `perilunate dislocation` routed to nothing. This fills
that carpal-instability gap.

## What it does

The clinician picks the stage; the tile reports the stage and its ligament-disruption description.

- `lib/mayfield-perilunate-v414.js` — pure stage → description. **I:** scapholunate dissociation
  (scapholunate ligament; Terry-Thomas sign). **II:** perilunate dislocation (capitolunate joint; lunate
  stays with the radius, the carpus dislocates). **III:** midcarpal dislocation (lunotriquetral ligament;
  triquetrum separates). **IV:** lunate dislocation (dorsal radiocarpal ligament; the lunate is extruded
  volarly while the capitate realigns). Each stage adds the prior disruptions. Accepts I/II/III/IV and 1-4.
- `views/group-v414.js` (RV414) — one select (dom `mf-stage`), real `<label for>`.
- `lib/meta.js` — Mayfield 1980 (J Hand Surg Am) citation + accessed date + grouped bands. No
  citation-staleness row (the citation carries no guideline-issuer acronym).
- 6 worked-example unit tests + fuzz registration; synonym entry (v135 → v136); corpus → 1266.

**HIGH-STAKES:** it reports the stage the clinician has determined, never a diagnosis, a treatment decision,
or a prognosis ([spec-v11](spec-v11.md) §5.3). The reduction / fixation decision stays with the hand /
orthopedic team.

## Sourcing (spec-v97)

- **Citation:** Mayfield JK, Johnson RP, Kilcoyne RK. Carpal dislocations: pathomechanics and progressive
  perilunar instability. *J Hand Surg Am.* 1980;5(3):226-241.
- Cross-verified against Radiopaedia and hand-surgery references reproducing the same scapholunate (I) /
  capitolunate (II) / lunotriquetral (III) / lunate-dislocation (IV) progression around the lunate.

## Verification

Lint (all catalog-truth surfaces at 1266), unit suite (+6 + fuzz), build — all green. Verified in a real
browser: stage III renders "midcarpal dislocation," the other stages flip to their descriptions; the tile
does not scroll horizontally at 320px.

## Out of scope

The tile echoes the stage the clinician selects; it does not read the imaging, measure the scapholunate gap,
or recommend closed vs open reduction. The MCP adapter + golden-probe promotion follow in a separate wave.
