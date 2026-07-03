# spec-v219.md — Metabolic & hepatic indices: the ADA/Bang and Cambridge diabetes-risk screeners, the Lipid Accumulation Product, Visceral Adiposity Index, and Conicity Index, and the AST/ALT and GGT-to-platelet liver ratios (+7 tiles)

> Status: **SHIPPED (2026-07-03).** Seventh feature spec of the **Bedside Decision
> & Physiology Instruments** program ([spec-v213](spec-v213.md)). Adds **7**
> deterministic metabolic and hepatic indices, each **verified absent by a direct
> scan of `app.js`** (spec-v85 §6.2): the catalog carries `findrisc`, `tyg-index`,
> `fib4`, and `apri`, but **not** the ADA/Bang or Cambridge diabetes-risk scores,
> the Lipid Accumulation Product, the Visceral Adiposity Index, the Conicity Index,
> the AST/ALT ratio, or the GGT-to-platelet ratio.
>
> Catalog effect: **live `UTILITIES.length` + 7** — enforced by the catalog-truth
> gate ([spec-v46](spec-v46.md)).
>
> Every prior spec remains in force. v219 adds no runtime network call and no AI;
> each tile obeys the [spec-v100](spec-v100.md) §2 doctrine, passes the
> [spec-v29](spec-v29.md) §3 one-line test, ships its citation inline
> ([spec-v54](spec-v54.md)), inherits the [spec-v59](spec-v59.md) output-safety
> contract, renders the [spec-v50](spec-v50.md) §3 posture note, and honors
> [spec-v11](spec-v11.md) §5.3 (**no screening-test, diagnostic, or biopsy
> order**). **Every formula/coefficient is re-fetched and cross-verified against ≥2
> independent open sources** ([spec-v97](spec-v97.md)); note the corrected VAI
> denominator `WC / (39.68 + 1.88·BMI)` — parenthesized so a healthy non-obese
> adult scores ~1, not ~150.

## 2. What v219 adds (7 tiles)

All Group G; all Class A; journal + author citations, none trips `ISSUER_PATTERN`.

| id | name | inputs → output | citation |
| --- | --- | --- | --- |
| `ada-diabetes-risk-test` | ADA / Bang diabetes-risk score | age, sex, GDM, family, HTN, inactivity, BMI (0-13) → screen ≥ 5 | Bang H, et al. Ann Intern Med. 2009;151(11):775-783 |
| `cambridge-diabetes-risk` | Cambridge Diabetes Risk Score | age, sex, BMI, family, smoking, antihypertensive/steroid → probability | Griffin SJ, et al. Diabetes Metab Res Rev. 2000;16(3):164-171 |
| `lipid-accumulation-product` | Lipid Accumulation Product | waist, TG, sex → central-lipid index | Kahn HS. BMC Cardiovasc Disord. 2005;5:26 |
| `visceral-adiposity-index` | Visceral Adiposity Index | waist, BMI, TG, HDL, sex → visceral-fat surrogate | Amato MC, et al. Diabetes Care. 2010;33(4):920-922 |
| `conicity-index` | Conicity Index | waist, weight, height → central-adiposity index | Valdez R. J Clin Epidemiol. 1991;44(9):955-956 |
| `ast-alt-ratio` | AST/ALT (De Ritis) ratio | AST, ALT → fibrosis/etiology band | De Ritis F, et al. Clin Chim Acta. 1957;2(1):70-74 |
| `ggt-platelet-ratio` | GGT-to-platelet ratio | GGT, GGT ULN, platelets → fibrosis marker (cutoff 0.32) | Lemoine M, et al. Gut. 2016;65(8):1369-1376 |

## 3. Per-tile robustness

- **Every compute routes through `lib/num.js` and is finite-guarded.** All numeric
  inputs use strictly-positive guards; VAI/GPR/AST-ALT/conicity floor their
  denominators; LAP floors its negative waist term. Each renders a
  complete-the-fields fallback rather than a `NaN`.
- **Each tile reports its value / band and the driving inputs**
  ([spec-v59](spec-v59.md)).
- **All seven screen / estimate, not order** ([spec-v11](spec-v11.md) §5.3); each
  renders the [spec-v50](spec-v50.md) §3 posture note.
- **All seven flow through the [spec-v59](spec-v59.md) fuzz harness with zero
  non-finite leaks.**

## 4. Files touched

```
docs/spec-v219.md                        (this file)
app.js                                   (+7 UTILITIES rows; import group-v219 RV219 into RENDERERS)
lib/metabolic-hepatic-v219.js            (new: adaDiabetesRisk, cambridgeDiabetes, lap, vai, conicity, astAltRatio, ggtPlatelet)
lib/meta.js                              (+7 META entries)
views/group-v219.js                      (new renderer module: 7 renderers)
test/unit/metabolic-hepatic-v219.test.js (worked examples)
test/unit/fuzz-tools.test.js             (add lib/metabolic-hepatic-v219.js to MODULES)
CHANGELOG.md, README.md, package.json, docs/architecture.md, docs/scope-post-parity.md, docs/scope-mdcalc-parity.md  (catalog count live -> live+7)
```

## 5. Acceptance criteria

v219 is fully shipped when all 7 tiles are live (Class A) with a `META[id]` entry,
inline citation + `citationUrl` + `accessed`, and worked examples; every compute is
finite-guarded and fuzz-covered; `UTILITIES.length` is **live + 7** across all
catalog-truth surfaces; and `npm run lint`, `npm run test`, `npm run sbom`, and
`npm run build` all pass.

## 6. Out of scope for v219

- **No screening-test / diagnostic / biopsy order** — the tiles screen and
  estimate; the decisions stay with the clinician and the patient
  ([spec-v11](spec-v11.md) §5.3).
