# spec-v338.md — ICRS cartilage lesion classification tile

> Status: **SHIPPED (2026-07-16).** Builds the `icrs-cartilage` tile — the ICRS (International
> Cartilage Repair Society) cartilage lesion classification (grades 0–4). Catalog **1189 → 1190**,
> group G.

## Why

spec-v337 shipped Outerbridge. ICRS is the modern arthroscopic cartilage grading used in cartilage-repair
practice and research, and it differs from Outerbridge in a way that matters: Outerbridge's original grades
split II/III by lesion **diameter**, whereas ICRS grades by the **percentage of cartilage depth** involved
and subdivides grade 3 (3a–3d). Both belong in the catalog because surgeons and papers use them
interchangeably. `icrs` / `cartilage lesion grade` routed to nothing. (Companion-gap pattern: the
cartilage-grading domain has both the diameter-based and the depth-based scale.)

## What it does

The surgeon picks the depth-based grade seen at arthroscopy; the tile reports the grade, its description,
and whether it is a full-thickness / osteochondral (grade 4) lesion.

- `lib/icrs-v338.js` — pure grade → description. **0:** normal. **1:** nearly normal (surface intact,
  softening/superficial fissures). **2:** < 50% of cartilage depth, no exposed bone. **3:** > 50% depth /
  down to but not through subchondral bone (subdivided 3a–3d). **4:** complete loss through the subchondral
  bone plate (osteochondral) — flagged. Accepts numeric 0–4.
- `views/group-v338.js` (RV338) — one select, real `<label for>`.
- `lib/meta.js` — Brittberg 2003 citation + accessed date + grouped bands. No citation-staleness row (the
  JBJS citation carries no guideline-issuer acronym).
- 5 worked-example unit tests + fuzz registration; synonym entry (v59 → v60); corpus → 1190.

**HIGH-STAKES:** it reports the cartilage grade the surgeon has determined, never a diagnosis, a surgical
recommendation, or an outcome prediction ([spec-v11](spec-v11.md) §5.3); the cartilage-repair / management
decision stays with the surgeon and the patient.

## Sourcing (spec-v97)

- **Citation:** Brittberg M, Winalski CS. Evaluation of cartilage injuries and repair. *J Bone Joint Surg
  Am.* 2003;85-A(Suppl 2):58-69 (the ICRS cartilage lesion classification).
- Cross-verified against ICRS grading reproductions (musculoskeletal-imaging references; the ICRS Cartilage
  Injury Evaluation Package) giving the same depth-based grade definitions and the grade-3 subdivisions
  (3a > 50% depth / 3b to the calcified layer / 3c to but not through subchondral bone / 3d blisters), with
  grade 4 penetrating the subchondral bone.

## Verification

Lint (all catalog-truth surfaces at 1190), unit suite (+5 + fuzz), build — all green. Verified in a real
browser: the example (grade 4) renders the "through the subchondral bone / osteochondral" warn description,
grade 0 flips to "normal cartilage," and the tile does not scroll horizontally at 320px.

## Out of scope

The tile echoes the grade the surgeon selects; it does not measure the lesion, take the grade-3 subdivisions
(3a–3d) as separate inputs, or recommend repair. The MCP adapter + golden-probe promotion follow in a
separate wave.
