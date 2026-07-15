# spec-v313.md — Acute cholecystitis diagnosis (Tokyo Guidelines TG18) tile

> Status: **SHIPPED (2026-07-15).** Builds the `cholecystitis-diagnosis` tile — the diagnostic
> companion to the spec-v311 severity grade, and the **fourth and final tile of the TG18 biliary
> quartet** (cholangitis + cholecystitis, each with a diagnosis and a severity grade). Catalog
> **1164 → 1165**, group G.

## Why

The TG18 biliary program had three of its four tiles after spec-v312; this closes it with the acute
cholecystitis diagnostic criteria. `acute cholecystitis diagnosis` had no tile.

## What it does

The clinician checks the category A/B/C items they have determined; the tile reports whether the
presentation is a **definite** or **suspected** acute cholecystitis, or **does not meet** the criteria.

- `lib/cholecystitis-dx-v313.js` — pure category-booleans → diagnosis. Suspected: one item in A plus
  one in B. Definite: one item in A + one in B + C (a characteristic imaging finding). Only strict
  boolean `true` fires an item.
- `views/group-v313.js` (RV313) — 6 criterion checkboxes grouped by category, real `<label for>`.
- `lib/meta.js` — citation + accessed date + per-category bands; companion cross-links.
- 7 worked-example unit tests + fuzz registration; synonym entry (v34 → v35); corpus → 1165.

It reports the diagnostic category, not a diagnosis or an order ([spec-v11](spec-v11.md) §5.3).

## Sourcing (spec-v97)

Transcribed verbatim from **Table 2 (TG18/TG13 diagnostic criteria for acute cholecystitis)**:

- **Citation:** Miura F, Okamoto K, Takada T, et al. Tokyo Guidelines 2018: initial management of acute
  biliary infection and flowchart for acute cholangitis. *J Hepatobiliary Pancreat Sci.*
  2018;25(1):31-40 (Table 2, cited from Yokoe et al. 2018;25(1):41-54, the source of the criteria).
- **A. Local signs:** Murphy's sign; RUQ mass/pain/tenderness.
- **B. Systemic signs:** fever; elevated CRP; elevated WBC.
- **C. Imaging:** findings characteristic of acute cholecystitis.
- **Suspected:** one item in A + one in B. **Definite:** one item in A + one in B + C.
- The citation carries no ISSUER_PATTERN uppercase society acronym, so no citation-staleness ledger
  row is required.

## Verification

Lint (all catalog-truth surfaces at 1165), unit suite (+7 + fuzz), build — all green. Verified in a
real browser: checking Murphy's sign + fever renders "Suspected"; adding an imaging finding renders
"Definite".

## Out of scope

The severity grade (spec-v311) is a separate scale, already shipped. The tile takes the items the
clinician has determined; it does not interpret the imaging. The MCP adapter + golden-probe promotion
follow in a separate wave. With this tile the TG18 biliary quartet is complete.
