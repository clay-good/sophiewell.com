# spec-v476.md — Nash-Moe grade (vertebral rotation) tile

> Status: **SHIPPED (2026-07-19).** Builds the `nash-moe-rotation` tile — the Nash-Moe method of grading
> vertebral rotation in scoliosis, grades 0-4. Catalog **1326 → 1327**, group G.

## Why

The scoliosis tiles (Risser sign skeletal maturity, Lenke, Cobb angle) had no vertebral-rotation grade.
`nash-moe` / `vertebral rotation grade` routed to nothing. This companions the Risser skeletal-maturity tile.

## What it does

The clinician picks the grade; the tile reports the grade and its convex-pedicle-position description.

- `lib/nash-moe-rotation-v476.js` — pure grade → description, the five Nash-Moe grades by convex-pedicle
  position on the AP film. **0:** symmetric pedicles (no rotation). **1:** convex pedicle slightly toward the
  midline. **2:** convex pedicle in the middle third. **3:** convex pedicle central, near the midline. **4:**
  convex pedicle past the midline. Accepts 0-4.
- `views/group-v476.js` (RV476) — one select (dom `nash-moe-grade`), real `<label for>`.
- `lib/meta.js` — Nash & Moe 1969 (J Bone Joint Surg Am) citation + accessed date + grouped bands. No
  citation-staleness row (the citation carries no guideline-issuer acronym).
- 6 worked-example unit tests + fuzz registration; synonym entry (v196 → v197); corpus → 1327.

**HIGH-STAKES:** it reports the radiographic rotation grade the clinician has determined, never a diagnosis, a
treatment decision, or a prognosis ([spec-v11](spec-v11.md) §5.3); the management decision stays with the
orthopedic / spine team.

## Sourcing (spec-v97)

- **Citation:** Nash CL Jr, Moe JH. A study of vertebral rotation. *J Bone Joint Surg Am.* 1969;51(2):223-229.
  The citation URL is a PubMed term search.
- Cross-verified against spine references reproducing the same symmetric-pedicles (0) / slight-migration (1) /
  middle-third (2) / central (3) / past-midline (4) grading of the convex pedicle.

## Verification

Lint (all catalog-truth surfaces at 1327), unit suite (+6 + fuzz), build — all green. Verified in a real
browser: grade 2 renders "the convex pedicle lies within the middle third of the vertebral body," the other
grades flip to their descriptions; the tile does not scroll horizontally at 320px.

## Out of scope

The tile echoes the grade the clinician selects; it does not read the radiograph or recommend management. The
MCP adapter + golden-probe promotion follow in the next wave (301).
