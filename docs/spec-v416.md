# spec-v416.md — Russe classification (scaphoid fracture) tile

> Status: **SHIPPED (2026-07-18).** Builds the `russe-scaphoid` tile — the Russe classification of scaphoid
> (carpal navicular) fractures by fracture-line orientation: horizontal oblique / transverse / vertical
> oblique. Catalog **1267 → 1268**, group G.

## Why

The catalog's wrist/carpal cluster (Mayfield perilunar staging, Geissler arthroscopic grading) had no
scaphoid-fracture classification. `russe` / `scaphoid fracture classification` routed to nothing. This fills
that gap.

## What it does

The clinician picks the orientation; the tile reports the type and its orientation/stability description.

- `lib/russe-scaphoid-v416.js` — pure orientation → description. **Horizontal oblique:** compressive forces
  predominate (most stable). **Transverse:** both compressive and shear forces (intermediate). **Vertical
  oblique:** shear forces predominate (least stable). Accepts the full names, HO/T/VO, and 1-3.
- `views/group-v416.js` (RV416) — one select (dom `ru-type`), real `<label for>`.
- `lib/meta.js` — Russe 1960 (J Bone Joint Surg Am) citation + accessed date + grouped bands. No
  citation-staleness row (the citation carries no guideline-issuer acronym).
- 5 worked-example unit tests + fuzz registration; synonym entry (v137 → v138); corpus → 1268.

**HIGH-STAKES:** it reports the fracture orientation the clinician has determined, never a diagnosis, a
treatment decision, or a prognosis ([spec-v11](spec-v11.md) §5.3). The stability is intrinsic to the pattern
(a classically taught association); the cast-vs-fixation decision stays with the hand / orthopedic team.

## Sourcing (spec-v97)

- **Citation:** Russe O. Fracture of the carpal navicular: diagnosis, non-operative treatment, and operative
  treatment. *J Bone Joint Surg Am.* 1960;42-A:759-768.
- Cross-verified against hand-surgery / radiology references reproducing the same
  horizontal-oblique (compressive/stable) / transverse (intermediate) / vertical-oblique (shear/unstable)
  grouping.

## Verification

Lint (all catalog-truth surfaces at 1268), unit suite (+5 + fuzz), build — all green. Verified in a real
browser: transverse renders "both compressive and shear forces, intermediate stability," the other
orientations flip to their descriptions; the tile does not scroll horizontally at 320px.

## Out of scope

The tile echoes the orientation the clinician selects; it does not read the imaging, measure the fracture
angle, or recommend cast vs screw. The MCP adapter + golden-probe promotion follow in a separate wave.
