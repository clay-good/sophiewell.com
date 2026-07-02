# spec-v197.md — Endocrine & metabolic quantitation: SPINA-GT, SPINA-GD, Jostel's TSH index, HOMA-B, and the oral disposition index (+5 tiles)

> Status: **PROPOSED (2026-07-01).** Feature spec of the **Advanced Specialist
> Quantitation** program ([spec-v193](spec-v193.md) §1.1). Adds **5** deterministic
> thyroid-homeostasis and β-cell-function instruments. **Each tile was verified
> absent by a direct scan of `app.js`** (zero id / name / keyword hits): the catalog
> carries `free-thyroxine-index`, `burch-wartofsky`, `homa-ir`, `quicki`,
> `matsuda-index`, `tyg-index`, `arr`, and `eag-a1c`, but **not** the SPINA-GT thyroid
> secretory capacity, the SPINA-GD deiodinase activity, Jostel's TSH index, HOMA-B
> (the β-cell arm of the homeostasis model), or the oral disposition index.
>
> Catalog effect: **live `UTILITIES.length` + 5** — enforced by the catalog-truth
> gate ([spec-v46](spec-v46.md)) at build time; no number is copied here.
>
> Every prior spec remains in force. v197 adds no runtime network call and no AI;
> each tile obeys the [spec-v100](spec-v100.md) §2 doctrine, passes the
> [spec-v29](spec-v29.md) §3 one-line test, ships its citation inline
> ([spec-v54](spec-v54.md)), inherits the [spec-v59](spec-v59.md) output-safety
> contract, renders the [spec-v50](spec-v50.md) §3 posture note, and honors
> [spec-v11](spec-v11.md) §5.3 (**no diagnostic or treatment order in Sophie's
> voice**). **Every coefficient and reference range is re-fetched and cross-verified
> against ≥2 independent open sources at implementation** ([spec-v97](spec-v97.md));
> uncertain values carry an explicit *(verify at implementation,
> [spec-v97](spec-v97.md))* tag. The implementing session **re-runs the
> [spec-v85 §6.2](spec-v85.md) collision check** first.

## 1. Thesis

The catalog carries the insulin-sensitivity indices (HOMA-IR, QUICKI, Matsuda, TyG)
and the free-thyroxine index, but not the **structure-parameter and secretion-arm
quantities** the endocrinologist uses to interpret thyroid homeostasis and β-cell
function: the SPINA calculated parameters, Jostel's pituitary-thyrotroph index, the
β-cell arm of the homeostasis model, and the sensitivity-adjusted secretion index
from an OGTT. Five standard, freely-reproducible quantities are absent, each a
transparent formula, and each is decision support — **never a diagnostic or treatment
order**.

## 2. What v197 adds (5 tiles)

### 2.1 `spina-gt` — SPINA-GT (Thyroid Secretory Capacity)

- **Citation:** Dietrich JW, Landgrafe-Mende G, Wiora E, et al. Calculated parameters
  of thyroid homeostasis: emerging tools for differential diagnosis and clinical
  research. *Front Endocrinol (Lausanne).* 2016;7:57.
- **citationUrl:** https://doi.org/10.3389/fendo.2016.00057
- **Group:** E (clinical math). **Specialties:** `endocrinology`,
  `internal-medicine`.
- **Inputs:** TSH (mIU/L) and free T4 (pmol/L). Computes the maximum thyroid secretory
  capacity **GT** from the published structure-parameter equation with its fixed
  constants *(the constants βT, αT, DT, K41, K42, [TBG], [TBPA] are transcribed
  verbatim at implementation, [spec-v97](spec-v97.md))*.
- **Output:** the **GT (pmol/s)** with the reference band (~1.4–8.7 pmol/s), naming the
  inputs; low GT indicates reduced thyroid secretory capacity. Guards TSH > 0. Class A.
  Cross-links `free-thyroxine-index`, `spina-gd`.

### 2.2 `spina-gd` — SPINA-GD (Sum Activity of Peripheral Deiodinases)

- **Citation:** Dietrich JW, Landgrafe-Mende G, Wiora E, et al. Calculated parameters
  of thyroid homeostasis. *Front Endocrinol (Lausanne).* 2016;7:57 (companion
  parameter).
- **citationUrl:** https://doi.org/10.3389/fendo.2016.00057
- **Group:** E. **Specialties:** `endocrinology`, `internal-medicine`.
- **Inputs:** free T4 (pmol/L) and free T3 (pmol/L). Computes the sum activity of
  peripheral deiodinases **GD** from the published equation with its fixed constants
  *(β31, α31, KM1, K30, [TBG] transcribed verbatim at implementation,
  [spec-v97](spec-v97.md))*.
- **Output:** the **GD (nmol/s)** with the reference band (~20–60 nmol/s), naming the
  inputs. Guards free T4 > 0. Class A. Cross-links `spina-gt`,
  `free-thyroxine-index`.

### 2.3 `jostel-tsh-index` — Jostel's TSH Index (TSHI / standardized sTSHI)

- **Citation:** Jostel A, Ryder WD, Shalet SM. The use of thyroid function tests in
  the diagnosis of hypopituitarism: definition and evaluation of the TSH index. *Clin
  Endocrinol (Oxf).* 2009;71(4):529-534.
- **citationUrl:** https://doi.org/10.1111/j.1365-2265.2009.03534.x
- **Group:** E. **Specialties:** `endocrinology`, `internal-medicine`.
- **Inputs:** TSH (mIU/L) and free T4 (pmol/L). Computes **TSHI = ln(TSH) + 0.1345 ×
  FT4** and the standardized **sTSHI = (TSHI − 2.7) / 0.676**.
- **Output:** the **TSH index (and standardized index)** with the reference band
  (TSHI ~1.3–4.1; sTSHI −2 to +2), naming the inputs; a low index suggests central
  (secondary) hypothyroidism. Guards TSH > 0 before the logarithm. Class A.
  Cross-links `free-thyroxine-index`, `spina-gt`.

### 2.4 `homa-beta` — HOMA-B (Steady-State β-Cell Function)

- **Citation:** Matthews DR, Hosker JP, Rudenski AS, et al. Homeostasis model
  assessment: insulin resistance and β-cell function from fasting plasma glucose and
  insulin concentrations in man. *Diabetologia.* 1985;28(7):412-419.
- **citationUrl:** https://doi.org/10.1007/BF00280883
- **Group:** E. **Specialties:** `endocrinology`, `internal-medicine`.
- **Inputs:** fasting insulin (µU/mL) and fasting glucose. Computes **HOMA-B (%) =
  20 × insulin / (glucose_mmol − 3.5)** (or the mg/dL form 360 × insulin /
  (glucose_mg − 63)).
- **Output:** the **HOMA-B (%)** with its interpretation as steady-state β-cell
  function, naming the inputs; the tile notes it is the β-cell arm complementing the
  live `homa-ir`. Guards the (glucose − 3.5) denominator > 0. Class A. Cross-links
  `homa-ir`, `quicki`.

### 2.5 `oral-disposition-index` — Oral Disposition Index (DIo)

- **Citation:** Utzschneider KM, Prigeon RL, Faulenbach MV, et al. Oral disposition
  index predicts the development of future diabetes above and beyond fasting and 2-h
  glucose levels. *Diabetes Care.* 2009;32(2):335-341.
- **citationUrl:** https://doi.org/10.2337/dc08-1478
- **Group:** E. **Specialties:** `endocrinology`, `internal-medicine`.
- **Inputs:** insulin and glucose at 0 and 30 min, plus fasting insulin. Computes the
  **insulinogenic index (ΔI₀₋₃₀ / ΔG₀₋₃₀)** and the **oral disposition index
  DIo = (ΔI₀₋₃₀ / ΔG₀₋₃₀) × (1 / fasting insulin)**.
- **Output:** the **oral disposition index (and the insulinogenic index sub-result)**
  with its interpretation — sensitivity-adjusted β-cell secretion; lower DIo predicts
  higher future-diabetes risk — naming the inputs. Guards ΔG and fasting insulin
  denominators > 0. Class A. Cross-links `homa-beta`, `matsuda-index`.

## 3. Per-tile robustness

- **Every compute routes through `lib/num.js` and is finite-guarded.** `jostel-tsh-
  index` and the SPINA tiles guard every logged / divided input > 0; `homa-beta`
  guards the (glucose − 3.5) denominator; `oral-disposition-index` guards the ΔG and
  fasting-insulin denominators; outside these each renders a complete-the-fields
  fallback, never a `NaN`/`Infinity`.
- **Each tile reports the reference band and names its intended assay units** (FT4 in
  pmol/L for the SPINA/Jostel tiles; the mmol/L-vs-mg/dL glucose form for HOMA-B), so
  a value is never read against the wrong scale ([spec-v59](spec-v59.md)).
- **All five flow through the [spec-v59](spec-v59.md) fuzz harness with zero
  non-finite leaks**, fuzzed at the log-domain and zero-denominator edges.
- **These quantify physiology; they are not orders.** Every tile renders the
  [spec-v50](spec-v50.md) §3 posture note; none authors a diagnostic or treatment
  order in Sophie's voice.

## 4. CI/CD & maintenance

- **Maintenance classes (§6.3):** all five are **Class A** — fixed formulas with
  published reference ranges, each cited by journal + authors. The implementing
  session confirms whether any citation trips `ISSUER_PATTERN`
  ([spec-v92](spec-v92.md)/[spec-v94](spec-v94.md)) and adds a
  `docs/citation-staleness.md` row only if the live pattern matches.
- **Build & gates (§6.1/§6.2):** the five computes live in a new
  `lib/endo-quant-v197.js` module, added to `test/unit/fuzz-tools.test.js` `MODULES`.
  Renderers live in a new `views/group-v197.js`; its `RV197` export is spread into the
  `app.js` `RENDERERS` map. Every input carries a real `<label for>`. The catalog
  count moves on all **13 catalog-truth surfaces** using the **live `UTILITIES.length`
  + 5**; a11y, `mobile-no-hscroll`, `mobile-touch-targets`, and the chromium
  `example-correctness` sweep pass.
- **Specialties** are drawn from the closed vocabulary: `endocrinology`,
  `internal-medicine` — both already in the vocabulary.

## 5. Files touched

```
docs/spec-v197.md                        (this file)
app.js                                   (+5 UTILITIES rows; import group-v197 RV197 into RENDERERS)
lib/endo-quant-v197.js                   (new: spinaGt, spinaGd, jostelTshIndex, homaBeta, oralDispositionIndex)
lib/meta.js                              (+5 META entries: inline citation + citationUrl + accessed; cross-links to free-thyroxine-index, homa-ir, matsuda-index)
views/group-v197.js                      (new renderer module: 5 renderers)
docs/clinical-citations.md               (+5 rows)
test/unit/spina-gt.test.js, spina-gd.test.js, jostel-tsh-index.test.js, homa-beta.test.js, oral-disposition-index.test.js  (>=3 worked examples each)
test/unit/fuzz-tools.test.js             (add lib/endo-quant-v197.js to MODULES)
docs/audits/v12/*.md                     (5 spec-v11 audit logs)
docs/scope-mdcalc-parity.md              (catalog count live -> live+5; record the v197 delta)
CHANGELOG.md, README.md, package.json    (catalog count live -> live+5; spec-progression line)
```

## 6. Acceptance criteria

v197 is fully shipped when:

- The implementing session has **re-run the [spec-v85 §6.2](spec-v85.md) collision
  check** and confirmed all five ids are absent (as verified at draft).
- All 5 tiles in §2 are live (Class A) with a `META[id]` entry, inline citation +
  `citationUrl` + `accessed`, and ≥ 3 worked examples each — including a **SPINA-GT in
  and below the reference band**, a **SPINA-GD example**, a **Jostel TSHI with its
  standardized form**, a **HOMA-B paired against a HOMA-IR example**, and an **oral
  disposition index with its insulinogenic-index sub-result**.
- Every compute is finite-guarded (log-domain and zero-denominator), routes through
  `lib/num.js`, and is covered by the [spec-v59](spec-v59.md) fuzz harness with **zero
  non-finite leaks**.
- `UTILITIES.length` is **live + 5** and all catalog-truth surfaces agree.
- `npm run lint`, `npm run test`, `npm run sbom`, and `npm run build` all pass; the
  CHANGELOG records v197 with the +5 delta.

## 7. Out of scope for v197

- **No diagnostic or treatment order** — the tiles quantify thyroid homeostasis and
  β-cell function; the diagnosis and hormone / antidiabetic decisions stay with the
  clinician ([spec-v11](spec-v11.md) §5.3).
- **No proprietary iterative model** — HOMA2 requires the closed Oxford iterative
  calculator (no open closed-form) and is excluded; only the original 1985 linear
  HOMA-B is carried.
- **No research-grade regression index without a clean second source** — the Stumvoll
  ISI and similar OGTT regression fits are deferred pending the [spec-v97](spec-v97.md)
  ≥ 2-source bar and are not bundled here.
