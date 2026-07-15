# spec-v311.md — Acute cholecystitis severity grade (Tokyo Guidelines TG18) tile

> Status: **SHIPPED (2026-07-15).** Builds the `cholecystitis-severity` tile — the companion to the
> spec-v310 acute cholangitis grade (the companion-gap pattern: after a grading tile, check whether
> the source defines a companion scale — TG18 grades both biliary infections). Catalog **1162 → 1163**,
> group G.

## Why

The spec-v310 acute cholangitis grade left its natural companion unbuilt: TG18 grades acute
cholecystitis on a parallel but distinct scale. Cholecystitis severity is the more common bedside
question (it drives the timing of cholecystectomy vs drainage), and `acute cholecystitis severity`
had no tile.

## What it does

The clinician checks the organ-dysfunction (Grade III) and moderate (Grade II) criteria they have
determined; the tile reports the overall severity grade (I mild / II moderate / III severe).

- `lib/cholecystitis-v311.js` — pure criteria-booleans → grade. **The Grade III organ dysfunctions
  are identical to cholangitis, but Grade II differs: acute cholecystitis is Grade II if ANY ONE (not
  two) of four cholecystitis-specific moderate criteria is present.** Only strict boolean `true` fires.
- `views/group-v311.js` (RV311) — 10 criterion checkboxes grouped by grade, real `<label for>`.
- `lib/meta.js` — citation + accessed date + per-grade bands; companion cross-link to
  `cholangitis-severity`.
- 7 worked-example unit tests + fuzz registration; synonym entry (v32 → v33); corpus → 1163.

It reports the classification grade, not an operative or drainage order ([spec-v11](spec-v11.md) §5.3).

## Sourcing (spec-v97)

The severity criteria were re-fetched and transcribed verbatim from **Table 4 (TG18/TG13 severity
grading for acute cholecystitis)**:

- **Citation:** Miura F, Okamoto K, Takada T, et al. Tokyo Guidelines 2018: initial management of acute
  biliary infection and flowchart for acute cholangitis. *J Hepatobiliary Pancreat Sci.*
  2018;25(1):31-40 (Table 4, cited from Yokoe et al. 2018;25(1):41-54, the source of the criteria).
- **Grade III (severe)** — any one organ dysfunction (identical six to cholangitis): cardiovascular
  (dopamine ≥5 µg/kg/min or any norepinephrine), neurological, respiratory (PaO₂/FiO₂ <300), renal
  (oliguria or creatinine >2.0 mg/dL), hepatic (PT-INR >1.5), hematological (platelets <100,000/mm³).
- **Grade II (moderate)** — any one: WBC >18,000/mm³, palpable tender RUQ mass, duration >72 h, or
  marked local inflammation (gangrenous/emphysematous cholecystitis, pericholecystic or hepatic
  abscess, biliary peritonitis).
- **Grade I (mild)** — neither, in an otherwise healthy patient.
- The citation carries no ISSUER_PATTERN uppercase society acronym, so no citation-staleness ledger
  row is required.

## Verification

Lint (all catalog-truth surfaces at 1163), unit suite (+7 + fuzz), build — all green. Verified in a
real browser: checking the duration criterion renders Grade II; checking a hepatic dysfunction renders
Grade III (severe).

## Out of scope

The tile takes the criteria the clinician has determined; it does not re-derive PaO₂/FiO₂ or dopamine
dosing. The MCP adapter + golden-probe promotion follow in a separate wave.
