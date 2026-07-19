# spec-v466.md — Judet-Letournel classification (acetabular fracture) tile

> Status: **SHIPPED (2026-07-19).** Builds the `letournel-acetabulum` tile — the Judet-Letournel classification
> of acetabular fractures, five elementary and five associated patterns. Catalog **1316 → 1317**, group G.

## Why

The hip/pelvis fracture tiles (Pipkin femoral head, Thompson-Epstein posterior dislocation) had no acetabular
fracture classification. `letournel` / `acetabular fracture` routed to nothing. This fills the acetabular
gap with the standard classification that drives the surgical approach.

## What it does

The clinician picks the pattern; the tile reports the pattern, whether it is elementary or associated, and its
description.

- `lib/letournel-acetabulum-v466.js` — pure pattern → description. **Elementary (5):** posterior wall,
  posterior column, anterior wall, anterior column, transverse. **Associated (5):** posterior column +
  posterior wall, transverse + posterior wall, T-shaped, anterior column + posterior hemitransverse,
  both-column. Case-insensitive pattern slugs.
- `views/group-v466.js` (RV466) — one select (dom `letournel-pattern`, ten options grouped elementary /
  associated), real `<label for>`.
- `lib/meta.js` — Judet & Letournel 1964 (J Bone Joint Surg Am) citation + accessed date + grouped bands. No
  citation-staleness row (the citation carries no guideline-issuer acronym).
- 6 worked-example unit tests + fuzz registration; synonym entry (v186 → v187); corpus → 1317.

**HIGH-STAKES:** it reports the fracture pattern the clinician has determined from imaging, never a diagnosis, a
treatment decision, or a prognosis ([spec-v11](spec-v11.md) §5.3); the management decision stays with the
orthopedic-trauma team.

## Sourcing (spec-v97)

- **Citation:** Judet R, Judet J, Letournel E. Fractures of the acetabulum: classification and surgical
  approaches for open reduction. *J Bone Joint Surg Am.* 1964;46:1615-1646. The citation URL is a PubMed term
  search for the classic paper.
- Cross-verified against orthopedic-trauma references reproducing the same five elementary and five associated
  patterns, including the both-column "floating acetabulum" definition (no articular surface attached to the
  axial skeleton).

## Verification

Lint (all catalog-truth surfaces at 1317), unit suite (+6 + fuzz), build — all green. Verified in a real
browser: the transverse pattern renders "a single transverse line dividing the acetabulum," the associated
patterns flip to their descriptions; the tile does not scroll horizontally at 320px.

## Out of scope

The tile echoes the pattern the clinician selects; it does not read the radiograph/CT, choose the surgical
approach, or recommend management. The MCP adapter + golden-probe promotion follow in the next wave (291).
