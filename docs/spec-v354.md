# spec-v354.md — Tonnis classification (hip osteoarthritis) tile

> Status: **SHIPPED (2026-07-16).** Builds the `tonnis-hip-oa` tile — the Tonnis classification (grade)
> of hip osteoarthritis (grades 0–3). Catalog **1205 → 1206**, group G.

## Why

The catalog carries the general radiographic-OA grade (`kellgren-lawrence`) but had no hip-specific OA
grade. The Tonnis classification is the standard radiographic hip-OA grade (a grade of 2 or more defines
radiographic hip OA in most studies). `tonnis grade` / `tonnis classification hip` / `hip osteoarthritis
grade` routed to nothing. (Companion-gap: Kellgren-Lawrence is the general/knee radiographic-OA grade;
Tonnis is the hip counterpart. It is also distinct from — and disambiguated against — the Tonnis *angle*,
the acetabular index.)

## What it does

The clinician picks the radiographic grade; the tile reports the grade, its description, and whether it
meets the radiographic-OA threshold (grade 2–3).

- `lib/tonnis-hip-oa-v354.js` — pure grade → description. **0:** no OA. **1:** slight sclerosis, slight
  joint-space narrowing, small osteophytes. **2:** small cysts, moderate narrowing, moderate loss of
  head sphericity — flagged. **3:** large cysts, severe narrowing, head deformity, or AVN (end-stage) —
  flagged. Accepts 0/1/2/3 (string or number); out-of-range is guarded.
- `views/group-v354.js` (RV354) — one select (dom `tonnis-grade`), real `<label for>`.
- `lib/meta.js` — Tonnis 1987 citation (cross-verified against CORR "In Brief" 2018) + accessed date +
  grouped bands. No citation-staleness row (the citation carries no guideline-issuer acronym).
- 5 worked-example unit tests + fuzz registration; synonym entry (v75 → v76); corpus → 1206.

**HIGH-STAKES:** it reports the Tonnis grade the clinician has determined from the radiograph, never a
diagnosis, a treatment decision, or a prognosis ([spec-v11](spec-v11.md) §5.3). The joint-preservation
(lower grades) vs total-hip-arthroplasty (grade 3 end-stage) association is the classically taught
pattern, not an order; the surgical decision stays with the orthopedic surgeon (surfaced in the tile
note).

## Sourcing (spec-v97)

- **Citation:** Tonnis D. Congenital Dysplasia and Dislocation of the Hip in Children and Adults. Berlin:
  Springer-Verlag; 1987 (the grade 0–3 radiographic definitions).
- Cross-verified against Kovalenko B, Bremjit P, Fernando N. Classifications in Brief: Tonnis
  Classification of Hip Osteoarthritis. *Clin Orthop Relat Res.* 2018;476(8):1680-1684, and Radiopaedia,
  reproducing the same grade 0–3 sclerosis / joint-space / cyst / head-sphericity definitions.

## Verification

Lint (all catalog-truth surfaces at 1206), unit suite (+5 + fuzz), build — all green. Verified in a real
browser: the example (grade 2) renders the "small cysts / moderate narrowing" warn description, grade 0
flips to the "no OA" description, and the tile does not scroll horizontally at 320px.

## Out of scope

The tile echoes the grade the clinician selects; it does not read imaging, measure the Tonnis angle, or
recommend a treatment. The MCP adapter + golden-probe promotion follow in a separate wave.
