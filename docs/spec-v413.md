# spec-v413.md — Seinsheimer classification (subtrochanteric femur fracture) tile

> Status: **SHIPPED (2026-07-18).** Builds the `seinsheimer-subtroch` tile — the Seinsheimer classification
> of subtrochanteric femur fractures, types I/IIA/IIB/IIC/IIIA/IIIB/IV/V. Catalog **1264 → 1265**, group G.

## Why

The catalog classifies the femur by region — Pauwels (femoral neck), Winquist-Hansen (femoral shaft
comminution), Pipkin (femoral head), Delbet (pediatric femoral neck) — but had no subtrochanteric
classification. `seinsheimer` / `subtrochanteric fracture` routed to nothing. This fills the subtrochanteric
gap in that cluster.

## What it does

The clinician picks the type; the tile reports the type and its fragment/fracture-line description.

- `lib/seinsheimer-subtroch-v413.js` — pure type → description. **I:** nondisplaced (<2 mm). **IIA:**
  two-part transverse. **IIB/IIC:** two-part spiral, lesser trochanter on the proximal / distal fragment.
  **IIIA:** three-part spiral, lesser trochanter in the third fragment (inferior spike). **IIIB:** three-part
  spiral with a butterfly fragment. **IV:** comminuted (four or more fragments). **V:**
  subtrochanteric-intertrochanteric (extends through the greater trochanter). Accepts the roman forms, 1/4/5,
  and the arabic-subgroup forms (2a/2b/2c/3a/3b).
- `views/group-v413.js` (RV413) — one select (dom `ss-type`), real `<label for>`.
- `lib/meta.js` — Seinsheimer 1978 (J Bone Joint Surg Am) citation + accessed date + grouped bands. No
  citation-staleness row (the citation carries no guideline-issuer acronym).
- 7 worked-example unit tests + fuzz registration; synonym entry (v134 → v135); corpus → 1265.

**HIGH-STAKES:** it reports the fracture type the clinician has determined, never a diagnosis, a treatment
decision, or a prognosis ([spec-v11](spec-v11.md) §5.3). The fixation decision stays with the orthopedic
team.

## Sourcing (spec-v97)

- **Citation:** Seinsheimer F. Subtrochanteric fractures of the femur. *J Bone Joint Surg Am.*
  1978;60(3):300-306.
- Cross-verified against Wheeless' Textbook of Orthopaedics and orthopedic references reproducing the same
  nondisplaced (I) / two-part (II) / three-part (III) / comminuted (IV) / subtrochanteric-intertrochanteric
  (V) grouping.

## Verification

Lint (all catalog-truth surfaces at 1265), unit suite (+7 + fuzz), build — all green. Verified in a real
browser: type IIB renders "two-part spiral fracture with the lesser trochanter attached to the proximal
fragment," the other types flip to their descriptions; the tile does not scroll horizontally at 320px.

## Out of scope

The tile echoes the type the clinician selects; it does not read the imaging, count the fragments, or
recommend nail vs plate. The MCP adapter + golden-probe promotion follow in a separate wave.
