# spec-v220.md — Hepatology prognosis & fibrosis: FIPS post-TIPS survival, the ALBI-PLT varices score, D'Amico cirrhosis staging, the aMAP HCC risk score, the NACSELD-ACLF organ-failure count, and FibroQ (+6 tiles)

> Status: **SHIPPED (2026-07-03).** Eighth feature spec of the **Bedside Decision &
> Physiology Instruments** program ([spec-v213](spec-v213.md)). Adds **6**
> deterministic hepatology prognosis and fibrosis instruments, each **verified
> absent by a direct scan of `app.js`** (spec-v85 §6.2): the catalog carries
> `albi-grade`, `palbi`, `fib4`, `apri`, `meld-na`, `meld-childpugh`, and
> `clif-c-aclf`, but **not** FIPS, the ALBI-PLT score, D'Amico staging, the aMAP
> score, the NACSELD-ACLF count, or FibroQ.
>
> Catalog effect: **live `UTILITIES.length` + 6** — enforced by the catalog-truth
> gate ([spec-v46](spec-v46.md)).
>
> Every prior spec remains in force. v220 adds no runtime network call and no AI;
> each tile obeys the [spec-v100](spec-v100.md) §2 doctrine, passes the
> [spec-v29](spec-v29.md) §3 one-line test, ships its citation inline
> ([spec-v54](spec-v54.md)), inherits the [spec-v59](spec-v59.md) output-safety
> contract, renders the [spec-v50](spec-v50.md) §3 posture note, and honors
> [spec-v11](spec-v11.md) §5.3 (**no TIPS, endoscopy, transplant, or treatment
> order**). **Every formula/coefficient is re-fetched and cross-verified against ≥2
> independent open sources** ([spec-v97](spec-v97.md)); FIPS carries the reciprocal
> `1/creatinine` term.

## 2. What v220 adds (6 tiles)

All Group G; all Class A; journal + author citations, none trips `ISSUER_PATTERN`.

| id | name | inputs → output | citation |
| --- | --- | --- | --- |
| `fips-score` | FIPS | bilirubin, creatinine, age, albumin → post-TIPS survival index (>= 0.92 high) | Bettinger D, et al. J Hepatol. 2021;74(6):1362-1372 |
| `albi-plt` | ALBI-PLT score | ALBI grade + platelets (2-5) → high-risk-varices risk | Chen RC, et al. Gastrointest Endosc. 2018;88(2):230-239 |
| `damico-cirrhosis-stage` | D'Amico staging | varices / ascites / bleeding → stage 1-4 + 1-year mortality | D’Amico G, et al. J Hepatol. 2006;44(1):217-231 |
| `amap-score` | aMAP score | age, sex, ALBI, platelets → HCC risk (< 50 / 50-60 / > 60) | Fan R, et al. J Hepatol. 2020;73(6):1368-1378 |
| `nacseld-aclf` | NACSELD-ACLF | count of 4 organ failures → ACLF at >= 2 | O’Leary JG, et al. Hepatology. 2018;67(6):2367-2374 |
| `fibroq` | FibroQ | age, AST, INR, ALT, platelets → fibrosis index (> 1.6) | Hsieh YY, et al. Chang Gung Med J. 2009;32(6):614-622 |

## 3. Per-tile robustness

- **Every compute routes through `lib/num.js` and is finite-guarded.** FIPS guards
  its `log10(bilirubin)` and `1/creatinine` terms with strictly-positive inputs;
  ALBI-PLT / aMAP guard the ALBI `log10` term; FibroQ guards its ALT×platelet
  denominator; D'Amico and NACSELD are classifiers. Each renders a
  complete-the-fields fallback rather than a `NaN`.
- **Each tile reports its value / stage / count, the band, and the driving
  inputs** ([spec-v59](spec-v59.md)).
- **All six stage / stratify, not order** ([spec-v11](spec-v11.md) §5.3); each
  renders the [spec-v50](spec-v50.md) §3 posture note.
- **All six flow through the [spec-v59](spec-v59.md) fuzz harness with zero
  non-finite leaks.**

## 4. Files touched

```
docs/spec-v220.md                        (this file)
app.js                                   (+6 UTILITIES rows; import group-v220 RV220 into RENDERERS)
lib/hepatology-prognosis-v220.js         (new: fips, albiPlt, damicoStage, amap, nacseldAclf, fibroq)
lib/meta.js                              (+6 META entries)
views/group-v220.js                      (new renderer module: 6 renderers)
test/unit/hepatology-prognosis-v220.test.js (worked examples)
test/unit/fuzz-tools.test.js             (add lib/hepatology-prognosis-v220.js to MODULES)
CHANGELOG.md, README.md, package.json, docs/architecture.md, docs/scope-post-parity.md, docs/scope-mdcalc-parity.md  (catalog count live -> live+6)
```

## 5. Acceptance criteria

v220 is fully shipped when all 6 tiles are live (Class A) with a `META[id]` entry,
inline citation + `citationUrl` + `accessed`, and worked examples; every compute is
finite-guarded and fuzz-covered; `UTILITIES.length` is **live + 6** across all
catalog-truth surfaces; and `npm run lint`, `npm run test`, `npm run sbom`, and
`npm run build` all pass.

## 6. Out of scope for v220

- **No TIPS / endoscopy / transplant / treatment order** — the tiles stage and
  stratify; the decisions stay with the hepatologist and the patient
  ([spec-v11](spec-v11.md) §5.3). The **Toronto HCC Risk Index** and **BALAD-2**
  are deferred: their exact point tables / marker transforms are not reproducible
  from ≥2 open sources ([spec-v97](spec-v97.md)).
