# spec-v424.md — Bethesda System (thyroid cytopathology) tile

> Status: **SHIPPED (2026-07-18).** Builds the `bethesda-thyroid` tile — the Bethesda System for Reporting
> Thyroid Cytopathology, categories I/II/III/IV/V/VI. Catalog **1275 → 1276**, group G.

## Why

The catalog had no reporting scheme for thyroid fine-needle-aspiration cytology — the near-universal Bethesda
categories a cytopathologist assigns to a thyroid FNA. `bethesda thyroid` / `thyroid cytology category` routed
to nothing. This fills that cytopathology gap.

## What it does

The cytopathologist picks the category; the tile reports the category and its cytologic meaning.

- `lib/bethesda-thyroid-v424.js` — pure category → meaning, the six Bethesda categories. **I:** nondiagnostic
  or unsatisfactory. **II:** benign. **III:** atypia of undetermined significance (AUS/FLUS). **IV:**
  follicular neoplasm or suspicious for one. **V:** suspicious for malignancy. **VI:** malignant. Accepts
  I-VI and 1-6.
- `views/group-v424.js` (RV424) — one select (dom `bt-cat`), real `<label for>`.
- `lib/meta.js` — Cibas & Ali 2017 (Thyroid) citation + accessed date + grouped bands. No citation-staleness
  row (the citation carries no guideline-issuer acronym).
- 6 worked-example unit tests + fuzz registration; synonym entry (v145 → v146); corpus → 1276.

**HIGH-STAKES:** it reports the category the cytopathologist has assigned, never a diagnosis of thyroid
cancer, an implied risk-of-malignancy estimate, a treatment/surgery decision, or a prognosis
([spec-v11](spec-v11.md) §5.3); the decisions stay with the pathology / endocrinology / surgery team. The tile
deliberately omits the edition-dependent risk-of-malignancy percentages and recommended management (which
differ between the 2017 second edition and 2023 third edition).

## Sourcing (spec-v97)

- **Citation:** Cibas ES, Ali SZ. The 2017 Bethesda System for Reporting Thyroid Cytopathology. *Thyroid.*
  2017;27(11):1341-1346.
- Cross-verified against pathology / endocrinology references; the third edition (Ali et al, 2023) keeps the
  same six categories (only the implied risk percentages and management recommendations, which this tile does
  not report, were revised).

## Verification

Lint (all catalog-truth surfaces at 1276), unit suite (+6 + fuzz), build — all green. Verified in a real
browser: category IV renders "follicular neoplasm or suspicious for a follicular neoplasm," the other
categories flip to their meanings; the tile does not scroll horizontally at 320px.

## Out of scope

The tile echoes the category the cytopathologist selects; it does not read the slide, report the implied
malignancy risk or management, or diagnose thyroid cancer. The MCP adapter + golden-probe promotion follow in
a separate wave.
