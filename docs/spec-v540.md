# spec-v540.md — ISHLT grade (cardiac acute cellular rejection) tile

> Status: **SHIPPED (2026-07-28).** Builds the `ishlt-rejection` tile — the four revised ISHLT grades with
> their 1990 mapping. Catalog **1389 → 1390**, group G.

## Why

`ishlt` and `myocyte` were zero-hit across `corpus.json`, `app.js`, and `lib/meta.js`. The `stewart` hits
belong to the Stewart acid-base strong-ion tile, an unrelated eponym.

**A different organ and a different lesion set from the existing `banff-tcmr` tile.** Banff grades T-cell
mediated rejection in a **kidney** allograft from interstitial inflammation, tubulitis, and arteritis — three
lesions that do not exist in myocardium. This grades a **heart** biopsy from lymphocytic infiltrate and
**myocyte damage**. The two share a concept and share nothing else, and a grade from one cannot be read on
the other's scale.

## What it does

| Grade | Biopsy | From 1990 grade(s) |
| --- | --- | --- |
| **0R** no rejection | Unremarkable endomyocardium, no lymphocytic infiltration | 0 |
| **1R** mild, low grade | Infiltrate with **up to one focus** of myocyte damage | **1A, 1B, 2** |
| **2R** moderate | **Two or more foci** with myocyte damage, uninvolved myocardium between | **3A** |
| **3R** severe, high grade | **Diffuse** infiltrate with **multifocal** myocyte damage | **3B, 4** |

### The "R" is not decoration, and the mapping is where the error lives

The 2004/2005 revision appended **R for "revised"** precisely because the numbers were reused: the old scheme
also had grades 1, 2, 3, and 4, and they do not mean the same things. An unqualified "grade 3" in a record is
**genuinely ambiguous**.

The mapping is **many-to-one and asymmetric**, and the trap is **3A versus 3B**: they sit adjacent in the old
scheme and land in **different** revised grades — 3A → 2R, 3B → 3R — on opposite sides of the threshold that
usually decides treatment. At least one published source reproduces this incorrectly, claiming both collapse
into 2R; that reading would move a severe rejection down a grade. Tests assert the split, the completeness
and disjointness of the whole mapping, and that three old grades collapse into 1R.

**So the tile refuses 1990-scheme input rather than guessing.** Passing `3A` returns "this is a 1990-scheme
grade, it maps to 2R"; passing a bare `3` returns "ambiguous between the two schemes". Tests cover both.

**The treatment threshold is conventionally between 1R and 2R** — 0R/1R low grade, 2R/3R high grade. That is
reported because it is *why* the grade is assigned, but labeled a **convention, not an order**: the decision
also turns on time since transplant, hemodynamics, symptoms, donor-specific antibody, and prior rejection.

- `lib/ishlt-rejection-v540.js` — pure grade → definition, `legacyGrades`, and a `highGrade` flag. Exports
  `ISHLT_GRADES`.
- `views/group-v540.js` (RV540) — one select (dom `ishlt-grade`) under an **h2** heading, offering only the
  R grades.
- `lib/meta.js` — Stewart and colleagues 2005 citation + accessed date + bands, related to `banff-tcmr`. No
  citation-staleness row (`ISHLT` is not in `ISSUER_PATTERN`).
- 11 worked-example unit tests + fuzz registration; synonym entry; corpus → 1390.

**HIGH-STAKES:** this grades **acute cellular** rejection only. It is blind to **antibody-mediated
rejection**, which is graded on a separate ISHLT pAMR scale using immunohistochemistry — a biopsy can be
**0R and still show antibody-mediated rejection**, so "0R" is not "no rejection". It is also blind to
**cardiac allograft vasculopathy**, the chronic process that limits long-term survival. It reports what a
biopsy shows rather than diagnosing rejection clinically, and is not an indication to pulse steroids or
change immunosuppression ([spec-v11](spec-v11.md) §5.3). Rejection is **patchy**, so a low grade on a biopsy
with few evaluable fragments does not exclude a higher grade elsewhere. A test asserts every grade names both
blind spots.

## Duplicate check

Per the procedure in [spec-v508](spec-v508.md): the society (`ishlt`), the lesion (`myocyte`), the first
author (`stewart`), the neighboring system (`banff`), and the concept (`allograft`) — each against **both**
`corpus.json` and `app.js` (and `lib/meta.js`), plus a `test/unit/` scan. The non-zero hits are the Stewart
acid-base tile and the Banff **kidney** tile, both addressed above.

## Sourcing (spec-v97)

- **Citation:** Stewart S, Winters GL, Fishbein MC, et al. Revision of the 1990 working formulation for the
  standardization of nomenclature in the diagnosis of heart rejection. *J Heart Lung Transplant.*
  2005;24(11):1710-1720.
- Grades and mapping transcribed from two independent sources agreeing on every grade and on the mapping. A
  third source claiming 3A **and** 3B both collapse into 2R was outvoted two to one and judged an error; it
  is documented here rather than silently discarded, because it is exactly the misreading the tile guards
  against.

## Verification

Lint (all catalog-truth surfaces at 1390), unit suite (+11 + fuzz), a11y, build, and the chromium
heading-level check — all green.

## Out of scope

The tile does not grade antibody-mediated rejection (the pAMR scale), assess cardiac allograft vasculopathy,
grade Quilty lesions, apply the Banff kidney classification, or recommend immunosuppression. The MCP adapter
+ golden-probe promotion ship in the same wave (365).
