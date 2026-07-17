# spec-v375.md — Pipkin classification (femoral head fracture) tile

> Status: **SHIPPED (2026-07-17).** Builds the `pipkin-femoral-head` tile — the Pipkin classification of a
> femoral head fracture (types I–IV). Catalog **1226 → 1227**, group G.

## Why

The catalog carries the femoral-neck (Garden, Pauwels) and hip-dysplasia (Crowe, Hartofilakidis)
classifications but not the Pipkin classification of a femoral HEAD fracture — a distinct hip-trauma
pattern (typically with a posterior hip dislocation). `pipkin` / `pipkin classification` / `femoral head
fracture` routed to nothing.

## What it does

The clinician picks the type; the tile reports the type, its description, and whether it is a complex
(type III–IV, associated neck/acetabular fracture) pattern.

- `lib/pipkin-femoral-head-v375.js` — pure type → description. **I:** below the fovea centralis (spares
  the weight-bearing surface). **II:** above the fovea centralis (involves it). **III:** type I/II + an
  associated femoral neck fracture — flagged. **IV:** type I/II + an associated acetabular fracture —
  flagged. Accepts I/II/III/IV or 1–4, case-insensitive.
- `views/group-v375.js` (RV375) — one select (dom `pipkin-type`), real `<label for>`.
- `lib/meta.js` — Pipkin 1957 (JBJS Am) citation + accessed date + grouped bands. No citation-staleness
  row (the citation carries no guideline-issuer acronym).
- 5 worked-example unit tests + fuzz registration; synonym entry (v96 → v97); corpus → 1227.

**HIGH-STAKES:** it reports the Pipkin type the clinician has determined from the radiograph, never a
diagnosis, a treatment decision, or a prognosis ([spec-v11](spec-v11.md) §5.3). The worse-outcome-with-
higher-type association (III/IV vs I/II) is the classically taught pattern, not an order; the reduction /
fixation decision stays with the orthopedic surgeon (surfaced in the tile note).

## Sourcing (spec-v97)

- **Citation:** Pipkin G. Treatment of grade IV fracture-dislocation of the hip. *J Bone Joint Surg Am.*
  1957;39-A(5):1027-1042 (the original type I–IV definitions).
- Cross-verified against the CORR "Classifications in Brief" (2018) and orthopedic references reproducing
  the same four types.

## Verification

Lint (all catalog-truth surfaces at 1227), unit suite (+5 + fuzz), build — all green. Verified in a real
browser: type III renders the flagged "+ associated femoral neck fracture" description, type I flips to
the "below the fovea centralis" description, and the tile does not scroll horizontally at 320px.

## Out of scope

The tile echoes the type the clinician selects; it does not read imaging, localize the fovea, or
recommend a fixation approach. The MCP adapter + golden-probe promotion follow in a separate wave.
