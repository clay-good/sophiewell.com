# spec-v799.md — Caine criteria (Wernicke encephalopathy)

> Status: **SHIPPED (2026-08-26).** Builds the `caine-wernicke` tile. Catalog
> **1590 → 1591**, group G.

## Why

The catalog had `ciwa` for alcohol withdrawal severity and `refeeding-risk` for the other
classic thiamine-relevant scenario, but nothing for **Wernicke encephalopathy** — the
complication where the cost of missing it is highest and the treatment is safest.

## What it does

**Two of four signs:**

- Dietary deficiency
- Oculomotor abnormalities
- Cerebellar dysfunction
- Altered mental state **or** mild memory impairment

Any two are enough; a test walks all six pairings, and another confirms no single sign is
privileged over the others.

## Why two, and not the triad

This is the whole reason the criteria exist. The classic triad — confusion, ataxia,
ophthalmoplegia — is present in only about **16%** of cases, and roughly **19%** of patients
show **none** of the three when first assessed. Waiting for the triad misses most of them. At
two or more signs the criteria are about **85% sensitive**.

**Worked example:** dietary deficiency + altered mental state → **criteria met, 2 of 4**.

## Posture (spec-v97)

The negative case is written as carefully as the positive one. When fewer than two signs are
present the tile says, in the result line itself, that this **does NOT exclude** Wernicke
encephalopathy — and the note adds that thiamine is given on suspicion and is safe, so
nothing here is a reason to withhold it. A test asserts the met result points *toward*
thiamine. The tile sets no dose and no route.

## Files

- `lib/caine-wernicke-v799.js` — `caineWernicke()`, `CAINE_NOTE`.
- `views/group-v799.js` (RV799) — four checkboxes; a11y-checked.
- `mcp/adapters/caine-wernicke-v799.js` — exposes the tile (clinical disclaimer).
- `lib/meta.js` — citation, example, the signs, the why-two rationale, the caution, related (ciwa, refeeding-risk).
- `test/unit/caine-wernicke.test.js` — 6 tests (none, the one-vs-two boundary, all six pairings, equal weighting, all four, the thiamine direction).
- `docs/spec-v799.md` (this file).

## Sourcing (spec-v97)

Caine D, Halliday GM, Kril JJ, Harper CG. *J Neurol Neurosurg Psychiatry.* 1997;62(1):51-60
(PMID 9010400), restated in *Wernicke Encephalopathy*, StatPearls NBK470344. Both sources
give the same four signs and the same two-of-four rule, wording the fourth identically as
"either an altered mental state or mild memory impairment", and both give the 16% triad
prevalence and the 85% sensitivity at two signs.
