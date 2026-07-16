# spec-v342.md — Hawkins classification (talar neck fracture) tile

> Status: **SHIPPED (2026-07-16).** Builds the `hawkins-talar` tile — the Hawkins classification of a
> talar neck fracture (types I–IV). Catalog **1193 → 1194**, group G.

## Why

The catalog carries the Garden (femoral neck), Danis-Weber (ankle), Schatzker (tibial plateau),
Salter-Harris (physis), Neer (proximal humerus), and Mason (radial head) fracture classifications but
had no talar-neck classification. The Hawkins classification (with Canale-Kelly's type IV) is the gold
standard for describing a fracture of the neck of the talus and the reference for its avascular-necrosis
(AVN) risk. `hawkins classification` / `talar neck fracture type` routed to nothing.

## What it does

The clinician picks the fracture pattern from imaging; the tile reports the type, its description, the
classically reported AVN-risk range, and whether it is a more severe (type III–IV) pattern.

- `lib/hawkins-talar-v342.js` — pure type → description. **I:** nondisplaced, no dislocation (AVN
  ~0–15%). **II:** displaced with subtalar dislocation (~20–50%). **III:** displaced with dislocation
  from the subtalar and ankle joints (~70–100%) — flagged. **IV:** type III plus talonavicular
  dislocation (highest) — flagged. Accepts roman I–IV or numeric 1–4, case-insensitive.
- `views/group-v342.js` (RV342) — one select (dom `hawkins-type`), real `<label for>`; echoes the AVN
  range.
- `lib/meta.js` — Hawkins 1970 + Canale-Kelly 1978 citation + accessed date + grouped bands. No
  citation-staleness row (the JBJS citations carry no guideline-issuer acronym).
- 5 worked-example unit tests + fuzz registration; synonym entry (v63 → v64); corpus → 1194.

**HIGH-STAKES:** it reports the Hawkins type the clinician has determined, never a diagnosis, a
treatment decision, or a prognosis ([spec-v11](spec-v11.md) §5.3). The AVN-risk ranges are the
classically reported case-series figures, not a per-patient prediction; displaced patterns classically
warrant urgent reduction and fixation, but the operative decision stays with the surgeon (surfaced in
the tile note).

## Sourcing (spec-v97)

- **Citation:** Hawkins LG. Fractures of the neck of the talus. *J Bone Joint Surg Am.*
  1970;52(5):991-1002 (the original three types); Canale ST, Kelly FB Jr. Fractures of the neck of the
  talus. Long-term evaluation of seventy-one cases. *J Bone Joint Surg Am.* 1978;60(2):143-156 (adds
  type IV).
- Cross-verified against foot-and-ankle trauma references (LITFL / Wheeless / review articles)
  reproducing the same type-I–IV definitions and the AVN-risk gradient.

## Verification

Lint (all catalog-truth surfaces at 1194), unit suite (+5 + fuzz), build — all green. Verified in a
real browser: the example (type III) renders the "subtalar + ankle dislocation / more severe" warn
description with the ~70–100% AVN range, type I flips to the "nondisplaced, ~0–15%" description, and
the tile does not scroll horizontally at 320px.

## Out of scope

The tile echoes the type the clinician selects; it does not read imaging, measure displacement, or
predict an individual patient's outcome. The MCP adapter + golden-probe promotion follow in a separate
wave.
