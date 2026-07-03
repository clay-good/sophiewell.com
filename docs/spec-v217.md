# spec-v217.md — Stroke & neuro-vascular risk scores: the Canadian TIA Score, ASTRAL, SOAR, PLAN, SITS-SICH, VASOGRADE, and Ogilvy-Carter aneurysm grading (+7 tiles)

> Status: **SHIPPED (2026-07-03).** Fifth feature spec of the **Bedside Decision &
> Physiology Instruments** program ([spec-v213](spec-v213.md)). Adds **7**
> deterministic stroke and neuro-vascular risk scores, each **verified absent by a
> direct scan of `app.js`** (spec-v85 §6.2): the catalog carries `abcd2`,
> `abcd3-i`, `nihss`, `ich-score`, `hat-score`, `sedan-score`, `modified-fisher`,
> and `hunt-hess-wfns`, but **not** the Canadian TIA Score, ASTRAL, SOAR, PLAN,
> SITS-SICH, VASOGRADE, or the Ogilvy-Carter grading.
>
> Catalog effect: **live `UTILITIES.length` + 7** — enforced by the catalog-truth
> gate ([spec-v46](spec-v46.md)).
>
> Every prior spec remains in force. v217 adds no runtime network call and no AI;
> each tile obeys the [spec-v100](spec-v100.md) §2 doctrine, passes the
> [spec-v29](spec-v29.md) §3 one-line test, ships its citation inline
> ([spec-v54](spec-v54.md)), inherits the [spec-v59](spec-v59.md) output-safety
> contract, renders the [spec-v50](spec-v50.md) §3 posture note, and honors
> [spec-v11](spec-v11.md) §5.3 (**no thrombolysis, admission, or surgical order** —
> these stratify and grade). **Every point value is re-fetched and cross-verified
> against ≥2 independent open sources** ([spec-v97](spec-v97.md)).

## 2. What v217 adds (7 tiles)

All Group G; all Class A; journal + author citations, none trips `ISSUER_PATTERN`.

| id | name | inputs → output | citation |
| --- | --- | --- | --- |
| `canadian-tia-score` | Canadian TIA Score | 13 clinical/investigation variables (-3 to 23) → 7-day stroke risk band | Perry JJ, et al. BMJ. 2021;372:n49 |
| `astral-score` | ASTRAL score | age/5 + NIHSS + onset/visual/glucose/consciousness → 90-day outcome | Ntaios G, et al. Neurology. 2012;78(24):1916-1922 |
| `soar-score` | SOAR score | subtype + OCSP + age band + prestroke Rankin (0-7) → early mortality | Myint PK, et al. Int J Stroke. 2014;9(3):278-283 |
| `plan-score` | PLAN score | comorbidities + consciousness + age + deficits (0-25) → 30-day mortality | O’Donnell MJ, et al. Arch Intern Med. 2012;172(20):1548-1556 |
| `sits-sich` | SITS-SICH | antiplatelet + NIHSS + glucose + SBP + weight + age + onset + HTN (0-15) → symptomatic ICH after alteplase | Mazya M, et al. Stroke. 2012;43(6):1524-1531 |
| `vasograde` | VASOGRADE | modified Fisher + WFNS → Green/Yellow/Red DCI risk | de Oliveira Manoel AL, et al. Stroke. 2015;46(7):1826-1831 |
| `ogilvy-carter` | Ogilvy-Carter grading | age > 50, HH 4-5, Fisher 3-4, size > 10 mm, posterior giant (0-5) → surgical outcome | Ogilvy CS, Carter BS. Neurosurgery. 1998;42(5):959-968 |

## 3. Per-tile robustness

- **Every compute routes through `lib/num.js` and is finite-guarded.** The numeric
  inputs (ASTRAL age/NIHSS, SITS-SICH labs/vitals, PLAN age) clamp to their
  published domains; `plan-score` preserves the published half-point weights;
  VASOGRADE and Ogilvy-Carter are classifiers. Each renders a complete-the-fields
  fallback rather than a `NaN`.
- **Each tile reports its score / grade, the band, and the driving inputs**
  ([spec-v59](spec-v59.md)).
- **All seven stratify / grade, not order** ([spec-v11](spec-v11.md) §5.3); each
  renders the [spec-v50](spec-v50.md) §3 posture note.
- **All seven flow through the [spec-v59](spec-v59.md) fuzz harness with zero
  non-finite leaks.**

## 4. Files touched

```
docs/spec-v217.md                        (this file)
app.js                                   (+7 UTILITIES rows; import group-v217 RV217 into RENDERERS)
lib/stroke-risk-v217.js                  (new: canadianTia, astral, soar, plan, sitsSich, vasograde, ogilvyCarter)
lib/meta.js                              (+7 META entries)
views/group-v217.js                      (new renderer module: 7 renderers)
test/unit/stroke-risk-v217.test.js       (worked examples)
test/unit/fuzz-tools.test.js             (add lib/stroke-risk-v217.js to MODULES)
CHANGELOG.md, README.md, package.json, docs/architecture.md, docs/scope-post-parity.md, docs/scope-mdcalc-parity.md  (catalog count live -> live+7)
```

## 5. Acceptance criteria

v217 is fully shipped when all 7 tiles are live (Class A) with a `META[id]` entry,
inline citation + `citationUrl` + `accessed`, and worked examples; every compute is
finite-guarded and fuzz-covered; `UTILITIES.length` is **live + 7** across all
catalog-truth surfaces; and `npm run lint`, `npm run test`, `npm run sbom`, and
`npm run build` all pass.

## 6. Out of scope for v217

- **No thrombolysis / admission / surgical order** — the tiles stratify and grade;
  the decisions stay with the stroke physician / neurosurgeon and the patient
  ([spec-v11](spec-v11.md) §5.3).
