# spec-v136.md — Endocrine & metabolic indices: HOMA-IR, QUICKI, TyG index, metabolic syndrome, and OST/ORAI DXA pre-screen (+5 tiles)

> Status: **SHIPPED (2026-06-21).** Feature spec of the [spec-v100](spec-v100.md)
> **MDCalc Parity Completion** program, **Wave 6 — Heme / onc / endocrine / ID.**
> Adds **5** deterministic insulin-resistance, metabolic-syndrome, and bone-screening
> indices that fill confirmed catalog gaps. None duplicates a live tile.
>
> Catalog effect at v136 close: **604 + 5 = 609 tiles.** (Specs landed out of
> order — v135 closed the live catalog at 604 — so the implementing session used the
> then-current `UTILITIES.length` (604) plus this spec's +5, and the catalog-truth
> gate enforces agreement at 609.)
>
> **Source-governance verified on ship:** the OST index truncates **toward zero**
> (`Math.trunc`, not `Math.floor` — the −3.6 → −3 published worked example
> disambiguates); the ORAI point table and the metabolic-syndrome waist cut-points
> were cross-verified across ≥ 2 independent sources. The ISSUER_PATTERN carries
> `IDSA`, **not** `IDF`, so `metabolic-syndrome` does **not** trip
> `check-citations.mjs`; its Class-B `docs/citation-staleness.md` row is
> documentation-only (the v134 `myeloma-r-iss` precedent), added per the §4
> maintenance-class designation rather than to satisfy a gate.
>
> Every prior spec (v4 through v135) remains in force. v136 adds no runtime network
> call and no AI; each tile obeys the [spec-v100](spec-v100.md) §2 doctrine
> (re-binding [spec-v85](spec-v85.md) §2) and the [spec-v100](spec-v100.md) §6 CI/CD
> contract, passes the [spec-v29](spec-v29.md) §3 one-line test, ships its primary
> citation inline ([spec-v54](spec-v54.md)), and inherits the [spec-v59](spec-v59.md)
> output-safety contract.

## 1. Thesis

The catalog has the A1c↔average-glucose converter (`eag-a1c`) but no insulin-
resistance index, no metabolic-syndrome rule, and no bone-screening pre-test. Each
is a published, deterministic instrument an endocrinologist or primary-care
clinician already uses, and the IR indices sit conceptually beside `eag-a1c`:

- **There is no insulin-resistance surrogate.** **HOMA-IR** (insulin × glucose /
  405), **QUICKI** (1/[log(insulin)+log(glucose)]), and the fasting-insulin-free
  **TyG index** (ln[TG × glucose / 2]) are the three standard IR surrogates; none is
  reachable. (The proprietary HOMA2 nonlinear model is excluded per
  [spec-v100](spec-v100.md) §8 — HOMA-IR is the free linear form.)
- **There is no metabolic-syndrome rule.** The **ATP III / IDF / Harmonized**
  any-3-of-5 (vs central-obesity-required) criteria are the standard MetS definition;
  the catalog scores neither.
- **There is no DXA pre-screen.** **OST** and **ORAI** are the free weight/age indices
  that flag who warrants bone densitometry (the licensed FRAX is excluded per
  [spec-v100](spec-v100.md) §8 — OST/ORAI is the free substitute).

v136 brings the endocrine/metabolic index cluster onto the page beside `eag-a1c`.

## 2. What v136 adds (5 tiles)

### 2.1 `homa-ir` — HOMA-IR (Homeostatic Model Assessment of Insulin Resistance)

- **Citation:** Matthews DR, Hosker JP, Rudenski AS, et al. Homeostasis model
  assessment: insulin resistance and beta-cell function from fasting plasma glucose
  and insulin concentrations in man. *Diabetologia.* 1985;28(7):412-419.
- **citationUrl:** https://doi.org/10.1007/BF00280883
- **Group:** Clinical Math & Conversions (`E`).
- **Specialties:** `endocrinology`, `diabetes-education`, `internal-medicine`,
  `primary-care`.
- **Inputs:** fasting insulin (µU/mL) and fasting glucose (mg/dL; the tile also
  accepts mmol/L). Optionally reports the linear HOMA-%B beta-cell estimate.
- **Output:** **HOMA-IR = (fasting insulin × fasting glucose) / 405** (mg/dL form;
  /22.5 for the mmol/L form), with the commonly-cited interpretation that higher
  values indicate greater insulin resistance. Class A. Cross-links `quicki`,
  `tyg-index`, and `eag-a1c`.

### 2.2 `quicki` — QUICKI (Quantitative Insulin Sensitivity Check Index)

- **Citation:** Katz A, Nambi SS, Mather K, et al. Quantitative insulin sensitivity
  check index: a simple, accurate method for assessing insulin sensitivity in humans.
  *J Clin Endocrinol Metab.* 2000;85(7):2402-2410.
- **citationUrl:** https://doi.org/10.1210/jcem.85.7.6661
- **Group:** Clinical Math & Conversions (`E`).
- **Specialties:** `endocrinology`, `diabetes-education`, `internal-medicine`.
- **Inputs:** fasting insulin (µU/mL) and fasting glucose (mg/dL).
- **Output:** **QUICKI = 1 / [log₁₀(fasting insulin) + log₁₀(fasting glucose)]**,
  with the interpretation that lower values indicate lower insulin sensitivity.
  Class A. Cross-links `homa-ir`.

### 2.3 `tyg-index` — Triglyceride-Glucose Index

- **Citation:** Simental-Mendía LE, Rodríguez-Morán M, Guerrero-Romero F. The product
  of fasting glucose and triglycerides as surrogate for identifying insulin
  resistance in apparently healthy subjects. *Metab Syndr Relat Disord.*
  2008;6(4):299-304.
- **citationUrl:** https://doi.org/10.1089/met.2008.0034
- **Group:** Clinical Math & Conversions (`E`).
- **Specialties:** `endocrinology`, `internal-medicine`, `primary-care`,
  `family-medicine`.
- **Inputs:** fasting triglycerides (mg/dL) and fasting glucose (mg/dL).
- **Output:** **TyG = ln[(fasting TG × fasting glucose) / 2]**, the fasting-insulin-
  free IR surrogate, with the interpretation that higher values indicate greater
  insulin resistance. Class A. Cross-links `homa-ir`.

### 2.4 `metabolic-syndrome` — Metabolic Syndrome (ATP III / IDF / Harmonized)

- **Citation:** Alberti KGMM, Eckel RH, Grundy SM, et al. Harmonizing the metabolic
  syndrome: a joint interim statement. *Circulation.* 2009;120(16):1640-1645;
  building on Grundy SM, Cleeman JI, Daniel SR, et al. *Circulation.*
  2005;112(17):2735-2752 (NCEP ATP III update).
- **citationUrl:** https://doi.org/10.1161/CIRCULATIONAHA.109.192644
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `endocrinology`, `internal-medicine`, `primary-care`,
  `family-medicine`.
- **Inputs:** waist circumference (with the sex- and population-specific cut-points),
  triglycerides ≥ 150 mg/dL (or on treatment), HDL (< 40 men / < 50 women, or on
  treatment), blood pressure ≥ 130/85 (or on treatment), and fasting glucose
  ≥ 100 mg/dL (or on treatment); plus the definition selector (Harmonized any-3-of-5
  vs IDF central-obesity-required).
- **Output:** the **metabolic-syndrome verdict** — **present** if ≥ 3 of 5 criteria
  (Harmonized) or central obesity + ≥ 2 others (IDF) — naming which criteria were
  met. **Class B** (ATP III / IDF / Harmonized are revisable consensus definitions →
  `docs/citation-staleness.md` row, on-publication cadence). Cross-links `homa-ir`.

### 2.5 `osteoporosis-prescreen` — OST / ORAI DXA Pre-Screen

- **Citation:** Koh LKH, Sedrine WB, Torralba TP, et al. A simple tool to identify
  Asian women at increased risk of osteoporosis (OST). *Osteoporos Int.*
  2001;12(8):699-705; and Cadarette SM, Jaglal SB, Kreiger N, et al. Development and
  validation of the Osteoporosis Risk Assessment Instrument (ORAI). *CMAJ.*
  2000;162(9):1289-1294.
- **citationUrl:** https://doi.org/10.1007/s001980170070
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `endocrinology`, `geriatrics`, `primary-care`, `family-medicine`.
- **Inputs:** age and weight (OST: [weight kg − age yr] × 0.2, truncated); plus the
  ORAI inputs (age band, weight band, current estrogen use) for the alternate index.
- **Output:** the **OST index** (and the **ORAI score**) with the published
  thresholds flagging who should proceed to DXA (e.g., OST < 2 → higher risk).
  Class A (fixed index formulas). Cross-links the bone-health cluster.

## 3. Per-tile robustness

- **`homa-ir`, `quicki`, and `tyg-index` use products and logarithms — guard the
  domains.** Each requires **glucose > 0** and **insulin > 0** (and **TG > 0** for
  TyG); a zero/negative/blank input returns a surfaced `valid:false` fallback rather
  than `log(0) = −Infinity`, a divide-by-zero, or a `NaN`. Unit conversion (mg/dL ↔
  mmol/L) is applied before the formula, and the `log₁₀`/`ln` calls are domain-
  guarded. All three join the [spec-v59](spec-v59.md) fuzz harness with the log/
  product math explicitly fuzzed.
- **`metabolic-syndrome` is any-3-of-5 (or central-obesity-required) criteria
  logic.** Each criterion compares an entered value to its sex-/population-specific
  cut-point (or honors the "on treatment" override) with a blank guard; the verdict
  names exactly which criteria were met and which definition was applied.
- **`osteoporosis-prescreen` is a truncated index / point lookup.** The OST product
  truncates toward zero per the published method; ORAI is a fixed point table. Blank
  age/weight surfaces the fallback.
- All five render the [spec-v50](spec-v50.md) §3 clinical posture note and quote the
  source's interpretation; none authors a diagnose/treat/order-DXA directive in
  Sophie's voice ([spec-v11](spec-v11.md) §5.3) — each reports the index/verdict and
  the source's stated framing.

## 4. CI/CD & maintenance

Per the [spec-v100](spec-v100.md) §6 contract (re-binding [spec-v85](spec-v85.md) §6):

- **Maintenance classes (§6.3):** `metabolic-syndrome` is **Class B** — the ATP III /
  IDF / Harmonized definitions are revisable consensus statements, so it gets a
  `docs/citation-staleness.md` row naming the editions in force (2009 Harmonized;
  2005 ATP III update; IDF), the `accessed` date, and an on-publication review
  cadence, monitored by `scripts/check-citation-cadence.mjs`. The other four
  (`homa-ir`, `quicki`, `tyg-index`, `osteoporosis-prescreen`) are **Class A** (fixed
  formulas) — **no** staleness row. Each Class-A citation names the **journal and
  authors** (Diabetologia, JCEM, Metab Syndr Relat Disord, Osteoporos Int / CMAJ),
  not a society acronym, so `check-citations.mjs` `ISSUER_PATTERN` does not fire.
  **Watch the gotcha:** the `metabolic-syndrome` citation names *Circulation* and the
  IDF — phrase it to name the journal + authors, and rely on the (intended) Class-B
  staleness row to satisfy the IDF-acronym `ISSUER_PATTERN` match
  ([spec-v92](spec-v92.md)/[spec-v94](spec-v94.md) lesson).
- **Build (§6.1):** `lib/endo-v136.js` is the new compute module (`homaIr`, `quicki`,
  `tygIndex`, `metabolicSyndrome`, `osteoporosisPrescreen`); `views/group-v136.js` is
  the new renderer module, exporting `RV136` into the `app.js` `RENDERERS` spread.
- **Gates (§6.2):** `lib/endo-v136.js` is added to `test/unit/fuzz-tools.test.js`
  `MODULES` (zero non-finite leaks, with the log/product math explicitly fuzzed);
  each `META` example is pinned by the chromium `example-correctness` sweep; the
  catalog count moves on all **13 catalog-truth surfaces**; a11y,
  `mobile-no-hscroll`, and 44px touch-target checks pass for `views/group-v136.js`.

## 5. Files touched

```
docs/spec-v136.md                        (this file)
app.js                                   (+5 UTILITIES rows, groups E & G; import group-v136 RV136 into RENDERERS)
lib/endo-v136.js                         (new module: homaIr, quicki, tygIndex, metabolicSyndrome, osteoporosisPrescreen)
lib/meta.js                              (+5 META entries: inline citation + citationUrl + accessed; cross-links to eag-a1c)
views/group-v136.js                      (new renderer module: 5 renderers)
docs/citation-staleness.md               (+ row: metabolic-syndrome ATP III/IDF/Harmonized)
docs/clinical-citations.md               (+ rows for the five sources)
test/unit/homa-ir.test.js, quicki.test.js, tyg-index.test.js, metabolic-syndrome.test.js, osteoporosis-prescreen.test.js  (≥3 boundary worked examples each)
test/unit/fuzz-tools.test.js             (add lib/endo-v136.js to MODULES)
docs/audits/v12/homa-ir.md, quicki.md, tyg-index.md, metabolic-syndrome.md, osteoporosis-prescreen.md  (spec-v11 audit logs)
docs/scope-mdcalc-parity.md              (catalog count 603 -> 608; running ledger)
CHANGELOG.md                             (Unreleased: v136 entry, +5)
README.md, package.json                  (catalog count 603 -> 608; spec-progression line -> v136)
```

## 6. Acceptance criteria

v136 is fully shipped when:

- The implementing session has **re-run the §6.2 collision check** and confirmed all
  five ids are absent.
- All 5 tiles in §2 are live (E for the IR indices, G for `metabolic-syndrome` and
  `osteoporosis-prescreen`) with a `META[id]` entry, an inline primary citation +
  `citationUrl` + `accessed`, ≥3 boundary worked examples each (including a worked
  **HOMA-IR / QUICKI / TyG** value, a **metabolic-syndrome exactly-3-of-5 present-vs-
  absent flip**, and an **OST threshold case**), a [spec-v11](spec-v11.md) audit log,
  and a passing [spec-v29](spec-v29.md) §3 check.
- `homa-ir`, `quicki`, and `tyg-index` guard glucose/insulin/TG > 0 and surface a
  `valid:false` fallback for zero/negative/blank inputs; all are covered by the
  [spec-v59](spec-v59.md) fuzz harness with zero non-finite leaks.
- `metabolic-syndrome` carries `accessed` + a `docs/citation-staleness.md` row.
- `UTILITIES.length` is **608** (or live count + 5 if specs land out of order) and
  all catalog-truth surfaces ([spec-v46](spec-v46.md)) agree.
- `npm run lint`, `npm run test`, `npm run sbom`, and `npm run build` all pass.
- The CHANGELOG records v136 with the +5 catalog delta.

## 7. Out of scope for v136

- **No HOMA2 (proprietary)** — the Oxford nonlinear HOMA2 model is excluded per
  [spec-v100](spec-v100.md) §8; `homa-ir` is the free linear form.
- **No FRAX / Tyrer-Cuzick** — the licensed bone/breast models are excluded per
  [spec-v100](spec-v100.md) §8; `osteoporosis-prescreen` (OST/ORAI) is the free DXA
  pre-screen substitute.
- **No diagnosis or treatment threshold beyond the source** — the IR indices have no
  universal diagnostic cut-point; the tiles report the value and the source's
  framing, not a "diagnose insulin resistance / start metformin" directive.
- **No diabetes-screening or A1c-diagnosis re-implementation** — `eag-a1c` is the
  live A1c tool, cross-linked.
