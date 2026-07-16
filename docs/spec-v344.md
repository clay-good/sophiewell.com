# spec-v344.md — Ficat-Arlet staging (femoral head AVN) tile

> Status: **SHIPPED (2026-07-16).** Builds the `ficat-arlet` tile — the Ficat-Arlet staging of
> femoral-head osteonecrosis / avascular necrosis (stages 0–IV). Catalog **1195 → 1196**, group G.

## Why

The catalog carries the Hawkins talar-neck classification (which reports AVN risk) and the
Kellgren-Lawrence osteoarthritis grade but had no femoral-head AVN staging system. The Ficat-Arlet
staging is the classic radiographic staging of hip osteonecrosis and the reference the joint-preservation
literature is built on. `ficat classification` / `avascular necrosis staging hip` routed to nothing.

## What it does

The clinician picks the radiographic stage; the tile reports the stage, its description, and whether it
is a post-collapse (stage III–IV) stage.

- `lib/ficat-arlet-v344.js` — pure stage → description. **0:** silent hip (normal X-ray). **I:**
  pre-radiographic (abnormal MRI). **II:** pre-collapse — sclerosis / cysts, sphericity preserved (IIA
  cysts, IIB crescent sign). **III:** subchondral collapse (crescent sign) with flattening — flagged.
  **IV:** secondary osteoarthritis — flagged. Accepts roman 0/I–IV or numeric 0–4, case-insensitive.
- `views/group-v344.js` (RV344) — one select (dom `ficat-stage`), real `<label for>`.
- `lib/meta.js` — Ficat 1985 + Ficat & Arlet 1980 citation + accessed date + grouped bands. No
  citation-staleness row (the JBJS Br citation carries no guideline-issuer acronym).
- 5 worked-example unit tests + fuzz registration; synonym entry (v65 → v66); corpus → 1196.

**HIGH-STAKES:** it reports the Ficat-Arlet stage the clinician has determined, never a diagnosis, a
treatment decision, or a prognosis ([spec-v11](spec-v11.md) §5.3). The pre-collapse (0–II) vs
post-collapse (III–IV) distinction is the classically taught joint-preservation-vs-replacement
watershed, not an order; the management decision stays with the surgeon (surfaced in the tile note).

## Sourcing (spec-v97)

- **Citation:** Ficat RP. Idiopathic bone necrosis of the femoral head. Early diagnosis and treatment.
  *J Bone Joint Surg Br.* 1985;67(1):3-9; Ficat RP, Arlet J. Ischemia and necroses of bone. Baltimore:
  Williams & Wilkins; 1980.
- Cross-verified against hip-imaging references (Radiopaedia / musculoskeletal-radiology reviews)
  reproducing the same modified 0–IV stages (with the IIA/IIB subdivision).

## Verification

Lint (all catalog-truth surfaces at 1196), unit suite (+5 + fuzz), build — all green. Verified in a
real browser: the example (stage III) renders the "subchondral collapse / post-collapse" warn
description, stage 0 flips to the "silent hip, normal X-ray" description, and the tile does not scroll
horizontally at 320px.

## Out of scope

The tile echoes the stage the clinician selects; it does not read imaging, distinguish the IIA/IIB
subtypes as separate inputs (they are described in the note), or predict an individual patient's
outcome. The MCP adapter + golden-probe promotion follow in a separate wave.
