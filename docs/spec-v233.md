# spec-v233.md — Quantitative bedside estimators: two cranial ventricular linear ratios (Evans index, FOHR), the age-adjusted D-dimer threshold, and the Deurenberg body-fat estimate (+4 tiles → 1013)

> Status: **SHIPPED (2026-07-03).** A cross-specialty estimator slice. Adds **4**
> well-established deterministic estimators. **Each id was verified absent by a
> fixed-string scan of the extracted `app.js` id/name lists AND the MCP adapter
> set** (spec-v85 §6.2): the catalog carried `bmi`, `wells-pe-geneva`, and several
> ventricular tiles, but neither cranial ventricular ratio, the age-adjusted
> D-dimer threshold, nor the Deurenberg body-fat estimate.
>
> Catalog effect: **live `UTILITIES.length` + 4** (1009 → 1013) — enforced by the
> catalog-truth gate ([spec-v46](spec-v46.md)).
>
> Every prior spec remains in force. v233 adds no runtime network call and no AI;
> each tile obeys the [spec-v100](spec-v100.md) §2 doctrine, passes the
> [spec-v29](spec-v29.md) §3 one-line test, ships its citation inline
> ([spec-v54](spec-v54.md)), inherits the [spec-v59](spec-v59.md) output-safety
> contract, renders the [spec-v50](spec-v50.md) §3 posture note, and honors
> [spec-v11](spec-v11.md) §5.3 (**no diagnosis and no treatment order** — these
> compute a ratio, estimate, or threshold). **Every formula and cutoff is re-fetched
> and cross-verified against ≥2 independent open sources** ([spec-v97](spec-v97.md)).
> All are Class A with no staleness rows.

## 2. What v233 adds (4 tiles)

All Group G; all Class A.

| id | name | inputs → output | citation |
| --- | --- | --- | --- |
| `evans-index` | Evans index | frontal-horn / inner-skull width → ratio; > 0.30 enlargement | Evans. Arch Neurol Psychiatry. 1942;47:931 |
| `fohr` | Frontal-occipital horn ratio | (frontal + occipital) / (2 × BPD) → ratio; ≥ 0.55 ventriculomegaly | O'Hayon. Pediatr Neurosurg. 1998;29:245 |
| `age-adjusted-d-dimer` | Age-adjusted D-dimer cutoff | age, D-dimer → cutoff (500 or age×10) + comparison | Righini. JAMA. 2014;311:1117 (ADJUST-PE) |
| `deurenberg-body-fat` | Deurenberg body-fat estimate | BMI, age, sex → body-fat % + ACE category | Deurenberg. Br J Nutr. 1991;65:105 |

## 3. Source cross-verification (spec-v97)

- **Evans index:** ratio = maximum frontal-horn width / maximum inner-table (biparietal)
  skull diameter on the same axial slice; > 0.30 defines ventricular enlargement.
  Reproduced from Evans 1942 and Frontiers Aging Neurosci 2021.
- **FOHR:** (frontal-horn + occipital-horn width) / (2 × biparietal diameter); normal
  mean 0.37; ≥ 0.55 clinically significant ventriculomegaly. Reproduced from O'Hayon
  1998 and Ambati (AJR 2019).
- **Age-adjusted D-dimer:** cutoff 500 µg/L up to age 50, age × 10 µg/L above 50, for
  a non-high clinical pretest probability. Reproduced from ADJUST-PE (JAMA 2014) and WikEM.
- **Deurenberg:** body-fat % = 1.20 × BMI + 0.23 × age − 10.8 × sex − 5.4 (male = 1,
  female = 0); ACE category thresholds by sex. Reproduced from Deurenberg 1991 and
  the ACE body-fat category chart.

## 4. Per-tile robustness

- **Every compute routes through `lib/num.js` and is finite-guarded.** Ratios and
  estimates coerce to bounded numbers; a blank or out-of-range field yields a
  "complete the fields" message, never a `NaN`.
- **Each tile reports its ratio / estimate / threshold, the band or comparison, and
  the driving inputs** ([spec-v59](spec-v59.md)).
- **All compute a value, not a diagnosis or order** ([spec-v11](spec-v11.md) §5.3);
  each renders the [spec-v50](spec-v50.md) §3 posture note.
- **All flow through the [spec-v59](spec-v59.md) fuzz harness with zero non-finite
  leaks.**

## 5. Files touched

```
docs/spec-v233.md                        (this file)
app.js                                   (+4 UTILITIES rows; import group-v233 RV233 into RENDERERS)
lib/estimators-v233.js                   (new: evansIndex, fohr, ageAdjustedDDimer, deurenberg)
lib/meta.js                              (+4 META entries)
views/group-v233.js                      (new renderer module: 4 renderers)
test/unit/estimators-v233.test.js        (new: worked examples)
test/unit/fuzz-tools.test.js             (register estimators-v233.js)
index.html, README.md, package.json, docs/architecture.md, docs/scope-mdcalc-parity.md, docs/scope-post-parity.md   (catalog count 1009 → 1013)
```
