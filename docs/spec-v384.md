# spec-v384.md — Spetzler-Ponce classification (cerebral AVM) tile

> Status: **SHIPPED (2026-07-17).** Builds the `spetzler-ponce` tile — the Spetzler-Ponce 3-tier
> classification of a cerebral AVM (Classes A/B/C). Catalog **1235 → 1236**, group G.

## Why

The catalog carries the 5-tier Spetzler-Martin AVM grade (`spetzler-martin`) but not its 2011 Spetzler-
Ponce simplification — the 3-tier grouping (A = SM I-II, B = SM III, C = SM IV-V) that collapses grades
with similar surgical outcomes. `spetzler ponce` / `AVM 3-tier classification` routed to nothing. This is
the Spetzler-Martin↔Spetzler-Ponce companion-gap.

## What it does

The clinician picks the class (or the underlying Spetzler-Martin grade); the tile reports the class, its
SM-grade grouping and surgical-risk level, and whether it is the highest-risk (Class C) group.

- `lib/spetzler-ponce-v384.js` — pure class → description. **A:** SM grade I-II (lowest surgical risk).
  **B:** SM grade III (intermediate). **C:** SM grade IV-V (highest surgical risk) — flagged. Accepts
  A/B/C or 1-3; also derives the class from a Spetzler-Martin grade (1-5 / I-V) via `smGrade`.
- `views/group-v384.js` (RV384) — one select (dom `sp-class`), real `<label for>`; surfaces a
  "Spetzler-Martin grades" row.
- `lib/meta.js` — Spetzler 2011 (J Neurosurg) citation + accessed date + grouped bands. No
  citation-staleness row (the citation carries no guideline-issuer acronym).
- 6 worked-example unit tests + fuzz registration; synonym entry (v105 → v106); corpus → 1236.

**HIGH-STAKES:** it reports the class derived from the Spetzler-Martin grade, never a diagnosis, a
treatment decision, or a prognosis ([spec-v11](spec-v11.md) §5.3). The management approaches the authors
associated with each class (surgery / multimodal / observation) are stated **descriptively** in the note
as a general association from their series — not an order for any individual patient; that decision stays
with the neurosurgical / neurovascular team.

## Sourcing (spec-v97)

- **Citation:** Spetzler RF, Ponce FA. A 3-tier classification of cerebral arteriovenous malformations.
  Clinical article. *J Neurosurg.* 2011;114(3):842-849 (the A/B/C grouping; the 3-tier and 5-tier systems
  had equivalent predictive accuracy for surgical outcome).
- Cross-verified against neurosurgical references reproducing the same A = SM I-II / B = SM III / C = SM
  IV-V grouping.

## Verification

Lint (all catalog-truth surfaces at 1236), unit suite (+6 + fuzz), build — all green. Verified in a real
browser: Class C renders the flagged "SM grade IV-V / highest surgical risk" description with the SM-grade
row, Class A flips to "SM grade I-II / lowest surgical risk", and the tile does not scroll horizontally at
320px.

## Out of scope

The tile echoes the class (or maps a Spetzler-Martin grade to it); it does not compute the underlying
Spetzler-Martin grade from size/eloquence/venous-drainage (that is the `spetzler-martin` tile), nor
recommend management. The MCP adapter + golden-probe promotion follow in a separate wave.
