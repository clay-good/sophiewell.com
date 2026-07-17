# spec-v362.md — Forrester hemodynamic classification tile

> Status: **SHIPPED (2026-07-16).** Builds the `forrester-hemodynamic` tile — the Forrester hemodynamic
> classification (subsets I–IV) of acute MI / acute heart failure. Catalog **1213 → 1214**, group G.

## Why

The catalog carries the Killip classification (clinical) and a hemodynamics suite (CI, SVR/PVR) but not
the Forrester subset — the invasive counterpart to Killip that assigns a hemodynamic subset from the
cardiac index (perfusion) and the pulmonary capillary wedge pressure (congestion). `forrester
classification` / `hemodynamic subset` / `warm and wet` routed to nothing. (Companion-gap: Killip is the
clinical acute-MI classification; Forrester is the hemodynamic one.)

## What it does

The clinician enters the CI and PCWP; the tile computes the hemodynamic subset (warm/cold × dry/wet) and
flags any subset other than I. This is a numeric compute (not a pick-a-class enum).

- `lib/forrester-hemodynamic-v362.js` — derives the subset. **Cold** = CI < 2.2 L/min/m²; **wet** = PCWP
  > 18 mmHg. **I** warm+dry (~2.2% mortality); **II** warm+wet (~10.1%) — flagged; **III** cold+dry
  (~22.4%) — flagged; **IV** cold+wet, cardiogenic-shock physiology (~55.5%) — flagged. Guards
  non-numeric and implausible inputs (CI 0–15, PCWP 0–60).
- `views/group-v362.js` (RV362) — two number inputs (dom `fh-ci`, `fh-pcwp`), real `<label for>`.
- `lib/meta.js` — Forrester, Diamond & Swan 1977 (Am J Cardiol) citation + accessed date + grouped bands.
  No citation-staleness row (the citation carries no guideline-issuer acronym).
- 5 worked-example unit tests + fuzz registration; synonym entry (v83 → v84); corpus → 1214.

**HIGH-STAKES:** it reports the Forrester subset computed from the entered CI and PCWP, never a diagnosis,
a treatment decision, or a prognosis ([spec-v11](spec-v11.md) §5.3). The mortality figures are the 1976
derivation-cohort averages, not an individual prediction; the management decision stays with the treating
clinician (surfaced in the tile note).

## Sourcing (spec-v97)

- **Citation:** Forrester JS, Diamond GA, Swan HJC. Correlative classification of clinical and hemodynamic
  function after acute myocardial infarction. *Am J Cardiol.* 1977;39(2):137-145 (the CI 2.2 / PCWP 18
  subsets I–IV and their derivation-cohort mortality).
- Cross-verified against cardiology references reproducing the same warm/cold (CI 2.2) × dry/wet (PCWP 18)
  2×2 grid and mortality gradient (2.2 / 10.1 / 22.4 / 55.5%).

## Verification

Lint (all catalog-truth surfaces at 1214), unit suite (+5 + fuzz), build — all green. Verified in a real
browser: the example (CI 1.8 / PCWP 24) renders the flagged "subset IV — cold and wet" description, CI
3.0 / PCWP 12 flips to the un-flagged "subset I — warm and dry", and the tile does not scroll
horizontally at 320px.

## Out of scope

The tile computes the subset from the entered values; it does not measure CI or PCWP, distinguish
Forrester from the clinical Nohria-Stevenson profiles, or recommend therapy. The MCP adapter +
golden-probe promotion follow in a separate wave.
