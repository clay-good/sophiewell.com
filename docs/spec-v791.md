# spec-v791.md — Cardiac sarcoidosis criteria (HRS 2014)

> Status: **SHIPPED (2026-08-26).** Builds the `cardiac-sarcoidosis` tile. Catalog
> **1582 → 1583**, group G.

## Why

The catalog could stage **pulmonary** sarcoidosis (`scadding`, the chest-radiograph stage) but
said nothing about the heart — which is where sarcoidosis kills people. It also completes the
inflammatory/infiltrative cardiomyopathy set alongside spec-v786 (ARVC) and spec-v790
(myocarditis).

## What it does

**Two independent pathways. They are not cumulative — one is enough.**

**Histological (definite), on its own:**

> An endomyocardial biopsy showing non-caseating granuloma with no alternative cause.

**Clinical (probable), needing all three:**

| Part | Requirement |
| --- | --- |
| a | Histological diagnosis of sarcoidosis **outside** the heart |
| b | One or more qualifying cardiac findings |
| c | Other causes for those findings reasonably excluded |

Qualifying cardiac findings: steroid- or immunosuppressant-responsive cardiomyopathy or heart
block; unexplained LVEF ≤ 40%; unexplained sustained VT; Mobitz II or third-degree block;
patchy cardiac FDG-PET uptake; cardiac MRI late gadolinium enhancement; gallium uptake.

The tile names **which** part is still missing rather than just refusing. Tests pin that the
biopsy alone is definite, that removing any one of the three clinical parts drops it back to
not-met, that **all seven** cardiac findings together still do not meet the criteria without
parts a and c, and that any single finding satisfies part b.

**Worked example:** extracardiac sarcoidosis + cardiac MRI late enhancement + other causes
excluded → **probable cardiac sarcoidosis by the clinical pathway**.

## Posture (spec-v97)

**Not meeting the criteria does not exclude the disease** — endomyocardial biopsy misses
patchy involvement often. The tile decides nothing about immunosuppression or a defibrillator.

## Files

- `lib/cardiac-sarcoidosis-v791.js` — `cardiacSarcoidosis()`, `CARDIAC_SARCOID_NOTE`.
- `views/group-v791.js` (RV791) — the two pathways under separate headings, with the clinical
  pathway's three parts each labeled; a11y-checked.
- `mcp/adapters/cardiac-sarcoidosis-v791.js` — exposes the tile (clinical disclaimer).
- `lib/meta.js` — citation, example, both pathways, the finding list, related (scadding, lake-louise-cmr, arvc-tfc).
- `test/unit/cardiac-sarcoidosis.test.js` — 6 tests (nothing selected names all three parts, biopsy alone, each clinical part removed in turn, every finding satisfies part b, seven findings alone are not enough, biopsy outranks an incomplete clinical pathway).
- `docs/spec-v791.md` (this file).

## Sourcing (spec-v97)

Birnie DH, Sauer WH, Bogun F, et al. *Heart Rhythm.* 2014;11(7):1305-1323 (PMID 24819193).
Both pathways, the three-part structure of the clinical one, and the list of qualifying
cardiac findings were confirmed against two independent renderings. The two differ only in
presentation — one groups sustained VT with the heart-block item, the other separates them.
Since either alone satisfies part b, the grouping cannot change any answer this tile returns,
and the more granular reading ships.

## Gate note

`META.interpretation.bands[].text` is capped at 200 characters, and like the 300-character
citation cap this is enforced only by the unit suite — `npm run lint` passes either way. The
cardiac-findings band ran 209. It was shortened by collapsing the three imaging modalities
into one clause, not by dropping a finding.
