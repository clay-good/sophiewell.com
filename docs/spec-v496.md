# spec-v496.md — Lodwick grade (bone lesion aggressiveness) tile

> Status: **SHIPPED (2026-07-23).** Builds the `lodwick-grade` tile — the Lodwick grading of the radiographic
> aggressiveness of a focal bone lesion, grades IA / IB / IC / II / III. Catalog **1346 → 1347**, group G.

## Why

The bone-tumor tiles grade different axes entirely: `enneking` is surgical staging of a diagnosed sarcoma, and
`mirels-score` is impending-fracture risk. Neither reads the *radiograph*. `lodwick`, `moth-eaten`,
`permeative`, and `geographic` were all zero-hit across the corpus — the margin / destruction-pattern axis,
the first thing a radiologist grades on a plain film, was uncovered.

## What it does

The clinician picks the grade; the tile reports the grade and its margin / destruction-pattern description.

- `lib/lodwick-grade-v496.js` — pure grade → description, the five Lodwick grades. **IA:** geographic with a
  sclerotic margin. **IB:** geographic, well-defined, no sclerotic rim. **IC:** geographic with an ill-defined
  margin. **II:** geographic with moth-eaten or permeative areas. **III:** moth-eaten or permeative throughout.
  Accepts the grades case-insensitively plus `1A`, `1B`, `1C`, `2`, `3`; bare `I` is rejected because it is
  ambiguous across IA/IB/IC.
- `views/group-v496.js` (RV496) — one select (dom `lodwick-grade`), real `<label for>`.
- `lib/meta.js` — Lodwick and colleagues 1980 (Radiology) citation + accessed date + grouped bands. No
  citation-staleness row (a named-author article, no guideline-issuer acronym).
- 6 worked-example unit tests + fuzz registration; synonym entry (v216 → v217); corpus → 1347.

**HIGH-STAKES:** it reports the radiographic grade the clinician has determined, never a diagnosis, a claim
that a lesion is benign or malignant, a biopsy decision, or a prognosis ([spec-v11](spec-v11.md) §5.3). A
higher grade indicates a faster-growing, more aggressive-*appearing* lesion, not a specific tumor; the
management decision stays with the musculoskeletal radiology and orthopedic-oncology team.

## Sourcing (spec-v97)

- **Citation:** Lodwick GS, Wilson AJ, Farrell C, et al. Determining growth rates of focal lesions of bone from
  radiographs. *Radiology.* 1980;134(3):577-583. The citation URL is a PubMed term search.
- Cross-verified against musculoskeletal-radiology references reproducing the same
  geographic-sclerotic-margin (IA) through moth-eaten-or-permeative (III) ordering.

## Verification

Lint (all catalog-truth surfaces at 1347), unit suite (+6 + fuzz), build — all green. Verified in a real
browser: grade IC renders "an ill-defined margin," III flips to "no geographic component"; the tile does not
scroll horizontally at 320px.

## Out of scope

The tile echoes the grade the clinician selects; it does not read the radiograph, assess periosteal reaction or
matrix mineralization, or suggest a differential. The MCP adapter + golden-probe promotion follow in the next
wave (321).
