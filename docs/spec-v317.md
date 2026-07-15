# spec-v317.md — C. difficile infection severity (IDSA/SHEA) tile

> Status: **SHIPPED (2026-07-15).** Builds the `cdi-severity` tile — the 2017 IDSA/SHEA severity
> classification that sorts a Clostridioides difficile infection into **non-severe, severe, or
> fulminant**. Catalog **1168 → 1169**, group G.

## Why

The catalog carried the ATLAS bedside CDI score (`atlas-cdi`) but not the canonical IDSA/SHEA severity
classification — the one that drives the initial oral-vancomycin vs fidaxomicin vs fulminant-pathway
decision. `c diff severity` / `clostridioides severity` routed to nothing.

## What it does

The clinician enters the WBC and serum creatinine and checks any fulminant finding; the tile reports the
severity class.

- `lib/cdi-severity-v317.js` — pure inputs → classification. **Non-severe:** WBC ≤ 15,000 cells/µL AND
  creatinine < 1.5 mg/dL. **Severe:** WBC ≥ 15,000 cells/µL OR creatinine ≥ 1.5 mg/dL. **Fulminant:**
  hypotension/shock, ileus, or megacolon — overrides the labs (and classifies without labs).
- `views/group-v317.js` (RV317) — two number inputs (WBC, creatinine) + three fulminant checkboxes, real
  `<label for>`.
- `lib/meta.js` — IDSA/SHEA citation + accessed date + bands; a **citation-staleness ledger row** (the
  citation matches the IDSA issuer pattern).
- 9 worked-example unit tests + fuzz registration; synonym entry (v38 → v39); corpus → 1169.

**HIGH-STAKES:** it reports the severity classification, never a treatment order
([spec-v11](spec-v11.md) §5.3); the regimen and management pathway stay with the clinician.

## Sourcing (spec-v97)

Transcribed verbatim from Table 1 of the 2017 IDSA/SHEA guideline, cross-verified against the guideline
text fetched from the primary source:

- **Citation:** McDonald LC, Gerding DN, Johnson S, et al. Clinical Practice Guidelines for Clostridium
  difficile Infection in Adults and Children: 2017 Update by the IDSA and SHEA. *Clin Infect Dis.*
  2018;66(7):e1-e48.
- **Non-severe:** WBC ≤ 15,000 cells/µL and serum creatinine < 1.5 mg/dL.
- **Severe:** WBC ≥ 15,000 cells/µL or serum creatinine > 1.5 mg/dL.
- **Fulminant:** hypotension or shock, ileus, or megacolon.
- The printed table leaves creatinine exactly 1.5 mg/dL uncovered (non-severe is `< 1.5`, severe is
  `> 1.5`); the tile classifies `≥ 1.5` as severe, the standard operationalization, which the 2021
  focused update also restates. The citation matches the IDSA issuer pattern, so a **citation-staleness
  ledger row** was added (the 2021 focused update revised treatment, not the severity definitions).

## Verification

Lint (all catalog-truth surfaces at 1169; citation gate + ledger row green), unit suite (+9 + fuzz),
build — all green. Verified in a real browser: the example (WBC 18,000, creatinine 1.2) renders "Severe
CDI," and checking a fulminant finding flips it to "Fulminant CDI."

## Out of scope

The tile classifies from the WBC, creatinine, and fulminant findings the clinician enters; it does not
diagnose CDI, choose the antibiotic, or grade the colitis endoscopically. The MCP adapter + golden-probe
promotion follow in a separate wave.
