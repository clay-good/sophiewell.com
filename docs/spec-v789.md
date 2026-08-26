# spec-v789.md — Acute pericarditis criteria and course

> Status: **SHIPPED (2026-08-26).** Builds the `acute-pericarditis` tile. Catalog
> **1580 → 1581**, group G.

## Why

spec-v788 added takotsubo to the chest-pain differential. **Pericarditis was missing from it
too** — a sweep for pericarditis, myocarditis, tamponade and constrictive physiology returned
nothing. It is one of the commonest non-coronary causes of chest pain in an emergency
department and its diagnosis is a short, fixed rule.

## What it does

**Diagnosis needs at least two of four:**

| Criterion |
| --- |
| Sharp pleuritic chest pain, better sitting up and leaning forward |
| Pericardial friction rub |
| New widespread ST elevation or PR depression on the ECG |
| New or worsening pericardial effusion |

**Two further findings support the diagnosis but do not count toward the two:** raised
inflammatory markers (CRP, ESR, white cell count), and pericardial inflammation on CT or
cardiac MRI.

That distinction is the point of the tile and the thing it renders structurally — the
supporting findings sit under their own heading labeled "not counted toward the two." A test
pins that both supporting findings together still leave the count at 0, and that one real
criterion plus both supporting findings is still **one** criterion. A raised CRP does not make
this diagnosis.

**Course**, classified separately and never changing the count:

| Term | Definition |
| --- | --- |
| Acute | new onset |
| Incessant | past 4–6 weeks without clear remission, under 3 months |
| Recurrent | a further episode after a symptom-free interval of 4–6 weeks or more |
| Chronic | more than 3 months |

**Worked example:** pleuritic chest pain + widespread ST elevation, new onset → **2 of 4,
criteria met, acute**.

## Posture (spec-v97)

Chest pain that could be pericarditis could also be a coronary syndrome, an aortic dissection
or a pulmonary embolism. **Meeting these criteria does not exclude any of them.**

## Files

- `lib/pericarditis-v789.js` — `pericarditis()`, `PERICARDITIS_NOTE`.
- `views/group-v789.js` (RV789) — four criteria checkboxes, two supporting checkboxes under their own heading, one course select; a11y-checked.
- `mcp/adapters/pericarditis-v789.js` — exposes the tile (clinical disclaimer).
- `lib/meta.js` — citation, example, criteria, supporting findings, course definitions, related (heart, intertak, ecg-axis).
- `docs/citation-staleness.md` — **new ledger row.** This is the first guideline-issuer citation of this run; `check-citations` requires a row for any citation matching the issuer pattern, and ESC is in it.
- `test/unit/pericarditis.test.js` — 6 tests (nothing selected, the one-vs-two boundary, supporting findings not counting, all four, course independence, every course accepted).
- `docs/spec-v789.md` (this file).

## Sourcing (spec-v97)

Adler Y, Charron P, Imazio M, et al. *Eur Heart J.* 2015;36(42):2921-2964 (PMID 26320112).
The four criteria, the two-of-four rule, the separation of supporting findings from criteria,
and all four course definitions were confirmed against two independent renderings of the
guideline, which agreed on every element including the 4–6 week and 3 month boundaries.
