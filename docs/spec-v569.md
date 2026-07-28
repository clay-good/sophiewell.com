# spec-v569.md — GAPP tile

> Status: **SHIPPED (2026-07-28).** Builds the `gapp` tile — Grading system for Adrenal Pheochromocytoma and
> Paraganglioma. Catalog **1418 → 1419**, group G.

## Why

A **revised-successor gap**. `gapp` and `pheochromocytoma` were both zero-hit; `grep -in "pheochrom" app.js`
returned nothing. GAPP was built to replace an earlier scaled score by dropping histological features that
concorded poorly between observers and adding Ki-67 and a biochemical phenotype — and neither instrument was
in the catalog.

## What it does

| Parameter | Points |
| --- | --- |
| Histological pattern: zellballen / large irregular cell nest / pseudorosette | 0 / **+1** / **+1** (these **add**) |
| Comedo-type necrosis | 2 |
| Cellularity: <150 / 150-250 / >250 cells per unit area | 0 / 1 / 2 |
| Ki-67: <1% / 1-3% / >3% | 0 / 1 / 2 |
| Vascular or capsular invasion | 1 |
| Catecholamine: non-functioning / adrenergic / noradrenergic | 0 / 0 / 1 |

**Maximum 10.** Grades: **WD 0-2** (~100% 5-yr survival), **MD 3-6** (~67%), **PD 7-10** (~22%).

## The four rules a plausible implementation breaks

**1. The two histological-pattern features add — and the arithmetic proves it.** The table lists them as
though one is chosen. But every other category's maximum plus a *single* pattern point gives **9**, while
the same table states a maximum of **10**. The only reading that reaches 10 is that both features can be
present at once, and an independent summary table lists the pattern maximum as 2. Treating them as mutually
exclusive silently caps the score at 9 and makes a maximum-grade tumor unreachable. A test asserts both the
reachable 10 and the counterfactual ceiling of 9.

**2. The catecholamine term is non-monotonic and looks like a bug.** A **non-functioning** tumor scores 0 —
the same as adrenergic, *less* than noradrenergic. A hormonally silent tumor is treated as low risk on this
axis although non-functioning disease is not clinically benign. Published ordering; not rearranged.

**3. A biochemical variable sits inside a histopathology grade, defined in a footnote.** The catecholamine
type comes from 24-hour urine fractionated metanephrine and normetanephrine — not the slide. Raised
metanephrine (± normetanephrine) is adrenergic; raised normetanephrine without metanephrine is
noradrenergic. Someone reading only the specimen cannot supply this field.

**4. SDHB immunohistochemistry is not part of GAPP.** A modified version adds it and is a separate,
unvalidated instrument. A score including an SDHB term is not a GAPP score.

Cellularity is counted in **cells per unit area at a specified magnification** — operator-dependent, not a
laboratory value.

## Scope (spec-v11 §5.3)

Grades metastatic **potential** from a resected specimen. It does **not** diagnose pheochromocytoma or
paraganglioma and does not establish that a tumor has metastasized. **No grade excludes metastasis** — these
tumors metastasize years to decades after resection, well-differentiated ones included, so a low grade is
**not** a reason to stop surveillance, which is the decision this score would most damagingly be misused to
settle. It says nothing about germline status, and hereditary syndromes carry their own risks and
surveillance requirements it does not capture. It does not select adjuvant therapy or an imaging interval.

## Files

- `lib/gapp-v569.js` — `gapp()`, `HISTOLOGICAL_FEATURES`, `CELLULARITY_LEVELS`, `KI67_LEVELS`,
  `CATECHOLAMINE_TYPES`, `GAPP_MAX`.
- `views/group-v569.js` (RV569) — the two pattern features as **separate** yes/no selects, since a
  single-choice control would silently cap the score at 9.
- `mcp/adapters/gapp-v569.js` — wave 394.
- `test/unit/gapp.test.js` — 16 tests.
- `docs/spec-v569.md` (this file).

## Sourcing (spec-v97)

Transcribed from an open-access validation study reproducing the original table verbatim, with the
histological-pattern maximum confirmed by a second independent review.

- Kimura N, Takayanagi R, Takizawa N, et al. *Endocr Relat Cancer.* 2014;21(3):405-414.
- Koh JM, Ahn SH, Kim H, et al. *PLoS One.* 2017;12(11):e0187398.
