# spec-v480.md — Ahlback grade (knee osteoarthritis) tile

> Status: **SHIPPED (2026-07-19).** Builds the `ahlback-knee-oa` tile — the Ahlback classification of knee
> osteoarthritis, grades I-V. Catalog **1330 → 1331**, group G.

## Why

The catalog carried the Kellgren-Lawrence osteoarthritis grade but not the Ahlback grade — a complementary knee
OA classification that emphasizes joint-space obliteration and bone attrition. `ahlback` / `knee osteoarthritis
grade` routed to nothing. This companions the Kellgren-Lawrence tile.

## What it does

The clinician picks the grade; the tile reports the grade and its joint-space-loss / bone-attrition description.

- `lib/ahlback-knee-oa-v480.js` — pure grade → description, the five Ahlback grades. **I:** joint-space
  narrowing. **II:** joint-space obliteration (bone-to-bone). **III:** minor bone attrition (0-5 mm). **IV:**
  moderate bone attrition (5-10 mm). **V:** severe bone attrition (>10 mm), often with subluxation. Accepts I-V
  and 1-5.
- `views/group-v480.js` (RV480) — one select (dom `ahlback-grade`), real `<label for>`.
- `lib/meta.js` — Ahlback 1968 (Acta Radiol Diagn) citation + accessed date + grouped bands. No
  citation-staleness row (a named-author journal article, no guideline-issuer acronym).
- 6 worked-example unit tests + fuzz registration; synonym entry (v200 → v201); corpus → 1331.

**HIGH-STAKES:** it reports the radiographic grade the clinician has determined, never a diagnosis, a treatment
decision, or a prognosis ([spec-v11](spec-v11.md) §5.3); the management decision stays with the orthopedic team.

## Sourcing (spec-v97)

- **Citation:** Ahlback S. Osteoarthrosis of the knee. A radiographic investigation. *Acta Radiol Diagn
  (Stockh).* 1968;Suppl 277:7-72. The citation URL is a PubMed term search. (Name rendered ASCII "Ahlback".)
- Cross-verified against orthopedic / radiology references reproducing the same narrowing (I) / obliteration
  (II) / minor-attrition (III) / moderate-attrition (IV) / severe-attrition (V) grading.

## Verification

Lint (all catalog-truth surfaces at 1331), unit suite (+6 + fuzz), build — all green. Verified in a real
browser: grade III renders "minor bone attrition (0 to 5 mm of bone loss)," the other grades flip to their
descriptions; the tile does not scroll horizontally at 320px.

## Out of scope

The tile echoes the grade the clinician selects; it does not read the radiograph or recommend management. The
MCP adapter + golden-probe promotion follow in the next wave (305).
