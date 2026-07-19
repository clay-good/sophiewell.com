# spec-v465.md — Stamey grade (stress urinary incontinence) tile

> Status: **SHIPPED (2026-07-19).** Builds the `stamey-incontinence` tile — the Stamey grading of stress
> urinary incontinence, grades 1/2/3. Catalog **1315 → 1316**, group G.

## Why

The catalog carried urinary-incontinence severity tools (Sandvik index, ICIQ-UI) but no Stamey grade — the
classic bedside severity grade of female stress incontinence by the physical stress that provokes leakage.
`stamey` / `stress incontinence grade` routed to nothing. This companions the Sandvik / ICIQ tiles.

## What it does

The clinician picks the grade; the tile reports the grade and its provoking-stress description.

- `lib/stamey-incontinence-v465.js` — pure grade → description, the three Stamey grades. **1:** sudden
  increases in abdominal pressure (cough, sneeze, laugh), not at night. **2:** lesser stress (walking,
  standing, sitting up). **3:** total, continuous incontinence regardless of activity or position. Accepts 1-3
  and I-III.
- `views/group-v465.js` (RV465) — one select (dom `stamey-grade`), real `<label for>`.
- `lib/meta.js` — Stamey 1980 (Ann Surg) citation + accessed date + grouped bands. No citation-staleness row
  (the citation carries no guideline-issuer acronym).
- 5 worked-example unit tests + fuzz registration; synonym entry (v185 → v186); corpus → 1316.

**HIGH-STAKES:** it reports the severity grade the clinician has determined from the history, never a
diagnosis, a treatment decision, or a prognosis ([spec-v11](spec-v11.md) §5.3); the management decision stays
with the urology / urogynecology team.

## Sourcing (spec-v97)

- **Citation:** Stamey TA. Endoscopic suspension of the vesical neck for urinary incontinence in females.
  Report on 203 consecutive patients. *Ann Surg.* 1980;192(4):465-471.
- Cross-verified against urology / urogynecology references reproducing the same sudden-pressure (1) /
  lesser-stress (2) / total-continuous (3) grading.

## Verification

Lint (all catalog-truth surfaces at 1316), unit suite (+5 + fuzz), build — all green. Verified in a real
browser: grade 2 renders "lesser degrees of stress (walking, standing erect, or sitting up in bed)," the other
grades flip to their descriptions; the tile does not scroll horizontally at 320px.

## Out of scope

The tile echoes the grade the clinician selects; it does not take the history, perform urodynamics, or
recommend management. The MCP adapter + golden-probe promotion follow in the next wave (290).
