# spec-v230.md — Prognostic inflammation indices: the lymphocyte-to-monocyte ratio, SIRI, PIV, and the CRP-to-albumin ratio (+4 tiles → 1004)

> Status: **SHIPPED (2026-07-03).** A hematology / inflammation slice extending the
> [spec-v229](spec-v229.md) CBC-index family (NLR/PLR/SII). Adds **4** deterministic
> prognostic inflammation indices computed from CBC and basic-chemistry values
> already in hand. **Each tile was verified absent by a direct scan of `app.js`
> AND the MCP adapter set** (spec-v85 §6.2) — the earlier absence pass used a
> broken shell alternation and is not trusted; this slice re-checked every id with
> a fixed-string match against the extracted id/name lists.
>
> Catalog effect: **live `UTILITIES.length` + 4** (1000 → 1004) — enforced by the
> catalog-truth gate ([spec-v46](spec-v46.md)).
>
> Every prior spec remains in force. v230 adds no runtime network call and no AI;
> each tile obeys the [spec-v100](spec-v100.md) §2 doctrine, passes the
> [spec-v29](spec-v29.md) §3 one-line test, ships its citation inline
> ([spec-v54](spec-v54.md)), inherits the [spec-v59](spec-v59.md) output-safety
> contract, renders the [spec-v50](spec-v50.md) §3 posture note, and honors
> [spec-v11](spec-v11.md) §5.3 (**no diagnosis and no treatment order**). **Every
> formula is re-fetched and cross-verified against ≥2 independent open sources**
> ([spec-v97](spec-v97.md)). No citation names a society acronym that trips the
> `check-citations` ISSUER_PATTERN, so all four are Class A with no staleness rows.

## 2. What v230 adds (4 tiles)

All Group G; all Class A. Absolute counts in 10³/µL (= 10⁹/L).

| id | name | formula → output | citation |
| --- | --- | --- | --- |
| `lmr` | Lymphocyte-to-Monocyte Ratio | ALC / AMC → ratio | Nishijima TF, et al. Cancer Treat Rev. 2015;41(10):971-978 |
| `siri` | Systemic Inflammation Response Index | ANC × AMC / ALC → index | Qi Q, et al. Cancer. 2016;122(14):2158-2167 |
| `piv` | Pan-Immune-Inflammation Value | ANC × platelets × AMC / ALC → value | Fucà G, et al. Br J Cancer. 2020;123(3):403-409 |
| `crp-albumin-ratio` | CRP-to-Albumin Ratio | CRP (mg/L) / albumin (g/dL) → ratio | Fairclough E, et al. Clin Med. 2009;9(1):30-33 |

None carries a universal cutoff; each reports the computed value with a
context-dependence note (the same design as `sii`). For `lmr`, a **lower** value
is the less-favorable direction; for the other three, higher is less favorable.

## 3. Source cross-verification (spec-v97)

Each formula was reproduced from its seminal source and at least one independent
review/calculator: LMR = ALC/AMC; SIRI = ANC×AMC/ALC; PIV = ANC×platelets×AMC/ALC;
CAR = CRP(mg/L)/albumin(g/dL). The HALP and Naples composite scores were considered
but deferred (HALP's magnitude depends on whether hemoglobin/albumin are entered in
g/L or g/dL — a unit ambiguity that fails the reproducibility bar).

## 4. Per-tile robustness

- **Every compute routes through `lib/num.js` and is finite-guarded.** Each index
  parses and range-checks its inputs and renders a complete-the-fields fallback
  rather than a `NaN`; a divide-by-entered-0 is blocked by the > 0 input bound.
- **Each tile reports its value, a context note, and the driving formula**
  ([spec-v59](spec-v59.md)).
- **All four compute a lab value, not a diagnosis or order** ([spec-v11](spec-v11.md)
  §5.3); each renders the [spec-v50](spec-v50.md) §3 posture note.
- **All four flow through the [spec-v59](spec-v59.md) fuzz harness with zero
  non-finite leaks.**

## 5. Files touched

```
docs/spec-v230.md                        (this file)
app.js                                   (+4 UTILITIES rows; import group-v230 RV230 into RENDERERS)
lib/inflam-v230.js                       (new: lmr, siri, piv, car)
lib/meta.js                              (+4 META entries)
views/group-v230.js                      (new renderer module: 4 renderers)
test/unit/inflam-v230.test.js            (new: worked examples)
test/unit/fuzz-tools.test.js             (register inflam-v230.js)
index.html, README.md, package.json, docs/scope-mdcalc-parity.md   (catalog count 1000 → 1004)
```
