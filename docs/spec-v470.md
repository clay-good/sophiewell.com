# spec-v470.md — Larsen grade (rheumatoid arthritis radiographs) tile

> Status: **SHIPPED (2026-07-19).** Builds the `larsen-ra` tile — the Larsen (Larsen-Dale-Eek) radiographic
> grading of joint damage in rheumatoid arthritis, grades 0-5. Catalog **1320 → 1321**, group G.

## Why

The RA cluster now carries disease activity (DAS28/CDAI/SDAI) and functional status (Steinbrocker) but had no
radiographic damage grade. `larsen` / `rheumatoid arthritis radiographic grade` routed to nothing. This
companions the Steinbrocker functional-class tile.

## What it does

The clinician picks the grade; the tile reports the grade and its radiographic-damage description.

- `lib/larsen-ra-v470.js` — pure grade → description, the six Larsen grades. **0:** normal. **1:** slight
  (swelling, osteoporosis, slight narrowing). **2:** definite early (erosion and narrowing). **3:** medium
  destructive (marked erosions). **4:** severe destructive (gross deformity). **5:** mutilating (articular
  surfaces lost). Accepts 0-5 and I-V (for grades 1-5).
- `views/group-v470.js` (RV470) — one select (dom `larsen-grade`), real `<label for>`.
- `lib/meta.js` — Larsen, Dale & Eek 1977 (Acta Radiol Diagn) citation + accessed date + grouped bands. No
  citation-staleness row (the citation carries no guideline-issuer acronym).
- 6 worked-example unit tests + fuzz registration; synonym entry (v190 → v191); corpus → 1321.

**HIGH-STAKES:** it reports the radiographic grade the clinician has determined, never a diagnosis, a treatment
decision, or a prognosis ([spec-v11](spec-v11.md) §5.3); the management decision stays with the rheumatology
team.

## Sourcing (spec-v97)

- **Citation:** Larsen A, Dale K, Eek M. Radiographic evaluation of rheumatoid arthritis and related conditions
  by standard reference films. *Acta Radiol Diagn (Stockh).* 1977;18(4):481-491. The citation URL is a PubMed
  term search for the classic paper.
- Cross-verified against rheumatology / radiology references reproducing the same normal (0) / slight (1) /
  definite-early (2) / medium-destructive (3) / severe-destructive (4) / mutilating (5) grading.

## Verification

Lint (all catalog-truth surfaces at 1321), unit suite (+6 + fuzz), build — all green. Verified in a real
browser: grade 2 renders "definite early abnormality with erosion and joint-space narrowing," the other grades
flip to their descriptions; the tile does not scroll horizontally at 320px.

## Out of scope

The tile echoes the grade the clinician selects; it does not read the radiograph, sum a whole-hand Larsen
score, or recommend management. The MCP adapter + golden-probe promotion follow in the next wave (295).
