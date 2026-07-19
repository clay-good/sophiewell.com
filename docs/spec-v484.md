# spec-v484.md — Barrack grade (femoral cement mantle) tile

> Status: **SHIPPED (2026-07-19).** Builds the `barrack-cement` tile — the Barrack classification of the cement
> mantle around a cemented femoral stem, grades A-D. Catalog **1334 → 1335**, group G.

## Why

The arthroplasty tiles (Vancouver periprosthetic fracture) had no cement-mantle quality grade. `barrack` /
`cement mantle grade` routed to nothing. This fills that arthroplasty gap.

## What it does

The clinician picks the grade; the tile reports the grade and its cement-mantle-quality description.

- `lib/barrack-cement-v484.js` — pure grade → description, the four Barrack grades. **A:** complete filling
  ("white-out"). **B:** slight radiolucency, nearly complete filling. **C:** radiolucency over 50-99% of the
  interface, or a mantle defect. **D:** radiolucency over 100%, or an unfilled canal. Accepts A-D and 1-4.
- `views/group-v484.js` (RV484) — one select (dom `barrack-grade`), real `<label for>`.
- `lib/meta.js` — Barrack 1992 (J Bone Joint Surg Br) citation + accessed date + grouped bands. No
  citation-staleness row (a named-author journal article, no guideline-issuer acronym).
- 6 worked-example unit tests + fuzz registration; synonym entry (v204 → v205); corpus → 1335.

**HIGH-STAKES:** it reports the radiographic grade the clinician has determined, never a diagnosis, a treatment
decision, or a prognosis ([spec-v11](spec-v11.md) §5.3); the management decision stays with the orthopedic team.

## Sourcing (spec-v97)

- **Citation:** Barrack RL, Mulroy RD Jr, Harris WH. Improved cementing techniques and femoral component
  loosening in young patients with hip arthroplasty. A 12-year radiographic review. *J Bone Joint Surg Br.*
  1992;74(3):385-389. The citation URL is a PubMed term search.
- Cross-verified against arthroplasty references reproducing the same complete-white-out (A) /
  slight-radiolucency (B) / 50-99%-radiolucency-or-defect (C) / 100%-radiolucency-or-unfilled (D) grading.

## Verification

Lint (all catalog-truth surfaces at 1335), unit suite (+6 + fuzz), build — all green. Verified in a real
browser: grade C renders "a radiolucency involving 50% to 99% of the cement-bone interface," the other grades
flip to their descriptions; the tile does not scroll horizontally at 320px.

## Out of scope

The tile echoes the grade the clinician selects; it does not read the radiograph or recommend management. The
MCP adapter + golden-probe promotion follow in the next wave (309).
