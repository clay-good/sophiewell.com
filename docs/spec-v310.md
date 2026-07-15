# spec-v310.md — Acute cholangitis severity grade (Tokyo Guidelines TG18) tile

> Status: **SHIPPED (2026-07-15).** Builds the `cholangitis-severity` tile — a catalog gap
> surfaced by the SESSION-40 biliary probe ("tokyo guidelines" / "cholangitis severity" had no
> tile; the corpus returned zero hits for `tokyo`/`cholecystitis`). Catalog **1161 → 1162**, group G.

## Why

A biliary sweep found no Tokyo-Guidelines tile: `acute cholangitis severity` / `cholangitis grade`
routed only to unrelated tiles. TG18 severity grading is a bedside decision instrument used
constantly on acute-care, GI, and hepatobiliary services — the grade drives the urgency of biliary
drainage. Acute cholecystitis (a separate TG18 scale) is the natural companion for a later spec.

## What it does

The clinician checks the organ-dysfunction (Grade III) and moderate (Grade II) criteria they have
determined; the tile reports the overall severity grade (I mild / II moderate / III severe).

- `lib/cholangitis-v310.js` — pure criteria-booleans → grade (III if any one organ dysfunction; II if
  any two moderate criteria; I otherwise). Only strict boolean `true` fires a criterion.
- `views/group-v310.js` (RV310) — 11 criterion checkboxes grouped by grade, real `<label for>`, no
  innerHTML.
- `lib/meta.js` — citation + accessed date + per-grade interpretation bands.
- 8 worked-example unit tests + fuzz registration; synonym entry (v31 → v32); corpus → 1162.

It reports the classification grade, not a drainage or antibiotic order ([spec-v11](spec-v11.md) §5.3).

## Sourcing (spec-v97)

The severity criteria were re-fetched and transcribed verbatim from **Table 3 (TG18/TG13 severity
assessment criteria for acute cholangitis)**:

- **Citation:** Miura F, Okamoto K, Takada T, et al. Tokyo Guidelines 2018: initial management of acute
  biliary infection and flowchart for acute cholangitis. *J Hepatobiliary Pancreat Sci.*
  2018;25(1):31-40 (Table 3, cited from Kiriyama et al. 2018;25(1):17-30, the source of the criteria).
- **Grade III (severe)** — any one: cardiovascular (dopamine ≥5 µg/kg/min or any norepinephrine),
  neurological (disturbed consciousness), respiratory (PaO₂/FiO₂ <300), renal (oliguria or creatinine
  >2.0 mg/dL), hepatic (PT-INR >1.5), hematological (platelets <100,000/mm³).
- **Grade II (moderate)** — any two: abnormal WBC (>12,000 or <4,000/mm³), fever ≥39 °C, age ≥75,
  total bilirubin ≥5 mg/dL, albumin <0.7× lower limit of normal.
- **Grade I (mild)** — neither at initial diagnosis.
- The citation carries no ISSUER_PATTERN uppercase society acronym, so no citation-staleness ledger
  row is required.

## Verification

Lint (all catalog-truth surfaces at 1162), unit suite (+8 + fuzz), build — all green. Verified in a
real browser: checking the hepatic criterion renders Grade III (severe); checking two moderate
criteria renders Grade II.

## Out of scope

Acute cholecystitis (a separate TG18 severity scale with different criteria) is the companion tile,
deferred to a later spec. The tile takes the criteria the clinician has determined; it does not
re-derive PaO₂/FiO₂, the albumin lower-limit-of-normal, or dopamine dosing. The MCP adapter +
golden-probe promotion follow in a separate wave.
