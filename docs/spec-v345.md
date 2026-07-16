# spec-v345.md — Lichtman staging (Kienbock disease) tile

> Status: **SHIPPED (2026-07-16).** Builds the `lichtman-kienbock` tile — the Lichtman staging of
> Kienbock disease / lunate osteonecrosis (stages I, II, IIIA, IIIB, IV). Catalog **1196 → 1197**,
> group G.

## Why

The catalog carries the Ficat-Arlet femoral-head AVN staging and the Hawkins talar AVN classification
but had no lunate (wrist) AVN staging. The Lichtman staging is the standard radiographic staging of
Kienbock disease and the reference the hand-surgery treatment algorithms are built on. `lichtman
classification` / `kienbock disease stage` routed to nothing.

## What it does

The clinician picks the radiographic stage; the tile reports the stage, its description, and whether it
is a collapse (stage IIIA–IV) stage.

- `lib/lichtman-kienbock-v345.js` — pure stage → description. **I:** normal X-ray, abnormal MRI. **II:**
  lunate sclerosis, shape preserved. **IIIA:** lunate collapse, carpal alignment maintained
  (radioscaphoid angle < 60 degrees) — flagged. **IIIB:** lunate collapse with fixed carpal collapse
  (radioscaphoid angle > 60 degrees) — flagged. **IV:** generalized degenerative arthrosis — flagged.
  Accepts I / II / IIIA / IIIB / IV case-insensitive; bare III maps to IIIA; also 1/2/4 and 3A/3B.
- `views/group-v345.js` (RV345) — one select (dom `lichtman-stage`), real `<label for>`.
- `lib/meta.js` — Lichtman 1977 citation + accessed date + grouped bands. No citation-staleness row
  (the JBJS Am citation carries no guideline-issuer acronym).
- 5 worked-example unit tests + fuzz registration; synonym entry (v66 → v67); corpus → 1197.

**HIGH-STAKES:** it reports the Lichtman stage the clinician has determined, never a diagnosis, a
treatment decision, or a prognosis ([spec-v11](spec-v11.md) §5.3). The pre-collapse (I–II) vs collapse
(IIIA–IV) distinction is the classically taught reconstruct-vs-salvage watershed, not an order; the
management decision stays with the hand surgeon (surfaced in the tile note).

## Sourcing (spec-v97)

- **Citation:** Lichtman DM, Mack GR, MacDonald RI, Gunther SF, Wilson JN. Kienbock's disease: the role
  of silicone replacement arthroplasty. *J Bone Joint Surg Am.* 1977;59(7):899-908 (the staging).
- Cross-verified against wrist-imaging references (Radiopaedia / "In Brief: The Lichtman Classification
  for Kienbock Disease" *Clin Orthop Relat Res* 2019) reproducing the same I/II/IIIA/IIIB/IV stages and
  the radioscaphoid-angle split.

## Verification

Lint (all catalog-truth surfaces at 1197), unit suite (+5 + fuzz), build — all green. Verified in a
real browser: the example (stage IIIB) renders the "fixed carpal collapse / collapse" warn description
with the radioscaphoid-angle detail, stage I flips to the "normal radiograph, abnormal MRI" description,
and the tile does not scroll horizontally at 320px.

## Out of scope

The tile echoes the stage the clinician selects; it does not read imaging, measure the radioscaphoid
angle, or predict an individual patient's outcome. Stage IIIC (a coronal lunate fracture) is described
in the note, not offered as a separate input. The MCP adapter + golden-probe promotion follow in a
separate wave.
