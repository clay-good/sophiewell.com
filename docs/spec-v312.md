# spec-v312.md — Acute cholangitis diagnosis (Tokyo Guidelines TG18) tile

> Status: **SHIPPED (2026-07-15).** Builds the `cholangitis-diagnosis` tile — the diagnostic companion
> to the spec-v310 severity grade. TG18 defines both a diagnostic criteria set (Table 1) and a severity
> grade (Table 3); this session shipped the grade first, this spec adds the diagnosis. Catalog
> **1163 → 1164**, group G.

## Why

The biliary sweep that surfaced the severity grade also left its diagnostic companion unbuilt: TG18's
diagnostic criteria classify a presentation as definite / suspected / not-met from three categories
(systemic inflammation, cholestasis, imaging). `acute cholangitis diagnosis` had no tile.

## What it does

The clinician checks the category A/B/C items they have determined; the tile reports whether the
presentation is a **definite** or **suspected** acute cholangitis, or **does not meet** the criteria.

- `lib/cholangitis-dx-v312.js` — pure category-booleans → diagnosis. Suspected: one item in A plus one
  in B or C. Definite: one item in each of A, B, and C. A is required for either. Only strict boolean
  `true` fires an item.
- `views/group-v312.js` (RV312) — 6 criterion checkboxes grouped by category, real `<label for>`.
- `lib/meta.js` — citation + accessed date + per-category bands; companion cross-links.
- 7 worked-example unit tests + fuzz registration; synonym entry (v33 → v34); corpus → 1164.

It reports the diagnostic category, not a diagnosis or an order ([spec-v11](spec-v11.md) §5.3).

## Sourcing (spec-v97)

Transcribed verbatim from **Table 1 (TG18/TG13 diagnostic criteria for acute cholangitis)**:

- **Citation:** Miura F, Okamoto K, Takada T, et al. Tokyo Guidelines 2018: initial management of acute
  biliary infection and flowchart for acute cholangitis. *J Hepatobiliary Pancreat Sci.*
  2018;25(1):31-40 (Table 1, cited from Kiriyama et al. 2018;25(1):17-30, the source of the criteria).
- **A. Systemic inflammation:** A-1 fever/chills (BT >38 °C); A-2 lab inflammatory response (WBC <4 or
  >10 ×10³/µL, or CRP ≥1 mg/dL).
- **B. Cholestasis:** B-1 jaundice (T-Bil ≥2 mg/dL); B-2 abnormal LFTs (ALP/GGT/AST/ALT >1.5× ULN).
- **C. Imaging:** C-1 biliary dilatation; C-2 evidence of the etiology (stricture, stone, stent).
- **Suspected:** one item in A + one in B or C. **Definite:** one item in each of A, B, and C.
- The citation carries no ISSUER_PATTERN uppercase society acronym, so no citation-staleness ledger
  row is required.

## Verification

Lint (all catalog-truth surfaces at 1164), unit suite (+7 + fuzz), build — all green. Verified in a
real browser: checking fever + jaundice renders "Suspected"; adding biliary dilatation renders
"Definite".

## Out of scope

The severity grade (spec-v310) is a separate scale, already shipped. The tile takes the items the
clinician has determined; it does not re-derive lab thresholds. The MCP adapter + golden-probe
promotion follow in a separate wave.
