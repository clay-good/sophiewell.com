# spec-v483.md — Vancouver classification (periprosthetic femoral fracture) tile

> Status: **SHIPPED (2026-07-19).** Builds the `vancouver-periprosthetic` tile — the Vancouver classification of
> periprosthetic femoral fractures after hip replacement, types AG/AL/B1/B2/B3/C. Catalog **1333 → 1334**,
> group G.

## Why

The femur-fracture cluster (Seinsheimer, Russell-Taylor subtrochanteric) had no periprosthetic-fracture
classification. `vancouver` / `periprosthetic femoral fracture` routed to nothing (the existing Vancouver scar
scale is a different Vancouver classification). This fills the periprosthetic-fracture gap that guides fixation
vs revision.

## What it does

The clinician picks the type; the tile reports the type and its location / stem-stability / bone-stock
description.

- `lib/vancouver-periprosthetic-v483.js` — pure type → description. **AG / AL:** trochanteric (greater /
  lesser). **B1:** around the stem, stem well-fixed. **B2:** around the stem, stem loose, adequate bone. **B3:**
  around the stem, stem loose, deficient bone. **C:** well below the stem tip. Accepts the six type slugs
  (case-insensitive).
- `views/group-v483.js` (RV483) — one select (dom `vancouver-type`), real `<label for>`.
- `lib/meta.js` — Duncan & Masri 1995 (Instr Course Lect) citation + accessed date + grouped bands. No
  citation-staleness row (a named-author article, no guideline-issuer acronym).
- 7 worked-example unit tests + fuzz registration; synonym entry (v203 → v204); corpus → 1334.

**HIGH-STAKES:** it reports the fracture type the clinician has determined, never a diagnosis, a treatment
decision, or a prognosis ([spec-v11](spec-v11.md) §5.3); the management decision stays with the
orthopedic-trauma / arthroplasty team.

## Sourcing (spec-v97)

- **Citation:** Duncan CP, Masri BA. Fractures of the femur after hip replacement. *Instr Course Lect.*
  1995;44:293-304. The citation URL is a PubMed term search.
- Cross-verified against orthopedic references reproducing the same trochanteric (A) / around-the-stem (B, by
  stem fixation and bone stock) / well-below-the-stem (C) grouping.

## Verification

Lint (all catalog-truth surfaces at 1334), unit suite (+7 + fuzz), build — all green. Verified in a real
browser: type B2 renders "the stem loose but adequate proximal bone stock," the other types flip to their
descriptions; the tile does not scroll horizontally at 320px.

## Out of scope

The tile echoes the type the clinician selects; it does not read the radiograph, assess stem fixation, or
recommend management (ORIF vs revision). The MCP adapter + golden-probe promotion follow in the next wave (308).
