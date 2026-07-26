# spec-v458.md — Boyd-Griffin classification (intertrochanteric fracture) tile

> Status: **SHIPPED (2026-07-19).** Builds the `boyd-griffin` tile — the Boyd-Griffin classification of
> trochanteric (intertrochanteric) femur fractures, types I/II/III/IV. Catalog **1308 → 1309**, group G.

## Why

The proximal-femur fracture cluster carried the neck (Pauwels, Garden, Delbet) and subtrochanteric
(Seinsheimer) classifications but had no *intertrochanteric* grade. `boyd-griffin` / `intertrochanteric
fracture` routed to nothing. This fills the region-completion gap (Evans-Jensen was skipped earlier under
spec-v97 for source disagreement; Boyd-Griffin's four types are a classic agreeing scheme).

## What it does

The clinician picks the type; the tile reports the type and its fracture-line description.

- `lib/boyd-griffin-v458.js` — pure type → description, the four Boyd-Griffin types by fracture line and
  comminution. **I:** simple intertrochanteric, undisplaced. **II:** comminuted intertrochanteric with
  secondary cortical lines. **III:** essentially subtrochanteric. **IV:** trochanteric region plus proximal
  shaft in at least two planes. Accepts I-IV and 1-4.
- `views/group-v458.js` (RV458) — one select (dom `boyd-type`), real `<label for>`.
- `lib/meta.js` — Boyd & Griffin 1949 (Arch Surg) citation + accessed date + grouped bands. No
  citation-staleness row (the citation carries no guideline-issuer acronym).
- 6 worked-example unit tests + fuzz registration; synonym entry (v178 → v179); corpus → 1309.

**HIGH-STAKES:** it reports the fracture type the clinician has determined, never a diagnosis, a treatment
decision, or a prognosis ([spec-v11](spec-v11.md) §5.3); the management decision stays with the orthopedic team.

## Sourcing (spec-v97)

- **Citation:** Boyd HB, Griffin LL. Classification and treatment of trochanteric fractures. *Arch Surg.*
  1949;58(6):853-866.
- Cross-verified against orthopedic / radiology references reproducing the same simple-intertrochanteric (I) /
  comminuted-intertrochanteric (II) / subtrochanteric (III) / trochanteric-plus-shaft (IV) grouping.

## Verification

Lint (all catalog-truth surfaces at 1309), unit suite (+6 + fuzz), build — all green. Verified in a real
browser: type II renders "comminuted fracture along the intertrochanteric line," the other types flip to their
descriptions; the tile does not scroll horizontally at 320px.

## Out of scope

The tile echoes the type the clinician selects; it does not read the radiograph or recommend management
(fixation choice). The MCP adapter + golden-probe promotion follow in the next wave (283).
