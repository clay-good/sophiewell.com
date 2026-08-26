# spec-v786.md — 2010 Task Force Criteria (ARVC)

> Status: **SHIPPED (2026-08-26).** Builds the `arvc-tfc` tile. Catalog **1577 → 1578**,
> group G.

## Why

The inherited-arrhythmia cluster had `shanghai-brugada` (Brugada syndrome diagnosis) and
`hcm-risk-scd` (sudden death risk in HCM), but nothing for **arrhythmogenic right ventricular
cardiomyopathy** — the third of the big three, and the one whose diagnosis is hardest to hold
in your head because the evidence is scattered across imaging, biopsy, two different parts of
the ECG, arrhythmia monitoring and the family tree.

## What it does

Six categories. **Within each category a patient meets a major criterion, a minor one, or
neither — never both.**

| | Category |
| --- | --- |
| I | Global or regional dysfunction and structural alterations (echo, MRI, angiography) |
| II | Tissue characterization of the wall (biopsy) |
| III | Repolarization abnormalities (T-wave inversion) |
| IV | Depolarization or conduction abnormalities (epsilon wave, late potentials, terminal activation duration) |
| V | Arrhythmias (VT morphology, ectopic burden) |
| VI | Family history, including genetics |

Major = 2 points, minor = 1. The published combinations map onto that arithmetic exactly:

| Result | Published combination | Points |
| --- | --- | --- |
| Definite | 2 major, or 1 major + 2 minor, or 4 minor | ≥ 4 |
| Borderline | 1 major + 1 minor, or 3 minor | 3 |
| Possible | 1 major, or 2 minor | 2 |

**The per-category cap is the rule people miss.** Three separate major findings inside one
category still count once — a category can never contribute more than 2 points. The tile
enforces this *structurally*: each category is one select, so there is no way to enter two
criteria from the same category. Tests walk all three definite combinations, both borderline
combinations and both possible combinations.

**Worked example:** major structural + minor repolarization + minor arrhythmia = **4 points**,
**definite ARVC**.

## Posture (spec-v97)

Applies a diagnostic framework to findings a clinician has **already gathered and
interpreted**. It does not read an image, an ECG or a biopsy, and it decides nothing about
defibrillators, exercise restriction or family screening.

## Files

- `lib/arvc-tfc-v786.js` — `arvcTfc()`, `ARVC_NOTE`, `CATEGORIES`.
- `views/group-v786.js` (RV786) — six none/minor/major selects; a11y-checked.
- `mcp/adapters/arvc-tfc-v786.js` — exposes the tile (clinical disclaimer).
- `lib/meta.js` — citation, example, categories, the per-category rule, all three result bands, related (shanghai-brugada, hcm-risk-scd).
- `test/unit/arvc-tfc.test.js` — 8 tests (nothing met, all three definite combinations, both borderline, both possible, one minor is below possible, the per-category cap, the 12-point ceiling, invalid level).
- `docs/spec-v786.md` (this file).

## Sourcing (spec-v97)

Marcus FI, McKenna WJ, Sherrill D, et al. *Eur Heart J.* 2010;31(7):806-814 (PMID 20172912).
The six categories, the at-most-one-criterion-per-category rule, the major = 2 / minor = 1
weighting and the definite threshold of ≥ 4 points were confirmed against two independent
sources. The borderline and possible thresholds of 3 and 2 points are the exact arithmetic
equivalents of the published combinations, and every one of those combinations is walked by a
test rather than trusted to the arithmetic.
