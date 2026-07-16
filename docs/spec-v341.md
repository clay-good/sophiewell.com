# spec-v341.md — Mason-Johnston radial head fracture classification tile

> Status: **SHIPPED (2026-07-16).** Builds the `mason-radial-head` tile — the Mason-Johnston
> classification of a radial head fracture (types I–IV). Catalog **1192 → 1193**, group G.

## Why

The catalog carries the Garden (femoral neck), Danis-Weber (ankle), Schatzker (tibial plateau),
Salter-Harris (physis), and Neer (proximal humerus) fracture classifications but had no elbow /
radial-head classification — one of the most common elbow fractures. The Mason classification (with
Johnston's type IV) is the universally taught way to describe a radial head fracture. `mason
classification` / `radial head fracture type` routed to nothing.

## What it does

The clinician picks the fracture pattern from imaging; the tile reports the type, its description,
and whether it is a more severe (type III–IV) pattern.

- `lib/mason-radial-head-v341.js` — pure type → description. **I:** nondisplaced / minimally
  displaced (< 2 mm), no mechanical block. **II:** displaced (> 2 mm) partial-articular fracture,
  may block motion. **III:** comminuted whole-head fracture — flagged. **IV:** with an associated
  elbow dislocation (Johnston) — flagged. Accepts roman I–IV or numeric 1–4, case-insensitive.
- `views/group-v341.js` (RV341) — one select (dom `mason-type`), real `<label for>`.
- `lib/meta.js` — Mason 1954 + Johnston 1962 citation + accessed date + grouped bands. No
  citation-staleness row (the Br J Surg / Ulster Med J citations carry no guideline-issuer acronym).
- 5 worked-example unit tests + fuzz registration; synonym entry (v62 → v63); corpus → 1193.

**HIGH-STAKES:** it reports the Mason type the clinician has determined, never a diagnosis, a
treatment decision, or a prognosis ([spec-v11](spec-v11.md) §5.3). The management shorthand each type
carries (early motion / fixation / excision or replacement) is the classically taught association,
not an order; the operative decision stays with the surgeon and depends on displacement, mechanical
block, elbow stability, and associated injuries (surfaced in the tile note).

## Sourcing (spec-v97)

- **Citation:** Mason ML. Some observations on fractures of the head of the radius with a review of
  one hundred cases. *Br J Surg.* 1954;42(172):123-132 (the original three types); Johnston GW. A
  follow-up of one hundred cases of fracture of the head of the radius with a review of the
  literature. *Ulster Med J.* 1962;31:51-56 (adds type IV — with dislocation).
- Cross-verified against elbow-trauma references (OrthoConsult / review articles) reproducing the
  same type-I–IV definitions and the modified (Hotchkiss) displacement / mechanical-block
  refinement.

## Verification

Lint (all catalog-truth surfaces at 1193), unit suite (+5 + fuzz), build — all green. Verified in a
real browser: the example (type III) renders the "comminuted / more severe" warn description, type I
flips to the "nondisplaced, early motion" description, and the tile does not scroll horizontally at
320px.

## Out of scope

The tile echoes the type the clinician selects; it does not read imaging, measure displacement, or
recommend a specific operation. The MCP adapter + golden-probe promotion follow in a separate wave.
