# spec-v493.md — Lown grade (ventricular ectopy) tile

> Status: **SHIPPED (2026-07-23).** Builds the `lown-ectopy` tile — the Lown grading system for ventricular
> ectopy on an ambulatory ECG recording, grades 0-5 with the 4A/4B split. Catalog **1343 → 1344**, group G.

## Why

The rhythm tiles cover antiarrhythmic drug classes (Vaughan Williams) and QT risk, but nothing grades the
*ectopy itself* on a Holter recording. `lown` / `ventricular ectopy grade` routed to nothing — no tile in the
catalog mentioned ectopy at all. This is the first ambulatory-ECG ectopy descriptor.

## What it does

The clinician picks the grade; the tile reports the grade and its frequency/form description.

- `lib/lown-ectopy-v493.js` — pure grade → description, the seven Lown grades. **0:** none. **1:** occasional
  isolated beats, fewer than 30 per hour. **2:** frequent beats, 30 or more per hour. **3:** multiform.
  **4A:** couplets. **4B:** salvos (three or more consecutive). **5:** the R-on-T phenomenon. Accepts the
  grades case-insensitively; bare `4` is ambiguous and rejected so the 4A/4B split stays explicit.
- `views/group-v493.js` (RV493) — one select (dom `lown-grade`), real `<label for>`.
- `lib/meta.js` — Lown and Wolf 1971 (Circulation) citation + accessed date + grouped bands. No
  citation-staleness row (a named-author article, no guideline-issuer acronym).
- 9 worked-example unit tests + fuzz registration; synonym entry (v213 → v214); corpus → 1344.

**HIGH-STAKES:** it reports the ectopy grade the clinician has determined from the recording, never a diagnosis,
an antiarrhythmic decision, or a sudden-death risk prediction ([spec-v11](spec-v11.md) §5.3); the management
decision stays with the cardiology team.

## Sourcing (spec-v97)

- **Citation:** Lown B, Wolf M. Approaches to sudden death from coronary heart disease. *Circulation.*
  1971;44(1):130-142.
- Cross-verified against cardiology references reproducing the same none (0) / occasional (1) / frequent (2) /
  multiform (3) / couplets (4A) / runs of VT (4B) / R-on-T (5) grouping.

## Verification

Lint (all catalog-truth surfaces at 1344), unit suite (+9 + fuzz), build — all green. Verified in a real
browser: grade 4B renders "salvos: three or more consecutive ventricular ectopic beats," the other grades flip
to their descriptions; the tile does not scroll horizontally at 320px.

## Out of scope

The tile echoes the grade the clinician selects; it does not read the recording, count the ectopic beats, or
recommend antiarrhythmic therapy. The Lown system grades the ectopy it sees — it is a descriptor, not the
risk-stratification tool later work replaced it with. The MCP adapter + golden-probe promotion follow in the
next wave (318).
