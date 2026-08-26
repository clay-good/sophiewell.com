# spec-v795.md — MIS-C surveillance case definition (2023)

> Status: **SHIPPED (2026-08-26).** Builds the `mis-c` tile. Catalog **1586 → 1587**, group G.

## Why

Pediatrics is one of the best-covered corners of the catalog — Kawasaki criteria, Kobayashi
and Sano IVIG-resistance scores, four febrile-infant rules, Westley, Bhutani, Finnegan. But a
sweep for **multisystem inflammatory syndrome in children** returned nothing, and MIS-C sits
directly on the Kawasaki differential the catalog already covers three ways.

## What it does

**Every criterion is required:**

| Criterion | Threshold |
| --- | --- |
| Age | under 21 years |
| Fever | ≥ 38.0 °C, documented **or** reported |
| C-reactive protein | ≥ 3.0 mg/dL (30 mg/L) |
| New-onset involvement | at least **two of five** categories |
| SARS-CoV-2 | detected by RNA, antigen or antibody within 60 days before or during admission |
| Alternative diagnosis | none |

The five categories: cardiac, mucocutaneous, shock, gastrointestinal, hematologic. A test
walks **all ten** pairings and confirms any two suffice.

**The Kawasaki exclusion is the part that surprises people.** A final diagnosis of Kawasaki
disease by the treating team counts as an alternative diagnosis, so a child meeting every
other criterion is still **not** a case. The renderer puts it under its own "Alternative
diagnosis" heading, away from the criteria it overrides, and a test pins that it defeats an
otherwise complete case.

The tile names **what is still missing** rather than just refusing.

**Worked example:** 8-year-old, fever, CRP 12, cardiac + gastrointestinal involvement,
SARS-CoV-2 detected → **case definition met**, 2 of 5 categories.

## Posture (spec-v97)

This is a **surveillance** definition, written so that states count cases the same way. It is
**not a clinical diagnosis and not a treatment threshold**, and a child who does not meet it
can still be seriously unwell and need treatment. That distinction is the single most
important thing on the page and it is stated in the note, the posture line and the meta bands.

## Files

- `lib/mis-c-v795.js` — `misC()`, `MISC_NOTE`.
- `views/group-v795.js` (RV795) — the criteria, then the five categories under their own heading, then the exclusion under a third; a11y-checked.
- `mcp/adapters/mis-c-v795.js` — exposes the tile (clinical disclaimer).
- `lib/meta.js` — citation, example, all criteria, the exclusion, related (kawasaki-criteria, kobayashi-kawasaki).
- `docs/citation-staleness.md` — new ledger row; the citation names CDC, which is in the issuer pattern.
- `test/unit/mis-c.test.js` — 7 tests (a complete case, the Kawasaki exclusion, the two-category rule, each remaining criterion including the age-21 and CRP-3.0 boundaries, all ten category pairings, the missing list, required inputs).
- `docs/spec-v795.md` (this file).

## Sourcing (spec-v97)

Council of State and Territorial Epidemiologists / CDC surveillance case definition, *MMWR
Recomm Rep.* 2022;71(4):1-14, effective 2023-01-01. Every criterion, both numeric thresholds
and the Kawasaki exclusion were read off the CDC's own case-definition page — the primary
source rather than a rendering of it — and cross-checked against the MMWR statement. The 2023
definition supersedes the 2020 one, which is recorded in the staleness ledger.
