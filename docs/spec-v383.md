# spec-v383.md — Risser sign (skeletal maturity) tile

> Status: **SHIPPED (2026-07-17).** Builds the `risser-sign` tile — the Risser sign (US grading, 0-5) for
> skeletal maturity. Catalog **1234 → 1235**, group G.

## Why

The catalog carries Tanner staging (pubertal maturity) but not the Risser sign — the standard
radiographic skeletal-maturity grade, read off the iliac crest apophysis, used in scoliosis to gauge
remaining growth and the likelihood of curve progression. `risser` / `iliac apophysis skeletal maturity`
routed to nothing. This is the maturity-indicator companion to Tanner.

## What it does

The clinician picks the grade; the tile reports the grade, its ossification description, and the
remaining growth potential.

- `lib/risser-sign-v383.js` — pure grade → description (US system). **0:** no ossification (max growth).
  **1-3:** ~25% / ~50% / ~75% ossification. **4:** 100% ossified but not fused (little growth remains).
  **5:** ossified AND fused (full skeletal maturity). Accepts 0-5.
- `views/group-v383.js` (RV383) — one select (dom `risser-grade`), real `<label for>`; also surfaces a
  "Growth potential remaining" row.
- `lib/meta.js` — Risser 1958 (Clin Orthop) citation + accessed date + grouped bands. No
  citation-staleness row (the citation carries no guideline-issuer acronym).
- 6 worked-example unit tests + fuzz registration; synonym entry (v104 → v105); corpus → 1235.

**MATURITY INDICATOR, NOT PATHOLOGY:** like Tanner staging, the tile reports the grade the clinician has
read from the radiograph and does **not** flag any grade as abnormal, nor assert a diagnosis, a treatment
decision, or a prognosis ([spec-v11](spec-v11.md) §5.3). The falling-growth-potential gradient (0 → 5) is
the classically taught pattern, not an order; the management decision stays with the treating team.

## Sourcing (spec-v97)

- **Citation:** Risser JC. The iliac apophysis: an invaluable sign in the management of scoliosis. *Clin
  Orthop.* 1958;11:111-119 (the original sign).
- Cross-verified against radiology / orthopedic references for the US six-stage system (0 none, 1 ~25%, 2
  ~50%, 3 ~75%, 4 100% ossified but unfused, 5 ossified and fused). (The European Risser divides the
  excursion differently; this tile uses the US convention, stated in the tile copy.)

## Verification

Lint (all catalog-truth surfaces at 1235), unit suite (+6 + fuzz), build — all green. Verified in a real
browser: grade 5 renders "ossified and fused / full skeletal maturity" with growth potential "none", grade
0 flips to "no ossification" with "substantial", and the tile does not scroll horizontally at 320px.

## Out of scope

The tile echoes the grade the clinician selects; it does not read the radiograph, distinguish the US vs
European convention beyond the copy note, or estimate curve-progression risk numerically. The MCP adapter
+ golden-probe promotion follow in a separate wave.
