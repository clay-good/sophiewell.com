# spec-v229.md — CBC-derived count & inflammation indices: the absolute eosinophil count and the NLR / PLR / SII ratios (+4 tiles → 1000, catalog milestone)

> Status: **SHIPPED (2026-07-03).** A hematology depth slice that carries the
> catalog to the **1000-tile milestone**. Adds **4** deterministic
> complete-blood-count-derived indices computed from CBC values already in hand:
> the absolute eosinophil count with eosinophilia grading, and the neutrophil-to-
> lymphocyte, platelet-to-lymphocyte, and systemic immune-inflammation ratios.
> **Each tile was verified absent by a direct scan of `app.js`** (spec-v85 §6.2):
> the catalog carried none of `aec`, `nlr`, `plr`, or `sii`.
>
> Catalog effect: **live `UTILITIES.length` + 4** (996 → 1000) — enforced by the
> catalog-truth gate ([spec-v46](spec-v46.md)).
>
> Every prior spec remains in force. v229 adds no runtime network call and no AI;
> each tile obeys the [spec-v100](spec-v100.md) §2 doctrine, passes the
> [spec-v29](spec-v29.md) §3 one-line test (each computes from user inputs), ships
> its citation inline ([spec-v54](spec-v54.md)), inherits the [spec-v59](spec-v59.md)
> output-safety contract, renders the [spec-v50](spec-v50.md) §3 posture note, and
> honors [spec-v11](spec-v11.md) §5.3 (**no diagnosis and no treatment order** —
> these compute a lab value). **Every formula and band is re-fetched and
> cross-verified against ≥2 independent open sources** ([spec-v97](spec-v97.md)).
> No citation names a society acronym that trips the `check-citations`
> ISSUER_PATTERN, so all four are Class A with no staleness rows.

## 2. What v229 adds (4 tiles)

All Group G; all Class A. Absolute counts in 10³/µL (= 10⁹/L); WBC in 10³/µL.

| id | name | formula → output | citation |
| --- | --- | --- | --- |
| `aec` | Absolute Eosinophil Count | WBC × eos% → cells/µL, graded | Valent P, et al. J Allergy Clin Immunol. 2012;130(3):607-612 |
| `nlr` | Neutrophil-to-Lymphocyte Ratio | ANC / ALC → ratio | Zahorec R. Bratisl Lek Listy. 2001;102(1):5-14 |
| `plr` | Platelet-to-Lymphocyte Ratio | platelets / ALC → ratio | Gasparyan AY, et al. Ann Lab Med. 2019;39(4):345-357 |
| `sii` | Systemic Immune-Inflammation Index | platelets × ANC / ALC → index | Hu B, et al. Clin Cancer Res. 2014;20(23):6212-6222 |

`aec` grades eosinophilia (< 500 normal, 500-1500 mild, 1500-5000 moderate,
> 5000 severe; ≥ 1500 = hypereosinophilia). `nlr` flags > 3 as elevated (typical
reference roughly 1-3); `plr` flags > 180. `sii` has no universal cutoff and
reports the value with a context-dependence note.

## 3. Source cross-verification (spec-v97)

The AEC grading bands were reproduced from the Valent 2012 consensus classification
and the NIH StatPearls eosinophilia chapter, which agree on the 500 / 1500 / 5000
boundaries and the ≥ 1500 hypereosinophilia threshold. Each ratio's formula is the
plain quotient defined in its seminal source (Zahorec 2001, Gasparyan 2019, Hu
2014) and confirmed against independent reference-interval reviews.

## 4. Per-tile robustness

- **Every compute routes through `lib/num.js` and is finite-guarded.** Each index
  parses and range-checks its CBC inputs and renders a complete-the-fields fallback
  rather than a `NaN`.
- **Each tile reports its value, the band / interpretation, and the driving
  formula** ([spec-v59](spec-v59.md)).
- **All four compute a lab value, not a diagnosis or order** ([spec-v11](spec-v11.md)
  §5.3); each renders the [spec-v50](spec-v50.md) §3 posture note.
- **All four flow through the [spec-v59](spec-v59.md) fuzz harness with zero
  non-finite leaks.**

## 5. Files touched

```
docs/spec-v229.md                        (this file)
app.js                                   (+4 UTILITIES rows; import group-v229 RV229 into RENDERERS)
lib/hematology-v229.js                   (new: aec, nlr, plr, sii)
lib/meta.js                              (+4 META entries)
views/group-v229.js                      (new renderer module: 4 renderers)
test/unit/hematology-v229.test.js        (new: worked examples)
test/unit/fuzz-tools.test.js             (register hematology-v229.js)
index.html, README.md, package.json, docs/scope-mdcalc-parity.md   (catalog count 996 → 1000)
```
