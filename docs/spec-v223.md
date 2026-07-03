# spec-v223.md — Dermatology activity, staging & screening: UAS7, HiSCR, Hurley staging, POEM, ALDEN, PEST, and the weighted Glasgow 7-point melanoma checklist (+7 tiles)

> Status: **SHIPPED (2026-07-03).** Eleventh feature spec of the **Bedside Decision
> & Physiology Instruments** program ([spec-v213](spec-v213.md)). Adds **7**
> deterministic dermatology instruments, each **verified absent by a direct scan of
> `app.js`** (spec-v85 §6.2): the catalog carries `pasi`, `easi`, `scorad`,
> `dlqi`, `scorten`, `regiscar-dress`, and `melanoma-t-stage`, but **not** UAS7,
> HiSCR, Hurley staging, POEM, ALDEN, PEST, or the Glasgow 7-point checklist.
>
> Catalog effect: **live `UTILITIES.length` + 7** — enforced by the catalog-truth
> gate ([spec-v46](spec-v46.md)).
>
> Every prior spec remains in force. v223 adds no runtime network call and no AI;
> each tile obeys the [spec-v100](spec-v100.md) §2 doctrine, passes the
> [spec-v29](spec-v29.md) §3 one-line test, ships its citation inline
> ([spec-v54](spec-v54.md)), inherits the [spec-v59](spec-v59.md) output-safety
> contract, renders the [spec-v50](spec-v50.md) §3 posture note, and honors
> [spec-v11](spec-v11.md) §5.3 (**no treatment or referral order** — these score,
> classify, and screen). **Every point value is re-fetched and cross-verified
> against ≥2 independent open sources** ([spec-v97](spec-v97.md)).

## 2. What v223 adds (7 tiles)

All Group G; all Class A; journal + author citations, none trips `ISSUER_PATTERN`.

| id | name | inputs → output | citation |
| --- | --- | --- | --- |
| `uas7` | UAS7 | 7-day wheal + itch sums (0-42) → urticaria activity band | Mlynek A, et al. Allergy. 2008;63(6):777-780 |
| `hiscr` | HiSCR | baseline/current abscess, nodule, fistula counts → responder yes/no | Kimball AB, et al. Br J Dermatol. 2014;171(6):1434-1442 |
| `hurley-stage` | Hurley staging | tracts / scarring / diffuse → stage I-III | Hurley HJ. Dermatologic Surgery. 1989 |
| `poem` | POEM | 7 items × 0-4 (0-28) → eczema severity band | Charman CR, et al. Arch Dermatol. 2004;140(12):1513-1519 |
| `alden` | ALDEN | per-drug causality criteria (-12 to +10) → SJS/TEN causality | Sassolas B, et al. Clin Pharmacol Ther. 2010;88(1):60-68 |
| `pest` | PEST | 5 yes/no items → refer at >= 3 | Ibrahim GH, et al. Clin Exp Rheumatol. 2009;27(3):469-474 |
| `glasgow-7-point-checklist` | Weighted Glasgow 7-point checklist | major (2) + minor (1) features → refer at >= 3 | MacKie RM. BMJ. 1990;301(6759):1005-1006 |

## 3. Per-tile robustness

- **Every compute routes through `lib/num.js` and is finite-guarded.** The banded
  select/checkbox tiles parse to fixed weights and clamp; HiSCR guards its
  baseline-AN denominator; the count-threshold tiles are pure classifiers. Each
  renders a complete-the-fields fallback rather than a `NaN`.
- **Each tile reports its score / stage / verdict, the band, and the driving
  inputs** ([spec-v59](spec-v59.md)).
- **All seven score / classify / screen, not order** ([spec-v11](spec-v11.md)
  §5.3); each renders the [spec-v50](spec-v50.md) §3 posture note.
- **All seven flow through the [spec-v59](spec-v59.md) fuzz harness with zero
  non-finite leaks.**

## 4. Files touched

```
docs/spec-v223.md                        (this file)
app.js                                   (+7 UTILITIES rows; import group-v223 RV223 into RENDERERS)
lib/dermatology-v223.js                  (new: uas7, hiscr, hurleyStage, poem, alden, pest, glasgow7)
lib/meta.js                              (+7 META entries)
views/group-v223.js                      (new renderer module: 7 renderers)
test/unit/dermatology-v223.test.js       (worked examples)
test/unit/fuzz-tools.test.js             (add lib/dermatology-v223.js to MODULES)
CHANGELOG.md, README.md, package.json, docs/architecture.md, docs/scope-post-parity.md, docs/scope-mdcalc-parity.md  (catalog count live -> live+7)
```

## 5. Acceptance criteria

v223 is fully shipped when all 7 tiles are live (Class A) with a `META[id]` entry,
inline citation + `citationUrl` + `accessed`, and worked examples; every compute is
finite-guarded and fuzz-covered; `UTILITIES.length` is **live + 7** across all
catalog-truth surfaces; and `npm run lint`, `npm run test`, `npm run sbom`, and
`npm run build` all pass.

## 6. Out of scope for v223

- **No treatment / referral order** — the tiles score, classify, and screen; the
  decisions stay with the clinician and the patient ([spec-v11](spec-v11.md) §5.3).
  The **IGA** and **ABCDE** mnemonics are deferred: they are subjective single
  ratings / mnemonics without a computed threshold ([spec-v29](spec-v29.md) §3).
